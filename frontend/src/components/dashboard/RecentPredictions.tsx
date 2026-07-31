import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Brain, ChevronRight } from "lucide-react";
import { EmployeeAPI } from "../../services/api";
import type { Employee } from "../../types";

const RecentPredictions = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await EmployeeAPI.getEmployees(undefined, undefined, undefined, undefined, 0, 5);
        setEmployees(data.employees);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High": return "bg-rose-50 text-rose-700 border-rose-100";
      case "Medium": return "bg-amber-50 text-amber-700 border-amber-100";
      default: return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4 animate-pulse">
        <div className="h-6 w-44 bg-slate-200 rounded-lg"></div>
        <div className="space-y-3">
          <div className="h-10 bg-slate-100 rounded-xl"></div>
          <div className="h-10 bg-slate-100 rounded-xl"></div>
          <div className="h-10 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between h-full space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Brain className="text-purple-600" size={20} /> High Risk Watchlist
        </h2>

        <div className="divide-y divide-slate-50">
          {employees.slice(0, 4).map((emp) => (
            <div key={emp.id} className="flex items-center justify-between py-3 gap-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                  {emp.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-slate-800 text-xs font-bold">{emp.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{emp.job_role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskColor(emp.risk_level)}`}>
                  {emp.risk_score}%
                </span>
                <Link
                  to={`/employees/${emp.id}`}
                  className="text-slate-400 hover:text-slate-800 transition"
                >
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
          {employees.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-400">
              No employees registered.
            </div>
          )}
        </div>
      </div>

      <Link
        to="/employees"
        className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 mt-2 gap-1"
      >
        View all employees <ChevronRight size={14} />
      </Link>
    </div>
  );
};

export default RecentPredictions;
