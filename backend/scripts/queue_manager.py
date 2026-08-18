import os
import json
import time
from datetime import datetime, timezone
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Union

from scoring import compute_impact_scores, DEFAULT_WEIGHTS


def get_prioritized_queue(
    df: pd.DataFrame,
    sort_by: str = 'impact_score',
    ascending: bool = False,
    filter_open_only: bool = False
) -> pd.DataFrame:
    """
    FR6, FR8 & FR9: Fast ranking query producing prioritized triage queue sorted by Impact Score.
    Supports column sorting with stable multi-column tie breaking.
    Assigns sequential dynamic rank (1..N).
    """
    if df.empty:
        return df.copy()

    res = df.copy()

    # Filter open only if requested
    if filter_open_only and 'status' in res.columns:
        res = res[res['status'].astype(str).str.lower() == 'open']

    # Ensure impact_score is computed if not present
    if 'impact_score' not in res.columns:
        res = compute_impact_scores(res)

    # Multi-column stable sort criteria
    sort_cols = [sort_by]
    ascending_list = [ascending]

    if sort_by != 'impact_score' and 'impact_score' in res.columns:
        sort_cols.append('impact_score')
        ascending_list.append(False)

    if 'complaint_count' in res.columns and 'complaint_count' not in sort_cols:
        sort_cols.append('complaint_count')
        ascending_list.append(False)

    if 'outage_id' in res.columns and 'outage_id' not in sort_cols:
        sort_cols.append('outage_id')
        ascending_list.append(True)

    sorted_df = res.sort_values(by=sort_cols, ascending=ascending_list).reset_index(drop=True)
    sorted_df['rank'] = sorted_df.index + 1
    sorted_df['rank_badge'] = '#' + sorted_df['rank'].astype(str)

    return sorted_df


def update_queue_with_new_complaints(
    df: pd.DataFrame,
    outage_id: str,
    additional_complaints: int,
    weights: Optional[Dict[str, float]] = None
) -> pd.DataFrame:
    """
    FR6 & FR8: Real-time re-ranking simulation when new customer complaints arrive.
    Increments complaint count for target outage, recomputes normalized impact scores, and re-ranks the queue.
    """
    if df.empty:
        return df.copy()

    updated = df.copy()
    mask = (updated['outage_id'] == outage_id)

    if mask.any():
        current = updated.loc[mask, 'complaint_count'].fillna(0)
        updated.loc[mask, 'complaint_count'] = current + additional_complaints

    # Recompute scores and re-rank
    recalculated = compute_impact_scores(updated, weights=weights)
    return get_prioritized_queue(recalculated)


def log_queue_snapshot(
    df: pd.DataFrame,
    output_dir: Optional[str] = None,
    snapshot_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    FR14 & Historical Audit: Record snapshot of the active prioritized queue for audit and trend tracking.
    """
    timestamp = datetime.now(timezone.utc).isoformat()
    snapshot_id = snapshot_name or f"snapshot_{int(time.time())}"

    total_incidents = len(df)
    critical_count = int((df['priority_tier'] == 'Critical').sum()) if 'priority_tier' in df.columns else 0
    high_count = int((df['priority_tier'] == 'High').sum()) if 'priority_tier' in df.columns else 0
    top_outage_id = str(df.iloc[0]['outage_id']) if not df.empty and 'outage_id' in df.columns else None
    top_score = float(df.iloc[0]['impact_score']) if not df.empty and 'impact_score' in df.columns else 0.0

    snapshot_metadata = {
        'snapshot_id': snapshot_id,
        'timestamp': timestamp,
        'total_active_incidents': total_incidents,
        'critical_incidents': critical_count,
        'high_incidents': high_count,
        'top_ranked_outage_id': top_outage_id,
        'top_impact_score': top_score
    }

    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        file_path = os.path.join(output_dir, f"{snapshot_id}.json")
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump({
                'metadata': snapshot_metadata,
                'queue_records': df.to_dict(orient='records')
            }, f, indent=2, default=str)

    return snapshot_metadata


def benchmark_queue_reranking(num_records: int = 100000) -> float:
    """
    PRD Section 11 & NFR Performance: Benchmark re-ranking pipeline execution speed on large datasets (100k records).
    Returns execution time in seconds (must be < 5.0 seconds).
    """
    np.random.seed(42)
    synthetic_df = pd.DataFrame({
        'outage_id': [f"OUT-{i}" for i in range(num_records)],
        'region_id': np.random.choice(['REG-NORTH', 'REG-SOUTH', 'REG-EAST', 'REG-WEST', 'REG-CENTRAL'], size=num_records),
        'subscriber_count': np.random.randint(500, 500000, size=num_records),
        'complaint_count': np.random.randint(1, 2000, size=num_records),
        'revenue_tier': np.random.choice(['Tier 1', 'Tier 2', 'Tier 3'], size=num_records),
        'severity': np.random.choice(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], size=num_records),
        'status': np.random.choice(['open', 'open', 'resolved'], size=num_records)
    })

    start_time = time.perf_counter()
    scored = compute_impact_scores(synthetic_df)
    ranked = get_prioritized_queue(scored, filter_open_only=True)
    duration = time.perf_counter() - start_time

    return duration
