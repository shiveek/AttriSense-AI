from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
from datetime import datetime

from backend.app.database.connection import get_db
from backend.app.core.auth import get_current_user, RoleChecker, User
from backend.app.models.db_models import Employee

router = APIRouter(prefix="/reports", tags=["Reports & Export"])

analyst_or_above = RoleChecker(["Admin", "HR_Manager", "Analyst"])

@router.get("/export/excel")
def export_employees_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(analyst_or_above)
):
    """
    Generates a beautifully structured Excel spreadsheet of the active workforce
    along with their attrition probabilities and risk categories.
    """
    import openpyxl
    from openpyxl.styles import Font, Alignment, PatternFill
    
    # Query active employees
    employees = db.query(Employee).all()
    
    # Create workbook
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Workforce Risk Directory"
    
    # Enable grid lines
    ws.views.sheetView[0].showGridLines = True
    
    # Define headers
    headers = [
        "Employee ID", "Full Name", "Email Address", "Department", "Job Role",
        "Job Level", "Monthly Income", "Years at Company", "Risk Score (%)",
        "Risk Level", "Status", "Location", "Manager Name"
    ]
    ws.append(headers)
    
    # Style Header Row
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="1F2937", end_color="1F2937", fill_type="solid") # Dark Slate Gray
    header_align = Alignment(horizontal="center", vertical="center", wrap_text=True)
    
    ws.row_dimensions[1].height = 25
    for col_idx in range(1, len(headers) + 1):
        cell = ws.cell(row=1, column=col_idx)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_align
        
    # Append Data
    for emp in employees:
        ws.append([
            emp.id, emp.name, emp.email, emp.department, emp.job_role,
            emp.job_level, emp.monthly_income, emp.years_at_company,
            round(emp.risk_score, 1), emp.risk_level, emp.status,
            emp.location or "HQ", emp.manager_name or "N/A"
        ])
        
    # Formatting styles for cells
    risk_high_fill = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid") # Rose 100
    risk_med_fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid") # Amber 100
    risk_low_fill = PatternFill(start_color="D1FAE5", end_color="D1FAE5", fill_type="solid") # Emerald 100
    
    # Auto-adjust column widths and style cell values
    for col in ws.columns:
        max_len = 0
        col_letter = openpyxl.utils.get_column_letter(col[0].column)
        
        for cell in col:
            # Skip header row for alignment/fills
            if cell.row > 1:
                # Text alignment
                if cell.column in [1, 6, 8, 9, 10, 11]: # ID, JobLevel, Years, RiskScore, RiskLevel, Status
                    cell.alignment = Alignment(horizontal="center")
                else:
                    cell.alignment = Alignment(horizontal="left")
                    
                # Risk level color tags
                if cell.column == 10: # Risk Level
                    if cell.value == "High":
                        cell.fill = risk_high_fill
                    elif cell.value == "Medium":
                        cell.fill = risk_med_fill
                    elif cell.value == "Low":
                        cell.fill = risk_low_fill
                        
            val_str = str(cell.value or '')
            if len(val_str) > max_len:
                max_len = len(val_str)
                
        ws.column_dimensions[col_letter].width = max(max_len + 3, 12)
        
    # Save to dynamic buffer
    stream = io.BytesIO()
    wb.save(stream)
    stream.seek(0)
    
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=attri_sense_workforce_risk.xlsx"}
    )


@router.get("/export/pdf")
def export_employees_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(analyst_or_above)
):
    """
    Compiles an Executive Workforce Attrition Summary PDF using reportlab.
    """
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    
    # Query metrics
    employees = db.query(Employee).all()
    total_count = len(employees)
    high_risk_count = sum(1 for e in employees if e.risk_level == "High")
    med_risk_count = sum(1 for e in employees if e.risk_level == "Medium")
    low_risk_count = total_count - high_risk_count - med_risk_count
    
    avg_risk = sum(e.risk_score for e in employees) / max(1, total_count)
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#111827'), # Dark gray
        spaceAfter=15
    )
    
    meta_style = ParagraphStyle(
        'MetaStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor('#6B7280'),
        spaceAfter=30
    )
    
    h2_style = ParagraphStyle(
        'Heading2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=colors.HexColor('#1E3A8A'), # Navy
        spaceBefore=15,
        spaceAfter=10
    )
    
    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#374151')
    )
    
    story = []
    
    # Logo & Title
    story.append(Paragraph("AttriSense AI — Executive Summary", title_style))
    story.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%B %d, %Y')} | Confidential workforce analytics report.", meta_style))
    
    # Section 1: Executive KPI Panel
    story.append(Paragraph("Workforce Health Overview", h2_style))
    intro_text = (
        f"This intelligence summary assesses employee attrition likelihoods across organizational departments. "
        f"The current active directory lists <b>{total_count}</b> personnel records analyzed by the Random Forest attrition risk classifier."
    )
    story.append(Paragraph(intro_text, body_style))
    story.append(Spacer(1, 15))
    
    # KPI Grid Table
    kpi_data = [
        ["Total Directory Count", f"{total_count} Active Profiles"],
        ["Average Attrition Risk Score", f"{avg_risk:.1f}% Attrition Likelihood"],
        ["High Risk Watchlist", f"{high_risk_count} Employees ({high_risk_count / max(1, total_count) * 100:.1f}%)"],
        ["Medium Risk Alerts", f"{med_risk_count} Employees ({med_risk_count / max(1, total_count) * 100:.1f}%)"],
        ["Retention Stability Rate", f"{(low_risk_count / max(1, total_count) * 100):.1f}% Stable"]
    ]
    
    kpi_table = Table(kpi_data, colWidths=[200, 300])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F9FAFB')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
        ('PADDING', (0,0), (-1,-1), 8),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('TEXTCOLOR', (0,0), (0,-1), colors.HexColor('#374151')),
        ('TEXTCOLOR', (1,0), (1,-1), colors.HexColor('#1E3A8A')),
    ]))
    
    story.append(kpi_table)
    story.append(Spacer(1, 20))
    
    # Section 2: Top Attrition Watchlist
    story.append(Paragraph("Retention Attrition Watchlist (Top High Risk)", h2_style))
    story.append(Paragraph("The following table documents high-propensity attrition warnings currently flagged by the ML pipeline. Proactive retention interviews are recommended.", body_style))
    story.append(Spacer(1, 12))
    
    # Sort employees by risk score descending
    watchlist = sorted(employees, key=lambda e: e.risk_score, reverse=True)[:10]
    
    watchlist_data = [
        ["ID", "Name", "Department", "Role", "Risk Score", "Risk Level"]
    ]
    for emp in watchlist:
        watchlist_data.append([
            emp.id, emp.name, emp.department, emp.job_role, f"{emp.risk_score:.1f}%", emp.risk_level
        ])
        
    watchlist_table = Table(watchlist_data, colWidths=[60, 100, 80, 140, 60, 60])
    watchlist_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1F2937')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('ALIGN', (4,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9FAFB')]),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    
    story.append(watchlist_table)
    
    # Build Document
    doc.build(story)
    
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=attri_sense_risk_summary.pdf"}
    )
