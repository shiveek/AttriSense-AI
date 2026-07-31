import {
  Users,
  TrendingDown,
  Brain,
  BadgeCheck,
} from "lucide-react";

import DashboardCard from "./DashboardCard";
import type { DashboardStats } from "../../types";

interface DashboardCardsProps {
  stats: DashboardStats;
}

const DashboardCards = ({ stats }: DashboardCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      <DashboardCard
        title="Total Employees"
        value={stats.total_employees.toString()}
        icon={Users}
        color="bg-blue-600"
      />

      <DashboardCard
        title="Attrition Danger"
        value={`${stats.attrition_rate}%`}
        icon={TrendingDown}
        color="bg-rose-500"
      />

      <DashboardCard
        title="AI Predictions"
        value={stats.ai_predictions_count.toString()}
        icon={Brain}
        color="bg-purple-600"
      />

      <DashboardCard
        title="Retention Rate"
        value={`${stats.retention_rate}%`}
        icon={BadgeCheck}
        color="bg-emerald-600"
      />

    </div>
  );
};

export default DashboardCards;