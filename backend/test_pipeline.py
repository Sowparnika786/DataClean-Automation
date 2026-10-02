import os
import pandas as pd
from services.data_loader import load_dataset, get_dataset_metadata
from services.quality_analyzer import analyze_data_quality
from services.cleaner import auto_clean_dataset
from services.report_generator import generate_excel_report, generate_pdf_report

def main():
    csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../datasets/sample_sales_data.csv"))
    print(f"Loading sample dataset from: {csv_path}")
    
    df_raw = pd.read_csv(csv_path)
    meta = get_dataset_metadata(df_raw, "sample_sales_data.csv")
    print(f"Dataset Loaded: {meta['total_rows']} rows, {meta['total_columns']} cols")
    
    orig_q = analyze_data_quality(df_raw)
    orig_score = orig_q["quality_score"]["score"]
    print(f"Original Quality Score: {orig_score}/100 (Rating: {orig_q['quality_score']['rating']})")
    print(f"Missing Cells: {orig_q['quality_indicators']['missing_cells']}, Duplicates: {orig_q['quality_indicators']['duplicate_rows']}")
    
    print("\nExecuting Auto-Clean Pipeline...")
    df_cleaned, log = auto_clean_dataset(df_raw)
    print(f"Auto-Clean performed {len(log)} actions:")
    for idx, act in enumerate(log, 1):
        print(f"  {idx}. {act}")
        
    clean_q = analyze_data_quality(df_cleaned)
    clean_score = clean_q["quality_score"]["score"]
    print(f"\nFinal Cleaned Quality Score: {clean_score}/100 (Rating: {clean_q['quality_score']['rating']})")
    print(f"Quality Score Improvement: +{clean_score - orig_score} points!")
    
    print("\nTesting Excel and PDF Report Generation...")
    excel_bytes = generate_excel_report(df_cleaned, df_raw, log)
    print(f"Excel Report generated successfully ({len(excel_bytes)} bytes)")
    
    pdf_bytes = generate_pdf_report(df_cleaned, df_raw, log)
    print(f"PDF Executive Summary Report generated successfully ({len(pdf_bytes)} bytes)")
    
    print("\nAll pipeline verification tests PASSED!")

if __name__ == "__main__":
    main()
