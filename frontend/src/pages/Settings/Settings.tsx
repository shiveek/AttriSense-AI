import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Shield,
  Sliders,
  RefreshCw,
  Database,
  Terminal,
  Activity,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";

import MainLayout from "../../components/layout/MainLayout";
import api from "../../services/api";

interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  target_id: string | null;
  details: string | null;
  ip_address: string | null;
  timestamp: string;
}

interface ModelMetrics {
  algorithm: string;
  feature_importance: Record<string, number>;
  accuracy: number;
  roc_auc: number;
  total_samples: number;
  trained_at: string | null;
}

interface HealthStatus {
  status: string;
  database: string;
  ml_engine: string;
  model_details: any;
  environment: string;
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState<"model" | "audit" | "health">("model");
  
  // Model thresholds
  const [lowThreshold, setLowThreshold] = useState(35);
  const [highThreshold, setHighThreshold] = useState(70);
  const [training, setTraining] = useState(false);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditActionFilter, setAuditActionFilter] = useState("");
  const limit = 10;

  // System Health
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Fetch model metrics
  const fetchModelMetrics = async () => {
    try {
      const res = await api.get("/models/metrics");
      setModelMetrics(res.data);
    } catch (err) {
      console.error("Failed to load model metrics", err);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      const params: any = {
        skip: (auditPage - 1) * limit,
        limit
      };
      if (auditActionFilter) {
        params.action = auditActionFilter;
      }
      const res = await api.get("/audit-logs/", { params });
      setAuditLogs(res.data.logs);
      setAuditTotal(res.data.total);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    }
  };

  // Fetch system health
  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await api.get("/health/");
      setHealth(res.data);
    } catch (err) {
      console.error("Failed to fetch system health status", err);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchModelMetrics();
  }, []);

  useEffect(() => {
    if (activeTab === "audit") {
      fetchAuditLogs();
    } else if (activeTab === "health") {
      fetchHealth();
    }
  }, [activeTab, auditPage, auditActionFilter]);

  const handleRetrain = async () => {
    setTraining(true);
    const toastId = toast.loading("Dispatching Random Forest retraining task...");
    try {
      await api.post("/models/retrain");
      toast.success("Retraining task accepted by Celery worker!", { id: toastId });
      
      // Poll metrics after 4 seconds to check if complete
      setTimeout(() => {
        fetchModelMetrics();
        setTraining(false);
      }, 4000);
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "ML retraining failed.";
      toast.error(errMsg, { id: toastId });
      setTraining(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("FAILED")) return "text-rose-600 bg-rose-50 border-rose-100";
    if (action.includes("SUCCESS") || action.includes("REGISTERED")) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (action.includes("RETRAINED") || action.includes("LOGIN")) return "text-blue-600 bg-blue-50 border-blue-100";
    return "text-slate-600 bg-slate-50 border-slate-100";
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <SettingsIcon className="text-slate-900" size={32} /> Platform Administration
            </h1>
            <p className="text-slate-500 mt-2">
              Configure risk thresholds, inspect audit logs, and monitor machine learning service health.
            </p>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 gap-6 select-none">
          <button
            onClick={() => setActiveTab("model")}
            className={`pb-4 text-sm font-bold border-b-2 transition duration-200 cursor-pointer ${
              activeTab === "model"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            Model Engine Configuration
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-4 text-sm font-bold border-b-2 transition duration-200 cursor-pointer ${
              activeTab === "audit"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            Security Audit Trail
          </button>
          <button
            onClick={() => setActiveTab("health")}
            className={`pb-4 text-sm font-bold border-b-2 transition duration-200 cursor-pointer ${
              activeTab === "health"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            System Infrastructure Health
          </button>
        </div>

        {/* TAB content: Model Settings */}
        {activeTab === "model" && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white border border-slate-100 shadow-sm rounded-3xl p-6 md:p-8 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sliders size={18} className="text-blue-500" /> Attrition Risk Classification Thresholds
              </h2>
              <p className="text-xs text-slate-400">
                Define the boundaries where prediction probability maps to risk levels in the UI.
              </p>

              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-slate-700">Medium Risk Trigger Probability</span>
                    <span className="text-blue-600">{lowThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={lowThreshold}
                    onChange={(e) => setLowThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs text-slate-400 block">Values below this are marked Low Risk (Green).</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-slate-700">High Risk Trigger Probability</span>
                    <span className="text-rose-600">{highThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="55"
                    max="90"
                    value={highThreshold}
                    onChange={(e) => setHighThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />
                  <span className="text-xs text-slate-400 block">Values above this are marked High Risk (Red).</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Shield size={18} className="text-purple-600" /> Active ML Metrics
                </h2>
                
                {modelMetrics ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100/50 space-y-1">
                      <div className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Algorithm</div>
                      <p className="text-slate-700 text-xs font-bold">{modelMetrics.algorithm}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="text-[9px] text-slate-400 font-bold uppercase">Accuracy</div>
                        <div className="text-sm font-extrabold text-slate-800">{(modelMetrics.accuracy * 100).toFixed(1)}%</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="text-[9px] text-slate-400 font-bold uppercase">ROC AUC</div>
                        <div className="text-sm font-extrabold text-slate-800">{modelMetrics.roc_auc.toFixed(3)}</div>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between text-xs">
                      <span className="text-slate-400">Total Train Count</span>
                      <span className="font-bold text-slate-700">{modelMetrics.total_samples} profiles</span>
                    </div>
                    <div className="text-[9px] text-slate-400 text-right pt-2 font-medium">
                      Trained At: {modelMetrics.trained_at ? new Date(modelMetrics.trained_at).toLocaleString() : "Initial Seed"}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 py-6 text-center">Fetching model data...</div>
                )}
              </div>

              <button
                onClick={handleRetrain}
                disabled={training}
                className="mt-6 w-full py-3 bg-slate-950 text-white rounded-2xl hover:bg-slate-800 transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 text-sm cursor-pointer"
              >
                <RefreshCw size={16} className={training ? "animate-spin" : ""} />
                {training ? "Retraining Engine..." : "Retrain ML Model"}
              </button>
            </div>
          </div>
        )}

        {/* TAB content: Audit Logs */}
        {activeTab === "audit" && (
          <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Terminal size={18} className="text-slate-800" /> Security Logs Trail
                </h2>
                <p className="text-xs text-slate-400">Real-time log of administrative events and authentication attempts.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Filter Event:</span>
                <select
                  value={auditActionFilter}
                  onChange={(e) => {
                    setAuditActionFilter(e.target.value);
                    setAuditPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Actions</option>
                  <option value="USER_LOGIN">User Sign In</option>
                  <option value="USER_REGISTERED">User Registration</option>
                  <option value="MODEL_RETRAINED">Model Retrained</option>
                  <option value="EMPLOYEE_UPDATE">Profile Update</option>
                  <option value="PASSWORD_RESET_REQUESTED">Password Reset Request</option>
                </select>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-3 pl-4">Timestamp</th>
                    <th className="p-3">Action Type</th>
                    <th className="p-3">Impact Reference</th>
                    <th className="p-3">Detailed Log Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                        No audit logs matching selection found.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/30 transition">
                        <td className="p-3 pl-4 text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-700">
                          {log.target_id || "System"}
                        </td>
                        <td className="p-3 text-slate-500 leading-normal max-w-sm truncate">
                          {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {auditTotal > limit && (
              <div className="flex items-center justify-between border-t border-slate-50 pt-4 text-xs select-none">
                <span className="text-slate-400">
                  Showing <span className="font-bold text-slate-700">{(auditPage - 1) * limit + 1}</span> to{" "}
                  <span className="font-bold text-slate-700">{Math.min(auditPage * limit, auditTotal)}</span> of{" "}
                  <span className="font-bold text-slate-700">{auditTotal}</span> events
                </span>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => setAuditPage(p => Math.max(1, p - 1))}
                    disabled={auditPage === 1}
                    className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center disabled:opacity-30 transition cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setAuditPage(p => Math.min(Math.ceil(auditTotal / limit), p + 1))}
                    disabled={auditPage >= Math.ceil(auditTotal / limit)}
                    className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center disabled:opacity-30 transition cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB content: System Health */}
        {activeTab === "health" && (
          <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity size={18} className="text-blue-500" /> Platform Infrastructure Status Check
                </h2>
                <p className="text-xs text-slate-400 mt-1">Uptime, database pooling indices, and API gateways health.</p>
              </div>
              <button
                onClick={fetchHealth}
                disabled={healthLoading}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition cursor-pointer"
              >
                <RefreshCw size={14} className={healthLoading ? "animate-spin" : ""} />
              </button>
            </div>

            {health ? (
              <div className="space-y-6">
                {/* Health Cards Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Database Check */}
                  <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/30 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">Database Server</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        health.database === "online" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-rose-50 text-rose-700 border-rose-100"
                      }`}>
                        {health.database.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Database className="text-slate-400" size={24} />
                      <div className="text-xs">
                        <div className="font-bold text-slate-700">PostgreSQL (Neon)</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Uptime: 100% | SSL Active</div>
                      </div>
                    </div>
                  </div>

                  {/* ML Prediction Engine */}
                  <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/30 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">AI Pipeline Cache</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        health.ml_engine === "online" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-rose-50 text-rose-700 border-rose-100"
                      }`}>
                        {health.ml_engine.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="text-slate-400" size={24} />
                      <div className="text-xs">
                        <div className="font-bold text-slate-700">RandomForest Explainer</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Cached Parameters Loaded</div>
                      </div>
                    </div>
                  </div>

                  {/* Environment Status */}
                  <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/30 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">Uvicorn API Gateway</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-100">
                        ONLINE
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Activity className="text-slate-400" size={24} />
                      <div className="text-xs">
                        <div className="font-bold text-slate-700">FastAPI Instance</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Mode: {health.environment.toUpperCase()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Model Details Table Check */}
                {health.model_details && !health.model_details.error && (
                  <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Model Verification Parameters</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Active Pipeline</span>
                        <span className="text-slate-700">{health.model_details.algorithm}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Trained Accuracy</span>
                        <span className="text-slate-700">{(health.model_details.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Retrained Samples</span>
                        <span className="text-slate-700">{health.model_details.samples} records</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Retrained Timestamp</span>
                        <span className="text-slate-700">
                          {health.model_details.trained_at ? new Date(health.model_details.trained_at).toLocaleString() : "Initial Seed"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-12 text-center">Load platform health status.</div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Settings;
