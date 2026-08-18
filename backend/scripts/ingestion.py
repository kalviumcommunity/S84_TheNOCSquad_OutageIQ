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


def clean_and_deduplicate(df: pd.DataFrame, id_column: str) -> pd.DataFrame:
    """
    FR3: Standardize IDs, remove duplicate records, and clean dataset.
    """
    if df.empty:
        return df.copy()

    cleaned_df = df.copy()
    cleaned_df[id_column] = cleaned_df[id_column].astype(str).str.strip()
    cleaned_df = cleaned_df.drop_duplicates(subset=[id_column]).reset_index(drop=True)
    return cleaned_df


def match_unlinked_complaints(complaints_df: pd.DataFrame, outages_df: pd.DataFrame, time_window_hours: int = 2) -> pd.DataFrame:
    """
    PRD Section 6 & FR4: Match unlinked complaints (missing linked_outage_id) to the nearest active
    outage in the same region within a specified time window (default: 2 hours).
    """
    complaints = complaints_df.copy()
    outages = outages_df.copy()

    if 'linked_outage_id' not in complaints.columns:
        complaints['linked_outage_id'] = None

    complaints['timestamp'] = pd.to_datetime(complaints['timestamp'])
    outages['start_time'] = pd.to_datetime(outages['start_time'])

    for idx, complaint in complaints[complaints['linked_outage_id'].isna()].iterrows():
        region_matches = outages[
            (outages['region_id'] == complaint['region_id']) & 
            (outages['status'] == 'open')
        ]

        for _, outage in region_matches.iterrows():
            time_diff = abs((complaint['timestamp'] - outage['start_time']).total_seconds() / 3600.0)
            if time_diff <= time_window_hours:
                complaints.at[idx, 'linked_outage_id'] = outage['outage_id']
                break

    return complaints


def merge_datasets(outages_df: pd.DataFrame, complaints_df: pd.DataFrame, usage_df: pd.DataFrame) -> pd.DataFrame:
    """
    FR4: Merge outages, aggregated complaints, and region usage data into one unified dataset per outage.
    """
    validate_schema(outages_df, 'outages')
    validate_schema(usage_df, 'usage')

    merged = outages_df.merge(usage_df, on='region_id', how='left')

    if not complaints_df.empty and 'linked_outage_id' in complaints_df.columns:
        complaint_counts = complaints_df.groupby('linked_outage_id').size().reset_index(name='complaint_count')
        merged = merged.merge(complaint_counts, left_on='outage_id', right_on='linked_outage_id', how='left')
        merged['complaint_count'] = merged['complaint_count'].fillna(0).astype(int)
    else:
        merged['complaint_count'] = 0

    return merged
