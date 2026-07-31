import { useState, useEffect, useRef } from "react";
import { Bell, BellRing, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";

import { useAuthStore } from "../../store/authStore";
import api from "../../services/api";

interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  type: string;
  created_at: string;
}

const Navbar = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications/");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds for live updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Update state locally
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case "alert":
      case "warning":
        return <AlertTriangle size={16} className="text-rose-500" />;
      default:
        return <Sparkles size={16} className="text-blue-500" />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex justify-between items-center px-6 select-none relative z-40">
      <div>
        <h2 className="text-lg font-bold text-slate-800">
          Workforce Health Intelligence
        </h2>
      </div>

      <div className="flex items-center gap-6" ref={dropdownRef}>
        {/* Notification Bell Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-xl transition duration-200 cursor-pointer relative"
          >
            {unreadCount > 0 ? (
              <BellRing size={20} className="text-blue-600 animate-pulse" />
            ) : (
              <Bell size={20} />
            )}
            
            {/* Unread Badge */}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Floating Dropdown Card */}
          {isOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 shadow-xl rounded-3xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">System Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-bold">
                    {unreadCount} Alerts
                  </span>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 font-medium">
                    No active system alerts.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => !item.is_read && handleMarkAsRead(item.id)}
                      className={`p-4 flex gap-3 cursor-pointer hover:bg-slate-50/50 transition duration-150 ${
                        !item.is_read ? "bg-slate-50/20" : ""
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {getNotificationIcon(item.type)}
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 justify-between">
                          <span>{item.title}</span>
                          {!item.is_read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          {item.message}
                        </p>
                        <span className="text-[8px] text-slate-400 block pt-1">
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User initials badge */}
        <div className="flex items-center gap-2 border-l border-slate-100 pl-6">
          <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {user ? user.full_name.split(" ").map((n) => n[0]).join("") : "U"}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 truncate max-w-[100px]">
              {user ? user.full_name : "User Account"}
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              {user ? user.role.name.replace("_", " ") : "Access Level"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;