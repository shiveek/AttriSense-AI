import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Brain,
  Sliders,
  Lightbulb,
  Sparkles,
  Info
} from "lucide-react";
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
import toast from "react-hot-toast";

import { PredictionAPI } from "../../services/api";
import type { PredictionRequest, PredictionResponse } from "../../types";

const PredictionForm = () => {
  const { register, handleSubmit, reset } = useForm<PredictionRequest>({
    defaultValues: {
      age: 30,
      gender: "Male",
      marital_status: "Single",
      distance_from_home: 5,
      department: "IT",
      job_role: "Software Engineer",
      job_level: 1,
      monthly_income: 4500,
      years_at_company: 2,
      years_in_current_role: 1,
      years_since_last_promotion: 0,
      performance_rating: 3,
      job_satisfaction: 3,
      work_life_balance: 3,
      training_hours: 20,
      overtime: "No"
    }
  });

  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: PredictionRequest) => {
    try {
      setLoading(true);
      setResult(null);
      toast.loading("Analyzing profile metrics...", { id: "predict" });
      
      // Parse numbers from form fields (as forms submit strings sometimes)
      const payload: PredictionRequest = {
        ...data,
        age: Number(data.age),
        distance_from_home: Number(data.distance_from_home),
        job_level: Number(data.job_level),
        monthly_income: Number(data.monthly_income),
        years_at_company: Number(data.years_at_company),
        years_in_current_role: Number(data.years_in_current_role),
        years_since_last_promotion: Number(data.years_since_last_promotion),
        performance_rating: Number(data.performance_rating),
        job_satisfaction: Number(data.job_satisfaction),
        work_life_balance: Number(data.work_life_balance),
        training_hours: Number(data.training_hours)
      };

      const res = await PredictionAPI.predict(payload);
      setResult(res);
      toast.success("Prediction complete!", { id: "predict" });
    } catch (err) {
      console.error(err);
      toast.error("Prediction engine failed.", { id: "predict" });
    } finally {
      setLoading(false);
    }
  };

  // Feature names mapping to readable labels
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

  const getRiskColors = (level: string) => {
    switch (level) {
      case "High": return { text: "text-rose-600", bg: "bg-rose-50 border-rose-200", progress: "bg-rose-500", ring: "stroke-rose-500" };
      case "Medium": return { text: "text-amber-600", bg: "bg-amber-50 border-amber-200", progress: "bg-amber-500", ring: "stroke-amber-500" };
      default: return { text: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", progress: "bg-emerald-500", ring: "stroke-emerald-500" };
    }
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-8 space-y-8"
      >
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Section 1: Demographics */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sliders size={16} /> Personal Profile
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Age</label>
                <input
                  type="number"
                  {...register("age")}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Gender</label>
                <select
                  {...register("gender")}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Marital Status</label>
                <select
                  {...register("marital_status")}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                >
                  <option>Single</option>
                  <option>Married</option>
                  <option>Divorced</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Commute (km)</label>
                <input
                  type="number"
                  {...register("distance_from_home")}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Role Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Info size={16} /> Job Role & Salary
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Department</label>
                <select
                  {...register("department")}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                >
                  <option>IT</option>
                  <option>HR</option>
                  <option>Sales</option>
                  <option>Finance</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Job Role</label>
                <input
                  placeholder="e.g. Developer"
                  {...register("job_role")}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Job Level (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  {...register("job_level")}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Monthly Salary ($)</label>
                <input
                  type="number"
                  {...register("monthly_income")}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Performance, Tenure & satisfaction */}
          <div className="md:col-span-2 space-y-4 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Brain size={16} /> Satisfaction & Career Tenure
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Years at Co.</label>
                <input
                  type="number"
                  {...register("years_at_company")}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Years in Role</label>
                <input
                  type="number"
                  {...register("years_in_current_role")}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Years Since Promo</label>
                <input
                  type="number"
                  {...register("years_since_last_promotion")}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Overtime Burden</label>
                <select
                  {...register("overtime")}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Job Satisfaction (1-4)</label>
                <select
                  {...register("job_satisfaction")}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                >
                  <option value={1}>1 - Low</option>
                  <option value={2}>2 - Medium</option>
                  <option value={3}>3 - High</option>
                  <option value={4}>4 - Outstanding</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Work Life Balance (1-4)</label>
                <select
                  {...register("work_life_balance")}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                >
                  <option value={1}>1 - Low</option>
                  <option value={2}>2 - Medium</option>
                  <option value={3}>3 - High</option>
                  <option value={4}>4 - Outstanding</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Performance Rating (1-4)</label>
                <select
                  {...register("performance_rating")}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                >
                  <option value={3}>3 - Excellent</option>
                  <option value={4}>4 - Outstanding</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Training (Hours)</label>
                <input
                  type="number"
                  {...register("training_hours")}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 border-t border-slate-100 pt-6 justify-end">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-3 border border-slate-200 text-slate-700 rounded-2xl font-semibold hover:bg-slate-50 transition text-sm"
          >
            Clear Fields
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-slate-950 text-white rounded-2xl font-semibold hover:bg-slate-800 transition disabled:opacity-50 text-sm"
          >
            {loading ? "Analyzing Attrition Probability..." : "Predict Attrition Risk"}
          </button>
        </div>
      </form>

      {/* Prediction Output Results */}
      {result && (
        <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
          
          {/* Risk Gauge Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-between min-h-[350px]">
            <div className="w-full text-center md:text-left">
              <h2 className="text-lg font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
                <Brain size={18} className="text-purple-600" /> Attrition Propensity
              </h2>
              <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold border ${getRiskColors(result.risk_level).bg} ${getRiskColors(result.risk_level).text}`}>
                {result.risk_level} Attrition Risk
              </span>
            </div>

            {/* Circular Risk Progress Bar */}
            <div className="relative flex items-center justify-center my-6">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * result.probability) / 100}
                  strokeLinecap="round"
                  className={`transition-all duration-1000 ease-out ${getRiskColors(result.risk_level).ring}`}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-slate-900">{result.probability}%</span>
                <span className="text-xs text-slate-400 font-medium mt-1">Probability</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Model Prediction Confidence</span>
                <span className="font-semibold text-slate-800">{result.confidence}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: `${result.confidence}%` }}></div>
              </div>
            </div>
          </div>

          {/* SHAP Chart */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col min-h-[350px]">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" /> Explainable AI (Local SHAP Details)
              </h2>
              <p className="text-xs text-slate-400 mt-1">Positive inputs push risk higher (red); negative inputs pull risk lower (green)</p>
            </div>

            <div className="flex-1 w-full min-h-[220px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={result.contributions.map(c => ({
                    feature: readableFeatures[c.feature] || c.feature,
                    impact: Math.round(c.contribution * 100 * 10) / 10
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="feature" type="category" width={130} stroke="#94a3b8" fontSize={11} />
                  <Tooltip formatter={(value) => [`${value}% impact`, "Attrition Impact"]} />
                  <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={1} />
                  <Bar dataKey="impact" radius={4}>
                    {result.contributions.map((c, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={c.contribution > 0 ? "#f43f5e" : "#10b981"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommendations Cards */}
          <div className="md:col-span-3 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="text-emerald-500" size={20} /> Prescriptive Attrition Mitigation Plan
            </h2>
            <div className="grid md:grid-cols-3 gap-6 pt-2">
              {result.recommendations.map((rec, index) => (
                <div key={index} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 flex gap-3 items-start">
                  <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-emerald-100 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default PredictionForm;