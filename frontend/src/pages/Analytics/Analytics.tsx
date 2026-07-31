import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { BarChart3, Download } from "lucide-react";
import toast from "react-hot-toast";

import MainLayout from "../../components/layout/MainLayout";
import api, { DashboardAPI } from "../../services/api";
import type { DashboardStats } from "../../types";

const Analytics = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await DashboardAPI.getStats();
        setStats(data);
      } catch (err) {
        console.error("Error loading analytics stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleDownload = async (format: "excel" | "pdf") => {
    setDownloading(true);
    const toastId = toast.loading(`Compiling and generating ${format.toUpperCase()} report...`);
    try {
      const response = await api.get(`/reports/export/${format}`, {
        responseType: "blob"
      });
      
      const blob = new Blob([response.data], {
        type: format === "excel" 
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
          : "application/pdf"
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download", 
        format === "excel" ? "attri_sense_workforce_risk.xlsx" : "attri_sense_risk_summary.pdf"
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${format.toUpperCase()} summary downloaded!`, { id: toastId });
    } catch (err) {
      toast.error("Failed to generate report. Check access permissions.", { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  if (loading || !stats) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          <p className="text-slate-500 font-medium">Crunching attrition metrics...</p>
        </div>
      </MainLayout>
    );
  }

  const riskChartData = [
    { name: "Low Risk", value: stats.risk_distribution.low, color: "#10b981" },
    { name: "Medium Risk", value: stats.risk_distribution.medium, color: "#f59e0b" },
    { name: "High Risk", value: stats.risk_distribution.high, color: "#ef4444" }
  ];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <BarChart3 className="text-slate-900" size={32} /> Workforce Demographics & Attrition Analytics
            </h1>
            <p className="text-slate-500 mt-2">
              Detailed breakdown of employee attrition probabilities, organizational risk drivers, and role distributions.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDownload("excel")}
              disabled={downloading}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 bg-white rounded-xl text-xs font-semibold hover:bg-slate-50 hover:text-slate-900 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download size={14} />
              Export Excel
            </button>
            <button
              onClick={() => handleDownload("pdf")}
              disabled={downloading}
              className="px-4 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow"
            >
              <Download size={14} />
              Export PDF
            </button>
          </div>
        </div>

        {/* Analytics Highlights grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Active Roles</div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 flex items-baseline gap-2">
              {stats.total_employees} <span className="text-xs text-slate-400 font-medium">employees</span>
            </div>
          </div>
          <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Attrition Danger</div>
            <div className="text-3xl font-extrabold text-rose-500 mt-2 flex items-baseline gap-2">
              {stats.attrition_rate}% <span className="text-xs text-slate-400 font-medium">rate</span>
            </div>
          </div>
          <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Stability Benchmark</div>
            <div className="text-3xl font-extrabold text-emerald-500 mt-2 flex items-baseline gap-2">
              {stats.retention_rate}% <span className="text-xs text-slate-400 font-medium">retention</span>
            </div>
          </div>
          <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">AI Forecast Runs</div>
            <div className="text-3xl font-extrabold text-purple-600 mt-2 flex items-baseline gap-2">
              {stats.ai_predictions_count} <span className="text-xs text-slate-400 font-medium">profiles</span>
            </div>
          </div>
        </div>

        {/* Main Charts Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Risk Level Distribution */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Attrition Propensity Distribution</h2>
            <div className="flex-1 min-h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {riskChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9" }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Headcount distribution */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Staffing Level by Department</h2>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.department_distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9" }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Headcount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Attrition Trend */}
          <div className="md:col-span-2 bg-white border border-slate-100 shadow-sm rounded-3xl p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Historical Attrition Trend (6 Months)</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.attrition_trend}>
                  <defs>
                    <linearGradient id="colorAttrition" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9" }}
                  />
                  <Area type="monotone" dataKey="attrition" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorAttrition)" name="Departures" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Analytics;
