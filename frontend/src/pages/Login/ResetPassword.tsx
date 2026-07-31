import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Shield, Lock, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

import { AuthAPI } from "../../services/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const token = searchParams.get("token") || "";

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const newPassword = watch("password");

  useEffect(() => {
    if (!token) {
      toast.error("Password reset token is missing. Please request a new recovery link.");
    }
  }, [token]);

  const onSubmit = async (data: any) => {
    if (!token) {
      toast.error("Invalid or missing token.");
      return;
    }
    setLoading(true);
    const toastId = toast.loading("Updating password credentials...");
    try {
      await AuthAPI.resetPassword(token, data.password);
      toast.success("Password updated successfully!", { id: toastId });
      setSuccess(true);
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Credential update failed. Token may be expired.";
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
            Reset Password
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl">
          {!success ? (
            <>
              <h2 className="text-lg font-bold text-slate-100 mb-2">
                Set new password
              </h2>
              <p className="text-slate-400 text-xs mb-6">
                Choose a strong and unique password of at least 6 characters.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* New Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 block">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      {...register("password", {
                        required: "New password is required",
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

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (val) => val === newPassword || "Passwords do not match"
                      })}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl py-3.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <span className="text-[10px] text-rose-500 font-medium pl-1 block">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white py-3.5 rounded-2xl text-sm font-semibold transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/10 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="text-lg font-bold text-slate-100">
                Credentials Updated
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Your password has been successfully changed. You can now log in using your new credentials.
              </p>
              <Link
                to="/login"
                className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-2xl text-sm font-semibold transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/10"
              >
                Sign In
              </Link>
            </div>
          )}

          {!success && (
            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white transition duration-200"
              >
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
