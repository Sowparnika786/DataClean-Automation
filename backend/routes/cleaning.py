from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from routes.upload import session_state
from services.cleaner import (
    clean_missing_values,
    clean_duplicates,
    standardize_text,
    convert_data_types,
    auto_clean_dataset
)
from services.outlier_detector import handle_outliers
from services.quality_analyzer import analyze_data_quality

router = APIRouter(prefix="/api/clean", tags=["cleaning"])

class MissingReq(BaseModel):
    column: str
    strategy: str  # mean, median, mode, zero, remove_rows, unknown, custom
    custom_value: Optional[str] = None

class DuplicateReq(BaseModel):
    subset_columns: Optional[List[str]] = None
    keep: str = "first"  # first, last

class InconsistentReq(BaseModel):
    column: str
    action: str  # trim, titlecase, lowercase, uppercase

class DtypeReq(BaseModel):
    column: str
    target_type: str  # numeric, float, int, datetime, string

class OutlierReq(BaseModel):
    column: str
    method: str = "iqr"  # iqr, zscore
    action: str = "cap"  # cap, remove, replace_median, keep
    threshold: float = 1.5

@router.post("/missing")
def handle_missing(req: MissingReq):
    df = session_state["cleaned_df"]
    if df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
        
    df_clean, msg = clean_missing_values(df, req.column, req.strategy, req.custom_value)
    session_state["cleaned_df"] = df_clean
    session_state["cleaning_log"].append(msg)
    
    return {"status": "success", "message": msg, "quality": analyze_data_quality(df_clean)}

@router.post("/duplicates")
def handle_duplicates(req: DuplicateReq):
    df = session_state["cleaned_df"]
    if df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
        
    df_clean, msg = clean_duplicates(df, req.subset_columns, req.keep)
    session_state["cleaned_df"] = df_clean
    session_state["cleaning_log"].append(msg)
    
    return {"status": "success", "message": msg, "quality": analyze_data_quality(df_clean)}

@router.post("/inconsistent")
def handle_inconsistent(req: InconsistentReq):
    df = session_state["cleaned_df"]
    if df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
        
    df_clean, msg = standardize_text(df, req.column, req.action)
    session_state["cleaned_df"] = df_clean
    session_state["cleaning_log"].append(msg)
    
    return {"status": "success", "message": msg, "quality": analyze_data_quality(df_clean)}

@router.post("/dtypes")
def handle_dtypes(req: DtypeReq):
    df = session_state["cleaned_df"]
    if df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
        
    df_clean, msg = convert_data_types(df, req.column, req.target_type)
    session_state["cleaned_df"] = df_clean
    session_state["cleaning_log"].append(msg)
    
    return {"status": "success", "message": msg, "quality": analyze_data_quality(df_clean)}

@router.post("/outliers")
def handle_outlier_req(req: OutlierReq):
    df = session_state["cleaned_df"]
    if df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
        
    df_clean, msg = handle_outliers(df, req.column, req.method, req.action, req.threshold)
    session_state["cleaned_df"] = df_clean
    session_state["cleaning_log"].append(msg)
    
    return {"status": "success", "message": msg, "quality": analyze_data_quality(df_clean)}

@router.post("/auto-clean")
def auto_clean():
    df = session_state["original_df"]
    if df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
        
    df_clean, actions = auto_clean_dataset(df)
    session_state["cleaned_df"] = df_clean
    session_state["cleaning_log"] = actions
    
    return {
        "status": "success",
        "message": f"Auto-clean completed with {len(actions)} transformations.",
        "cleaning_log": actions,
        "quality": analyze_data_quality(df_clean)
    }

@router.post("/reset")
def reset_cleaning():
    if session_state["original_df"] is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
        
    session_state["cleaned_df"] = session_state["original_df"].copy()
    session_state["cleaning_log"] = []
    
    return {
        "status": "success",
        "message": "Reset dataset back to original uploaded state.",
        "quality": analyze_data_quality(session_state["cleaned_df"])
    }
