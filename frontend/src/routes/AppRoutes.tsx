import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import Register from "../pages/Login/Register";
import ForgotPassword from "../pages/Login/ForgotPassword";
import ResetPassword from "../pages/Login/ResetPassword";
import HelpCenter from "../pages/Help/HelpCenter";
import Support from "../pages/Support/Support";
import LegalPages from "../pages/Legal/LegalPages";

import Dashboard from "../pages/Dashboard/Dashboard";
import Employees from "../pages/Employees/Employees";
import EmployeeDetail from "../pages/Employees/EmployeeDetail";
import Prediction from "../pages/Prediction/Prediction";
import Analytics from "../pages/Analytics/Analytics";
import InsightsPage from "../pages/Insights/InsightsPage";
import Settings from "../pages/Settings/Settings";

import ProtectedLayout from "../components/layout/ProtectedLayout";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/support" element={<Support />} />
        <Route path="/legal" element={<LegalPages />} />

        {/* Protected Dashboard & Metrics (Any Authenticated Role) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedLayout>
              <Employees />
            </ProtectedLayout>
          }
        />
        <Route
          path="/employees/:id"
          element={
            <ProtectedLayout>
              <EmployeeDetail />
            </ProtectedLayout>
          }
        />

        {/* Analytical Routes (Admin, HR_Manager, Analyst) */}
        <Route
          path="/prediction"
          element={
            <ProtectedLayout allowedRoles={["Admin", "HR_Manager", "Analyst"]}>
              <Prediction />
            </ProtectedLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedLayout allowedRoles={["Admin", "HR_Manager", "Analyst"]}>
              <Analytics />
            </ProtectedLayout>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedLayout allowedRoles={["Admin", "HR_Manager", "Analyst"]}>
              <InsightsPage />
            </ProtectedLayout>
          }
        />

        {/* Administrative Routes (Admin, HR_Manager) */}
        <Route
          path="/settings"
          element={
            <ProtectedLayout allowedRoles={["Admin", "HR_Manager"]}>
              <Settings />
            </ProtectedLayout>
          }
        />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;