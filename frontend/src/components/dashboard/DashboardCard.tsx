import type { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

const DashboardCard = ({
  title,
  value,
  icon: Icon,
  color,
}: DashboardCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center hover:shadow-lg transition">
      <div>
        <p className="text-gray-500">{title}</p>

        <h2 className="text-3xl font-bold mt-2">
          {value}
        </h2>
      </div>

      <div className={`${color} p-4 rounded-xl`}>
        <Icon className="text-white" size={30} />
      </div>
    </div>
  );
};

export default DashboardCard;