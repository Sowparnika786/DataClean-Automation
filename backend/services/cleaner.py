import re
import pandas as pd
import numpy as np
from .outlier_detector import handle_outliers

# Standard Synonym Maps for common dirty datasets
COMMON_SYNONYMS = {
    "gender": {
        "m": "Male", "male": "Male", "m": "Male", "MALE": "Male", "m": "Male",
        "f": "Female", "female": "Female", "FEMALE": "Female", "f": "Female"
    },
    "city": {
        "coimbatore": "Coimbatore", "coimbatore city": "Coimbatore", " coimbatore ": "Coimbatore",
        "chennai": "Chennai", "chennai city": "Chennai",
        "bengaluru": "Bengaluru", "bangalore": "Bengaluru",
        "mumbai": "Mumbai", "delhi": "Delhi", "kolkata": "Kolkata", "hyderabad": "Hyderabad"
    }
}

def clean_missing_values(df: pd.DataFrame, col: str, strategy: str = "median", custom_value = None) -> tuple[pd.DataFrame, str]:
    """Impute or drop missing values in a column."""
    if col not in df.columns:
        return df, f"Column '{col}' not found."
    
    missing_count = int(df[col].isna().sum())
    if missing_count == 0:
        return df, f"No missing values in '{col}'."
    
    df_clean = df.copy()
    
    if strategy == "remove_rows":
        df_clean = df_clean.dropna(subset=[col]).reset_index(drop=True)
        msg = f"Removed {missing_count} rows with missing values in '{col}'."
    elif strategy == "mean" and pd.api.types.is_numeric_dtype(df_clean[col]):
        val = float(df_clean[col].mean())
        df_clean[col] = df_clean[col].fillna(val)
        msg = f"Filled {missing_count} missing values in '{col}' using mean ({round(val, 2)})."
    elif strategy == "median" and pd.api.types.is_numeric_dtype(df_clean[col]):
        val = float(df_clean[col].median())
        df_clean[col] = df_clean[col].fillna(val)
        msg = f"Filled {missing_count} missing values in '{col}' using median ({round(val, 2)})."
    elif strategy == "mode":
        mode_series = df_clean[col].mode()
        val = mode_series.iloc[0] if len(mode_series) > 0 else "Unknown"
        df_clean[col] = df_clean[col].fillna(val)
        msg = f"Filled {missing_count} missing values in '{col}' using mode ('{val}')."
    elif strategy == "zero":
        df_clean[col] = df_clean[col].fillna(0)
        msg = f"Filled {missing_count} missing values in '{col}' with 0."
    elif strategy == "unknown":
        df_clean[col] = df_clean[col].fillna("Unknown")
        msg = f"Filled {missing_count} missing values in '{col}' with 'Unknown'."
    elif strategy == "custom" and custom_value is not None:
        df_clean[col] = df_clean[col].fillna(custom_value)
        msg = f"Filled {missing_count} missing values in '{col}' with '{custom_value}'."
    else:
        # Fallback
        val = "Unknown" if not pd.api.types.is_numeric_dtype(df_clean[col]) else 0
        df_clean[col] = df_clean[col].fillna(val)
        msg = f"Filled {missing_count} missing values in '{col}' with fallback value '{val}'."
        
    return df_clean, msg

def clean_duplicates(df: pd.DataFrame, subset_cols: list = None, keep: str = "first") -> tuple[pd.DataFrame, str]:
    """Remove exact or column-subset duplicate rows."""
    initial_rows = len(df)
    subset = subset_cols if subset_cols and len(subset_cols) > 0 else None
    
    dup_mask = df.duplicated(subset=subset, keep=keep)
    dup_count = int(dup_mask.sum())
    
    if dup_count == 0:
        return df, "No duplicate rows found."
    
    df_clean = df.drop_duplicates(subset=subset, keep=keep).reset_index(drop=True)
    cols_str = f"subset ({', '.join(subset)})" if subset else "all columns"
    msg = f"Removed {dup_count} duplicate rows based on {cols_str} (kept '{keep}')."
    return df_clean, msg

def standardize_text(df: pd.DataFrame, col: str, action: str = "trim_title", custom_map: dict = None) -> tuple[pd.DataFrame, str]:
    """Standardize text column whitespace, capitalization, or category synonyms."""
    if col not in df.columns or pd.api.types.is_numeric_dtype(df[col]):
        return df, f"Column '{col}' is not a text column."
    
    df_clean = df.copy()
    s = df_clean[col].astype(str)
    
    # Check common synonyms map first
    col_lower = col.lower()
    mapping = custom_map if custom_map else COMMON_SYNONYMS.get(col_lower, None)
    
    if mapping:
        # Normalize string before map
        def map_val(x):
            if pd.isna(x) or str(x).strip() in ['nan', 'None', '']:
                return np.nan
            key = str(x).strip().lower()
            return mapping.get(key, str(x).strip().title())
        df_clean[col] = s.apply(map_val)
        msg = f"Standardized category values in '{col}' using synonym rules."
    elif action == "trim":
        df_clean[col] = s.str.strip()
        msg = f"Trimmed leading and trailing whitespace in '{col}'."
    elif action == "lowercase":
        df_clean[col] = s.str.strip().str.lower()
        msg = f"Converted all text in '{col}' to lowercase."
    elif action == "uppercase":
        df_clean[col] = s.str.strip().str.upper()
        msg = f"Converted all text in '{col}' to uppercase."
    elif action == "titlecase" or action == "trim_title":
        df_clean[col] = s.str.strip().str.title()
        msg = f"Trimmed whitespace and converted '{col}' to Title Case."
    else:
        df_clean[col] = s.str.strip()
        msg = f"Cleaned text in '{col}'."
        
    return df_clean, msg

def convert_data_types(df: pd.DataFrame, col: str, target_type: str) -> tuple[pd.DataFrame, str]:
    """Coerce column to target data type (numeric, float, int, datetime, string)."""
    if col not in df.columns:
        return df, f"Column '{col}' not found."
    
    df_clean = df.copy()
    s = df_clean[col]
    
    try:
        if target_type in ["numeric", "float", "int"]:
            # Clean currency symbols, commas, spaces
            cleaned_s = s.astype(str).str.replace(r'[₹\$€£, ]', '', regex=True)
            num_s = pd.to_numeric(cleaned_s, errors='coerce')
            if target_type == "int":
                df_clean[col] = num_s.round().astype('Int64')
            else:
                df_clean[col] = num_s.astype(float)
            msg = f"Converted column '{col}' to {target_type} data type."
        elif target_type == "datetime":
            df_clean[col] = pd.to_datetime(s, errors='coerce').dt.strftime('%Y-%m-%d')
            msg = f"Converted column '{col}' to standardized YYYY-MM-DD datetime."
        elif target_type == "string":
            df_clean[col] = s.astype(str).str.strip()
            msg = f"Converted column '{col}' to string."
        else:
            msg = f"Unsupported target type '{target_type}'."
    except Exception as e:
        msg = f"Failed to convert '{col}' to {target_type}: {str(e)}"
        
    return df_clean, msg

def auto_clean_dataset(df: pd.DataFrame) -> tuple[pd.DataFrame, list[str]]:
    """Perform comprehensive 1-click automatic data cleaning pipeline."""
    df_clean = df.copy()
    actions = []
    
    # 1. Remove completely blank rows & empty columns
    initial_rows, initial_cols = len(df_clean), len(df_clean.columns)
    df_clean = df_clean.dropna(how='all')
    empty_rows_removed = initial_rows - len(df_clean)
    if empty_rows_removed > 0:
        actions.append(f"Removed {empty_rows_removed} completely empty rows.")
        
    empty_cols = [col for col in df_clean.columns if df_clean[col].isna().all()]
    if empty_cols:
        df_clean = df_clean.drop(columns=empty_cols)
        actions.append(f"Removed {len(empty_cols)} completely empty columns ({', '.join(empty_cols)}).")
    
    # 2. Remove exact duplicate rows
    df_clean, dup_msg = clean_duplicates(df_clean, keep="first")
    if "Removed" in dup_msg:
        actions.append(dup_msg)
        
    # 3. Standardize text capitalization & category synonyms
    for col in df_clean.columns:
        if not pd.api.types.is_numeric_dtype(df_clean[col]) and not pd.api.types.is_datetime64_any_dtype(df_clean[col]):
            # Check text type or date type inside object column
            non_null = df_clean[col].dropna().astype(str).str.strip()
            if len(non_null) > 0:
                # Test date parse
                date_parsed = pd.to_datetime(non_null, errors='coerce')
                if date_parsed.notna().mean() > 0.7:
                    df_clean[col] = date_parsed.dt.strftime('%Y-%m-%d')
                    actions.append(f"Converted '{col}' to standardized YYYY-MM-DD date format.")
                    continue
                
                # Test currency / float parse
                cleaned_num = non_null.str.replace(r'[₹\$€£, ]', '', regex=True)
                num_parsed = pd.to_numeric(cleaned_num, errors='coerce')
                if num_parsed.notna().mean() > 0.7:
                    df_clean[col] = num_parsed
                    actions.append(f"Fixed data type for '{col}': converted formatted string to numeric.")
                    continue
            
            # Standardize text
            df_clean, text_msg = standardize_text(df_clean, col, action="trim_title")
            if "Standardized" in text_msg or "Trimmed" in text_msg:
                actions.append(text_msg)
                
    # 4. Handle Missing Values
    for col in df_clean.columns:
        m_count = int(df_clean[col].isna().sum())
        if m_count > 0:
            if pd.api.types.is_numeric_dtype(df_clean[col]):
                df_clean, m_msg = clean_missing_values(df_clean, col, strategy="median")
            else:
                df_clean, m_msg = clean_missing_values(df_clean, col, strategy="mode")
            actions.append(m_msg)
            
    # 5. Handle Outliers in numerical columns (cap extreme outliers using IQR)
    for col in df_clean.columns:
        if pd.api.types.is_numeric_dtype(df_clean[col]):
            df_clean, out_msg = handle_outliers(df_clean, col, method="iqr", action="cap", threshold=1.5)
            if "Capped" in out_msg:
                actions.append(out_msg)

    if not actions:
        actions.append("Dataset was already in clean condition. No modifications required.")
        
    return df_clean, actions
