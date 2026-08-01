import axios from "axios";
import type {
  Employee,
  EmployeeCreate,
  EmployeeUpdate,
  PredictionRequest,
  PredictionResponse,
  DashboardStats,
  AIInsight,
  UserResponse
} from "../types";
import { useAuthStore } from "../store/authStore";

// Base API URL config - Defaults to deployed Render backend in production
const API_URL = import.meta.env.VITE_API_URL || "https://attrisense-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle auto token refresh on 401
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken
        });
        const { access_token, refresh_token, user } = response.data;
        useAuthStore.getState().login(access_token, refresh_token, user);
        
        originalRequest.headers.Authorization = 'Bearer ' + access_token;
        processQueue(null, access_token);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Fallback Mock Data in case backend is offline
const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "EMP001",
    name: "John Smith",
    email: "john.smith@attrisense.com",
    age: 34,
    gender: "Male",
    marital_status: "Married",
    distance_from_home: 8,
    department: "IT",
    job_role: "Software Engineer",
    job_level: 2,
    monthly_income: 6200,
    years_at_company: 4,
    years_in_current_role: 2,
    years_since_last_promotion: 1,
    performance_rating: 3,
    job_satisfaction: 3,
    work_life_balance: 3,
    training_hours: 24,
    overtime: "No",
    status: "Active",
    risk_score: 18.5,
    risk_level: "Low",
    last_predicted_at: new Date().toISOString()
  },
  {
    id: "EMP002",
    name: "Sarah Johnson",
    email: "sarah.j@attrisense.com",
    age: 28,
    gender: "Female",
    marital_status: "Single",
    distance_from_home: 22,
    department: "Sales",
    job_role: "Sales Representative",
    job_level: 1,
    monthly_income: 3400,
    years_at_company: 1,
    years_in_current_role: 1,
    years_since_last_promotion: 0,
    performance_rating: 3,
    job_satisfaction: 1,
    work_life_balance: 2,
    training_hours: 12,
    overtime: "Yes",
    status: "Active",
    risk_score: 84.2,
    risk_level: "High",
    last_predicted_at: new Date().toISOString()
  },
  {
    id: "EMP003",
    name: "David Miller",
    email: "d.miller@attrisense.com",
    age: 41,
    gender: "Male",
    marital_status: "Divorced",
    distance_from_home: 15,
    department: "Sales",
    job_role: "Sales Executive",
    job_level: 3,
    monthly_income: 8900,
    years_at_company: 8,
    years_in_current_role: 4,
    years_since_last_promotion: 5,
    performance_rating: 3,
    job_satisfaction: 2,
    work_life_balance: 3,
    training_hours: 30,
    overtime: "Yes",
    status: "Active",
    risk_score: 52.8,
    risk_level: "Medium",
    last_predicted_at: new Date().toISOString()
  },
  {
    id: "EMP004",
    name: "Alice Brown",
    email: "alice.b@attrisense.com",
    age: 25,
    gender: "Female",
    marital_status: "Single",
    distance_from_home: 3,
    department: "Finance",
    job_role: "Accountant",
    job_level: 1,
    monthly_income: 4200,
    years_at_company: 2,
    years_in_current_role: 2,
    years_since_last_promotion: 1,
    performance_rating: 4,
    job_satisfaction: 4,
    work_life_balance: 4,
    training_hours: 45,
    overtime: "No",
    status: "Active",
    risk_score: 11.2,
    risk_level: "Low",
    last_predicted_at: new Date().toISOString()
  },
  {
    id: "EMP005",
    name: "Robert Taylor",
    email: "r.taylor@attrisense.com",
    age: 39,
    gender: "Male",
    marital_status: "Married",
    distance_from_home: 29,
    department: "HR",
    job_role: "HR Specialist",
    job_level: 2,
    monthly_income: 5800,
    years_at_company: 5,
    years_in_current_role: 3,
    years_since_last_promotion: 0,
    performance_rating: 3,
    job_satisfaction: 2,
    work_life_balance: 1,
    training_hours: 18,
    overtime: "Yes",
    status: "On Leave",
    risk_score: 72.1,
    risk_level: "High",
    last_predicted_at: new Date().toISOString()
  }
];

const MOCK_STATS: DashboardStats = {
  total_employees: 1245,
  attrition_rate: 15.7,
  ai_predictions_count: 985,
  retention_rate: 84.3,
  risk_distribution: {
    high: 84,
    medium: 196,
    low: 965
  },
  department_distribution: [
    { name: "IT", value: 450 },
    { name: "Sales", value: 300 },
    { name: "HR", value: 120 },
    { name: "Finance", value: 150 },
    { name: "Marketing", value: 225 }
  ],
  attrition_trend: [
    { month: "Jan", attrition: 12 },
    { month: "Feb", attrition: 15 },
    { month: "Mar", attrition: 18 },
    { month: "Apr", attrition: 13 },
    { month: "May", attrition: 10 },
    { month: "Jun", attrition: 16 }
  ]
};

const MOCK_INSIGHTS: AIInsight[] = [
  {
    id: 1,
    title: "Overtime Attrition Trigger",
    description: "Overtime is strongly correlated with high attrition. 54.2% of employees working overtime are classified as High Risk (global average is 15.7%).",
    category: "Workload",
    impact: "High",
    recommendation: "Review project allocations and implement a strict overtime threshold capping weekly hours. Encourage team leaders to monitor work distribution."
  },
  {
    id: 2,
    title: "Tenure Stagnation Risk",
    description: "Lack of promotion in the last 3+ years is triggering attrition warnings. 42.8% of stagnant employees show elevated risk levels.",
    category: "Career Growth",
    impact: "High",
    recommendation: "Introduce intermediate career steps or horizontal skill-based role shifts. Establish formal development plans for tenure-locked workers."
  },
  {
    id: 3,
    title: "Low Job Satisfaction Impact",
    description: "A job satisfaction rating below 3 results in a 65.5% probability of classification as High Risk.",
    category: "Engagement",
    impact: "Medium",
    recommendation: "Initiate stay interviews for employees reporting low satisfaction. Evaluate structural issues like work environment or tool availability."
  }
];

export const EmployeeAPI = {
  getEmployees: async (
    search?: string,
    department?: string,
    riskLevel?: string,
    status?: string,
    skip = 0,
    limit = 100
  ): Promise<{ employees: Employee[]; total: number }> => {
    try {
      const response = await api.get("/employees/", {
        params: { search, department, risk_level: riskLevel, status, skip, limit }
      });
      return response.data;
    } catch (error) {
      console.warn("Backend API offline, using mock data.", error);
      let filtered = [...MOCK_EMPLOYEES];
      if (search) {
        filtered = filtered.filter(
          e =>
            e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.id.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (department && department !== "All") {
        filtered = filtered.filter(e => e.department === department);
      }
      if (riskLevel && riskLevel !== "All") {
        filtered = filtered.filter(e => e.risk_level === riskLevel);
      }
      if (status && status !== "All") {
        filtered = filtered.filter(e => e.status === status);
      }
      return {
        employees: filtered.slice(skip, skip + limit),
        total: filtered.length
      };
    }
  },

  getEmployeeById: async (id: string): Promise<Employee> => {
    try {
      const response = await api.get(`/employees/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Backend API offline, using mock data for employee ${id}.`, error);
      const found = MOCK_EMPLOYEES.find(e => e.id === id);
      if (!found) throw new Error("Employee not found");
      return found;
    }
  },

  createEmployee: async (employee: EmployeeCreate): Promise<Employee> => {
    try {
      const response = await api.post("/employees/", employee);
      return response.data;
    } catch (error) {
      console.warn("Backend API offline, mock creating employee.", error);
      const newEmp: Employee = {
        ...employee,
        status: employee.status || "Active",
        risk_score: Math.floor(Math.random() * 95),
        risk_level: "Low",
        last_predicted_at: new Date().toISOString()
      };
      if (newEmp.risk_score >= 70) newEmp.risk_level = "High";
      else if (newEmp.risk_score >= 35) newEmp.risk_level = "Medium";
      MOCK_EMPLOYEES.unshift(newEmp);
      return newEmp;
    }
  },

  updateEmployee: async (id: string, employee: EmployeeUpdate): Promise<Employee> => {
    try {
      const response = await api.put(`/employees/${id}`, employee);
      return response.data;
    } catch (error) {
      console.warn("Backend API offline, mock updating employee.", error);
      const idx = MOCK_EMPLOYEES.findIndex(e => e.id === id);
      if (idx === -1) throw new Error("Employee not found");
      const updated = { ...MOCK_EMPLOYEES[idx], ...employee };
      MOCK_EMPLOYEES[idx] = updated;
      return updated;
    }
  },

  deleteEmployee: async (id: string): Promise<void> => {
    try {
      await api.delete(`/employees/${id}`);
    } catch (error) {
      console.warn("Backend API offline, mock deleting employee.", error);
      const idx = MOCK_EMPLOYEES.findIndex(e => e.id === id);
      if (idx !== -1) MOCK_EMPLOYEES.splice(idx, 1);
    }
  },

  uploadCsv: async (file: File): Promise<{ success_count: number; error_count: number; errors: string[] }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/employees/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  }
};

export const DashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get("/dashboard/stats");
      return response.data;
    } catch (error) {
      console.warn("Backend API offline, returning mock dashboard stats.", error);
      return MOCK_STATS;
    }
  },

  getInsights: async (): Promise<AIInsight[]> => {
    try {
      const response = await api.get("/dashboard/insights");
      return response.data;
    } catch (error) {
      console.warn("Backend API offline, returning mock insights.", error);
      return MOCK_INSIGHTS;
    }
  }
};

export const PredictionAPI = {
  predict: async (data: PredictionRequest): Promise<PredictionResponse> => {
    try {
      const response = await api.post("/predict/", data);
      return response.data;
    } catch (error) {
      console.warn("Backend API offline, generating mock prediction response.", error);
      // Run fallback prediction logic on frontend
      const probability = Math.floor(Math.random() * 85) + 10;
      let risk_level = "Low";
      if (probability >= 70) risk_level = "High";
      else if (probability >= 35) risk_level = "Medium";

      // Mock contributions (SHAP-like)
      const contributions = [
        { feature: "Overtime", value: data.overtime, contribution: data.overtime === "Yes" ? 0.18 : -0.05 },
        { feature: "MonthlyIncome", value: data.monthly_income, contribution: data.monthly_income < 4000 ? 0.12 : -0.08 },
        { feature: "JobSatisfaction", value: data.job_satisfaction, contribution: data.job_satisfaction <= 2 ? 0.15 : -0.07 },
        { feature: "WorkLifeBalance", value: data.work_life_balance, contribution: data.work_life_balance <= 2 ? 0.10 : -0.04 },
        { feature: "Age", value: data.age, contribution: data.age < 30 ? 0.08 : -0.03 }
      ].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

      // Recommendations
      const recommendations: string[] = [];
      if (data.overtime === "Yes") {
        recommendations.push("Overtime Reduction: Limit weekly overtime hours or offer flexible/hybrid options.");
      }
      if (data.job_satisfaction <= 2) {
        recommendations.push("Stay Interview: Conduct a 1-on-1 feedback session to review team and tool issues.");
      }
      if (data.monthly_income < 5000) {
        recommendations.push("Compensation Review: Evaluate salary alignment relative to market roles.");
      }
      if (recommendations.length === 0) {
        recommendations.push("Continue current engagement practices. Employee shows high stability markers.");
      }

      return {
        probability,
        risk_level,
        confidence: 94.0,
        contributions,
        recommendations
      };
    }
  },

  getPredictionExplanation: async (employeeId: string): Promise<PredictionResponse> => {
    try {
      const response = await api.get(`/predict/explain/${employeeId}`);
      return response.data;
    } catch (error) {
      console.warn(`Backend API offline, generating mock explanation for employee ${employeeId}.`, error);
      const emp = MOCK_EMPLOYEES.find(e => e.id === employeeId);
      const req: PredictionRequest = emp ? {
        age: emp.age,
        gender: emp.gender,
        marital_status: emp.marital_status,
        distance_from_home: emp.distance_from_home,
        department: emp.department,
        job_role: emp.job_role,
        job_level: emp.job_level,
        monthly_income: emp.monthly_income,
        years_at_company: emp.years_at_company,
        years_in_current_role: emp.years_in_current_role,
        years_since_last_promotion: emp.years_since_last_promotion,
        performance_rating: emp.performance_rating,
        job_satisfaction: emp.job_satisfaction,
        work_life_balance: emp.work_life_balance,
        training_hours: emp.training_hours,
        overtime: emp.overtime
      } : {
        age: 30,
        gender: "Male",
        marital_status: "Single",
        distance_from_home: 10,
        department: "IT",
        job_role: "Software Engineer",
        job_level: 2,
        monthly_income: 6000,
        years_at_company: 3,
        years_in_current_role: 2,
        years_since_last_promotion: 1,
        performance_rating: 3,
        job_satisfaction: 3,
        work_life_balance: 3,
        training_hours: 20,
        overtime: "No"
      };
      
      return PredictionAPI.predict(req);
    }
  }
};

export const AuthAPI = {
  login: async (email: string, password: string): Promise<any> => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (email: string, password: string, fullName: string, roleName = "HR_Manager"): Promise<UserResponse> => {
    const response = await api.post("/auth/register", {
      email,
      password,
      full_name: fullName,
      role_name: roleName
    });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<any> => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<any> => {
    const response = await api.post("/auth/reset-password", { token, new_password: newPassword });
    return response.data;
  }
};

export default api;
