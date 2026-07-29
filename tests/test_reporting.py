import unittest
import sys
import os
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../analytics-workspace-setup/scripts')))

from reporting import filter_outages, get_executive_summary

class TestReporting(unittest.TestCase):

    def setUp(self):
        self.sample_df = pd.DataFrame({
            'outage_id': ['OUT-1', 'OUT-2', 'OUT-3'],
            'region_id': ['REG-01', 'REG-02', 'REG-01'],
            'severity': ['CRITICAL', 'HIGH', 'LOW'],
            'status': ['open', 'open', 'resolved'],
            'priority_tier': ['Critical', 'High', 'Low'],
            'impact_score': [92.5, 64.0, 15.0]
        })

    def test_filter_by_region(self):
        """FR13: Test filtering outages by region ID."""
        res = filter_outages(self.sample_df, region_id='REG-01')
        self.assertEqual(len(res), 2)
        self.assertListEqual(list(res['outage_id']), ['OUT-1', 'OUT-3'])

    def test_filter_by_status_and_severity(self):
        """FR13: Test filtering outages by status and severity."""
        res = filter_outages(self.sample_df, status='open', severity='CRITICAL')
        self.assertEqual(len(res), 1)
        self.assertEqual(res.iloc[0]['outage_id'], 'OUT-1')

    def test_get_executive_summary_top_n(self):
        """FR14 & FR15: Test retrieving top N highest-impact outages for executive summary."""
        top_2 = get_executive_summary(self.sample_df, top_n=2)
        self.assertEqual(len(top_2), 2)
        self.assertEqual(top_2.iloc[0]['outage_id'], 'OUT-1')
        self.assertEqual(top_2.iloc[1]['outage_id'], 'OUT-2')

if __name__ == '__main__':
    unittest.main()
