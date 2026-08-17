import pandas as pd
import numpy as np
from typing import Dict, Optional

DEFAULT_WEIGHTS = {
    'reach': 0.35,
    'complaints': 0.30,
    'revenue': 0.20,
    'duration': 0.15
}

SEVERITY_WEIGHTS = {
    'CRITICAL': 4.0,
    'HIGH': 3.0,
    'MEDIUM': 2.0,
    'LOW': 1.0
}

REVENUE_TIER_MAP = {
    'Tier 1': 3.0,
    'Tier 2': 2.0,
    'Tier 3': 1.0
}

def min_max_normalize(series: pd.Series) -> pd.Series:
    """
    PRD Section 7: Min-Max normalize values across active outages to scale [0, 1].
    If all values are identical or max == min, return 0.5 default.
    """
    if series.empty:
        return series
    min_val = series.min()
    max_val = series.max()
    if max_val == min_val:
        return pd.Series(0.5, index=series.index)
    return (series - min_val) / (max_val - min_val)

def compute_impact_scores(
    df: pd.DataFrame, 
    weights: Optional[Dict[str, float]] = None
) -> pd.DataFrame:
    """
    FR5 & Section 7: Compute composite Impact Score (0–100) per active outage from 4 sub-scores:
    - Customer Reach (35%)
    - Complaint Pressure (30%)
    - Revenue Exposure (20%)
    - Duration & Severity (15%)
    NFR Extensibility: Accepts configurable custom weights.
    NFR Reliability: Evaluates confidence flag if key data is missing.
    """
    if weights is None:
        weights = DEFAULT_WEIGHTS
        
    res = df.copy()
    
    # Check data confidence (NFR Reliability)
    res['confidence_flag'] = ~(res['subscriber_count'].isna() | res['complaint_count'].isna())
    
    # Fill missing values with defaults for safe calculation
    subscribers = res['subscriber_count'].fillna(0)
    complaints = res['complaint_count'].fillna(0)
    revenue_weights = res['revenue_tier'].map(REVENUE_TIER_MAP).fillna(1.0)
    severity_weights = res['severity'].str.upper().map(SEVERITY_WEIGHTS).fillna(1.0)
    
    # Compute raw sub-scores
    raw_reach = subscribers
    raw_complaints = complaints
    raw_revenue = revenue_weights
    raw_duration = severity_weights
    
    # Normalize sub-scores across active outages (0-1)
    res['reach_norm'] = min_max_normalize(raw_reach)
    res['complaints_norm'] = min_max_normalize(raw_complaints)
    res['revenue_norm'] = min_max_normalize(raw_revenue)
    res['duration_norm'] = min_max_normalize(raw_duration)
    
    # Compute composite Impact Score (scaled to 0-100)
    score = (
        weights['reach'] * res['reach_norm'] +
        weights['complaints'] * res['complaints_norm'] +
        weights['revenue'] * res['revenue_norm'] +
        weights['duration'] * res['duration_norm']
    ) * 100.0
    
    res['impact_score'] = score.round(2)
    res['priority_tier'] = res['impact_score'].apply(assign_priority_tier)
    
    return res

def assign_priority_tier(score: float) -> str:
    """
    FR7: Assign priority tier based on Impact Score thresholds.
    """
    if score >= 75.0:
        return 'Critical'
    elif score >= 50.0:
        return 'High'
    elif score >= 25.0:
        return 'Medium'
    else:
        return 'Low'
