import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Brain,
  BarChart3,
  Lightbulb,
  Settings,
  LogOut,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Employees", icon: Users, path: "/employees" },
    { name: "Prediction", icon: Brain, path: "/prediction" },
    { name: "Analytics", icon: BarChart3, path: "/analytics" },
    { name: "AI Insights", icon: Lightbulb, path: "/insights" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  const secondaryItems = [
    { name: "Help Center", icon: HelpCircle, path: "/help" },
    { name: "Contact Support", icon: MessageSquare, path: "/support" },
  ];

  const handleLogout = () => {
    useAuthStore.getState().logout();
    toast.success("Successfully logged out.");
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-slate-950 text-white min-h-screen p-6 flex flex-col justify-between border-r border-slate-900">
      <div className="space-y-6">
        <div className="flex items-center gap-3 py-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            A
          </div>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            AttriSense AI
          </h1>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-900/80 pt-4 space-y-1">
          <div className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase px-3 pb-2">Support & Legal</div>
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-slate-900 text-blue-400 font-semibold"
                    : "text-slate-400 hover:bg-slate-900/60 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-3 rounded-2xl text-slate-400 hover:bg-slate-900 hover:text-rose-400 transition-all duration-200 mt-auto"
      >
        <LogOut size={18} />
        <span className="text-sm">Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;