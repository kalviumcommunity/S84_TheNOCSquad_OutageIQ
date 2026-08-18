import unittest
import sys
import os
import json
import tempfile
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../scripts')))

from scoring import (
    min_max_normalize,
    compute_impact_scores,
    compute_single_outage_score,
    assign_priority_tier,
    get_priority_tier_details,
    evaluate_data_confidence,
    load_scoring_weights,
    DEFAULT_WEIGHTS,
    WEIGHT_PRESETS
)


class TestScoringEngine(unittest.TestCase):

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.temp_dir.cleanup()

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
        self.assertIn('tier_details', result)
        self.assertEqual(result['tier_details']['color'], 'rose')
        self.assertGreater(result['impact_score'], 80.0)

    # --- Phase 4 Dynamic Priority Tiering & Config Tests ---

    def test_assign_priority_tier_boundaries(self):
        """FR7: Test exact threshold boundary mapping to priority tiers."""
        # Critical tier: >= 75.0
        self.assertEqual(assign_priority_tier(100.0), 'Critical')
        self.assertEqual(assign_priority_tier(75.0), 'Critical')
        self.assertEqual(assign_priority_tier(74.99), 'High')

        # High tier: 50.0 - 74.99
        self.assertEqual(assign_priority_tier(60.0), 'High')
        self.assertEqual(assign_priority_tier(50.0), 'High')
        self.assertEqual(assign_priority_tier(49.99), 'Medium')

        # Medium tier: 25.0 - 49.99
        self.assertEqual(assign_priority_tier(35.0), 'Medium')
        self.assertEqual(assign_priority_tier(25.0), 'Medium')
        self.assertEqual(assign_priority_tier(24.99), 'Low')

        # Low tier: < 25.0
        self.assertEqual(assign_priority_tier(10.0), 'Low')
        self.assertEqual(assign_priority_tier(0.0), 'Low')
        self.assertEqual(assign_priority_tier(None), 'Low')

    def test_get_priority_tier_details(self):
        """FR7: Test priority tier metadata retrieval."""
        crit = get_priority_tier_details('Critical')
        self.assertEqual(crit['min_score'], 75.0)
        self.assertEqual(crit['sla_target_hours'], 2)
        self.assertEqual(crit['color'], 'rose')

        high = get_priority_tier_details('High')
        self.assertEqual(high['min_score'], 50.0)
        self.assertEqual(high['sla_target_hours'], 4)

    def test_evaluate_data_confidence(self):
        """NFR Reliability: Test data confidence evaluator with complete and missing metrics."""
        complete_row = {
            'subscriber_count': 50000,
            'complaint_count': 120,
            'revenue_tier': 'Tier 1'
        }
        conf = evaluate_data_confidence(complete_row)
        self.assertTrue(conf['confidence_flag'])
        self.assertEqual(len(conf['missing_fields']), 0)
        self.assertEqual(conf['badge_label'], 'High Confidence')

        partial_row = {
            'subscriber_count': None,
            'complaint_count': 120,
            'revenue_tier': None
        }
        partial_conf = evaluate_data_confidence(partial_row)
        self.assertFalse(partial_conf['confidence_flag'])
        self.assertIn('subscriber_count', partial_conf['missing_fields'])
        self.assertIn('revenue_tier', partial_conf['missing_fields'])
        self.assertEqual(partial_conf['badge_label'], 'Low Confidence - Partial Data')

    def test_missing_data_confidence_flag_in_scoring(self):
        """NFR Reliability: Test compute_impact_scores with missing telemetry."""
        data = pd.DataFrame({
            'outage_id': ['OUT-1', 'OUT-2'],
            'subscriber_count': [None, 50000],  # OUT-1 missing usage data
            'complaint_count': [100, 50],
            'revenue_tier': ['Tier 2', 'Tier 1'],
            'severity': ['HIGH', 'CRITICAL']
        })
        scored = compute_impact_scores(data)
        self.assertFalse(scored.iloc[0]['confidence_flag'])
        self.assertEqual(scored.iloc[0]['confidence_label'], 'Low Confidence - Partial Data')
        self.assertTrue(scored.iloc[1]['confidence_flag'])
        self.assertEqual(scored.iloc[1]['confidence_label'], 'High Confidence')
        self.assertIn('impact_score', scored.columns)

    def test_load_scoring_weights_presets(self):
        """NFR Extensibility: Test loading preset weights."""
        customer_weights = load_scoring_weights(preset='CUSTOMER_CENTRIC', env_override=False)
        self.assertEqual(customer_weights['reach'], 0.40)
        self.assertEqual(customer_weights['complaints'], 0.40)
        self.assertEqual(customer_weights['revenue'], 0.10)
        self.assertEqual(customer_weights['duration'], 0.10)

        revenue_weights = load_scoring_weights(preset='REVENUE_FOCUSED', env_override=False)
        self.assertEqual(revenue_weights['revenue'], 0.50)

    def test_load_scoring_weights_json_config(self):
        """NFR Extensibility: Test loading weights from JSON config file."""
        config_file = os.path.join(self.temp_dir.name, "weights.json")
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump({'reach': 0.50, 'complaints': 0.20, 'revenue': 0.20, 'duration': 0.10}, f)

        loaded = load_scoring_weights(config_path=config_file, env_override=False)
        self.assertEqual(loaded['reach'], 0.50)
        self.assertEqual(loaded['complaints'], 0.20)

    def test_load_scoring_weights_env_override(self):
        """NFR Extensibility: Test environment variable overrides."""
        os.environ['IMPACT_WEIGHT_REACH'] = '0.45'
        os.environ['IMPACT_WEIGHT_COMPLAINTS'] = '0.25'
        os.environ['IMPACT_WEIGHT_REVENUE'] = '0.15'
        os.environ['IMPACT_WEIGHT_DURATION'] = '0.15'

        try:
            loaded = load_scoring_weights(env_override=True)
            self.assertEqual(loaded['reach'], 0.45)
            self.assertEqual(loaded['complaints'], 0.25)
        finally:
            del os.environ['IMPACT_WEIGHT_REACH']
            del os.environ['IMPACT_WEIGHT_COMPLAINTS']
            del os.environ['IMPACT_WEIGHT_REVENUE']
            del os.environ['IMPACT_WEIGHT_DURATION']


if __name__ == '__main__':
    unittest.main()
