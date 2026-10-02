import os
from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd

from services.data_loader import load_dataset, get_dataset_metadata

router = APIRouter(prefix="/api", tags=["upload"])

# Global session state
session_state = {
    "original_df": None,
    "cleaned_df": None,
    "cleaning_log": [],
    "filename": "sample_sales_data.csv"
}

DEMO_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../datasets/sample_sales_data.csv"))

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload CSV or Excel dataset."""
    try:
        contents = await file.read()
        df = load_dataset(contents, file.filename)
        
        session_state["original_df"] = df.copy()
        session_state["cleaned_df"] = df.copy()
        session_state["cleaning_log"] = []
        session_state["filename"] = file.filename
        
        metadata = get_dataset_metadata(df, file.filename)
        return {"status": "success", "message": "File uploaded successfully", "data": metadata}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/load-demo")
def load_demo():
    """Load the built-in messy Customer Sales Dataset."""
    if not os.path.exists(DEMO_PATH):
        raise HTTPException(status_code=444, detail="Demo dataset not found")
        
    df = pd.read_csv(DEMO_PATH)
    session_state["original_df"] = df.copy()
    session_state["cleaned_df"] = df.copy()
    session_state["cleaning_log"] = []
    session_state["filename"] = "sample_sales_data.csv"
    
    metadata = get_dataset_metadata(df, "sample_sales_data.csv")
    return {"status": "success", "message": "Demo dataset loaded successfully", "data": metadata}

@router.get("/dataset-preview")
def dataset_preview(dataset_type: str = "cleaned"):
    """Get preview of original or cleaned dataset."""
    df = session_state["cleaned_df"] if dataset_type == "cleaned" else session_state["original_df"]
    if df is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
        
    metadata = get_dataset_metadata(df, session_state["filename"])
    return {"status": "success", "data": metadata}
