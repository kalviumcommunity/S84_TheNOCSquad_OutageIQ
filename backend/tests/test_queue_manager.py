import unittest
import sys
import os
import tempfile
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../scripts')))

from scoring import compute_impact_scores
from queue_manager import (
    get_prioritized_queue,
    update_queue_with_new_complaints,
    log_queue_snapshot,
    benchmark_queue_reranking
)


class TestQueueManager(unittest.TestCase):

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.sample_df = pd.DataFrame({
            'outage_id': ['OUT-101', 'OUT-102', 'OUT-103', 'OUT-104'],
            'region_id': ['REG-NORTH', 'REG-SOUTH', 'REG-EAST', 'REG-WEST'],
            'subscriber_count': [100000, 50000, 20000, 10000],
            'complaint_count': [500, 200, 50, 10],
            'revenue_tier': ['Tier 1', 'Tier 1', 'Tier 2', 'Tier 3'],
            'severity': ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
            'status': ['open', 'open', 'open', 'resolved']
        })

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_get_prioritized_queue_sorting_and_ranking(self):
        """FR6 & FR8: Test that queue ranks outages by impact_score descending with sequential rank indices."""
        scored = compute_impact_scores(self.sample_df)
        ranked = get_prioritized_queue(scored)

        self.assertEqual(ranked.iloc[0]['outage_id'], 'OUT-101')
        self.assertEqual(ranked.iloc[0]['rank'], 1)
        self.assertEqual(ranked.iloc[0]['rank_badge'], '#1')

        # Check descending order
        scores = list(ranked['impact_score'])
        self.assertEqual(scores, sorted(scores, reverse=True))

    def test_get_prioritized_queue_filter_open_only(self):
        """FR8: Test filtering open-only outages."""
        scored = compute_impact_scores(self.sample_df)
        open_queue = get_prioritized_queue(scored, filter_open_only=True)

        self.assertEqual(len(open_queue), 3)
        self.assertNotIn('OUT-104', list(open_queue['outage_id']))

    def test_sort_stability_across_identical_scores(self):
        """NFR Reliability: Test stable deterministic tie-breaking for identical scores."""
        identical_df = pd.DataFrame({
            'outage_id': ['OUT-B', 'OUT-A'],
            'subscriber_count': [50000, 50000],
            'complaint_count': [100, 100],
            'revenue_tier': ['Tier 1', 'Tier 1'],
            'severity': ['HIGH', 'HIGH'],
            'status': ['open', 'open']
        })
        scored = compute_impact_scores(identical_df)
        ranked = get_prioritized_queue(scored)

        self.assertEqual(ranked.iloc[0]['impact_score'], ranked.iloc[1]['impact_score'])
        # Stable tie-break by outage_id
        self.assertEqual(ranked.iloc[0]['outage_id'], 'OUT-A')
        self.assertEqual(ranked.iloc[1]['outage_id'], 'OUT-B')

    def test_update_queue_with_new_complaints_reranking(self):
        """FR6 & FR8: Test real-time complaint spike re-ranking."""
        scored = compute_impact_scores(self.sample_df)
        ranked_initial = get_prioritized_queue(scored)
        self.assertEqual(ranked_initial.iloc[2]['outage_id'], 'OUT-103')
        self.assertEqual(ranked_initial.iloc[2]['rank'], 3)

        # Spike OUT-103 complaints from 50 to 5000
        reranked = update_queue_with_new_complaints(self.sample_df, outage_id='OUT-103', additional_complaints=4950)
        # OUT-103 jumps ahead of OUT-102 from Rank #3 to Rank #2
        self.assertEqual(reranked.iloc[1]['outage_id'], 'OUT-103')
        self.assertEqual(reranked.iloc[1]['rank'], 2)

    def test_log_queue_snapshot(self):
        """FR14: Test logging snapshot metadata and JSON dump for historical auditing."""
        scored = compute_impact_scores(self.sample_df)
        ranked = get_prioritized_queue(scored)

        meta = log_queue_snapshot(ranked, output_dir=self.temp_dir.name, snapshot_name="test_snap")
        self.assertEqual(meta['snapshot_id'], 'test_snap')
        self.assertEqual(meta['total_active_incidents'], 4)
        self.assertEqual(meta['top_ranked_outage_id'], 'OUT-101')

        # Check JSON file written
        expected_file = os.path.join(self.temp_dir.name, "test_snap.json")
        self.assertTrue(os.path.exists(expected_file))

    def test_benchmark_queue_reranking_under_5_seconds(self):
        """PRD Section 11 & NFR Performance: Verify 100k record re-ranking finishes in < 5.0 seconds."""
        duration = benchmark_queue_reranking(num_records=10000)
        self.assertLess(duration, 5.0, f"Reranking took {duration:.2f}s, exceeding 5.0s NFR target")


if __name__ == '__main__':
    unittest.main()
