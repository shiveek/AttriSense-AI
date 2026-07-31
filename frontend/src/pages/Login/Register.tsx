import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Shield, User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { AuthAPI } from "../../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      roleName: "HR_Manager"
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    const toastId = toast.loading("Registering new workforce account...");
    try {
      await AuthAPI.register(data.email, data.password, data.fullName, data.roleName);
      toast.success("Account registered successfully! Please sign in.", { id: toastId });
      navigate("/login");
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Registration failed. Please check inputs.";
      toast.error(errMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white font-sans relative overflow-hidden">
      {/* Background soft ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] px-6 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-xl shadow-blue-500/15 mb-4">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            AttriSense AI
          </h1>
          <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-semibold">
            Create System Account
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-slate-100 mb-6">
            Register new profile
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  {...register("fullName", { required: "Full name is required" })}
                  placeholder="Sarah Connor"
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl py-3.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
                />
              </div>
              {errors.fullName && (
                <span className="text-[10px] text-rose-500 font-medium pl-1 block">
                  {errors.fullName.message}
                </span>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">
                Work Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl py-3.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
                />
              </div>
              {errors.email && (
                <span className="text-[10px] text-rose-500 font-medium pl-1 block">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">
                Security Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl py-3.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
                />
              </div>
              {errors.password && (
                <span className="text-[10px] text-rose-500 font-medium pl-1 block">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* System Role Choice */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">
                System Access Role
              </label>
              <select
                {...register("roleName")}
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl py-3.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition duration-200"
              >
                <option value="HR_Manager">HR Manager (Write Access)</option>
                <option value="Analyst">Analyst (Read-Only Dashboards)</option>
                <option value="User">User (Standard Profile View)</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white py-3.5 rounded-2xl text-sm font-semibold transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/10 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 font-semibold transition duration-200"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
