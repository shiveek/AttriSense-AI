import os
import joblib
from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score

# Feature categories
CATEGORICAL_MAPPINGS = {
    "Gender": {"Male": 0, "Female": 1},
    "MaritalStatus": {"Single": 0, "Married": 1, "Divorced": 2},
    "Overtime": {"No": 0, "Yes": 1},
    "Department": {"IT": 0, "HR": 1, "Sales": 2, "Finance": 3},
    "JobRole": {
        "Software Engineer": 0, "DevOps Engineer": 1, "Data Scientist": 2, "IT Support": 3,
        "HR Specialist": 4, "Recruiter": 5, "HR Manager": 6,
        "Sales Executive": 7, "Account Manager": 8, "Sales Representative": 9,
        "Accountant": 10, "Financial Analyst": 11, "Finance Manager": 12
    }
}

FEATURE_COLUMNS = [
    "Age", "Gender", "MaritalStatus", "DistanceFromHome", "Department", "JobRole",
    "JobLevel", "MonthlyIncome", "YearsAtCompany", "YearsInCurrentRole", "YearsSinceLastPromotion",
    "PerformanceRating", "JobSatisfaction", "WorkLifeBalance", "TrainingHours", "Overtime"
]

def preprocess_df(df: pd.DataFrame) -> pd.DataFrame:
    """
    Encodes categorical features into numeric formats based on predefined mappings.
    """
    processed_df = df.copy()
    for col, mapping in CATEGORICAL_MAPPINGS.items():
        if col in processed_df.columns:
            # Map values, fill unmapped with -1
            processed_df[col] = processed_df[col].map(mapping).fillna(-1).astype(int)
    return processed_df

def calculate_shap_fallback(model, sample_row, X_train):
    """
    A lightweight, compile-free approximation of SHAP local explanations.
    Used if the shap library is missing or fails to run.
    It calculates feature contributions based on:
    - Feature importance
    - Standardized feature deviations from the training set average
    - Model logic (e.g. low satisfaction = high risk, high overtime = high risk)
    """
    importances = model.feature_importances_
    contributions = []
    
    # Calculate means and stds for training set features
    means = X_train.mean(axis=0)
    stds = X_train.std(axis=0)
    # Avoid division by zero
    stds = np.where(stds == 0, 1.0, stds)
    
    for i, col in enumerate(FEATURE_COLUMNS):
        val = sample_row[col]
        mean_val = means[i]
        std_val = stds[i]
        
        # Calculate numeric value for math operations
        numeric_val = val
        if col in CATEGORICAL_MAPPINGS:
            numeric_val = CATEGORICAL_MAPPINGS[col].get(val, -1)
            
        # Calculate deviation (z-score)
        z = (numeric_val - mean_val) / std_val
        importance = importances[i]
        
        # Determine sign of contribution based on logical business rules
        # (e.g., lower monthly income increases attrition risk)
        direction = 1
        if col in ["MonthlyIncome", "JobSatisfaction", "WorkLifeBalance", "YearsAtCompany", "YearsInCurrentRole", "JobLevel"]:
            direction = -1 # Low value = high risk (positive contribution to attrition)
        elif col in ["Overtime", "DistanceFromHome", "YearsSinceLastPromotion"]:
            direction = 1  # High value = high risk
        elif col in ["Age"]:
            direction = -1 # Younger age = high risk
            
        contrib = z * importance * direction * 1.5
        
        # Put bounds on contribution to keep them visually balanced
        contrib = np.clip(contrib, -0.25, 0.25)
        
        contributions.append({
            "feature": col,
            "value": val,
            "contribution": float(contrib)
        })
        
    # Sort contributions by absolute impact
    contributions = sorted(contributions, key=lambda x: abs(x["contribution"]), reverse=True)
    return contributions

def train_attrition_model(dataset_path: str, model_dir: str):
    """
    Loads dataset, trains Random Forest model, computes metrics, and serializes model artifacts.
    """
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}. Please run generate_dataset.py first.")
        
    df = pd.read_csv(dataset_path)
    
    # Preprocess categorical values
    processed_df = preprocess_df(df)
    
    X = processed_df[FEATURE_COLUMNS]
    y = processed_df["Attrition"]
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Train Random Forest Classifier
    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42
    )
    model.fit(X_train, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    print("\n--- Model Evaluation ---")
    print(classification_report(y_test, y_pred))
    print(f"ROC AUC Score: {roc_auc_score(y_test, y_prob):.4f}")
    
    # Save model files
    os.makedirs(model_dir, exist_ok=True)
    
    model_data = {
        "model": model,
        "feature_columns": FEATURE_COLUMNS,
        "categorical_mappings": CATEGORICAL_MAPPINGS,
        "train_means": X_train.mean(axis=0).tolist(),
        "train_stds": X_train.std(axis=0).tolist(),
        "feature_importances": model.feature_importances_.tolist(),
        "accuracy": float(np.mean(y_pred == y_test)),
        "roc_auc": float(roc_auc_score(y_test, y_prob)),
        "total_samples": len(df),
        "trained_at": datetime.utcnow().isoformat()
    }
    
    # Check if SHAP is installed and attempt to train TreeExplainer
    shap_explainer = None
    try:
        import shap
        # Train TreeExplainer
        shap_explainer = shap.TreeExplainer(model)
        print("SHAP TreeExplainer initialized successfully.")
    except ImportError:
        print("SHAP library not installed or failed to import. Falling back to statistical explainer.")
    except Exception as e:
        print(f"SHAP Explainer setup failed: {e}. Falling back to statistical explainer.")
        
    model_data["shap_explainer"] = shap_explainer
    
    model_path = os.path.join(model_dir, "attrition_model.joblib")
    joblib.dump(model_data, model_path)
    print(f"Model saved successfully to {model_path}")

if __name__ == "__main__":
    train_attrition_model("dataset/employee_attrition.csv", "model")
