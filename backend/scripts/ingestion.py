import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any

REQUIRED_SCHEMAS = {
    'outages': ['outage_id', 'region_id', 'start_time', 'severity', 'status'],
    'complaints': ['complaint_id', 'region_id', 'timestamp'],
    'usage': ['region_id', 'region_name', 'subscriber_count', 'revenue_tier']
}

def validate_schema(df: pd.DataFrame, dataset_name: str) -> bool:
    """
    FR2 & NFR Data Quality: Validate dataframe schema against expected required columns.
    Returns True if valid, raises ValueError if required columns are missing.
    """
    if dataset_name not in REQUIRED_SCHEMAS:
        raise ValueError(f"Unknown dataset name: {dataset_name}")
    
    required_cols = REQUIRED_SCHEMAS[dataset_name]
    missing_cols = [col for col in required_cols if col not in df.columns]
    
    if missing_cols:
        raise ValueError(f"Dataset '{dataset_name}' missing required columns: {missing_cols}")
    
    return True

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
    PRD Section 6: Match unlinked complaints (missing linked_outage_id) to the nearest active
    outage in the same region within a specified time window (e.g. 2 hours).
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
