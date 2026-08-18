import unittest
import sys
import os
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../scripts')))

from reporting import (
    filter_outages,
    get_executive_summary,
    calculate_sla_status,
    add_sla_tracking,
    get_filter_summary,
    SLA_TARGET_HOURS
)


class TestReporting(unittest.TestCase):

    def setUp(self):
        self.sample_df = pd.DataFrame({
            'outage_id': ['OUT-101', 'OUT-102', 'OUT-103', 'OUT-104'],
            'region_id': ['REG-NORTH', 'REG-SOUTH', 'REG-NORTH', 'REG-WEST'],
            'node': ['Node-DEL-991', 'Tower-BOM-402', 'Node-GZB-012', 'Tower-CCU-055'],
            'severity': ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
            'status': ['open', 'open', 'resolved', 'resolving'],
            'priority_tier': ['Critical', 'High', 'Medium', 'Low'],
            'impact_score': [92.5, 64.0, 42.0, 15.0],
            'duration_hours': [3.5, 1.5, 2.0, 0.5],
            'root_cause': ['Backhaul Fiber Cut', 'Power Surge', 'Firmware Delay', 'Feeder Cable']
        })

    def test_filter_by_region_single_and_list(self):
        """FR13: Test filtering outages by single region ID and list of regions."""
        res_single = filter_outages(self.sample_df, region_id='REG-NORTH')
        self.assertEqual(len(res_single), 2)
        self.assertListEqual(list(res_single['outage_id']), ['OUT-101', 'OUT-103'])

        res_list = filter_outages(self.sample_df, region_id=['REG-NORTH', 'REG-SOUTH'])
        self.assertEqual(len(res_list), 3)

        res_all = filter_outages(self.sample_df, region_id='ALL')
        self.assertEqual(len(res_all), 4)

    def test_filter_by_status_and_severity(self):
        """FR13: Test filtering outages by compound status and severity."""
        res = filter_outages(self.sample_df, status='open', severity='CRITICAL')
        self.assertEqual(len(res), 1)
        self.assertEqual(res.iloc[0]['outage_id'], 'OUT-101')

    def test_filter_by_priority_tier(self):
        """FR13: Test filtering by operational priority tier."""
        res = filter_outages(self.sample_df, priority_tier='High')
        self.assertEqual(len(res), 1)
        self.assertEqual(res.iloc[0]['outage_id'], 'OUT-102')

    def test_filter_by_search_query(self):
        """FR13: Test substring search across Outage ID, Node, and Root Cause."""
        res_id = filter_outages(self.sample_df, search_query='OUT-102')
        self.assertEqual(len(res_id), 1)
        self.assertEqual(res_id.iloc[0]['outage_id'], 'OUT-102')

        res_node = filter_outages(self.sample_df, search_query='DEL-991')
        self.assertEqual(len(res_node), 1)
        self.assertEqual(res_node.iloc[0]['outage_id'], 'OUT-101')

        res_cause = filter_outages(self.sample_df, search_query='Fiber')
        self.assertEqual(len(res_cause), 1)
        self.assertEqual(res_cause.iloc[0]['outage_id'], 'OUT-101')

    def test_calculate_sla_status(self):
        """FR13 / SLA Tracking: Test SLA calculation (breached, at-risk, on-track)."""
        # Critical SLA target is 2.0 hours
        breached = calculate_sla_status(elapsed_hours=3.5, severity='CRITICAL')
        self.assertEqual(breached['sla_status'], 'BREACHED')
        self.assertEqual(breached['sla_target_hours'], 2.0)
        self.assertLess(breached['remaining_hours'], 0)

        # High SLA target is 4.0 hours, elapsed 3.75 hours -> 0.25 hours left (<30 min -> AT_RISK)
        at_risk = calculate_sla_status(elapsed_hours=3.75, severity='HIGH')
        self.assertEqual(at_risk['sla_status'], 'AT_RISK')

        # Low SLA target is 24.0 hours, elapsed 1.0 hours -> ON_TRACK
        on_track = calculate_sla_status(elapsed_hours=1.0, severity='LOW')
        self.assertEqual(on_track['sla_status'], 'ON_TRACK')
        self.assertEqual(on_track['remaining_hours'], 23.0)

    def test_add_sla_tracking(self):
        """FR13: Test attaching SLA columns to outage dataset."""
        tracked = add_sla_tracking(self.sample_df)
        self.assertIn('sla_status', tracked.columns)
        self.assertIn('sla_remaining_hours', tracked.columns)
        self.assertIn('sla_badge', tracked.columns)

        # OUT-101 has 3.5h elapsed on Critical (2.0h target) -> BREACHED
        self.assertEqual(tracked.iloc[0]['sla_status'], 'BREACHED')

    def test_get_executive_summary_top_n(self):
        """FR14 & FR15: Test retrieving top N highest-impact outages for executive summary."""
        top_2 = get_executive_summary(self.sample_df, top_n=2)
        self.assertEqual(len(top_2), 2)
        self.assertEqual(top_2.iloc[0]['outage_id'], 'OUT-101')
        self.assertEqual(top_2.iloc[1]['outage_id'], 'OUT-102')

    def test_get_filter_summary(self):
        """FR13: Test summary label generator for filtered results."""
        filtered = filter_outages(self.sample_df, region_id='REG-NORTH')
        summary = get_filter_summary(filtered, original_total=len(self.sample_df))
        self.assertEqual(summary['total_records'], 4)
        self.assertEqual(summary['matched_records'], 2)
        self.assertTrue(summary['filter_applied'])
        self.assertEqual(summary['summary_label'], "Showing 2 of 4 outages")


if __name__ == '__main__':
    unittest.main()
