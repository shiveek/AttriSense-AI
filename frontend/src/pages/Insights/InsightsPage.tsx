import { useEffect, useState } from "react";
import { Lightbulb, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";

import MainLayout from "../../components/layout/MainLayout";
import { DashboardAPI } from "../../services/api";
import type { AIInsight } from "../../types";

const InsightsPage = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await DashboardAPI.getInsights();
        setInsights(data);
      } catch (err) {
        console.error("Error loading insights", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const getImpactBadgeColor = (impact: string) => {
    switch (impact) {
      case "High": return "bg-rose-50 border-rose-200 text-rose-700";
      case "Medium": return "bg-amber-50 border-amber-200 text-amber-700";
      default: return "bg-emerald-50 border-emerald-200 text-emerald-700";
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          <p className="text-slate-500 font-medium">AI analysis in progress...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Lightbulb className="text-amber-500" size={32} /> AttriSense AI Decision Insights
          </h1>
          <p className="text-slate-500 mt-2">
            AI-discovered attrition triggers, risk demographics, and actionable retention strategies based on organizational data.
          </p>
        </div>

        {/* Dynamic insights cards list */}
        <div className="space-y-6">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 md:p-8 space-y-6 hover:shadow-md transition duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{insight.title}</h2>
                    <span className="text-xs text-slate-400 font-medium">{insight.category} Correlation</span>
                  </div>
                </div>
                <span className={`self-start sm:self-center px-3 py-1 text-xs font-semibold rounded-full border ${getImpactBadgeColor(insight.impact)}`}>
                  {insight.impact} Impact Factor
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 space-y-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                  <ShieldAlert size={14} className="text-rose-500" /> Analytical Finding
                </span>
                <p className="text-slate-700 text-sm leading-relaxed">{insight.description}</p>
              </div>

              <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/30 space-y-2">
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 uppercase tracking-wider">
                  <CheckCircle2 size={14} /> HR Retention Policy Action
                </span>
                <p className="text-slate-700 text-sm leading-relaxed">{insight.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default InsightsPage;
