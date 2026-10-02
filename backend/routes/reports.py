import os
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import Response

from routes.upload import session_state
from services.report_generator import generate_excel_report, generate_pdf_report

router = APIRouter(prefix="/api", tags=["reports"])

@router.post("/export/csv")
def export_csv():
    df = session_state["cleaned_df"]
    if df is None:
        raise HTTPException(status_code=400, detail="No dataset available to export")
        
    csv_str = df.to_csv(index=False)
    fname = f"cleaned_{session_state['filename']}"
    if not fname.endswith('.csv'):
        fname += '.csv'
        
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={fname}"}
    )

@router.post("/export/excel")
def export_excel():
    df_clean = session_state["cleaned_df"]
    df_orig = session_state["original_df"]
    log = session_state["cleaning_log"]
    
    if df_clean is None or df_orig is None:
        raise HTTPException(status_code=400, detail="No dataset available to export")
        
    excel_bytes = generate_excel_report(df_clean, df_orig, log)
    base_name = os.path.splitext(session_state['filename'])[0]
    fname = f"cleaned_report_{base_name}.xlsx"
    
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={fname}"}
    )

@router.post("/generate-report")
def generate_pdf():
    df_clean = session_state["cleaned_df"]
    df_orig = session_state["original_df"]
    log = session_state["cleaning_log"]
    
    if df_clean is None or df_orig is None:
        raise HTTPException(status_code=400, detail="No dataset available to export")
        
    pdf_bytes = generate_pdf_report(df_clean, df_orig, log)
    base_name = os.path.splitext(session_state['filename'])[0]
    fname = f"Executive_Data_Quality_Report_{base_name}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={fname}"}
    )

@router.get("/export/cleaning-log")
def export_log():
    return {
        "filename": session_state["filename"],
        "total_actions": len(session_state["cleaning_log"]),
        "cleaning_log": session_state["cleaning_log"]
    }
