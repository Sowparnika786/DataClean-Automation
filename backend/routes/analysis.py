from fastapi import APIRouter, HTTPException
import pandas as pd
import numpy as np

from routes.upload import session_state
from services.quality_analyzer import analyze_data_quality
from services.visualizer import generate_visualizations
from services.outlier_detector import detect_column_outliers

router = APIRouter(prefix="/api", tags=["analysis"])

@router.post("/analyze")
def analyze_dataset():
    """Analyze quality of currently loaded dataset."""
    df_orig = session_state["original_df"]
    df_clean = session_state["cleaned_df"]
    
    if df_orig is None:
        raise HTTPException(status_code=400, detail="No dataset loaded. Please upload or load demo first.")
        
    analysis_orig = analyze_data_quality(df_orig)
    analysis_clean = analyze_data_quality(df_clean) if df_clean is not None else analysis_orig
    
    return {
        "status": "success",
        "filename": session_state["filename"],
        "original_quality": analysis_orig,
        "cleaned_quality": analysis_clean,
        "cleaning_log": session_state["cleaning_log"]
    }

@router.get("/quality-report")
def get_quality_report():
    """Get latest data quality report."""
    return analyze_dataset()

@router.get("/statistics")
def get_statistics():
    """Get descriptive statistics for numeric features."""
    df = session_state["cleaned_df"] if session_state["cleaned_df"] is not None else session_state["original_df"]
    if df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
        
    num_df = df.select_dtypes(include=[np.number])
    if num_df.empty:
        return {"status": "success", "statistics": {}}
        
    stats = num_df.describe().round(2).replace({np.nan: None}).to_dict()
    return {"status": "success", "statistics": stats}

@router.get("/visualizations")
def get_visualizations():
    """Get interactive visualization payloads for frontend dashboard."""
    df_orig = session_state["original_df"]
    df_clean = session_state["cleaned_df"]
    
    if df_orig is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
        
    vis_data = generate_visualizations(df_orig, df_clean)
    return {"status": "success", "data": vis_data}

@router.get("/column-details/{col_name}")
def column_details(col_name: str):
    """Smart Column Analysis detailing metrics for a specific column."""
    df = session_state["cleaned_df"] if session_state["cleaned_df"] is not None else session_state["original_df"]
    if df is None or col_name not in df.columns:
        raise HTTPException(status_code=404, detail=f"Column '{col_name}' not found")
        
    series = df[col_name]
    total = len(df)
    null_cnt = int(series.isna().sum())
    unique_cnt = int(series.nunique())
    dtype_str = str(series.dtype)
    
    detail = {
        "column_name": col_name,
        "data_type": dtype_str,
        "total_values": total,
        "missing_count": null_cnt,
        "missing_percentage": round((null_cnt / total) * 100, 2) if total > 0 else 0,
        "unique_values_count": unique_cnt,
        "sample_values": series.dropna().unique()[:8].tolist()
    }
    
    if pd.api.types.is_numeric_dtype(series):
        non_null = series.dropna()
        detail["is_numeric"] = True
        detail["min"] = float(non_null.min()) if len(non_null) > 0 else None
        detail["max"] = float(non_null.max()) if len(non_null) > 0 else None
        detail["mean"] = round(float(non_null.mean()), 2) if len(non_null) > 0 else None
        detail["median"] = round(float(non_null.median()), 2) if len(non_null) > 0 else None
        detail["std"] = round(float(non_null.std()), 2) if len(non_null) > 1 else 0.0
        
        outliers = detect_column_outliers(df, col_name, method="iqr")
        detail["outliers_count"] = outliers["outlier_count"] if outliers else 0
    else:
        detail["is_numeric"] = False
        top_cats = series.value_counts().head(5).to_dict()
        detail["top_categories"] = [{"category": str(k), "count": int(v)} for k, v in top_cats.items()]
        mode_val = series.mode()
        detail["mode"] = str(mode_val.iloc[0]) if len(mode_val) > 0 else "N/A"
        
    return {"status": "success", "data": detail}
