import re
import pandas as pd
import numpy as np
from .outlier_detector import detect_column_outliers

def analyze_data_quality(df: pd.DataFrame) -> dict:
    """Analyze overall dataset quality and calculate Data Quality Score (0-100)."""
    total_rows = len(df)
    total_cols = len(df.columns)
    total_cells = total_rows * total_cols if total_rows * total_cols > 0 else 1
    
    # Missing values
    missing_cells = int(df.isna().sum().sum())
    missing_pct = round((missing_cells / total_cells) * 100, 2)
    missing_by_col = []
    for col in df.columns:
        m_count = int(df[col].isna().sum())
        if m_count > 0:
            m_pct = round((m_count / total_rows) * 100, 2)
            # Recommend imputation method
            if pd.api.types.is_numeric_dtype(df[col]):
                rec = "Median" if df[col].skew() > 1 else "Mean"
            else:
                rec = "Mode"
            missing_by_col.append({
                "column": col,
                "missing_count": m_count,
                "missing_percentage": m_pct,
                "recommended_action": rec
            })

    # Duplicate rows
    duplicate_rows = int(df.duplicated().sum())
    duplicate_pct = round((duplicate_rows / total_rows) * 100, 2) if total_rows > 0 else 0.0

    # Column type categorization & inconsistencies
    num_cols = []
    cat_cols = []
    date_cols = []
    inconsistent_cols = []
    outlier_summary = []
    dtype_issues = []

    for col in df.columns:
        non_null = df[col].dropna()
        if pd.api.types.is_numeric_dtype(df[col]):
            num_cols.append(col)
            # Outlier check
            outlier_info = detect_column_outliers(df, col, method="iqr")
            if outlier_info and outlier_info["outlier_count"] > 0:
                outlier_summary.append({
                    "column": col,
                    "outlier_count": outlier_info["outlier_count"],
                    "outlier_percentage": outlier_info["outlier_percentage"]
                })
        elif pd.api.types.is_datetime64_any_dtype(df[col]):
            date_cols.append(col)
        else:
            cat_cols.append(col)
            # Check text inconsistency: whitespace or case variations
            str_vals = non_null.astype(str)
            trimmed = str_vals.str.strip()
            whitespace_issues = int((str_vals != trimmed).sum())
            unique_orig = str_vals.nunique()
            unique_lower = str_vals.str.lower().nunique()
            case_issues = unique_orig - unique_lower
            
            if whitespace_issues > 0 or case_issues > 0:
                inconsistent_cols.append({
                    "column": col,
                    "whitespace_issues": whitespace_issues,
                    "case_variations": case_issues,
                    "sample_variations": str_vals.unique()[:5].tolist()
                })
            
            # Check if text column looks like currency or numeric string
            if len(non_null) > 0:
                cleaned = str_vals.str.strip().str.replace(r'^[₹\$€£,]', '', regex=True)
                converted = pd.to_numeric(cleaned, errors='coerce')
                if converted.notna().mean() > 0.7:
                    dtype_issues.append({
                        "column": col,
                        "current_type": str(df[col].dtype),
                        "suggested_type": "float64 / integer",
                        "reason": "Text contains numeric or currency format"
                    })

    # Calculate Data Quality Score (0-100)
    missing_penalty = min(35, (missing_cells / total_cells) * 150)
    dup_penalty = min(25, (duplicate_rows / total_rows) * 100) if total_rows > 0 else 0
    inconsistency_penalty = min(20, len(inconsistent_cols) * 5)
    outlier_count_total = sum(o["outlier_count"] for o in outlier_summary)
    outlier_penalty = min(20, (outlier_count_total / total_rows) * 50) if total_rows > 0 else 0
    
    quality_score = max(0, int(round(100 - (missing_penalty + dup_penalty + inconsistency_penalty + outlier_penalty))))
    
    if quality_score >= 90:
        rating = "Excellent"
    elif quality_score >= 75:
        rating = "Good"
    elif quality_score >= 60:
        rating = "Needs Improvement"
    else:
        rating = "Poor Data Quality"

    return {
        "dataset_info": {
            "total_rows": total_rows,
            "total_columns": total_cols,
            "numerical_columns_count": len(num_cols),
            "categorical_columns_count": len(cat_cols),
            "date_columns_count": len(date_cols),
            "numerical_columns": num_cols,
            "categorical_columns": cat_cols,
            "date_columns": date_cols
        },
        "quality_score": {
            "score": quality_score,
            "rating": rating,
            "breakdown": {
                "missing_penalty": round(missing_penalty, 1),
                "duplicate_penalty": round(dup_penalty, 1),
                "inconsistency_penalty": round(inconsistency_penalty, 1),
                "outlier_penalty": round(outlier_penalty, 1)
            }
        },
        "quality_indicators": {
            "missing_cells": missing_cells,
            "missing_percentage": missing_pct,
            "missing_by_column": missing_by_col,
            "duplicate_rows": duplicate_rows,
            "duplicate_percentage": duplicate_pct,
            "inconsistent_columns": inconsistent_cols,
            "data_type_issues": dtype_issues,
            "outliers_found": outlier_summary,
            "outlier_total_count": outlier_count_total
        }
    }
