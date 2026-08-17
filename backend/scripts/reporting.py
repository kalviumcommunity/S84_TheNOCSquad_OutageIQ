import pandas as pd
from typing import Optional, List

def filter_outages(
    df: pd.DataFrame,
    region_id: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    priority_tier: Optional[str] = None
) -> pd.DataFrame:
    """
    FR13: Filter outages by region, severity, status, and priority tier.
    """
    filtered = df.copy()
    
    if region_id:
        filtered = filtered[filtered['region_id'] == region_id]
        
    if severity:
        filtered = filtered[filtered['severity'].str.upper() == severity.upper()]
        
    if status:
        filtered = filtered[filtered['status'].str.lower() == status.lower()]
        
    if priority_tier:
        filtered = filtered[filtered['priority_tier'].str.title() == priority_tier.title()]
        
    return filtered

def get_executive_summary(df: pd.DataFrame, top_n: int = 5) -> pd.DataFrame:
    """
    FR14 & FR15: Get executive view showing top N highest-impact outages ranked by Impact Score.
    """
    if 'impact_score' not in df.columns:
        raise KeyError("Dataframe must contain 'impact_score' column")
        
    return df.sort_values(by='impact_score', ascending=False).head(top_n).copy()
