import unittest
import sys
import os
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../analytics-workspace-setup/scripts')))

from scoring import min_max_normalize, compute_impact_scores, assign_priority_tier

class TestScoringEngine(unittest.TestCase):

    def test_min_max_normalize(self):
        """PRD Section 7: Test min-max normalization returns values strictly in range [0, 1]."""
        s = pd.Series([10, 20, 30])
        norm = min_max_normalize(s)
        self.assertAlmostEqual(norm.iloc[0], 0.0)
        self.assertAlmostEqual(norm.iloc[1], 0.5)
        self.assertAlmostEqual(norm.iloc[2], 1.0)

    def test_impact_score_calculation(self):
        """FR5 & Section 7: Test impact score calculation and relative ranking."""
        data = pd.DataFrame({
            'outage_id': ['OUT-1', 'OUT-2'],
            'region_id': ['REG-01', 'REG-02'],
            'subscriber_count': [100000, 10000],
            'complaint_count': [500, 10],
            'revenue_tier': ['Tier 1', 'Tier 3'],
            'severity': ['CRITICAL', 'LOW']
        })
        scored = compute_impact_scores(data)
        
        self.assertIn('impact_score', scored.columns)
        # OUT-1 has maximum metrics across all sub-scores, so normalized sub-scores should be 1.0 -> impact score = 100
        self.assertEqual(scored.iloc[0]['impact_score'], 100.0)
        self.assertEqual(scored.iloc[0]['priority_tier'], 'Critical')
        # OUT-2 has minimum metrics -> impact score = 0
        self.assertEqual(scored.iloc[1]['impact_score'], 0.0)
        self.assertEqual(scored.iloc[1]['priority_tier'], 'Low')

    def test_custom_weights(self):
        """NFR Extensibility: Test scoring with custom configurable weights."""
        data = pd.DataFrame({
            'outage_id': ['OUT-1', 'OUT-2'],
            'subscriber_count': [100000, 10000],
            'complaint_count': [500, 10],
            'revenue_tier': ['Tier 1', 'Tier 3'],
            'severity': ['CRITICAL', 'LOW']
        })
        custom_weights = {
            'reach': 0.50,
            'complaints': 0.20,
            'revenue': 0.20,
            'duration': 0.10
        }
        scored = compute_impact_scores(data, weights=custom_weights)
        self.assertEqual(scored.iloc[0]['impact_score'], 100.0)

    def test_assign_priority_tier(self):
        """FR7: Test threshold mapping to priority tiers."""
        self.assertEqual(assign_priority_tier(80.0), 'Critical')
        self.assertEqual(assign_priority_tier(60.0), 'High')
        self.assertEqual(assign_priority_tier(30.0), 'Medium')
        self.assertEqual(assign_priority_tier(10.0), 'Low')

    def test_missing_data_confidence_flag(self):
        """NFR Reliability: Test missing data surfaces partial score with confidence_flag=False."""
        data = pd.DataFrame({
            'outage_id': ['OUT-1'],
            'subscriber_count': [None],  # missing usage data
            'complaint_count': [100],
            'revenue_tier': ['Tier 2'],
            'severity': ['HIGH']
        })
        scored = compute_impact_scores(data)
        self.assertFalse(scored.iloc[0]['confidence_flag'])
        self.assertIn('impact_score', scored.columns)

if __name__ == '__main__':
    unittest.main()
