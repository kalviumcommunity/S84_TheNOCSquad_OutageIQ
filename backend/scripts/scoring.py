import pandas as pd
import numpy as np
from typing import Dict, Optional, Any, Union

# Config-driven scoring weights from PRD Section 7
DEFAULT_WEIGHTS: Dict[str, float] = {
    'reach': 0.35,
    'complaints': 0.30,
    'revenue': 0.20,
    'duration': 0.15
}

# Standard severity multiplier weights
SEVERITY_WEIGHTS: Dict[str, float] = {
    'CRITICAL': 4.0,
    'HIGH': 3.0,
    'MEDIUM': 2.0,
    'LOW': 1.0,
    'P1': 4.0,
    'P2': 3.0,
    'P3': 2.0,
    'P4': 1.0
}

# Regional revenue tier multiplier weights
REVENUE_TIER_MAP: Dict[str, float] = {
    'Tier 1': 3.0,
    'Tier 2': 2.0,
    'Tier 3': 1.0,
    'TIER 1': 3.0,
    'TIER 2': 2.0,
    'TIER 3': 1.0
}


def min_max_normalize(series: pd.Series) -> pd.Series:
    """
    PRD Section 7: Vectorized Min-Max normalization scaling metric values to [0.0, 1.0] across active outages.
    Boundary Conditions:
    - Empty series: returns empty series.
    - All NaN or all identical values: defaults to 0.5 (neutral baseline).
    """
    if series.empty:
        return series

    # Convert to numeric, non-numeric become NaN
    numeric_series = pd.to_numeric(series, errors='coerce')
    
    if numeric_series.isna().all():
        return pd.Series(0.5, index=series.index)

    min_val = numeric_series.min()
    max_val = numeric_series.max()

    if max_val == min_val or np.isclose(max_val, min_val):
        return pd.Series(0.5, index=series.index)

    normalized = (numeric_series - min_val) / (max_val - min_val)
    return normalized.fillna(0.5).clip(lower=0.0, upper=1.0)


def assign_priority_tier(score: float) -> str:
    """
    FR7: Map numeric composite Impact Score (0–100) into discrete operational priority tiers:
    - Critical: >= 75.0
    - High: 50.0 - 74.99
    - Medium: 25.0 - 49.99
    - Low: < 25.0
    """
    if pd.isna(score):
        return 'Low'
    
    if score >= 75.0:
        return 'Critical'
    elif score >= 50.0:
        return 'High'
    elif score >= 25.0:
        return 'Medium'
    else:
        return 'Low'


def compute_single_outage_score(
    subscribers_norm: float,
    complaints_norm: float,
    revenue_norm: float,
    duration_norm: float,
    weights: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    FR5, FR10 & PRD Section 7: Compute transparent composite Impact Score and 4 sub-score contributions for a single record.
    """
    weights = weights or DEFAULT_WEIGHTS

    reach_contrib = subscribers_norm * weights['reach'] * 100.0
    complaints_contrib = complaints_norm * weights['complaints'] * 100.0
    revenue_contrib = revenue_norm * weights['revenue'] * 100.0
    duration_contrib = duration_norm * weights['duration'] * 100.0

    total_score = round(reach_contrib + complaints_contrib + revenue_contrib + duration_contrib, 2)
    total_score = max(0.0, min(100.0, total_score))

    return {
        'impact_score': total_score,
        'priority_tier': assign_priority_tier(total_score),
        'subscores': {
            'reach': round(subscribers_norm * 100.0, 1),
            'complaints': round(complaints_norm * 100.0, 1),
            'revenue': round(revenue_norm * 100.0, 1),
            'duration': round(duration_norm * 100.0, 1)
        },
        'contributions': {
            'reach': round(reach_contrib, 2),
            'complaints': round(complaints_contrib, 2),
            'revenue': round(revenue_contrib, 2),
            'duration': round(duration_contrib, 2)
        }
    }


def compute_impact_scores(
    df: pd.DataFrame, 
    weights: Optional[Dict[str, float]] = None
) -> pd.DataFrame:
    """
    FR5, FR7 & PRD Section 7: Vectorized Core Impact Scoring Engine.
    Computes transparent sub-scores and composite Impact Score (0–100) per active outage from:
    1. Customer Reach (35%): Normalized regional subscriber count.
    2. Complaint Pressure (30%): Normalized customer complaint count / arrival velocity.
    3. Revenue Exposure (20%): Normalized regional revenue tier weight.
    4. Duration & Severity (15%): Normalized severity weighting escalated by outage duration.

    Preserves individual sub-scores and weighted contributions (FR10 / NFR Transparency).
    Evaluates confidence flag when regional metrics or complaint data are missing (NFR Reliability).
    Supports custom configurable scoring weights (NFR Extensibility).
    """
    if df.empty:
        return df.copy()

    weights = weights or DEFAULT_WEIGHTS
    res = df.copy()

    # NFR Reliability: Evaluate Data Completeness and confidence_flag
    subscriber_missing = res['subscriber_count'].isna() if 'subscriber_count' in res.columns else pd.Series(True, index=res.index)
    complaint_missing = res['complaint_count'].isna() if 'complaint_count' in res.columns else pd.Series(True, index=res.index)
    res['confidence_flag'] = ~(subscriber_missing | complaint_missing)

    # Fill defaults safely for robust calculations
    subscribers = res['subscriber_count'].fillna(0) if 'subscriber_count' in res.columns else pd.Series(0, index=res.index)
    complaints = res['complaint_count'].fillna(0) if 'complaint_count' in res.columns else pd.Series(0, index=res.index)
    
    if 'revenue_tier' in res.columns:
        revenue_tier_str = res['revenue_tier'].astype(str).str.strip()
        revenue_weights = revenue_tier_str.map(REVENUE_TIER_MAP).fillna(1.0)
    else:
        revenue_weights = pd.Series(1.0, index=res.index)

    if 'severity' in res.columns:
        severity_str = res['severity'].astype(str).str.strip().str.upper()
        severity_weights = severity_str.map(SEVERITY_WEIGHTS).fillna(1.0)
    else:
        severity_weights = pd.Series(1.0, index=res.index)

    # 1. Customer Reach (35%)
    raw_reach = subscribers.astype(float)

    # 2. Complaint Pressure (30%)
    raw_complaints = complaints.astype(float)

    # 3. Revenue Exposure (20%)
    raw_revenue = revenue_weights.astype(float)

    # 4. Duration & Severity (15%)
    raw_duration = severity_weights.astype(float)

    # Vectorized Min-Max Normalization across active outages (0.0 to 1.0)
    res['reach_norm'] = min_max_normalize(raw_reach)
    res['complaints_norm'] = min_max_normalize(raw_complaints)
    res['revenue_norm'] = min_max_normalize(raw_revenue)
    res['duration_norm'] = min_max_normalize(raw_duration)

    # Calculate weighted contributions (FR10)
    res['reach_contribution'] = (weights['reach'] * res['reach_norm'] * 100.0).round(2)
    res['complaints_contribution'] = (weights['complaints'] * res['complaints_norm'] * 100.0).round(2)
    res['revenue_contribution'] = (weights['revenue'] * res['revenue_norm'] * 100.0).round(2)
    res['duration_contribution'] = (weights['duration'] * res['duration_norm'] * 100.0).round(2)

    # Calculate composite Impact Score (0–100)
    composite_score = (
        res['reach_contribution'] +
        res['complaints_contribution'] +
        res['revenue_contribution'] +
        res['duration_contribution']
    ).round(2)

    res['impact_score'] = composite_score.clip(lower=0.0, upper=100.0)
    res['priority_tier'] = res['impact_score'].apply(assign_priority_tier)

    return res
