import pandas as pd
import numpy as np
from .quality_analyzer import analyze_data_quality

def generate_visualizations(df_before: pd.DataFrame, df_after: pd.DataFrame = None) -> dict:
    """Generate chart datasets for Recharts visualization dashboard."""
    curr_df = df_after if df_after is not None else df_before
    
    # 1. Missing Values by Column Chart
    missing_chart_data = []
    for col in curr_df.columns:
        m_cnt = int(curr_df[col].isna().sum())
        missing_chart_data.append({
            "column": col,
            "missing_count": m_cnt,
            "missing_percentage": round((m_cnt / len(curr_df)) * 100, 1) if len(curr_df) > 0 else 0
        })
        
    # 2. Data Types Distribution
    dtypes_count = {"Numerical": 0, "Categorical": 0, "Datetime": 0}
    for col in curr_df.columns:
        if pd.api.types.is_numeric_dtype(curr_df[col]):
            dtypes_count["Numerical"] += 1
        elif pd.api.types.is_datetime64_any_dtype(curr_df[col]):
            dtypes_count["Datetime"] += 1
        else:
            dtypes_count["Categorical"] += 1
            
    dtypes_chart_data = [
        {"name": k, "value": v} for k, v in dtypes_count.items() if v > 0
    ]
    
    # 3. Numeric Distributions (Histograms & Box Plots)
    num_cols = [c for c in curr_df.columns if pd.api.types.is_numeric_dtype(curr_df[c])]
    numeric_charts = {}
    for col in num_cols:
        series = curr_df[col].dropna()
        if len(series) > 0:
            # Histogram bins
            counts, bin_edges = np.histogram(series, bins=min(10, max(5, series.nunique())))
            hist_data = []
            for i in range(len(counts)):
                label = f"{round(bin_edges[i], 1)}-{round(bin_edges[i+1], 1)}"
                hist_data.append({"bin": label, "frequency": int(counts[i])})
                
            # Boxplot statistics
            q1, med, q3 = float(series.quantile(0.25)), float(series.quantile(0.50)), float(series.quantile(0.75))
            iqr = q3 - q1
            min_val, max_val = float(series.min()), float(series.max())
            outliers = series[(series < q1 - 1.5 * iqr) | (series > q3 + 1.5 * iqr)].tolist()
            
            numeric_charts[col] = {
                "histogram": hist_data,
                "boxplot": {
                    "min": min_val,
                    "q1": round(q1, 2),
                    "median": round(med, 2),
                    "q3": round(q3, 2),
                    "max": max_val,
                    "outliers_count": len(outliers)
                }
            }

    # 4. Categorical Distributions (Bar & Pie Charts)
    cat_cols = [c for c in curr_df.columns if not pd.api.types.is_numeric_dtype(curr_df[c]) and not pd.api.types.is_datetime64_any_dtype(curr_df[c])]
    categorical_charts = {}
    for col in cat_cols:
        top_cats = curr_df[col].value_counts().head(10)
        cat_data = [
            {"category": str(k), "count": int(v)} for k, v in top_cats.items()
        ]
        categorical_charts[col] = cat_data

    # 5. Correlation Heatmap
    correlation_matrix = []
    if len(num_cols) >= 2:
        corr_df = curr_df[num_cols].corr().round(2).fillna(0)
        for row in corr_df.index:
            for col in corr_df.columns:
                correlation_matrix.append({
                    "x": str(col),
                    "y": str(row),
                    "value": float(corr_df.loc[row, col])
                })

    # 6. Before vs After Comparison
    before_quality = analyze_data_quality(df_before)
    after_quality = analyze_data_quality(df_after) if df_after is not None else before_quality
    
    score_before = before_quality["quality_score"]["score"]
    score_after = after_quality["quality_score"]["score"]
    score_diff = score_after - score_before
    
    comparison_metrics = {
        "rows": {"before": before_quality["dataset_info"]["total_rows"], "after": after_quality["dataset_info"]["total_rows"]},
        "missing_values": {"before": before_quality["quality_indicators"]["missing_cells"], "after": after_quality["quality_indicators"]["missing_cells"]},
        "duplicate_rows": {"before": before_quality["quality_indicators"]["duplicate_rows"], "after": after_quality["quality_indicators"]["duplicate_rows"]},
        "outliers": {"before": before_quality["quality_indicators"]["outlier_total_count"], "after": after_quality["quality_indicators"]["outlier_total_count"]},
        "quality_score": {"before": score_before, "after": score_after},
        "score_improvement": score_diff
    }

    return {
        "missing_values_chart": missing_chart_data,
        "data_types_chart": dtypes_chart_data,
        "numeric_charts": numeric_charts,
        "categorical_charts": categorical_charts,
        "correlation_matrix": correlation_matrix,
        "comparison_metrics": comparison_metrics
    }
