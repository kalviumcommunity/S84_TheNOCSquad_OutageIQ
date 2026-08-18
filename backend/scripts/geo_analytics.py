import pandas as pd
import numpy as np
from typing import Optional, List, Dict, Any

# Standard region definitions (PRD Section 6 & 8)
DEFAULT_REGIONS = [
    'North Region',
    'South Region',
    'East Region',
    'West Region',
    'Central Region'
]

SEVERITY_ORDER = {
    'CRITICAL': 4,
    'P1': 4,
    'HIGH': 3,
    'P2': 3,
    'MEDIUM': 2,
    'P3': 2,
    'LOW': 1,
    'P4': 1,
    'NONE': 0
}


def _determine_dominant_severity(severities: pd.Series) -> str:
    """Return the highest severity present in the group."""
    if severities.empty:
        return 'NONE'
    
    clean_sevs = severities.dropna().astype(str).str.upper()
    if clean_sevs.empty:
        return 'NONE'

    sorted_sevs = sorted(clean_sevs, key=lambda s: SEVERITY_ORDER.get(s, 0), reverse=True)
    return sorted_sevs[0]


def _determine_density_rating(outage_count: int, avg_impact_score: float, dominant_sev: str) -> str:
    """Classify regional density impact rating."""
    if outage_count == 0:
        return 'HEALTHY'
    if dominant_sev in ['CRITICAL', 'P1'] or avg_impact_score >= 75.0:
        return 'CRITICAL_IMPACT'
    if dominant_sev in ['HIGH', 'P2'] or avg_impact_score >= 50.0:
        return 'HIGH_IMPACT'
    if avg_impact_score >= 25.0:
        return 'MODERATE_IMPACT'
    return 'LOW_IMPACT'


def compute_regional_aggregations(
    df: pd.DataFrame,
    all_regions: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    FR11 & Phase 8: Geo-Operational Analytics & Regional Aggregation Engine.
    Groups active outages by region and calculates:
    - Active outage count
    - Total affected subscribers (sum of subscriber_count)
    - Total revenue exposure rate (sum of hourly exposure)
    - Dominant / highest severity level in region
    - Average composite Impact Score
    - Regional SLA compliance percentage
    - Impact density rating (CRITICAL_IMPACT, HIGH_IMPACT, MODERATE_IMPACT, LOW_IMPACT, HEALTHY)

    Handles zero-outage regions gracefully with clean empty states.
    """
    regions_to_track = list(all_regions) if all_regions else list(DEFAULT_REGIONS)

    if not df.empty and 'region_id' in df.columns:
        present_regions = df['region_id'].dropna().astype(str).unique().tolist()
        for r in present_regions:
            if r not in regions_to_track:
                regions_to_track.append(r)

    results: List[Dict[str, Any]] = []

    for region in regions_to_track:
        if df.empty or 'region_id' not in df.columns:
            region_df = pd.DataFrame()
        else:
            region_df = df[df['region_id'].astype(str).str.upper() == region.upper()]

        outage_count = len(region_df)

        if outage_count == 0:
            results.append({
                'region_id': region,
                'outage_count': 0,
                'total_affected_subscribers': 0,
                'total_revenue_exposure_rate': 0.0,
                'avg_impact_score': 0.0,
                'dominant_severity': 'NONE',
                'sla_breach_count': 0,
                'sla_compliance_pct': 100.0,
                'impact_density_rating': 'HEALTHY',
                'density_color': 'emerald',
                'status_badge': '🟢 All Systems Normal'
            })
            continue

        # Aggregate subscribers
        if 'subscriber_count' in region_df.columns:
            total_subscribers = int(region_df['subscriber_count'].fillna(0).sum())
        elif 'subscribers' in region_df.columns:
            total_subscribers = int(region_df['subscribers'].fillna(0).sum())
        else:
            total_subscribers = 0

        # Aggregate revenue exposure
        total_revenue = 0.0
        if 'revenue_exposure' in region_df.columns:
            for rev_val in region_df['revenue_exposure']:
                if isinstance(rev_val, (int, float)):
                    total_revenue += float(rev_val)
                elif isinstance(rev_val, str):
                    clean_str = rev_val.replace('$', '').replace('/ hr', '').replace(',', '').strip()
                    try:
                        total_revenue += float(clean_str)
                    except ValueError:
                        pass

        # Aggregate Impact Score
        if 'impact_score' in region_df.columns:
            avg_score = round(float(region_df['impact_score'].mean()), 1)
        elif 'score' in region_df.columns:
            avg_score = round(float(region_df['score'].mean()), 1)
        else:
            avg_score = 0.0

        # Dominant severity
        if 'severity' in region_df.columns:
            dominant_sev = _determine_dominant_severity(region_df['severity'])
        elif 'priority' in region_df.columns:
            dominant_sev = _determine_dominant_severity(region_df['priority'])
        else:
            dominant_sev = 'MEDIUM'

        # SLA Compliance
        sla_breach_count = 0
        if 'sla_status' in region_df.columns:
            sla_breach_count = int((region_df['sla_status'].astype(str).str.upper() == 'BREACHED').sum())
        elif 'duration_hours' in region_df.columns:
            # Fallback estimation: if duration > 4h
            sla_breach_count = int((region_df['duration_hours'].fillna(0) > 4.0).sum())

        sla_compliance_pct = round(((outage_count - sla_breach_count) / outage_count) * 100.0, 1)

        # Impact density rating
        density_rating = _determine_density_rating(outage_count, avg_score, dominant_sev)
        
        if density_rating == 'CRITICAL_IMPACT':
            density_color = 'rose'
            status_badge = '🔴 High Impact Concentration'
        elif density_rating == 'HIGH_IMPACT':
            density_color = 'amber'
            status_badge = '🟠 Elevated Incident Load'
        elif density_rating == 'MODERATE_IMPACT':
            density_color = 'blue'
            status_badge = '🔵 Moderate Activity'
        else:
            density_color = 'emerald'
            status_badge = '🟢 Minor Disruption'

        results.append({
            'region_id': region,
            'outage_count': outage_count,
            'total_affected_subscribers': total_subscribers,
            'total_revenue_exposure_rate': round(total_revenue, 2),
            'avg_impact_score': avg_score,
            'dominant_severity': dominant_sev,
            'sla_breach_count': sla_breach_count,
            'sla_compliance_pct': sla_compliance_pct,
            'impact_density_rating': density_rating,
            'density_color': density_color,
            'status_badge': status_badge
        })

    # Sort descending by total_affected_subscribers and avg_impact_score
    results.sort(key=lambda x: (x['total_affected_subscribers'], x['avg_impact_score']), reverse=True)
    
    # Assign regional rankings
    for idx, r in enumerate(results):
        r['rank'] = idx + 1

    return results


def get_regional_ranking(
    df: pd.DataFrame,
    sort_by: str = 'affected_subscribers'
) -> List[Dict[str, Any]]:
    """
    FR11: Return comparative regional ranking sorted by specified metric.
    """
    aggregations = compute_regional_aggregations(df)
    
    if sort_by == 'outage_count':
        aggregations.sort(key=lambda x: x['outage_count'], reverse=True)
    elif sort_by == 'revenue_exposure':
        aggregations.sort(key=lambda x: x['total_revenue_exposure_rate'], reverse=True)
    elif sort_by == 'avg_impact_score':
        aggregations.sort(key=lambda x: x['avg_impact_score'], reverse=True)
    else: # default affected_subscribers
        aggregations.sort(key=lambda x: x['total_affected_subscribers'], reverse=True)

    for idx, item in enumerate(aggregations):
        item['rank'] = idx + 1

    return aggregations
