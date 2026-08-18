import pandas as pd
import numpy as np
from datetime import datetime, timezone
from typing import Optional, List, Union, Dict, Any
from geo_analytics import compute_regional_aggregations, get_regional_ranking

# Standard SLA response and resolution targets in hours (FR13 / PRD Section 8)
SLA_TARGET_HOURS: Dict[str, float] = {
    'CRITICAL': 2.0,
    'HIGH': 4.0,
    'MEDIUM': 8.0,
    'LOW': 24.0,
    'P1': 2.0,
    'P2': 4.0,
    'P3': 8.0,
    'P4': 24.0
}


def calculate_sla_status(elapsed_hours: float, severity: str) -> Dict[str, Any]:
    """
    FR13 & SLA Tracking: Calculate time remaining before SLA breach based on severity code.
    Returns SLA target, remaining hours, SLA status (BREACHED, AT_RISK, ON_TRACK), and badge label.
    """
    sev_upper = str(severity).strip().upper()
    target_hours = SLA_TARGET_HOURS.get(sev_upper, 8.0)
    remaining_hours = round(target_hours - elapsed_hours, 2)

    if remaining_hours < 0:
        status = 'BREACHED'
        badge = '🚨 SLA Breached'
    elif remaining_hours <= 0.5:
        status = 'AT_RISK'
        badge = '⚠️ SLA At Risk (<30m)'
    else:
        status = 'ON_TRACK'
        hours_int = int(remaining_hours)
        mins_int = int((remaining_hours - hours_int) * 60)
        badge = f'⏱️ {hours_int}h {mins_int}m left'

    return {
        'sla_target_hours': target_hours,
        'elapsed_hours': round(elapsed_hours, 2),
        'remaining_hours': remaining_hours,
        'sla_status': status,
        'sla_badge': badge
    }


def add_sla_tracking(df: pd.DataFrame, current_time: Optional[datetime] = None) -> pd.DataFrame:
    """
    FR13: Attach SLA compliance tracking columns to outage dataset.
    Computes elapsed duration, SLA target hours, remaining hours, and SLA breach status.
    """
    if df.empty:
        return df.copy()

    res = df.copy()
    current_time = current_time or datetime.now(timezone.utc)

    # Determine elapsed hours from duration or start_time
    if 'duration_hours' in res.columns:
        elapsed = res['duration_hours'].fillna(1.0).astype(float)
    elif 'start_time' in res.columns:
        parsed_starts = pd.to_datetime(res['start_time'], errors='coerce', utc=True)
        elapsed = (current_time - parsed_starts).dt.total_seconds() / 3600.0
        elapsed = elapsed.fillna(1.0).clip(lower=0.0)
    else:
        elapsed = pd.Series(1.0, index=res.index)

    severities = res['severity'] if 'severity' in res.columns else pd.Series('MEDIUM', index=res.index)

    sla_metrics = [
        calculate_sla_status(el, sev)
        for el, sev in zip(elapsed, severities)
    ]

    res['sla_target_hours'] = [m['sla_target_hours'] for m in sla_metrics]
    res['sla_remaining_hours'] = [m['remaining_hours'] for m in sla_metrics]
    res['sla_status'] = [m['sla_status'] for m in sla_metrics]
    res['sla_badge'] = [m['sla_badge'] for m in sla_metrics]

    return res


def filter_outages(
    df: pd.DataFrame,
    region_id: Optional[Union[str, List[str]]] = None,
    severity: Optional[Union[str, List[str]]] = None,
    status: Optional[Union[str, List[str]]] = None,
    priority_tier: Optional[Union[str, List[str]]] = None,
    search_query: Optional[str] = None,
    sla_status: Optional[Union[str, List[str]]] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None
) -> pd.DataFrame:
    """
    FR13 & Phase 6: Multi-Dimensional Filter and Search Engine.
    Filters outages across:
    - region_id (single or list)
    - severity (single or list)
    - status ('open', 'resolved', 'active triage', 'investigating', 'resolving')
    - priority_tier ('Critical', 'High', 'Medium', 'Low')
    - search_query (case-insensitive substring match across outage_id, node, region_id, root_cause, service_name)
    - sla_status ('BREACHED', 'AT_RISK', 'ON_TRACK')
    - min_score and max_score bounds
    """
    if df.empty:
        return df.copy()

    filtered = df.copy()

    # 1. Region Filter
    if region_id is not None:
        if isinstance(region_id, str):
            if region_id.upper() != 'ALL':
                filtered = filtered[filtered['region_id'].astype(str).str.upper() == region_id.upper()]
        elif isinstance(region_id, list) and len(region_id) > 0:
            regions_upper = [r.upper() for r in region_id if r.upper() != 'ALL']
            if len(regions_upper) > 0:
                filtered = filtered[filtered['region_id'].astype(str).str.upper().isin(regions_upper)]

    # 2. Severity Filter
    if severity is not None:
        if isinstance(severity, str):
            if severity.upper() != 'ALL':
                filtered = filtered[filtered['severity'].astype(str).str.upper() == severity.upper()]
        elif isinstance(severity, list) and len(severity) > 0:
            sevs_upper = [s.upper() for s in severity if s.upper() != 'ALL']
            if len(sevs_upper) > 0:
                filtered = filtered[filtered['severity'].astype(str).str.upper().isin(sevs_upper)]

    # 3. Status Filter
    if status is not None:
        if isinstance(status, str):
            if status.lower() not in ['all', '']:
                filtered = filtered[filtered['status'].astype(str).str.lower() == status.lower()]
        elif isinstance(status, list) and len(status) > 0:
            stats_lower = [s.lower() for s in status if s.lower() != 'all']
            if len(stats_lower) > 0:
                filtered = filtered[filtered['status'].astype(str).str.lower().isin(stats_lower)]

    # 4. Priority Tier Filter
    if priority_tier is not None:
        if isinstance(priority_tier, str):
            if priority_tier.upper() != 'ALL' and 'priority_tier' in filtered.columns:
                filtered = filtered[filtered['priority_tier'].astype(str).str.title() == priority_tier.title()]
        elif isinstance(priority_tier, list) and len(priority_tier) > 0 and 'priority_tier' in filtered.columns:
            tiers_title = [t.title() for t in priority_tier if t.upper() != 'ALL']
            if len(tiers_title) > 0:
                filtered = filtered[filtered['priority_tier'].astype(str).str.title().isin(tiers_title)]

    # 5. Search Query (Substring matching)
    if search_query and str(search_query).strip() != '':
        query = str(search_query).strip().lower()
        search_cols = [c for c in ['outage_id', 'node', 'region_id', 'root_cause', 'service_name', 'affected_service'] if c in filtered.columns]
        
        if search_cols:
            match_mask = pd.Series(False, index=filtered.index)
            for col in search_cols:
                match_mask = match_mask | filtered[col].astype(str).str.lower().str.contains(query, regex=False)
            filtered = filtered[match_mask]

    # 6. SLA Status Filter
    if sla_status is not None and 'sla_status' in filtered.columns:
        if isinstance(sla_status, str):
            if sla_status.upper() != 'ALL':
                filtered = filtered[filtered['sla_status'].astype(str).str.upper() == sla_status.upper()]
        elif isinstance(sla_status, list) and len(sla_status) > 0:
            slas_upper = [s.upper() for s in sla_status if s.upper() != 'ALL']
            if len(slas_upper) > 0:
                filtered = filtered[filtered['sla_status'].astype(str).str.upper().isin(slas_upper)]

    # 7. Impact Score Bounds
    if min_score is not None and 'impact_score' in filtered.columns:
        filtered = filtered[filtered['impact_score'] >= min_score]
    if max_score is not None and 'impact_score' in filtered.columns:
        filtered = filtered[filtered['impact_score'] <= max_score]

    return filtered


def get_executive_summary(df: pd.DataFrame, top_n: int = 5) -> pd.DataFrame:
    """
    FR14 & FR15: Get executive view showing top N highest-impact outages ranked by Impact Score.
    """
    if 'impact_score' not in df.columns:
        raise KeyError("Dataframe must contain 'impact_score' column")
        
    return df.sort_values(by='impact_score', ascending=False).head(top_n).copy()


def get_filter_summary(df: pd.DataFrame, original_total: int) -> Dict[str, Any]:
    """
    FR13: Return statistical summary of filtered results vs original dataset count.
    """
    filtered_count = len(df)
    return {
        'total_records': original_total,
        'matched_records': filtered_count,
        'filter_applied': filtered_count < original_total,
        'summary_label': f"Showing {filtered_count} of {original_total} outages"
    }
