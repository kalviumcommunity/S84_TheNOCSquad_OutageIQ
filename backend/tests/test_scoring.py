import unittest
import sys
import os
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../scripts')))

from scoring import (
    min_max_normalize,
    compute_impact_scores,
    compute_single_outage_score,
    assign_priority_tier,
    DEFAULT_WEIGHTS
)


class TestScoringEngine(unittest.TestCase):

    def test_min_max_normalize(self):
        """PRD Section 7: Test min-max normalization returns values strictly in range [0, 1]."""
        s = pd.Series([10, 20, 30])
        norm = min_max_normalize(s)
        self.assertAlmostEqual(norm.iloc[0], 0.0)
        self.assertAlmostEqual(norm.iloc[1], 0.5)
        self.assertAlmostEqual(norm.iloc[2], 1.0)

    def test_min_max_normalize_identical_values(self):
        """PRD Section 7: Test min-max normalization with identical inputs returns 0.5 default."""
        s = pd.Series([100, 100, 100])
        norm = min_max_normalize(s)
        self.assertTrue((norm == 0.5).all())

    def test_min_max_normalize_empty_and_nan(self):
        """PRD Section 7: Test min-max normalization with empty and NaN inputs."""
        empty_s = pd.Series([], dtype=float)
        norm_empty = min_max_normalize(empty_s)
        self.assertTrue(norm_empty.empty)

        nan_s = pd.Series([np.nan, np.nan])
        norm_nan = min_max_normalize(nan_s)
        self.assertTrue((norm_nan == 0.5).all())

    def test_impact_score_calculation(self):
        """FR5 & Section 7: Test impact score calculation, exact 0-100 bounds, and relative ranking."""
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
        self.assertEqual(scored.iloc[0]['impact_score'], 100.0)
        self.assertEqual(scored.iloc[0]['priority_tier'], 'Critical')
        self.assertEqual(scored.iloc[1]['impact_score'], 0.0)
        self.assertEqual(scored.iloc[1]['priority_tier'], 'Low')

    def test_subscore_contributions_and_transparency(self):
        """FR10 & NFR Transparency: Verify sub-score contributions match total composite score."""
        data = pd.DataFrame({
            'outage_id': ['OUT-1', 'OUT-2', 'OUT-3'],
            'subscriber_count': [50000, 100000, 25000],
            'complaint_count': [100, 400, 50],
            'revenue_tier': ['Tier 2', 'Tier 1', 'Tier 3'],
            'severity': ['HIGH', 'CRITICAL', 'LOW']
        })
        scored = compute_impact_scores(data)

        for _, row in scored.iterrows():
            expected_sum = round(
                row['reach_contribution'] + 
                row['complaints_contribution'] + 
                row['revenue_contribution'] + 
                row['duration_contribution'], 
                2
            )
            self.assertAlmostEqual(row['impact_score'], expected_sum, places=1)
            self.assertGreaterEqual(row['impact_score'], 0.0)
            self.assertLessEqual(row['impact_score'], 100.0)

    def test_single_outage_score_computation(self):
        """PRD Section 7 Simulator: Test compute_single_outage_score transparency breakdown."""
        result = compute_single_outage_score(
            subscribers_norm=0.92,
            complaints_norm=0.85,
            revenue_norm=0.95,
            duration_norm=0.80
        )
        self.assertIn('impact_score', result)
        self.assertIn('priority_tier', result)
        self.assertEqual(result['priority_tier'], 'Critical')
        self.assertIn('subscores', result)
        self.assertIn('contributions', result)
        self.assertGreater(result['impact_score'], 80.0)

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
        self.assertEqual(assign_priority_tier(75.0), 'Critical')
        self.assertEqual(assign_priority_tier(60.0), 'High')
        self.assertEqual(assign_priority_tier(50.0), 'High')
        self.assertEqual(assign_priority_tier(30.0), 'Medium')
        self.assertEqual(assign_priority_tier(25.0), 'Medium')
        self.assertEqual(assign_priority_tier(10.0), 'Low')
        self.assertEqual(assign_priority_tier(0.0), 'Low')

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
