export interface Employee {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  marital_status: string;
  distance_from_home: number;
  department: string;
  job_role: string;
  job_level: number;
  monthly_income: number;
  years_at_company: number;
  years_in_current_role: number;
  years_since_last_promotion: number;
  performance_rating: number;
  job_satisfaction: number;
  work_life_balance: number;
  training_hours: number;
  overtime: string;
  status: string;
  risk_score: number;
  risk_level: string;
  last_predicted_at: string;
  location?: string;
  manager_name?: string;
}

export interface EmployeeCreate {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  marital_status: string;
  distance_from_home: number;
  department: string;
  job_role: string;
  job_level: number;
  monthly_income: number;
  years_at_company: number;
  years_in_current_role: number;
  years_since_last_promotion: number;
  performance_rating: number;
  job_satisfaction: number;
  work_life_balance: number;
  training_hours: number;
  overtime: string;
  status?: string;
  location?: string;
  manager_name?: string;
}

export interface EmployeeUpdate {
  name?: string;
  email?: string;
  age?: number;
  gender?: string;
  marital_status?: string;
  distance_from_home?: number;
  department?: string;
  job_role?: string;
  job_level?: number;
  monthly_income?: number;
  years_at_company?: number;
  years_in_current_role?: number;
  years_since_last_promotion?: number;
  performance_rating?: number;
  job_satisfaction?: number;
  work_life_balance?: number;
  training_hours?: number;
  overtime?: string;
  status?: string;
  location?: string;
  manager_name?: string;
}

export interface PredictionRequest {
  age: number;
  gender: string;
  marital_status: string;
  distance_from_home: number;
  department: string;
  job_role: string;
  job_level: number;
  monthly_income: number;
  years_at_company: number;
  years_in_current_role: number;
  years_since_last_promotion: number;
  performance_rating: number;
  job_satisfaction: number;
  work_life_balance: number;
  training_hours: number;
  overtime: string;
}

export interface SHAPContribution {
  feature: string;
  value: any;
  contribution: number;
}

export interface PredictionResponse {
  probability: number;
  risk_level: string;
  confidence: number;
  contributions: SHAPContribution[];
  recommendations: string[];
}

export interface RiskDistribution {
  high: number;
  medium: number;
  low: number;
}

export interface DepartmentDistributionItem {
  name: string;
  value: number;
}

export interface AttritionTrendItem {
  month: string;
  attrition: number;
}

export interface DashboardStats {
  total_employees: number;
  attrition_rate: number;
  ai_predictions_count: number;
  retention_rate: number;
  risk_distribution: RiskDistribution;
  department_distribution: DepartmentDistributionItem[];
  attrition_trend: AttritionTrendItem[];
}

export interface AIInsight {
  id: number;
  title: string;
  description: string;
  category: string;
  impact: string; // High, Medium, Low
  recommendation: string;
}

export interface RoleResponse {
  id: number;
  name: string;
  description?: string;
}

export interface UserResponse {
  id: number;
  email: string;
  full_name: string;
  role: RoleResponse;
  is_active: boolean;
  created_at: string;
}
