import { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import DashboardCards from "../../components/dashboard/DashboardCards";
import AttritionChart from "../../components/dashboard/AttritionChart";
import DepartmentChart from "../../components/dashboard/DepartmentChart";
import AIInsights from "../../components/dashboard/AIInsights";
import RecentPredictions from "../../components/dashboard/RecentPredictions";
import { DashboardAPI } from "../../services/api";
import type { DashboardStats } from "../../types";

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const data = await DashboardAPI.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard metrics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading || !stats) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          <p className="text-slate-500 font-medium">Synchronizing workforce intelligence...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">
            Workforce Health Dashboard
          </h1>
          <p className="text-slate-500 mt-2">
            Welcome back! Here's a live overview of organizational retention risk levels.
          </p>
        </div>

        {/* Dashboard Stat Cards */}
        <div>
          <DashboardCards stats={stats} />
        </div>

        {/* Core Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          <AttritionChart data={stats.attrition_trend} />
          <DepartmentChart data={stats.department_distribution} />
        </div>

        {/* Insights & Watchlist Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <RecentPredictions />
          </div>
          <div>
            <AIInsights />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;