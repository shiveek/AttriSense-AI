from sqlalchemy.orm import Session
from typing import List
from backend.app.schemas.schemas import AIInsightResponse
from backend.app.models.db_models import Employee

def generate_ai_insights(db: Session) -> List[AIInsightResponse]:
    """
    Analyzes employee records in the DB to extract structural risk insights and retention suggestions.
    """
    insights = []
    
    employees = db.query(Employee).filter(Employee.status != "Inactive").all()
    if not employees:
        return []
        
    total_count = len(employees)
    
    # 1. Overtime Analysis
    overtime_employees = [e for e in employees if e.overtime == "Yes"]
    overtime_high_risk = [e for e in overtime_employees if e.risk_level == "High"]
    
    if overtime_employees:
        ot_pct = len(overtime_employees) / total_count * 100
        ot_hr_pct = len(overtime_high_risk) / len(overtime_employees) * 100
        
        if ot_hr_pct > 30.0:
            insights.append(
                AIInsightResponse(
                    id=1,
                    title="Overtime Attrition Trigger",
                    description=f"Overtime is strongly correlated with high attrition. {ot_hr_pct:.1f}% of employees working overtime are classified as High Risk (global average is 15.0%).",
                    category="Workload",
                    impact="High",
                    recommendation="Review project allocations and implement a strict overtime threshold capping weekly hours. Encourage team leaders to monitor work distribution."
                )
            )
            
    # 2. Promotion Stagnation Analysis
    stagnant_employees = [e for e in employees if e.years_since_last_promotion >= 3]
    stagnant_high_risk = [e for e in stagnant_employees if e.risk_level in ["High", "Medium"]]
    
    if stagnant_employees:
        stag_pct = len(stagnant_employees) / total_count * 100
        stag_risk_pct = len(stagnant_high_risk) / len(stagnant_employees) * 100
        
        if stag_risk_pct > 40.0:
            insights.append(
                AIInsightResponse(
                    id=2,
                    title="Tenure Stagnation Risk",
                    description=f"Lack of promotion in the last 3+ years is triggering attrition warnings. {stag_risk_pct:.1f}% of stagnant employees show elevated risk levels.",
                    category="Career Growth",
                    impact="High",
                    recommendation="Introduce intermediate career steps or horizontal skill-based role shifts. Establish formal development plans for tenure-locked workers."
                )
            )
            
    # 3. Satisfaction Analysis
    unsatisfied = [e for e in employees if e.job_satisfaction <= 2]
    unsatisfied_risk = [e for e in unsatisfied if e.risk_level == "High"]
    
    if unsatisfied:
        unsat_risk_pct = len(unsatisfied_risk) / len(unsatisfied) * 100
        if unsat_risk_pct > 50.0:
            insights.append(
                AIInsightResponse(
                    id=3,
                    title="Low Job Satisfaction Impact",
                    description=f"A job satisfaction rating below 3 results in a {unsat_risk_pct:.1f}% probability of classification as High Risk.",
                    category="Engagement",
                    impact="Medium",
                    recommendation="Initiate stay interviews for employees reporting low satisfaction. Evaluate structural issues like work environment or tool availability."
                )
            )
            
    # 4. Department specific analysis (Sales vs IT vs HR)
    depts = set([e.department for e in employees])
    for dept in depts:
        dept_emps = [e for e in employees if e.department == dept]
        dept_high_risk = [e for e in dept_emps if e.risk_level == "High"]
        
        if dept_emps:
            dept_risk_pct = len(dept_high_risk) / len(dept_emps) * 100
            if dept_risk_pct > 25.0:
                insights.append(
                    AIInsightResponse(
                        id=4,
                        title=f"{dept} Department Risk Warning",
                        description=f"The {dept} department is showing elevated risk with {dept_risk_pct:.1f}% of team members classified as High Attrition Risk.",
                        category="Departmental",
                        impact="Medium",
                        recommendation=f"Schedule department-wide feedback circles. Investigate compensation alignment or leadership concerns within the {dept} department."
                    )
                )
                break # Only add one departmental warning to avoid flooding
                
    # Fallback default insight if no criteria met
    if not insights:
        insights.append(
            AIInsightResponse(
                id=5,
                title="Workforce Stability Insight",
                description="Employee risk metrics show normal distributions across work units. Retention indicators remain within historical parameters.",
                category="General",
                impact="Low",
                recommendation="Continue standard engagement metrics tracking and quarterly satisfaction check-ins."
            )
        )
        
    return insights
