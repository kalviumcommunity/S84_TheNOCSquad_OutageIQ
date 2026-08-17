import unittest
import sys
import os
import tempfile
import json
import pandas as pd

# Add scripts directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../scripts')))

from ingestion import (
    validate_schema,
    clean_and_deduplicate,
    match_unlinked_complaints,
    merge_datasets,
    read_dataset,
    read_outages,
    read_complaints,
    read_usage,
    get_data_quality_summary
)


class TestIngestion(unittest.TestCase):

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.csv_path = os.path.join(self.temp_dir.name, "outages.csv")
        self.json_path = os.path.join(self.temp_dir.name, "outages.json")

        self.sample_outages_df = pd.DataFrame({
            'outage_id': ['OUT-101', 'OUT-102'],
            'region_id': ['REG-01', 'REG-02'],
            'start_time': ['2026-07-29 10:00:00', '2026-07-29 11:00:00'],
            'severity': ['CRITICAL', 'HIGH'],
            'status': ['open', 'open']
        })
        self.sample_outages_df.to_csv(self.csv_path, index=False)
        self.sample_outages_df.to_json(self.json_path, orient='records')

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_read_dataset_csv(self):
        """FR1: Test reading a valid CSV dataset."""
        df = read_dataset(self.csv_path, dataset_name='outages')
        self.assertEqual(len(df), 2)
        self.assertIn('outage_id', df.columns)

    def test_read_dataset_json(self):
        """FR1: Test reading a valid JSON dataset."""
        df = read_dataset(self.json_path, dataset_name='outages')
        self.assertEqual(len(df), 2)
        self.assertIn('outage_id', df.columns)

    def test_read_dataset_file_not_found(self):
        """FR1: Test that reading a missing file raises FileNotFoundError."""
        with self.assertRaises(FileNotFoundError):
            read_dataset("non_existent_file.csv")

    def test_read_dataset_unsupported_format(self):
        """FR1: Test that reading an unsupported file format raises ValueError."""
        txt_path = os.path.join(self.temp_dir.name, "outages.txt")
        with open(txt_path, "w") as f:
            f.write("text content")
        with self.assertRaises(ValueError):
            read_dataset(txt_path)

    def test_validate_schema_success(self):
        """FR2: Test schema validation passes when all required fields are present."""
        df = pd.DataFrame({
            'outage_id': ['OUT-101'],
            'region_id': ['REG-01'],
            'start_time': ['2026-07-29 10:00:00'],
            'severity': ['CRITICAL'],
            'status': ['open']
        })
        self.assertTrue(validate_schema(df, 'outages'))

    def test_validate_schema_missing_field(self):
        """FR2: Test schema validation fails with ValueError when required fields are missing."""
        df = pd.DataFrame({
            'outage_id': ['OUT-101'],
            'severity': ['CRITICAL']
        })
        with self.assertRaises(ValueError):
            validate_schema(df, 'outages')

    def test_validate_schema_unknown_dataset(self):
        """FR2: Test schema validation raises ValueError for unknown dataset name."""
        with self.assertRaises(ValueError):
            validate_schema(self.sample_outages_df, 'unknown_dataset')

    def test_validate_schema_strict_null_keys(self):
        """FR2 & NFR Data Quality: Test strict schema validation fails when primary keys are null."""
        df_with_null_pk = pd.DataFrame({
            'outage_id': ['OUT-101', None],
            'region_id': ['REG-01', 'REG-02'],
            'start_time': ['2026-07-29 10:00:00', '2026-07-29 11:00:00'],
            'severity': ['CRITICAL', 'HIGH'],
            'status': ['open', 'open']
        })
        with self.assertRaises(ValueError):
            validate_schema(df_with_null_pk, 'outages', strict=True)

    def test_get_data_quality_summary(self):
        """FR2 & NFR Data Quality: Test data quality summary calculation."""
        summary = get_data_quality_summary(self.sample_outages_df, 'outages')
        self.assertEqual(summary['dataset_name'], 'outages')
        self.assertEqual(summary['total_records'], 2)
        self.assertTrue(summary['is_schema_valid'])
        self.assertEqual(summary['malformed_rows_count'], 0)
        self.assertEqual(summary['status'], 'HEALTHY')
        self.assertEqual(summary['completeness_percentage'], 100.0)

    def test_clean_and_deduplicate(self):
        """FR3: Test duplicate records are removed and whitespace is stripped."""
        df = pd.DataFrame({
            'outage_id': ['OUT-101 ', 'OUT-101', 'OUT-102'],
            'region_id': ['REG-01', 'REG-01', 'REG-02']
        })
        cleaned = clean_and_deduplicate(df, 'outage_id')
        self.assertEqual(len(cleaned), 2)
        self.assertListEqual(list(cleaned['outage_id']), ['OUT-101', 'OUT-102'])

    def test_match_unlinked_complaints(self):
        """PRD Section 6: Test matching unlinked complaints to open outages by region and time window."""
        outages_df = pd.DataFrame({
            'outage_id': ['OUT-101'],
            'region_id': ['REG-01'],
            'start_time': ['2026-07-29 10:00:00'],
            'status': ['open']
        })
        complaints_df = pd.DataFrame({
            'complaint_id': ['CMP-01'],
            'region_id': ['REG-01'],
            'timestamp': ['2026-07-29 10:30:00'],
            'linked_outage_id': [None]
        })
        matched = match_unlinked_complaints(complaints_df, outages_df, time_window_hours=2)
        self.assertEqual(matched.iloc[0]['linked_outage_id'], 'OUT-101')

    def test_merge_datasets(self):
        """FR4: Test merging outage, usage, and complaint counts."""
        outages_df = pd.DataFrame({
            'outage_id': ['OUT-101'],
            'region_id': ['REG-01'],
            'start_time': ['2026-07-29 10:00:00'],
            'severity': ['CRITICAL'],
            'status': ['open']
        })
        usage_df = pd.DataFrame({
            'region_id': ['REG-01'],
            'region_name': ['North Region'],
            'subscriber_count': [50000],
            'revenue_tier': ['Tier 1']
        })
        complaints_df = pd.DataFrame({
            'complaint_id': ['CMP-01', 'CMP-02'],
            'linked_outage_id': ['OUT-101', 'OUT-101'],
            'region_id': ['REG-01', 'REG-01'],
            'timestamp': ['2026-07-29 10:15:00', '2026-07-29 10:20:00']
        })
        
        merged = merge_datasets(outages_df, complaints_df, usage_df)
        self.assertEqual(len(merged), 1)
        self.assertEqual(merged.iloc[0]['subscriber_count'], 50000)
        self.assertEqual(merged.iloc[0]['complaint_count'], 2)


if __name__ == '__main__':
    unittest.main()
