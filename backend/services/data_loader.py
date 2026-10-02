import os
import io
import pandas as pd
import numpy as np

def load_dataset(file_bytes: bytes, filename: str) -> pd.DataFrame:
    """Load dataset from bytes based on file extension."""
    ext = os.path.splitext(filename)[1].lower()
    if ext == '.csv':
        try:
            df = pd.read_csv(io.BytesIO(file_bytes), encoding='utf-8')
        except UnicodeDecodeError:
            df = pd.read_csv(io.BytesIO(file_bytes), encoding='latin1')
    elif ext in ['.xlsx', '.xls']:
        df = pd.read_excel(io.BytesIO(file_bytes))
    else:
        raise ValueError(f"Unsupported file type: {ext}")
    return df

def get_dataset_metadata(df: pd.DataFrame, filename: str = "dataset"):
    """Extract metadata, schema and sample rows from dataframe."""
    total_rows = len(df)
    total_cols = len(df.columns)
    
    col_info = []
    for col in df.columns:
        dtype_str = str(df[col].dtype)
        inferred_type = "numerical" if pd.api.types.is_numeric_dtype(df[col]) else "categorical"
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            inferred_type = "datetime"
        
        # Check if text column contains dates or numbers as strings
        non_nulls = df[col].dropna()
        if len(non_nulls) > 0 and inferred_type == "categorical":
            # Test currency or numeric string pattern
            sample = non_nulls.astype(str).str.strip().str.replace(r'^[₹\$€£,]', '', regex=True)
            if pd.to_numeric(sample, errors='coerce').notna().mean() > 0.7:
                inferred_type = "numerical (string)"
            
        col_info.append({
            "name": col,
            "data_type": dtype_str,
            "inferred_type": inferred_type,
            "null_count": int(df[col].isna().sum()),
            "null_percentage": round(float(df[col].isna().mean() * 100), 2)
        })
    
    # Replace NaN/Infinity with None for JSON serialization
    preview_df = df.head(20).copy()
    preview_df = preview_df.replace({np.nan: None, np.inf: None, -np.inf: None})
    
    return {
        "filename": filename,
        "total_rows": total_rows,
        "total_columns": total_cols,
        "columns": col_info,
        "preview": preview_df.to_dict(orient="records")
    }
