import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Briefcase,
  MapPin,
  ShieldAlert,
  Brain,
  CheckCircle2,
  User,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";

import MainLayout from "../../components/layout/MainLayout";
import { EmployeeAPI, PredictionAPI } from "../../services/api";
import type { Employee, PredictionResponse } from "../../types";

const EmployeeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEmployeeData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const empData = await EmployeeAPI.getEmployeeById(id);
      setEmployee(empData);
      
      const predData = await PredictionAPI.getPredictionExplanation(id);
      setPrediction(predData);
    } catch (error) {
      console.error("Error fetching employee details", error);
      toast.error("Failed to load employee details.");
      navigate("/employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [id, navigate]);

  const handleExecuteAction = async (actionType: string) => {
    if (!employee || !id) return;
    
    let updatedFields: any = {};
    let successMessage = "";
    
    if (actionType === "overtime") {
      updatedFields = { overtime: "No" };
      successMessage = "Overtime burden removed. Recalculating risk...";
    } else if (actionType === "salary") {
      const newIncome = Math.round(employee.monthly_income * 1.15);
      updatedFields = { monthly_income: newIncome };
      successMessage = `Salary boosted by 15% to $${newIncome.toLocaleString()}. Recalculating risk...`;
    } else if (actionType === "promotion") {
      const newLevel = Math.min(5, employee.job_level + 1);
      updatedFields = { job_level: newLevel, years_since_last_promotion: 0 };
      successMessage = `Promoted to Level ${newLevel}. Promotion timeline reset. Recalculating risk...`;
    } else if (actionType === "training") {
      updatedFields = { training_hours: employee.training_hours + 12 };
      successMessage = "Assigned 12h training track. Recalculating risk...";
    } else if (actionType === "worklife") {
      const newWlb = Math.min(4, employee.work_life_balance + 1);
      updatedFields = { work_life_balance: newWlb };
      successMessage = `Work-life balance rating set to ${newWlb}/4. Recalculating risk...`;
    } else if (actionType === "satisfaction") {
      const newSat = Math.min(4, employee.job_satisfaction + 1);
      updatedFields = { job_satisfaction: newSat };
      successMessage = `Stay interview feedback processed. Job satisfaction set to ${newSat}/4. Recalculating...`;
    }
    
    if (Object.keys(updatedFields).length === 0) return;
    
    const toastId = toast.loading("Executing action and updating predictive ML explainers...");
    try {
      const updatedEmployee = await EmployeeAPI.updateEmployee(id, updatedFields);
      setEmployee(updatedEmployee);
      
      const newPred = await PredictionAPI.getPredictionExplanation(id);
      setPrediction(newPred);
      
      toast.success(successMessage, { id: toastId });
    } catch (err: any) {
      toast.error("Failed to execute retention action.", { id: toastId });
    }
  };

  const getActionType = (recText: string) => {
    const text = recText.toLowerCase();
    if (text.includes("overtime")) return "overtime";
    if (text.includes("compensation") || text.includes("salary")) return "salary";
    if (text.includes("promotion") || text.includes("progression") || text.includes("career")) return "promotion";
    if (text.includes("training") || text.includes("upskilling") || text.includes("professional development")) return "training";
    if (text.includes("hybrid") || text.includes("flexible") || text.includes("commuter") || text.includes("work-life") || text.includes("life balance")) return "worklife";
    if (text.includes("satisfaction") || text.includes("interview")) return "satisfaction";
    return null;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          <p className="text-slate-500 font-medium">Analyzing workforce profiles...</p>
        </div>
      </MainLayout>
    );
  }

  if (!employee || !prediction) {
    return (
      <MainLayout>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600">Employee Profile Missing</h2>
          <p className="text-slate-500 mt-2">The requested profile could not be retrieved.</p>
          <Link to="/employees" className="mt-4 inline-flex items-center text-blue-600 hover:underline">
            <ArrowLeft size={16} className="mr-2" /> Back to Employees
          </Link>
        </div>
      </MainLayout>
    );
  }

  const readableFeatures: Record<string, string> = {
    Age: "Age",
    Gender: "Gender",
    MaritalStatus: "Marital Status",
    DistanceFromHome: "Commute Distance",
    Department: "Department",
    JobRole: "Job Role",
    JobLevel: "Job Level",
    MonthlyIncome: "Monthly Income",
    YearsAtCompany: "Tenure at Company",
    YearsInCurrentRole: "Years in Role",
    YearsSinceLastPromotion: "Time Since Promotion",
    PerformanceRating: "Performance Rating",
    JobSatisfaction: "Job Satisfaction",
    WorkLifeBalance: "Work-Life Balance",
    TrainingHours: "Training Hours",
    Overtime: "Overtime Burden"
  };

  const chartData = prediction.contributions.map((c) => ({
    feature: readableFeatures[c.feature] || c.feature,
    impact: Math.round(c.contribution * 100 * 10) / 10,
  })).sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  const getRiskColor = (level: string) => {
    switch (level) {
      case "High": return "text-rose-600 bg-rose-50 border-rose-200";
      case "Medium": return "text-amber-600 bg-amber-50 border-amber-200";
      default: return "text-emerald-600 bg-emerald-50 border-emerald-200";
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Link to="/employees" className="inline-flex items-center text-slate-500 hover:text-slate-800 transition text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" /> Back to Directory
          </Link>
          <div className="text-xs text-slate-400">
            Last Analysed: {new Date(employee.last_predicted_at).toLocaleString()}
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center text-white text-3xl font-bold select-none">
              {employee.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900">{employee.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(employee.risk_level)}`}>
                  {employee.risk_level} Attrition Risk
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-1 gap-x-4 mt-2 text-slate-500 text-sm">
                <div className="flex items-center gap-2"><Briefcase size={16} /> {employee.job_role} ({employee.department})</div>
                <div className="flex items-center gap-2"><Mail size={16} /> {employee.email}</div>
                <div className="flex items-center gap-2"><MapPin size={16} /> Commute: {employee.distance_from_home} km</div>
              </div>
            </div>
          </div>
          <div className="text-right flex md:flex-col items-center md:items-end gap-2 md:gap-0">
            <span className="text-xs text-slate-400">ID Reference</span>
            <span className="text-lg font-bold text-slate-700">{employee.id}</span>
          </div>
        </div>

        {/* AI Analytics & Explanations Row */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Risk Gauge Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-between min-h-[350px]">
            <div className="w-full">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 select-none">
                <Brain size={18} className="text-purple-600" /> Attrition Propensity
              </h2>
              <p className="text-xs text-slate-400 mt-1">Calculated via Random Forest Explainer</p>
            </div>

            {/* Circular Risk Progress Bar */}
            <div className="relative flex items-center justify-center my-6 select-none">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={employee.risk_score >= 70 ? "#ef4444" : employee.risk_score >= 35 ? "#f59e0b" : "#10b981"}
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * employee.risk_score) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-slate-900">{employee.risk_score.toFixed(1)}%</span>
                <span className="text-xs text-slate-400 font-medium mt-1">Probability</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Model Confidence</span>
                <span className="font-semibold text-slate-800">{prediction.confidence}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${prediction.confidence}%` }}></div>
              </div>
            </div>
          </div>

          {/* SHAP Explanations Chart Card */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col min-h-[350px]">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 select-none">
                <ShieldAlert size={18} className="text-amber-500" /> Explainable AI (SHAP Impacts)
              </h2>
              <p className="text-xs text-slate-400 mt-1">Features driving prediction positive (increase risk) or negative (protect retention)</p>
            </div>

            {/* Recharts Bar Chart */}
            <div className="flex-1 w-full min-h-[220px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData.slice(0, 7)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[-25, 25]} tickFormatter={(value) => `${value > 0 ? "+" : ""}${value}`} stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="feature" type="category" width={130} stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    formatter={(value: any) => [`${value > 0 ? "+" : ""}${value}% impact`, "Attrition Impact"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={1} />
                  <Bar dataKey="impact" radius={4}>
                    {chartData.slice(0, 7).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.impact > 0 ? "#f43f5e" : "#10b981"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Action Recommendations & HR Profile Detail Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Action Recommendations List */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" /> Actionable Retention Plan
              </h2>
              <p className="text-xs text-slate-400">Recommended policies for risk reduction</p>

              <div className="space-y-4 mt-2">
                {prediction.recommendations.map((rec, idx) => {
                  const actionType = getActionType(rec);
                  return (
                    <div key={idx} className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      <div className="flex gap-3 items-start">
                        <div className="h-6 w-6 rounded-full bg-slate-900 flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold select-none">
                          {idx + 1}
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">{rec}</p>
                      </div>
                      
                      {actionType && (
                        <button
                          onClick={() => handleExecuteAction(actionType)}
                          className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow shadow-emerald-600/10"
                        >
                          <Sparkles size={10} />
                          Apply Retention Policy
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* HR Details Grid */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User size={18} className="text-slate-800" /> HR Metric Profile
            </h2>
            <p className="text-xs text-slate-400">Complete performance and demographic dataset</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2">
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Age & Gender</span>
                <p className="text-sm font-semibold text-slate-800">{employee.age} Years, {employee.gender}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Marital Status</span>
                <p className="text-sm font-semibold text-slate-800">{employee.marital_status}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Monthly Salary</span>
                <p className="text-sm font-semibold text-slate-800">${employee.monthly_income.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Job Level</span>
                <p className="text-sm font-semibold text-slate-800">Level {employee.job_level} of 5</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Tenure (At Company)</span>
                <p className="text-sm font-semibold text-slate-800">{employee.years_at_company} Years ({employee.years_in_current_role} in role)</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Last Promotion</span>
                <p className="text-sm font-semibold text-slate-800">{employee.years_since_last_promotion === 0 ? "This Year" : `${employee.years_since_last_promotion} Years Ago`}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Job Satisfaction</span>
                <p className="text-sm font-semibold text-slate-800">{employee.job_satisfaction} / 4</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Work Life Balance</span>
                <p className="text-sm font-semibold text-slate-800">{employee.work_life_balance} / 4</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Overtime Requirement</span>
                <p className="text-sm font-semibold text-slate-800">{employee.overtime}</p>
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <span className="text-xs text-slate-400">Performance Rating</span>
                <p className="text-sm font-semibold text-slate-800">{employee.performance_rating === 4 ? "Outstanding" : "Excellent"} (Rating {employee.performance_rating})</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Office Location</span>
                <p className="text-sm font-semibold text-slate-800">{employee.location || "HQ"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Direct Manager</span>
                <p className="text-sm font-semibold text-slate-800">{employee.manager_name || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EmployeeDetail;
