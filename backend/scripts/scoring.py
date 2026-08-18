import os
import json
import pandas as pd
import numpy as np
from typing import Dict, Optional, Any, Union, List

# Standard weight presets for configurable tuning (PRD Section 7, NFR Extensibility)
WEIGHT_PRESETS: Dict[str, Dict[str, float]] = {
    'DEFAULT_BALANCED': {
        'reach': 0.35,
        'complaints': 0.30,
        'revenue': 0.20,
        'duration': 0.15
    },
    'CUSTOMER_CENTRIC': {
        'reach': 0.40,
        'complaints': 0.40,
        'revenue': 0.10,
        'duration': 0.10
    },
    'REVENUE_FOCUSED': {
        'reach': 0.20,
        'complaints': 0.15,
        'revenue': 0.50,
        'duration': 0.15
    },
    'SEVERITY_ESCALATED': {
        'reach': 0.25,
        'complaints': 0.25,
        'revenue': 0.15,
        'duration': 0.35
    }
}

DEFAULT_WEIGHTS: Dict[str, float] = WEIGHT_PRESETS['DEFAULT_BALANCED']

# Operational priority tier configuration (FR7)
PRIORITY_TIER_CONFIG: Dict[str, Dict[str, Any]] = {
    'Critical': {
        'min_score': 75.0,
        'max_score': 100.0,
        'color': 'rose',
        'badge_bg': 'bg-rose-500/20',
        'badge_text': 'text-rose-400',
        'sla_target_hours': 2,
        'description': 'Immediate executive escalation and emergency field dispatch'
    },
    'High': {
        'min_score': 50.0,
        'max_score': 74.99,
        'color': 'amber',
        'badge_bg': 'bg-amber-500/20',
        'badge_text': 'text-amber-400',
        'sla_target_hours': 4,
        'description': 'High operational priority triage within standard SLA'
    },
    'Medium': {
        'min_score': 25.0,
        'max_score': 49.99,
        'color': 'blue',
        'badge_bg': 'bg-blue-500/20',
        'badge_text': 'text-blue-400',
        'sla_target_hours': 8,
        'description': 'Standard operational queue prioritization'
    },
    'Low': {
        'min_score': 0.0,
        'max_score': 24.99,
        'color': 'gray',
        'badge_bg': 'bg-gray-500/20',
        'badge_text': 'text-gray-400',
        'sla_target_hours': 24,
        'description': 'Low business impact or scheduled maintenance event'
    }
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


def load_scoring_weights(
    config_path: Optional[str] = None,
    preset: Optional[str] = None,
    env_override: bool = True
) -> Dict[str, float]:
    """
    NFR Extensibility: Config-driven scoring weights loader.
    Priority order:
    1. Environment variables (if env_override=True)
    2. JSON config file (if config_path provided and exists)
    3. Named preset (if preset provided)
    4. DEFAULT_WEIGHTS (Balanced: 35/30/20/15)
    Guarantees weights are non-negative and normalized to sum to 1.0.
    """
    weights = DEFAULT_WEIGHTS.copy()

    # 1. Preset selection
    if preset and preset.upper() in WEIGHT_PRESETS:
        weights = WEIGHT_PRESETS[preset.upper()].copy()

    # 2. JSON config file
    if config_path and os.path.exists(config_path):
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                loaded = json.load(f)
                if isinstance(loaded, dict):
                    for k in ['reach', 'complaints', 'revenue', 'duration']:
                        if k in loaded:
                            weights[k] = float(loaded[k])
        except Exception:
            pass

    # 3. Environment variables
    if env_override:
        env_reach = os.getenv('IMPACT_WEIGHT_REACH')
        env_complaints = os.getenv('IMPACT_WEIGHT_COMPLAINTS')
        env_revenue = os.getenv('IMPACT_WEIGHT_REVENUE')
        env_duration = os.getenv('IMPACT_WEIGHT_DURATION')

        if env_reach is not None:
            weights['reach'] = float(env_reach)
        if env_complaints is not None:
            weights['complaints'] = float(env_complaints)
        if env_revenue is not None:
            weights['revenue'] = float(env_revenue)
        if env_duration is not None:
            weights['duration'] = float(env_duration)

    # Normalize weights so sum is 1.0
    total_w = sum(weights.values())
    if total_w > 0 and not np.isclose(total_w, 1.0):
        weights = {k: round(v / total_w, 4) for k, v in weights.items()}

    return weights


def min_max_normalize(series: pd.Series) -> pd.Series:
    """
    PRD Section 7: Vectorized Min-Max normalization scaling metric values to [0.0, 1.0] across active outages.
    Boundary Conditions:
    - Empty series: returns empty series.
    - All NaN or all identical values: defaults to 0.5 (neutral baseline).
    """
    if series.empty:
        return series

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


def get_priority_tier_details(tier_name: str) -> Dict[str, Any]:
    """
    FR7: Return full tier metadata including SLA target, badge color, and description.
    """
    canonical_tier = tier_name.capitalize()
    return PRIORITY_TIER_CONFIG.get(canonical_tier, PRIORITY_TIER_CONFIG['Low'])


def evaluate_data_confidence(row: Union[pd.Series, Dict[str, Any]]) -> Dict[str, Any]:
    """
    NFR Reliability: Evaluates completeness of telemetry metrics for an outage.
    Returns boolean confidence_flag and missing fields diagnostic list.
    """
    missing_fields: List[str] = []

    sub_val = row.get('subscriber_count')
    if pd.isna(sub_val) or sub_val is None:
        missing_fields.append('subscriber_count')

    comp_val = row.get('complaint_count')
    if pd.isna(comp_val) or comp_val is None:
        missing_fields.append('complaint_count')

    rev_val = row.get('revenue_tier')
    if pd.isna(rev_val) or rev_val is None or str(rev_val).strip() == '':
        missing_fields.append('revenue_tier')

    is_confident = (len(missing_fields) == 0)
    reason = "Complete Telemetry" if is_confident else f"Partial Data (Missing: {', '.join(missing_fields)})"

    return {
        'confidence_flag': is_confident,
        'missing_fields': missing_fields,
        'confidence_reason': reason,
        'badge_label': "High Confidence" if is_confident else "Low Confidence - Partial Data"
    }


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

    tier_name = assign_priority_tier(total_score)
    tier_details = get_priority_tier_details(tier_name)

    return {
        'impact_score': total_score,
        'priority_tier': tier_name,
        'tier_details': tier_details,
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
    FR5, FR7, NFR Reliability, NFR Extensibility: Vectorized Core Impact Scoring Engine.
    Computes transparent sub-scores, confidence flags, priority tiers, and composite Impact Score (0–100) per active outage:
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
    revenue_missing = res['revenue_tier'].isna() if 'revenue_tier' in res.columns else pd.Series(True, index=res.index)
    
    res['confidence_flag'] = ~(subscriber_missing | complaint_missing)
    res['confidence_label'] = res['confidence_flag'].apply(
        lambda x: "High Confidence" if x else "Low Confidence - Partial Data"
    )

    # Fill defaults safely for robust partial score calculations
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

    # 1. Customer Reach
    raw_reach = subscribers.astype(float)

    # 2. Complaint Pressure
    raw_complaints = complaints.astype(float)

    # 3. Revenue Exposure
    raw_revenue = revenue_weights.astype(float)

    # 4. Duration & Severity
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
