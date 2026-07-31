import { useEffect, useState } from "react";
import { ArrowRight, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardAPI } from "../../services/api";
import type { AIInsight } from "../../types";

const AIInsights = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await DashboardAPI.getInsights();
        setInsights(data.slice(0, 2)); // Limit to top 2 in dashboard widget
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4 animate-pulse">
        <div className="h-6 w-36 bg-slate-200 rounded-lg"></div>
        <div className="h-20 bg-slate-100 rounded-2xl"></div>
        <div className="h-20 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between h-full space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lightbulb className="text-amber-500" size={20} /> AI Decision Insights
          </h2>
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping"></span>
        </div>

        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {insight.category} Driver
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  insight.impact === "High" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                }`}>
                  {insight.impact}
                </span>
              </div>
              <p className="text-slate-800 text-xs font-semibold leading-relaxed">{insight.title}</p>
              <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">{insight.description}</p>
            </div>
          ))}
        </div>
      </div>

      <Link
        to="/insights"
        className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 mt-2 gap-1"
      >
        View all insights <ArrowRight size={14} />
      </Link>
    </div>
  );
};

export default AIInsights;
