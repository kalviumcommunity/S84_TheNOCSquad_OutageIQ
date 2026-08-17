import unittest
import sys
import os
import pandas as pd

# Add scripts directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../scripts')))

from ingestion import validate_schema, clean_and_deduplicate, match_unlinked_complaints, merge_datasets

class TestIngestion(unittest.TestCase):

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
