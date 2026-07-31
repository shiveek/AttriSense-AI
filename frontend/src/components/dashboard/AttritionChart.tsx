import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AttritionTrendItem } from "../../types";

interface AttritionChartProps {
  data: AttritionTrendItem[];
}

const AttritionChart = ({ data }: AttritionChartProps) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">
        Attrition Danger Trend
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />

          <YAxis stroke="#94a3b8" fontSize={12} />

          <Tooltip
            contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9" }}
          />

          <Line
            type="monotone"
            dataKey="attrition"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttritionChart;