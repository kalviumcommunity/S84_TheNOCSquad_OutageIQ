import unittest
import sys
import os
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../scripts')))

from geo_analytics import (
    compute_regional_aggregations,
    get_regional_ranking,
    _determine_dominant_severity,
    _determine_density_rating
)


class TestGeoAnalytics(unittest.TestCase):

    def setUp(self):
        self.sample_df = pd.DataFrame({
            'outage_id': ['OUT-101', 'OUT-102', 'OUT-103', 'OUT-104'],
            'region_id': ['North Region', 'North Region', 'West Region', 'South Region'],
            'subscriber_count': [45000, 1200, 32000, 28000],
            'revenue_exposure': ['$45,000 / hr', '$950 / hr', '$38,500 / hr', '$28,000 / hr'],
            'impact_score': [94.2, 21.4, 88.5, 76.1],
            'severity': ['CRITICAL', 'LOW', 'CRITICAL', 'HIGH'],
            'sla_status': ['BREACHED', 'ON_TRACK', 'BREACHED', 'ON_TRACK']
        })

    def test_compute_regional_aggregations_metrics_match(self):
        """FR11: Test that aggregated regional metrics accurately sum underlying outage records."""
        aggregations = compute_regional_aggregations(self.sample_df)
        
        # Look up North Region
        north = next(r for r in aggregations if r['region_id'] == 'North Region')
        self.assertEqual(north['outage_count'], 2)
        self.assertEqual(north['total_affected_subscribers'], 46200) # 45000 + 1200
        self.assertEqual(north['total_revenue_exposure_rate'], 45950.0) # 45000 + 950
        self.assertEqual(north['dominant_severity'], 'CRITICAL')
        self.assertEqual(north['sla_breach_count'], 1)
        self.assertEqual(north['sla_compliance_pct'], 50.0)
        self.assertEqual(north['impact_density_rating'], 'CRITICAL_IMPACT')

        # Look up South Region
        south = next(r for r in aggregations if r['region_id'] == 'South Region')
        self.assertEqual(south['outage_count'], 1)
        self.assertEqual(south['total_affected_subscribers'], 28000)
        self.assertEqual(south['sla_compliance_pct'], 100.0)

    def test_zero_outage_region_handling(self):
        """FR11: Test zero-outage regions produce clean empty states without division by zero."""
        aggregations = compute_regional_aggregations(self.sample_df)
        
        # East Region has 0 outages in sample_df
        east = next(r for r in aggregations if r['region_id'] == 'East Region')
        self.assertEqual(east['outage_count'], 0)
        self.assertEqual(east['total_affected_subscribers'], 0)
        self.assertEqual(east['total_revenue_exposure_rate'], 0.0)
        self.assertEqual(east['avg_impact_score'], 0.0)
        self.assertEqual(east['dominant_severity'], 'NONE')
        self.assertEqual(east['sla_compliance_pct'], 100.0)
        self.assertEqual(east['impact_density_rating'], 'HEALTHY')
        self.assertEqual(east['density_color'], 'emerald')

    def test_dominant_severity_resolution(self):
        """FR11: Test that dominant severity accurately picks the highest priority."""
        sevs_1 = pd.Series(['LOW', 'CRITICAL', 'MEDIUM'])
        self.assertEqual(_determine_dominant_severity(sevs_1), 'CRITICAL')

        sevs_2 = pd.Series(['LOW', 'MEDIUM', 'HIGH'])
        self.assertEqual(_determine_dominant_severity(sevs_2), 'HIGH')

        sevs_empty = pd.Series([])
        self.assertEqual(_determine_dominant_severity(sevs_empty), 'NONE')

    def test_density_rating_classification(self):
        """FR11: Test classification of density rating."""
        self.assertEqual(_determine_density_rating(0, 0.0, 'NONE'), 'HEALTHY')
        self.assertEqual(_determine_density_rating(1, 90.0, 'CRITICAL'), 'CRITICAL_IMPACT')
        self.assertEqual(_determine_density_rating(2, 60.0, 'HIGH'), 'HIGH_IMPACT')
        self.assertEqual(_determine_density_rating(1, 35.0, 'MEDIUM'), 'MODERATE_IMPACT')
        self.assertEqual(_determine_density_rating(1, 15.0, 'LOW'), 'LOW_IMPACT')

    def test_get_regional_ranking_sorting(self):
        """FR11: Test comparative regional rankings sorted by subscribers and revenue."""
        ranking_subscribers = get_regional_ranking(self.sample_df, sort_by='affected_subscribers')
        self.assertEqual(ranking_subscribers[0]['region_id'], 'North Region')
        self.assertEqual(ranking_subscribers[0]['rank'], 1)

        ranking_revenue = get_regional_ranking(self.sample_df, sort_by='revenue_exposure')
        self.assertEqual(ranking_revenue[0]['region_id'], 'North Region')
        self.assertEqual(ranking_revenue[0]['rank'], 1)


if __name__ == '__main__':
    unittest.main()
