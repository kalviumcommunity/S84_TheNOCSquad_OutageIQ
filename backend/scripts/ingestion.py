import os
import json
import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, List, Optional

# Core schemas required for pipeline execution (FR1, FR2)
REQUIRED_SCHEMAS: Dict[str, List[str]] = {
    'outages': ['outage_id', 'region_id', 'start_time', 'severity', 'status'],
    'complaints': ['complaint_id', 'region_id', 'timestamp'],
    'usage': ['region_id', 'region_name', 'subscriber_count', 'revenue_tier']
}

# Full comprehensive expected schemas per PRD Section 6
EXPECTED_SCHEMAS: Dict[str, List[str]] = {
    'outages': ['outage_id', 'region_id', 'tower_id', 'start_time', 'end_time', 'severity', 'status', 'affected_services', 'root_cause_code'],
    'complaints': ['complaint_id', 'customer_id', 'region_id', 'timestamp', 'channel', 'category', 'linked_outage_id', 'sentiment', 'priority'],
    'usage': ['region_id', 'region_name', 'subscriber_count', 'avg_daily_traffic', 'revenue_tier', 'plan_mix', 'prior_month_ARPU']
}

PRIMARY_KEYS: Dict[str, str] = {
    'outages': 'outage_id',
    'complaints': 'complaint_id',
    'usage': 'region_id'
}

SUPPORTED_FORMATS: List[str] = ['.csv', '.json']


def read_dataset(filepath: str, dataset_name: Optional[str] = None, validate: bool = True) -> pd.DataFrame:
    """
    FR1: Modular reader for CSV and JSON datasets.
    Supports file validation, automatic format detection, and optional schema verification.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Dataset file not found: {filepath}")

    ext = os.path.splitext(filepath)[1].lower()
    if ext == '.csv':
        df = pd.read_csv(filepath)
    elif ext == '.json':
        df = pd.read_json(filepath)
    else:
        raise ValueError(f"Unsupported file format: '{ext}'. Supported formats: {SUPPORTED_FORMATS}")

    if validate and dataset_name:
        validate_schema(df, dataset_name)

    return df


def read_outages(filepath: str, validate: bool = True) -> pd.DataFrame:
    """Read network outage alerts dataset."""
    return read_dataset(filepath, dataset_name='outages', validate=validate)


def read_complaints(filepath: str, validate: bool = True) -> pd.DataFrame:
    """Read customer complaint logs dataset."""
    return read_dataset(filepath, dataset_name='complaints', validate=validate)


def read_usage(filepath: str, validate: bool = True) -> pd.DataFrame:
    """Read regional usage metrics dataset."""
    return read_dataset(filepath, dataset_name='usage', validate=validate)


def validate_schema(df: pd.DataFrame, dataset_name: str, strict: bool = False) -> bool:
    """
    FR2 & NFR Data Quality: Validate dataframe schema against expected required columns.
    Returns True if valid, raises ValueError if required columns are missing.
    If strict=True, also validates that primary keys are non-null.
    """
    if dataset_name not in REQUIRED_SCHEMAS:
        raise ValueError(f"Unknown dataset name: {dataset_name}. Expected one of {list(REQUIRED_SCHEMAS.keys())}")

    required_cols = REQUIRED_SCHEMAS[dataset_name]
    missing_cols = [col for col in required_cols if col not in df.columns]

    if missing_cols:
        raise ValueError(f"Dataset '{dataset_name}' missing required columns: {missing_cols}")

    if strict and not df.empty:
        pk_col = PRIMARY_KEYS.get(dataset_name)
        if pk_col and pk_col in df.columns:
            null_keys = df[pk_col].isnull().sum()
            if null_keys > 0:
                raise ValueError(f"Dataset '{dataset_name}' contains {null_keys} null values in primary key column '{pk_col}'.")

    return True


def get_data_quality_summary(df: pd.DataFrame, dataset_name: str) -> Dict[str, Any]:
    """
    FR2 & NFR Data Quality: Generate a data quality and schema health report
    surfacing malformed/missing records rather than silently dropping them.
    """
    total_records = len(df)
    columns_present = list(df.columns)
    required = REQUIRED_SCHEMAS.get(dataset_name, [])
    missing_columns = [col for col in required if col not in columns_present]
    
    null_counts = {col: int(df[col].isnull().sum()) for col in df.columns}
    total_nulls = sum(null_counts.values())
    
    pk_col = PRIMARY_KEYS.get(dataset_name)
    duplicate_keys = int(df[pk_col].duplicated().sum()) if (pk_col and pk_col in df.columns) else 0

    # Malformed rows are rows missing any required field
    if missing_columns:
        malformed_rows = total_records
        valid_schema = False
    else:
        req_df = df[required]
        malformed_rows = int(req_df.isnull().any(axis=1).sum())
        valid_schema = True

    total_cells = max(total_records * len(columns_present), 1)
    completeness_percentage = round(((total_cells - total_nulls) / total_cells) * 100.0, 2) if total_records > 0 else 100.0

    return {
        'dataset_name': dataset_name,
        'total_records': total_records,
        'total_columns': len(columns_present),
        'columns_present': columns_present,
        'required_columns': required,
        'missing_columns': missing_columns,
        'is_schema_valid': valid_schema,
        'null_counts': null_counts,
        'duplicate_keys': duplicate_keys,
        'malformed_rows_count': malformed_rows,
        'completeness_percentage': completeness_percentage,
        'status': 'HEALTHY' if (valid_schema and malformed_rows == 0 and duplicate_keys == 0) else 'WARNING'
    }


def sanitize_string_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    FR3: Strip whitespace from all string/object columns and standardize uppercase formatting for IDs.
    """
    if df.empty:
        return df.copy()

    cleaned = df.copy()
    for col in cleaned.columns:
        if pd.api.types.is_object_dtype(cleaned[col]) or pd.api.types.is_string_dtype(cleaned[col]):
            # Strip whitespace safely
            cleaned[col] = cleaned[col].apply(lambda x: x.strip() if isinstance(x, str) else x)
            # Normalize IDs and categorical codes to uppercase if applicable
            if col in ['outage_id', 'complaint_id', 'region_id', 'severity']:
                cleaned[col] = cleaned[col].apply(lambda x: x.upper() if isinstance(x, str) else x)
            elif col == 'status':
                cleaned[col] = cleaned[col].apply(lambda x: x.lower() if isinstance(x, str) else x)

    return cleaned


def clean_and_deduplicate(df: pd.DataFrame, id_column: str) -> pd.DataFrame:
    """
    FR3: Standardize IDs, remove duplicate records based on primary key, and clean dataset.
    """
    if df.empty:
        return df.copy()

    cleaned_df = sanitize_string_columns(df)
    if id_column in cleaned_df.columns:
        cleaned_df = cleaned_df.drop_duplicates(subset=[id_column]).reset_index(drop=True)
    return cleaned_df


def match_unlinked_complaints(complaints_df: pd.DataFrame, outages_df: pd.DataFrame, time_window_hours: float = 2.0) -> pd.DataFrame:
    """
    PRD Section 6 & FR4: Match unlinked complaints (missing or empty linked_outage_id) to the nearest active
    outage in the same region within a configurable sliding window (default: ±2.0 hours).
    Attaches a 'match_type' tag ('explicit', 'temporal_match', or 'unlinked').
    """
    complaints = complaints_df.copy()
    outages = outages_df.copy()

    if complaints.empty:
        complaints['match_type'] = pd.Series(dtype='str')
        return complaints

    if 'linked_outage_id' not in complaints.columns:
        complaints['linked_outage_id'] = None

    # Sanitize string empty values
    complaints['linked_outage_id'] = complaints['linked_outage_id'].apply(
        lambda x: None if (pd.isna(x) or str(x).strip() in ['', 'None', 'nan', 'null']) else str(x).strip()
    )

    # Initialize match_type column
    complaints['match_type'] = complaints['linked_outage_id'].apply(
        lambda x: 'explicit' if pd.notna(x) else 'unlinked'
    )

    if outages.empty:
        return complaints

    complaints['timestamp'] = pd.to_datetime(complaints['timestamp'])
    outages_copy = outages.copy()
    outages_copy['start_time'] = pd.to_datetime(outages_copy['start_time'])

    # Find unlinked complaints
    unlinked_mask = complaints['linked_outage_id'].isna()

    for idx, complaint in complaints[unlinked_mask].iterrows():
        comp_time = complaint['timestamp']
        comp_region = str(complaint['region_id']).strip().upper()

        # Find matching open outages in the exact same region
        region_matches = outages_copy[
            (outages_copy['region_id'].astype(str).str.strip().str.upper() == comp_region) & 
            (outages_copy['status'].astype(str).str.strip().str.lower() == 'open')
        ]

        if region_matches.empty:
            continue

        # Compute absolute time difference in hours to each candidate outage
        time_diffs = (region_matches['start_time'] - comp_time).abs().dt.total_seconds() / 3600.0
        min_diff_idx = time_diffs.idxmin()
        min_diff_hours = time_diffs.loc[min_diff_idx]

        # If within sliding time window, associate and tag as 'temporal_match'
        if min_diff_hours <= time_window_hours:
            matched_outage_id = region_matches.loc[min_diff_idx, 'outage_id']
            complaints.at[idx, 'linked_outage_id'] = matched_outage_id
            complaints.at[idx, 'match_type'] = 'temporal_match'

    return complaints


def get_complaint_linkage_summary(complaints_df: pd.DataFrame) -> Dict[str, Any]:
    """
    FR4 & Phase 2 UI: Calculate summary metrics for unlinked vs explicitly tagged vs temporally matched complaints.
    """
    total = len(complaints_df)
    if total == 0:
        return {
            'total_complaints': 0,
            'explicit_linked_count': 0,
            'temporally_matched_count': 0,
            'unlinked_count': 0,
            'matched_ratio_pct': 0.0,
            'unlinked_ratio_pct': 0.0
        }

    match_types = complaints_df.get('match_type', pd.Series(['unlinked'] * total))
    explicit_count = int((match_types == 'explicit').sum())
    temporal_count = int((match_types == 'temporal_match').sum())
    unlinked_count = int((match_types == 'unlinked').sum())

    matched_total = explicit_count + temporal_count
    matched_ratio = round((matched_total / total) * 100.0, 2)
    unlinked_ratio = round((unlinked_count / total) * 100.0, 2)

    return {
        'total_complaints': total,
        'explicit_linked_count': explicit_count,
        'temporally_matched_count': temporal_count,
        'unlinked_count': unlinked_count,
        'matched_ratio_pct': matched_ratio,
        'unlinked_ratio_pct': unlinked_ratio
    }


def merge_datasets(outages_df: pd.DataFrame, complaints_df: pd.DataFrame, usage_df: pd.DataFrame) -> pd.DataFrame:
    """
    FR4: Merge outages, aggregated complaint volumes (explicit + temporally matched),
    and regional usage metrics into one unified dataset per outage event.
    Guarantees no Cartesian product explosion and preserves all outages.
    """
    validate_schema(outages_df, 'outages')
    validate_schema(usage_df, 'usage')

    # Standardize join key region_id
    outages = outages_df.copy()
    usage = usage_df.copy()
    outages['region_id'] = outages['region_id'].astype(str).str.strip().str.upper()
    usage['region_id'] = usage['region_id'].astype(str).str.strip().str.upper()

    # Deduplicate usage by region_id to avoid duplicate row expansion
    usage_dedup = clean_and_deduplicate(usage, 'region_id')

    # Left-join usage metrics onto outages
    merged = outages.merge(usage_dedup, on='region_id', how='left')

    if not complaints_df.empty and 'linked_outage_id' in complaints_df.columns:
        # Group complaints by linked_outage_id
        valid_complaints = complaints_df[complaints_df['linked_outage_id'].notna()].copy()
        valid_complaints['linked_outage_id'] = valid_complaints['linked_outage_id'].astype(str).str.strip()

        # Compute total, explicit, and temporally matched complaints
        total_counts = valid_complaints.groupby('linked_outage_id').size().reset_index(name='complaint_count')
        
        if 'match_type' in valid_complaints.columns:
            explicit_counts = valid_complaints[valid_complaints['match_type'] == 'explicit'].groupby('linked_outage_id').size().reset_index(name='explicit_complaint_count')
            temporal_counts = valid_complaints[valid_complaints['match_type'] == 'temporal_match'].groupby('linked_outage_id').size().reset_index(name='temporal_complaint_count')
        else:
            explicit_counts = pd.DataFrame(columns=['linked_outage_id', 'explicit_complaint_count'])
            temporal_counts = pd.DataFrame(columns=['linked_outage_id', 'temporal_complaint_count'])

        # Merge complaint counts
        merged['outage_id_clean'] = merged['outage_id'].astype(str).str.strip()
        merged = merged.merge(total_counts, left_on='outage_id_clean', right_on='linked_outage_id', how='left')
        merged = merged.merge(explicit_counts, left_on='outage_id_clean', right_on='linked_outage_id', how='left')
        merged = merged.merge(temporal_counts, left_on='outage_id_clean', right_on='linked_outage_id', how='left')

        merged['complaint_count'] = merged['complaint_count'].fillna(0).astype(int)
        merged['explicit_complaint_count'] = merged['explicit_complaint_count'].fillna(0).astype(int)
        merged['temporal_complaint_count'] = merged['temporal_complaint_count'].fillna(0).astype(int)

        # Drop temporary join columns
        cols_to_drop = [c for c in ['linked_outage_id', 'linked_outage_id_x', 'linked_outage_id_y', 'outage_id_clean'] if c in merged.columns]
        merged = merged.drop(columns=cols_to_drop)
    else:
        merged['complaint_count'] = 0
        merged['explicit_complaint_count'] = 0
        merged['temporal_complaint_count'] = 0

    return merged


def run_data_pipeline(outages_df: pd.DataFrame, complaints_df: pd.DataFrame, usage_df: pd.DataFrame, time_window_hours: float = 2.0) -> Dict[str, Any]:
    """
    Phase 2 End-to-End Ingestion, Sanitization, Temporal Linkage, and Merge Pipeline.
    Returns stage metrics and the unified merged dataset.
    """
    # 1. Raw record counts
    raw_metrics = {
        'outages_raw': len(outages_df),
        'complaints_raw': len(complaints_df),
        'usage_raw': len(usage_df)
    }

    # 2. Clean and deduplicate
    outages_clean = clean_and_deduplicate(outages_df, 'outage_id')
    complaints_clean = clean_and_deduplicate(complaints_df, 'complaint_id')
    usage_clean = clean_and_deduplicate(usage_df, 'region_id')

    dedup_metrics = {
        'outages_dedup': len(outages_clean),
        'complaints_dedup': len(complaints_clean),
        'usage_dedup': len(usage_clean)
    }

    # 3. Temporal complaint matching
    complaints_matched = match_unlinked_complaints(complaints_clean, outages_clean, time_window_hours=time_window_hours)
    linkage_summary = get_complaint_linkage_summary(complaints_matched)

    # 4. Multi-table merge
    merged_df = merge_datasets(outages_clean, complaints_matched, usage_clean)

    return {
        'raw_metrics': raw_metrics,
        'dedup_metrics': dedup_metrics,
        'linkage_summary': linkage_summary,
        'merged_records': len(merged_df),
        'merged_df': merged_df,
        'status': 'SUCCESS'
    }
