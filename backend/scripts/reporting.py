import os
import json
import time
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


def export_outages_to_csv(df: pd.DataFrame, output_path: Optional[str] = None) -> str:
    """
    FR14 & Phase 10: Export prioritized list of outages to standardized CSV format.
    Sorts by impact_score descending and exports clean schema.
    """
    if df.empty:
        csv_str = "outage_id,region_id,node,priority_tier,impact_score,subscriber_count,complaint_count,revenue_exposure,status,sla_status,root_cause\n"
    else:
        export_df = df.copy()
        if 'impact_score' in export_df.columns:
            export_df = export_df.sort_values(by='impact_score', ascending=False)

        # Standard column selection
        col_order = [
            'outage_id', 'region_id', 'node', 'priority_tier', 'impact_score',
            'subscriber_count', 'subscribers', 'complaint_count', 'revenue_exposure',
            'status', 'sla_status', 'root_cause'
        ]
        present_cols = [c for c in col_order if c in export_df.columns]
        export_df = export_df[present_cols]
        csv_str = export_df.to_csv(index=False)

    if output_path:
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(csv_str)

    return csv_str


def generate_executive_pdf_summary_data(df: pd.DataFrame, top_n: int = 5) -> Dict[str, Any]:
    """
    FR14, FR15 & Phase 10: Generate structured payload for Executive PDF Briefing Report.
    """
    if df.empty:
        return {
            'report_title': 'OutageIQ Executive Incident Briefing',
            'generated_at': datetime.now(timezone.utc).isoformat(),
            'top_outages': [],
            'kpis': {
                'total_active': 0,
                'critical_count': 0,
                'total_subscribers': 0,
                'avg_score': 0.0
            },
            'regional_breakdown': []
        }

    scored_df = df.sort_values(by='impact_score', ascending=False) if 'impact_score' in df.columns else df
    top_df = scored_df.head(top_n)

    top_outages = []
    for rank_idx, (_, row) in enumerate(top_df.iterrows(), start=1):
        top_outages.append({
            'rank': rank_idx,
            'outage_id': str(row.get('outage_id', 'N/A')),
            'region': str(row.get('region_id', row.get('region', 'N/A'))),
            'node': str(row.get('node', 'N/A')),
            'priority': str(row.get('priority_tier', row.get('priority', 'Critical'))),
            'impact_score': float(row.get('impact_score', row.get('score', 0.0))),
            'subscribers': int(row.get('subscriber_count', row.get('subscribers', 0))),
            'revenue_exposure': str(row.get('revenue_exposure', '$0 / hr')),
            'sla_status': str(row.get('sla_status', 'ON_TRACK')),
            'root_cause': str(row.get('root_cause', 'Transport Link Disruption'))
        })

    # KPI summary
    total_subscribers = int(df['subscriber_count'].fillna(0).sum()) if 'subscriber_count' in df.columns else (
        int(df['subscribers'].fillna(0).sum()) if 'subscribers' in df.columns else 0
    )
    critical_count = int((df['impact_score'] >= 75.0).sum()) if 'impact_score' in df.columns else 0
    avg_score = round(float(df['impact_score'].mean()), 1) if 'impact_score' in df.columns else 0.0

    regional_agg = compute_regional_aggregations(df)

    return {
        'report_title': 'OutageIQ Executive Incident Briefing (PRD Section 8.3 & FR14)',
        'classification': 'TELECOM OPERATIONS CONFIDENTIAL',
        'generated_at': datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC'),
        'kpis': {
            'total_active': len(df),
            'critical_count': critical_count,
            'total_subscribers': total_subscribers,
            'avg_score': avg_score
        },
        'top_outages': top_outages,
        'regional_breakdown': regional_agg
    }


def export_executive_summary_report(df: pd.DataFrame, output_path: Optional[str] = None) -> str:
    """
    FR14 & Phase 10: Export formatted executive briefing report in markdown/text format.
    """
    data = generate_executive_pdf_summary_data(df)
    
    report_lines = [
        f"# {data['report_title']}",
        f"**Classification:** {data.get('classification', 'CONFIDENTIAL')} | **Generated:** {data['generated_at']}\n",
        "## 1. Executive Operations KPI Summary",
        f"- **Total Active Incidents:** {data['kpis']['total_active']}",
        f"- **Critical Tier P1 Incidents (Score ≥75):** {data['kpis']['critical_count']}",
        f"- **Total Impacted Customer Base:** {data['kpis']['total_subscribers']:,} subscribers",
        f"- **Average Composite Impact Score:** {data['kpis']['avg_score']} / 100\n",
        "## 2. Top Prioritized Critical Outages (Immediate Dispatch)",
        "| Rank | Outage ID | Region | Impact Score | Priority Tier | Affected Subs | Revenue Exposure | SLA Status |",
        "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |"
    ]

    for item in data['top_outages']:
        report_lines.append(
            f"| #{item['rank']} | {item['outage_id']} | {item['region']} | {item['impact_score']} | {item['priority']} | {item['subscribers']:,} | {item['revenue_exposure']} | {item['sla_status']} |"
        )

    report_lines.append("\n## 3. Regional Exposure Breakdown")
    for reg in data['regional_breakdown']:
        report_lines.append(
            f"- **{reg['region_id']}:** {reg['outage_count']} outages • {reg['total_affected_subscribers']:,} subs • {reg['status_badge']}"
        )

    report_lines.append("\n---\n*Generated by OutageIQ Automated Triage Platform — PRD Phase 10 Release*")

    report_content = "\n".join(report_lines)

    if output_path:
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report_content)

    return report_content


def benchmark_full_pipeline(num_records: int = 100000) -> Dict[str, float]:
    """
    NFR Performance & Phase 10: Complete pipeline stress test on 100,000+ records.
    Verifies total runtime (Scoring + Priority Classification + Regional Aggregation + CSV Export) < 5.0 seconds.
    """
    np.random.seed(42)
    regions = ['North Region', 'West Region', 'South Region', 'East Region', 'Central Region']
    severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
    rev_tiers = ['Tier 1', 'Tier 2', 'Tier 3']

    synthetic_df = pd.DataFrame({
        'outage_id': [f"OUT-{i:06d}" for i in range(num_records)],
        'region_id': np.random.choice(regions, size=num_records),
        'node': [f"Node-{i % 500}" for i in range(num_records)],
        'subscriber_count': np.random.randint(100, 100000, size=num_records),
        'complaint_count': np.random.randint(0, 1000, size=num_records),
        'revenue_tier': np.random.choice(rev_tiers, size=num_records),
        'severity': np.random.choice(severities, size=num_records),
        'duration_hours': np.random.uniform(0.5, 12.0, size=num_records),
        'status': np.random.choice(['open', 'investigating', 'resolving'], size=num_records)
    })

    t0 = time.perf_counter()

    # 1. Scoring & SLA tracking
    from scoring import compute_impact_scores
    scored_df = compute_impact_scores(synthetic_df)
    tracked_df = add_sla_tracking(scored_df)

    # 2. Regional aggregation
    regional_agg = compute_regional_aggregations(tracked_df)

    # 3. Filter top N executive summary
    top_5 = get_executive_summary(tracked_df, top_n=5)

    # 4. CSV export
    csv_out = export_outages_to_csv(top_5)

    total_time = time.perf_counter() - t0

    return {
        'num_records': num_records,
        'total_pipeline_time_seconds': round(total_time, 3),
        'target_budget_seconds': 5.0,
        'passed_nfr_performance': total_time < 5.0
    }
