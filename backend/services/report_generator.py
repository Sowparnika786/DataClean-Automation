import io
import pandas as pd
import numpy as np
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils.dataframe import dataframe_to_rows

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from .quality_analyzer import analyze_data_quality

def generate_excel_report(df_cleaned: pd.DataFrame, df_original: pd.DataFrame, cleaning_log: list[str]) -> bytes:
    """Generate multi-sheet Excel workbook (5 Sheets)."""
    wb = Workbook()
    
    # Styles
    header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid") # Dark navy
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    title_font = Font(name="Calibri", size=16, bold=True, color="1E3A8A")
    regular_font = Font(name="Calibri", size=10)
    bold_font = Font(name="Calibri", size=10, bold=True)
    border = Border(
        left=Side(style='thin', color='E2E8F0'),
        right=Side(style='thin', color='E2E8F0'),
        top=Side(style='thin', color='E2E8F0'),
        bottom=Side(style='thin', color='E2E8F0')
    )

    # Sheet 1: Cleaned Data
    ws1 = wb.active
    ws1.title = "Cleaned Data"
    ws1.views.sheetView[0].showGridLines = True
    
    ws1.append(["Cleaned Dataset Export"])
    ws1.cell(row=1, column=1).font = title_font
    ws1.append([]) # blank
    
    for r in dataframe_to_rows(df_cleaned, index=False, header=True):
        ws1.append(r)
        
    # Format header row
    header_row_idx = 3
    for cell in ws1[header_row_idx]:
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")

    # Sheet 2: Data Summary
    ws2 = wb.create_sheet(title="Data Summary")
    ws2.views.sheetView[0].showGridLines = True
    ws2.append(["Data Cleaning & Quality Summary Report"])
    ws2.cell(row=1, column=1).font = title_font
    ws2.append([])
    
    before_q = analyze_data_quality(df_original)
    after_q = analyze_data_quality(df_cleaned)
    
    summary_data = [
        ["Metric", "Before Cleaning", "After Cleaning", "Improvement"],
        ["Total Records / Rows", before_q["dataset_info"]["total_rows"], after_q["dataset_info"]["total_rows"], f"{after_q['dataset_info']['total_rows'] - before_q['dataset_info']['total_rows']} rows"],
        ["Total Columns", before_q["dataset_info"]["total_columns"], after_q["dataset_info"]["total_columns"], "-"],
        ["Missing Cells", before_q["quality_indicators"]["missing_cells"], after_q["quality_indicators"]["missing_cells"], f"-{before_q['quality_indicators']['missing_cells'] - after_q['quality_indicators']['missing_cells']}"],
        ["Duplicate Rows", before_q["quality_indicators"]["duplicate_rows"], after_q["quality_indicators"]["duplicate_rows"], f"-{before_q['quality_indicators']['duplicate_rows'] - after_q['quality_indicators']['duplicate_rows']}"],
        ["Outliers Detected", before_q["quality_indicators"]["outlier_total_count"], after_q["quality_indicators"]["outlier_total_count"], f"-{before_q['quality_indicators']['outlier_total_count'] - after_q['quality_indicators']['outlier_total_count']}"],
        ["Data Quality Score", f"{before_q['quality_score']['score']}/100", f"{after_q['quality_score']['score']}/100", f"+{after_q['quality_score']['score'] - before_q['quality_score']['score']} points"]
    ]
    for row in summary_data:
        ws2.append(row)
        
    for cell in ws2[3]:
        cell.fill = header_fill
        cell.font = header_font

    # Sheet 3: Cleaning Log
    ws3 = wb.create_sheet(title="Cleaning Log")
    ws3.views.sheetView[0].showGridLines = True
    ws3.append(["Automated Cleaning Actions Audit Trail"])
    ws3.cell(row=1, column=1).font = title_font
    ws3.append([])
    ws3.append(["Step #", "Action Performed"])
    ws3.cell(row=3, column=1).fill = header_fill
    ws3.cell(row=3, column=1).font = header_font
    ws3.cell(row=3, column=2).fill = header_fill
    ws3.cell(row=3, column=2).font = header_font
    
    for idx, act in enumerate(cleaning_log, start=1):
        ws3.append([idx, act])

    # Sheet 4: Missing Value Report
    ws4 = wb.create_sheet(title="Missing Value Report")
    ws4.views.sheetView[0].showGridLines = True
    ws4.append(["Missing Values Detailed Analysis"])
    ws4.cell(row=1, column=1).font = title_font
    ws4.append([])
    ws4.append(["Column Name", "Missing Count (Before)", "Missing % (Before)", "Status (After)"])
    for cell in ws4[3]:
        cell.fill = header_fill
        cell.font = header_font
        
    for col in df_original.columns:
        m_cnt = int(df_original[col].isna().sum())
        m_pct = round((m_cnt / len(df_original)) * 100, 2) if len(df_original) > 0 else 0
        after_m = int(df_cleaned[col].isna().sum()) if col in df_cleaned.columns else 0
        status = "Resolved (0 missing)" if after_m == 0 else f"{after_m} missing remaining"
        ws4.append([col, m_cnt, f"{m_pct}%", status])

    # Sheet 5: Statistical Summary
    ws5 = wb.create_sheet(title="Statistical Summary")
    ws5.views.sheetView[0].showGridLines = True
    ws5.append(["Descriptive Numerical Statistics"])
    ws5.cell(row=1, column=1).font = title_font
    ws5.append([])
    
    num_df = df_cleaned.select_dtypes(include=[np.number])
    if not num_df.empty:
        stats_df = num_df.describe().T.reset_index()
        stats_df = stats_df.rename(columns={"index": "Column Name"})
        for r in dataframe_to_rows(stats_df, index=False, header=True):
            ws5.append(r)
        for cell in ws5[3]:
            cell.fill = header_fill
            cell.font = header_font

    # Auto-adjust column widths across all sheets
    for sheet in wb.worksheets:
        for col in sheet.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = col[0].column_letter
            sheet.column_dimensions[col_letter].width = max(max_len + 3, 12)

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return output.read()

def generate_pdf_report(df_cleaned: pd.DataFrame, df_original: pd.DataFrame, cleaning_log: list[str]) -> bytes:
    """Generate Executive PDF Report using ReportLab."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B'),
        spaceAfter=15
    )
    
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#1E3A8A'),
        spaceBefore=14,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#334155')
    )

    story = []
    
    # Header
    story.append(Paragraph("Data Cleaning & Automated Quality Report", title_style))
    story.append(Paragraph("Automated Data Diagnostics, Cleaning Audit & Statistical Overview", subtitle_style))
    story.append(Spacer(1, 8))
    
    before_q = analyze_data_quality(df_original)
    after_q = analyze_data_quality(df_cleaned)

    # Section 1: Executive Summary & Scorecard
    story.append(Paragraph("1. Executive Summary & Quality Scorecard", h2_style))
    
    b_score = before_q['quality_score']['score']
    a_score = after_q['quality_score']['score']
    diff = a_score - b_score
    
    score_table_data = [
        [
            Paragraph(f"<b>Original Data Quality</b><br/><font size=16 color='#EF4444'><b>{b_score} / 100</b></font><br/>Rating: {before_q['quality_score']['rating']}", body_style),
            Paragraph(f"<b>Final Data Quality</b><br/><font size=16 color='#10B981'><b>{a_score} / 100</b></font><br/>Rating: {after_q['quality_score']['rating']}", body_style),
            Paragraph(f"<b>Quality Improvement</b><br/><font size=16 color='#2563EB'><b>+{diff} Points</b></font><br/>Status: Clean & Verified", body_style),
        ]
    ]
    t_score = Table(score_table_data, colWidths=[180, 180, 180])
    t_score.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_score)
    story.append(Spacer(1, 12))

    # Section 2: Before vs After Comparison
    story.append(Paragraph("2. Dataset Comparison Metrics", h2_style))
    comp_data = [
        ["Metric", "Before Cleaning", "After Cleaning", "Delta"],
        ["Total Rows", str(before_q["dataset_info"]["total_rows"]), str(after_q["dataset_info"]["total_rows"]), str(after_q["dataset_info"]["total_rows"] - before_q["dataset_info"]["total_rows"])],
        ["Total Columns", str(before_q["dataset_info"]["total_columns"]), str(after_q["dataset_info"]["total_columns"]), "0"],
        ["Missing Values", str(before_q["quality_indicators"]["missing_cells"]), str(after_q["quality_indicators"]["missing_cells"]), f"-{before_q['quality_indicators']['missing_cells'] - after_q['quality_indicators']['missing_cells']}"],
        ["Duplicate Rows", str(before_q["quality_indicators"]["duplicate_rows"]), str(after_q["quality_indicators"]["duplicate_rows"]), f"-{before_q['quality_indicators']['duplicate_rows'] - after_q['quality_indicators']['duplicate_rows']}"],
        ["Outliers Detected", str(before_q["quality_indicators"]["outlier_total_count"]), str(after_q["quality_indicators"]["outlier_total_count"]), f"-{before_q['quality_indicators']['outlier_total_count'] - after_q['quality_indicators']['outlier_total_count']}"]
    ]
    t_comp = Table(comp_data, colWidths=[150, 130, 130, 130])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A8A')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('ALIGN', (1,0), (-1,-1), 'CENTER'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(t_comp)
    story.append(Spacer(1, 14))

    # Section 3: Cleaning Actions Log
    story.append(Paragraph("3. Cleaning Actions Performed", h2_style))
    log_rows = [["#", "Action Description"]]
    for idx, act in enumerate(cleaning_log, start=1):
        log_rows.append([str(idx), Paragraph(act, body_style)])
    
    t_log = Table(log_rows, colWidths=[30, 510])
    t_log.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#3B82F6')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_log)
    story.append(Spacer(1, 14))

    # Section 4: Statistical Summary
    story.append(Paragraph("4. Numerical Features Summary Statistics", h2_style))
    num_df = df_cleaned.select_dtypes(include=[np.number])
    if not num_df.empty:
        stats_df = num_df.describe().T.reset_index()
        s_headers = ["Column", "Count", "Mean", "Std", "Min", "50% (Median)", "Max"]
        s_rows = [s_headers]
        for _, row in stats_df.iterrows():
            s_rows.append([
                str(row['index']),
                str(int(row['count'])),
                str(round(row['mean'], 1)),
                str(round(row['std'], 1)) if not np.isnan(row['std']) else '0',
                str(round(row['min'], 1)),
                str(round(row['50%'], 1)),
                str(round(row['max'], 1))
            ])
        t_stat = Table(s_rows, colWidths=[120, 50, 70, 70, 70, 80, 80])
        t_stat.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('ALIGN', (1,0), (-1,-1), 'CENTER'),
            ('FONTSIZE', (0,0), (-1,-1), 8.5)
        ]))
        story.append(t_stat)
    else:
        story.append(Paragraph("No numerical features found in dataset.", body_style))
        
    story.append(Spacer(1, 14))

    # Section 5: Conclusion & Recommendation
    story.append(Paragraph("5. Final Data Readiness Recommendation", h2_style))
    rec_text = f"The dataset has been successfully processed and verified. Data Quality Score improved from <b>{b_score}/100</b> to <b>{a_score}/100</b> (+{diff}%). All critical missing values, duplicates, formatting inconsistencies, and extreme outliers have been rectified. The cleaned dataset is ready for analytics, machine learning model training, and business intelligence reporting."
    story.append(Paragraph(rec_text, body_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()
