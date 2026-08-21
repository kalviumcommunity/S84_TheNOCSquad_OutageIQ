import unittest
import sys
import os
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../scripts')))

from trend_analytics import (
    compute_kpis,
    compute_rolling_trends,
    detect_critical_breach_events
)


class TestTrendAnalytics(unittest.TestCase):

    def setUp(self):
        self.active_df = pd.DataFrame({
            'outage_id': ['OUT-101', 'OUT-102', 'OUT-103', 'OUT-104'],
            'region_id': ['North Region', 'West Region', 'South Region', 'East Region'],
            'node': ['Node-DEL-991', 'Tower-BOM-402', 'Node-BLR-108', 'Tower-CCU-055'],
            'subscriber_count': [45000, 32000, 28000, 14000],
            'revenue_exposure': ['$45,000 / hr', '$38,500 / hr', '$28,000 / hr', '$15,200 / hr'],
            'impact_score': [94.2, 88.5, 76.1, 64.3],
            'priority_tier': ['Critical', 'Critical', 'Critical', 'High'],
            'sla_status': ['BREACHED', 'BREACHED', 'ON_TRACK', 'ON_TRACK'],
            'duration_hours': [3.5, 2.2, 1.5, 1.2],
            'root_cause': ['Backhaul Fiber Cut', 'Power Surge', 'RF Degradation', 'Memory Leak']
        })

        self.resolved_df = pd.DataFrame({
            'outage_id': ['OUT-090', 'OUT-091'],
            'duration_hours': [1.6, 2.0]
        })

    def test_compute_kpis_accuracy(self):
        """FR8: Test accuracy of calculated executive KPIs."""
        kpis = compute_kpis(self.active_df, self.resolved_df)

        self.assertEqual(kpis['total_active_outages'], 4)
        self.assertEqual(kpis['critical_outages_count'], 3) # OUT-101, 102, 103 >= 75.0
        self.assertEqual(kpis['total_customers_impacted'], 119000) # 45k + 32k + 28k + 14k
        self.assertEqual(kpis['total_revenue_at_risk_hourly'], 126700.0) # 45k + 38.5k + 28k + 15.2k
        self.assertEqual(kpis['avg_mttr_hours'], 1.8) # (1.6 + 2.0)/2
        self.assertEqual(kpis['sla_compliance_rate'], 50.0) # 2 out of 4 non-breached

    def test_compute_kpis_empty_dataset(self):
        """FR8: Test KPI computation handles empty dataframe cleanly."""
        empty_kpis = compute_kpis(pd.DataFrame())
        self.assertEqual(empty_kpis['total_active_outages'], 0)
        self.assertEqual(empty_kpis['critical_outages_count'], 0)
        self.assertEqual(empty_kpis['total_customers_impacted'], 0)
        self.assertEqual(empty_kpis['sla_compliance_rate'], 100.0)

    def test_compute_rolling_trends_7_and_30_days(self):
        """FR12: Test rolling impact trend aggregation across 7-day and 30-day horizons."""
        trends_7 = compute_rolling_trends(window_days=7)
        self.assertEqual(trends_7['window_days'], 7)
        self.assertEqual(len(trends_7['data_points']), 7)
        self.assertGreater(trends_7['total_period_outages'], 0)
        self.assertGreater(trends_7['avg_period_impact_score'], 0)
        self.assertIn('volume_reduction_pct', trends_7)

        trends_30 = compute_rolling_trends(window_days=30)
        self.assertEqual(trends_30['window_days'], 30)
        self.assertEqual(len(trends_30['data_points']), 4) # 4 weeks
        self.assertGreater(trends_30['total_period_outages'], 0)

    def test_detect_critical_breach_events(self):
        """FR16: Test critical score threshold and SLA breach event detection."""
        alerts = detect_critical_breach_events(self.active_df, threshold=75.0)

        # 3 Critical incidents in active_df (OUT-101, OUT-102, OUT-103)
        self.assertEqual(len(alerts), 3)
        self.assertEqual(alerts[0]['outage_id'], 'OUT-101')
        self.assertEqual(alerts[0]['score'], 94.2)
        self.assertEqual(alerts[0]['alert_type'], 'CRITICAL_THRESHOLD_EXCEEDED')
        self.assertIn('Node-DEL-991', alerts[0]['action_required'])

        empty_alerts = detect_critical_breach_events(pd.DataFrame())
        self.assertEqual(len(empty_alerts), 0)


if __name__ == '__main__':
    unittest.main()
