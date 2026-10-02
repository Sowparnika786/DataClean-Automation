import numpy as np
import pandas as pd

def detect_column_outliers(df: pd.DataFrame, col: str, method: str = "iqr", threshold: float = 1.5):
    """Detect outliers in a numeric column using IQR or Z-score."""
    if col not in df.columns or not pd.api.types.is_numeric_dtype(df[col]):
        return None
    
    series = df[col].dropna()
    if len(series) == 0:
        return None
    
    mean_val = float(series.mean())
    median_val = float(series.median())
    min_val = float(series.min())
    max_val = float(series.max())
    std_val = float(series.std()) if len(series) > 1 else 0.0
    
    if method == "zscore":
        if std_val == 0:
            is_outlier = pd.Series(False, index=series.index)
            lower_bound, upper_bound = min_val, max_val
        else:
            z_scores = np.abs((series - mean_val) / std_val)
            is_outlier = z_scores > threshold
            lower_bound = mean_val - (threshold * std_val)
            upper_bound = mean_val + (threshold * std_val)
    else:  # iqr
        q1 = float(series.quantile(0.25))
        q3 = float(series.quantile(0.75))
        iqr = q3 - q1
        lower_bound = q1 - (threshold * iqr)
        upper_bound = q3 + (threshold * iqr)
        is_outlier = (series < lower_bound) | (series > upper_bound)
    
    outlier_indices = series[is_outlier].index.tolist()
    outlier_count = len(outlier_indices)
    outlier_pct = round((outlier_count / len(df)) * 100, 2)
    
    return {
        "column": col,
        "method": method,
        "total_values": len(series),
        "outlier_count": outlier_count,
        "outlier_percentage": outlier_pct,
        "min": min_val,
        "max": max_val,
        "mean": round(mean_val, 2),
        "median": round(median_val, 2),
        "lower_bound": round(lower_bound, 2),
        "upper_bound": round(upper_bound, 2),
        "outlier_indices": outlier_indices
    }

def handle_outliers(df: pd.DataFrame, col: str, method: str = "iqr", action: str = "cap", threshold: float = 1.5) -> tuple[pd.DataFrame, str]:
    """Apply outlier handling action (keep, remove, cap, replace_median)."""
    detection = detect_column_outliers(df, col, method, threshold)
    if not detection or detection["outlier_count"] == 0:
        return df, f"No outliers detected in '{col}'."
    
    df_clean = df.copy()
    count = detection["outlier_count"]
    
    if action == "remove":
        indices_to_drop = detection["outlier_indices"]
        df_clean = df_clean.drop(indices_to_drop).reset_index(drop=True)
        msg = f"Removed {count} outlier rows in column '{col}'."
    elif action == "cap":
        lb, ub = detection["lower_bound"], detection["upper_bound"]
        df_clean[col] = df_clean[col].clip(lower=lb, upper=ub)
        msg = f"Capped {count} outliers in '{col}' between [{lb}, {ub}]."
    elif action == "replace_median":
        indices = detection["outlier_indices"]
        med = detection["median"]
        df_clean.loc[indices, col] = med
        msg = f"Replaced {count} outliers in '{col}' with median value ({med})."
    else:  # keep
        msg = f"Retained all {count} outliers in '{col}'."
        
    return df_clean, msg
