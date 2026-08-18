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
    get_complaint_linkage_summary,
    merge_datasets,
    run_data_pipeline,
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

    # --- Phase 1 Ingestion & Schema Tests ---

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

    # --- Phase 2 Data Cleaning, Deduplication & Temporal Matching Tests ---

    def test_clean_and_deduplicate(self):
        """FR3: Test duplicate records removal, whitespace trimming, and uppercase normalization."""
        df = pd.DataFrame({
            'outage_id': ['out-101 ', 'OUT-101', 'OUT-102'],
            'region_id': [' reg-01', 'REG-01', 'REG-02 '],
            'severity': [' critical ', 'CRITICAL', 'high '],
            'status': [' OPEN ', 'open', ' RESOLVED']
        })
        cleaned = clean_and_deduplicate(df, 'outage_id')
        self.assertEqual(len(cleaned), 2)
        self.assertListEqual(list(cleaned['outage_id']), ['OUT-101', 'OUT-102'])
        self.assertListEqual(list(cleaned['region_id']), ['REG-01', 'REG-02'])
        self.assertListEqual(list(cleaned['severity']), ['CRITICAL', 'HIGH'])
        self.assertListEqual(list(cleaned['status']), ['open', 'resolved'])

    def test_match_unlinked_complaints_within_window(self):
        """FR4 & PRD Section 6: Test unlinked complaints matching to open outages within 2-hour window."""
        outages_df = pd.DataFrame({
            'outage_id': ['OUT-101'],
            'region_id': ['REG-01'],
            'start_time': ['2026-07-29 10:00:00'],
            'status': ['open']
        })
        complaints_df = pd.DataFrame({
            'complaint_id': ['CMP-01', 'CMP-02'],
            'region_id': ['REG-01', 'REG-01'],
            'timestamp': ['2026-07-29 10:30:00', '2026-07-29 11:45:00'],
            'linked_outage_id': [None, 'OUT-101']
        })
        matched = match_unlinked_complaints(complaints_df, outages_df, time_window_hours=2.0)
        self.assertEqual(matched.iloc[0]['linked_outage_id'], 'OUT-101')
        self.assertEqual(matched.iloc[0]['match_type'], 'temporal_match')
        self.assertEqual(matched.iloc[1]['linked_outage_id'], 'OUT-101')
        self.assertEqual(matched.iloc[1]['match_type'], 'explicit')

    def test_match_unlinked_complaints_out_of_window_isolated(self):
        """FR4 & PRD Section 6: Test complaints outside time window remain unlinked."""
        outages_df = pd.DataFrame({
            'outage_id': ['OUT-101'],
            'region_id': ['REG-01'],
            'start_time': ['2026-07-29 10:00:00'],
            'status': ['open']
        })
        # 5 hours later (beyond default 2.0 hour window)
        complaints_df = pd.DataFrame({
            'complaint_id': ['CMP-01'],
            'region_id': ['REG-01'],
            'timestamp': ['2026-07-29 15:30:00'],
            'linked_outage_id': [None]
        })
        matched = match_unlinked_complaints(complaints_df, outages_df, time_window_hours=2.0)
        self.assertIsNone(matched.iloc[0]['linked_outage_id'])
        self.assertEqual(matched.iloc[0]['match_type'], 'unlinked')

    def test_match_unlinked_complaints_different_region_unmatched(self):
        """FR4: Test complaints in different region are not matched even if within time window."""
        outages_df = pd.DataFrame({
            'outage_id': ['OUT-101'],
            'region_id': ['REG-NORTH'],
            'start_time': ['2026-07-29 10:00:00'],
            'status': ['open']
        })
        complaints_df = pd.DataFrame({
            'complaint_id': ['CMP-01'],
            'region_id': ['REG-SOUTH'],
            'timestamp': ['2026-07-29 10:15:00'],
            'linked_outage_id': [None]
        })
        matched = match_unlinked_complaints(complaints_df, outages_df, time_window_hours=2.0)
        self.assertIsNone(matched.iloc[0]['linked_outage_id'])
        self.assertEqual(matched.iloc[0]['match_type'], 'unlinked')

    def test_match_unlinked_complaints_multi_outage_closest(self):
        """FR4: When multiple open outages exist in the region, match to the closest one in time."""
        outages_df = pd.DataFrame({
            'outage_id': ['OUT-EARLY', 'OUT-CLOSER'],
            'region_id': ['REG-01', 'REG-01'],
            'start_time': ['2026-07-29 08:30:00', '2026-07-29 09:50:00'],
            'status': ['open', 'open']
        })
        complaints_df = pd.DataFrame({
            'complaint_id': ['CMP-01'],
            'region_id': ['REG-01'],
            'timestamp': ['2026-07-29 10:00:00'],
            'linked_outage_id': [None]
        })
        matched = match_unlinked_complaints(complaints_df, outages_df, time_window_hours=2.0)
        # OUT-CLOSER is 10 mins away, OUT-EARLY is 90 mins away
        self.assertEqual(matched.iloc[0]['linked_outage_id'], 'OUT-CLOSER')
        self.assertEqual(matched.iloc[0]['match_type'], 'temporal_match')

    def test_get_complaint_linkage_summary(self):
        """Phase 2 UI: Test complaint linkage summary metrics."""
        complaints_df = pd.DataFrame({
            'complaint_id': ['C1', 'C2', 'C3', 'C4'],
            'match_type': ['explicit', 'explicit', 'temporal_match', 'unlinked']
        })
        summary = get_complaint_linkage_summary(complaints_df)
        self.assertEqual(summary['total_complaints'], 4)
        self.assertEqual(summary['explicit_linked_count'], 2)
        self.assertEqual(summary['temporally_matched_count'], 1)
        self.assertEqual(summary['unlinked_count'], 1)
        self.assertEqual(summary['matched_ratio_pct'], 75.0)
        self.assertEqual(summary['unlinked_ratio_pct'], 25.0)

    def test_merge_datasets(self):
        """FR4: Test merging outage, usage, and explicit/temporal complaint counts."""
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
            'match_type': ['explicit', 'temporal_match'],
            'region_id': ['REG-01', 'REG-01'],
            'timestamp': ['2026-07-29 10:15:00', '2026-07-29 10:20:00']
        })
        
        merged = merge_datasets(outages_df, complaints_df, usage_df)
        self.assertEqual(len(merged), 1)
        self.assertEqual(merged.iloc[0]['subscriber_count'], 50000)
        self.assertEqual(merged.iloc[0]['complaint_count'], 2)
        self.assertEqual(merged.iloc[0]['explicit_complaint_count'], 1)
        self.assertEqual(merged.iloc[0]['temporal_complaint_count'], 1)

    def test_merge_datasets_synthetic_multi_region_no_cartesian(self):
        """Integration: Test synthetic multi-region dataset merge without Cartesian explosion."""
        outages_df = pd.DataFrame({
            'outage_id': [f'OUT-{i}' for i in range(10)],
            'region_id': [f'REG-{i % 3}' for i in range(10)],
            'start_time': ['2026-07-29 10:00:00'] * 10,
            'severity': ['CRITICAL', 'HIGH', 'MEDIUM'] * 3 + ['LOW'],
            'status': ['open'] * 10
        })
        usage_df = pd.DataFrame({
            'region_id': [f'REG-{i}' for i in range(3)],
            'region_name': [f'Region {i}' for i in range(3)],
            'subscriber_count': [100000, 50000, 25000],
            'revenue_tier': ['Tier 1', 'Tier 2', 'Tier 3']
        })
        complaints_df = pd.DataFrame({
            'complaint_id': [f'CMP-{i}' for i in range(50)],
            'linked_outage_id': [f'OUT-{i % 10}' for i in range(50)],
            'match_type': ['explicit'] * 30 + ['temporal_match'] * 20,
            'region_id': [f'REG-{(i % 10) % 3}' for i in range(50)],
            'timestamp': ['2026-07-29 10:15:00'] * 50
        })

        merged = merge_datasets(outages_df, complaints_df, usage_df)
        # Should have exactly 10 rows (1 per outage)
        self.assertEqual(len(merged), 10)
        # Every outage should have attached subscriber_count and complaint_count
        self.assertTrue(merged['subscriber_count'].notna().all())
        self.assertEqual(merged['complaint_count'].sum(), 50)

    def test_run_data_pipeline(self):
        """Phase 2 Integration: Test full data pipeline execution."""
        outages_df = pd.DataFrame({
            'outage_id': ['OUT-101', 'OUT-101 '],  # duplicate with whitespace
            'region_id': ['REG-01', 'REG-01'],
            'start_time': ['2026-07-29 10:00:00', '2026-07-29 10:00:00'],
            'severity': ['CRITICAL', 'CRITICAL'],
            'status': ['open', 'open']
        })
        usage_df = pd.DataFrame({
            'region_id': ['REG-01', 'REG-01'],
            'region_name': ['North Region', 'North Region'],
            'subscriber_count': [50000, 50000],
            'revenue_tier': ['Tier 1', 'Tier 1']
        })
        complaints_df = pd.DataFrame({
            'complaint_id': ['CMP-01', 'CMP-02', 'CMP-02'],  # duplicate
            'region_id': ['REG-01', 'REG-01', 'REG-01'],
            'timestamp': ['2026-07-29 10:15:00', '2026-07-29 10:30:00', '2026-07-29 10:30:00'],
            'linked_outage_id': ['OUT-101', None, None]
        })

        res = run_data_pipeline(outages_df, complaints_df, usage_df, time_window_hours=2.0)
        self.assertEqual(res['status'], 'SUCCESS')
        self.assertEqual(res['dedup_metrics']['outages_dedup'], 1)
        self.assertEqual(res['dedup_metrics']['complaints_dedup'], 2)
        self.assertEqual(res['linkage_summary']['explicit_linked_count'], 1)
        self.assertEqual(res['linkage_summary']['temporally_matched_count'], 1)
        self.assertEqual(res['merged_records'], 1)


if __name__ == '__main__':
    unittest.main()
