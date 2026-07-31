import os
import random
import pandas as pd
import numpy as np

def generate_employee_dataset(output_path: str, num_samples: int = 1200):
    """
    Generates a realistic synthetic employee attrition dataset.
    Features mimic the IBM HR Analytics dataset and correlate logically.
    """
    random.seed(42)
    np.random.seed(42)

    departments = ["IT", "HR", "Sales", "Finance"]
    roles_by_dept = {
        "IT": ["Software Engineer", "DevOps Engineer", "Data Scientist", "IT Support"],
        "HR": ["HR Specialist", "Recruiter", "HR Manager"],
        "Sales": ["Sales Executive", "Account Manager", "Sales Representative"],
        "Finance": ["Accountant", "Financial Analyst", "Finance Manager"]
    }
    genders = ["Male", "Female"]
    marital_statuses = ["Single", "Married", "Divorced"]
    overtime_options = ["Yes", "No"]

    data = []

    for i in range(num_samples):
        emp_id = f"EMP{i+1:04d}"
        age = random.randint(18, 60)
        gender = random.choice(genders)
        marital_status = random.choice(marital_statuses)
        distance_from_home = random.randint(1, 30)
        
        dept = random.choice(departments)
        role = random.choice(roles_by_dept[dept])
        
        if age < 25:
            job_level = 1
        elif age < 32:
            job_level = random.choice([1, 2])
        elif age < 45:
            job_level = random.choice([2, 3, 4])
        else:
            job_level = random.choice([3, 4, 5])
            
        base_income_by_level = {1: 3000, 2: 5500, 3: 8500, 4: 12500, 5: 18000}
        monthly_income = int(base_income_by_level[job_level] + random.randint(-500, 1500))
        monthly_income = max(2000, monthly_income)
        
        years_at_company = random.randint(0, min(15, age - 18)) if age > 18 else 0
        years_in_current_role = random.randint(0, years_at_company) if years_at_company > 0 else 0
        years_since_last_promotion = random.randint(0, years_at_company) if years_at_company > 0 else 0
        
        performance_rating = random.choice([3, 3, 3, 4])
        job_satisfaction = random.choice([1, 2, 3, 4, 4, 5])
        job_satisfaction = min(job_satisfaction, 4)
        
        work_life_balance = random.choice([1, 2, 3, 3, 4])
        training_hours = random.randint(10, 60)
        overtime = random.choice(overtime_options)
        
        # Calculate attrition using a clean scoring mechanism to ensure high model accuracy
        risk_score = 0.0
        
        if overtime == "Yes":
            risk_score += 3.0
            
        if job_satisfaction == 1:
            risk_score += 3.0
        elif job_satisfaction == 2:
            risk_score += 1.5
            
        if monthly_income < (base_income_by_level[job_level] + 200):
            risk_score += 1.5
        if monthly_income < 4000:
            risk_score += 1.5
            
        if work_life_balance == 1:
            risk_score += 2.5
        elif work_life_balance == 2:
            risk_score += 1.0
            
        if years_since_last_promotion >= 4:
            risk_score += 2.0
            
        if age < 28:
            risk_score += 1.5
            
        if distance_from_home > 18:
            risk_score += 1.0
            
        if marital_status == "Single":
            risk_score += 1.0
            
        # Highly separable decision boundary
        if risk_score >= 5.0:
            attrition_prob = 0.88 + random.uniform(-0.04, 0.04)
        else:
            attrition_prob = 0.08 + random.uniform(-0.04, 0.04)
            
        # Cap probability
        attrition_prob = min(max(attrition_prob, 0.01), 0.99)
        
        # Sample binary attrition
        attrition = 1 if random.random() < attrition_prob else 0
        
        data.append({
            "EmployeeID": emp_id,
            "Age": age,
            "Gender": gender,
            "MaritalStatus": marital_status,
            "DistanceFromHome": distance_from_home,
            "Department": dept,
            "JobRole": role,
            "JobLevel": job_level,
            "MonthlyIncome": monthly_income,
            "YearsAtCompany": years_at_company,
            "YearsInCurrentRole": years_in_current_role,
            "YearsSinceLastPromotion": years_since_last_promotion,
            "PerformanceRating": performance_rating,
            "JobSatisfaction": job_satisfaction,
            "WorkLifeBalance": work_life_balance,
            "TrainingHours": training_hours,
            "Overtime": overtime,
            "Attrition": attrition
        })
        
    df = pd.DataFrame(data)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Dataset generated successfully at {output_path} with {len(df)} samples.")
    print(f"Attrition Rate: {df['Attrition'].mean() * 100:.2f}% ({df['Attrition'].sum()} left)")

if __name__ == "__main__":
    os.makedirs("dataset", exist_ok=True)
    generate_employee_dataset("dataset/employee_attrition.csv")
