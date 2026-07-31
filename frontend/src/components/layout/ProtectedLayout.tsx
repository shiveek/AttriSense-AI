import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { useEffect, useRef } from "react";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedLayout = ({ children, allowedRoles }: ProtectedLayoutProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const toastShown = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      if (!toastShown.current) {
        toast.error("Please sign in to access this page.");
        toastShown.current = true;
      }
    } else if (allowedRoles && user && !allowedRoles.includes(user.role.name)) {
      if (!toastShown.current) {
        toast.error(`Access Denied: Your role (${user.role.name}) does not have permission to view this page.`);
        toastShown.current = true;
      }
    }
  }, [isAuthenticated, user, allowedRoles]);

  if (!isAuthenticated) {
    // Redirect to login, storing original location to return after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role.name)) {
    // Redirect unauthorized role to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedLayout;
