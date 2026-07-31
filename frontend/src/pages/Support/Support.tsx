import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { MessageSquare, ShieldAlert, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import toast from "react-hot-toast";

type SupportFormInputs = {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
};

const Support = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<SupportFormInputs>({
    defaultValues: {
      name: "",
      email: "",
      category: "Technical",
      subject: "",
      message: ""
    }
  });

  const onSubmit = async (_data: SupportFormInputs) => {
    setLoading(true);
    // Simulate API delivery
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setSubmitted(true);
    toast.success("Support ticket logged successfully!");
    reset();
  };

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">Contact Support</h1>
            <p className="text-slate-400 text-xs mt-1">
              Submit a service desk ticket. Our SRE and security engineers will respond within 4 hours.
            </p>
          </div>
          <Link
            to="/help"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-350 text-xs font-semibold transition"
          >
            <ArrowLeft size={14} />
            Help Center
          </Link>
        </div>

        {submitted ? (
          <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-3xl p-8 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-200">Ticket Dispatched</h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              Thank you for contacting AttriSense Support. Ticket reference ID <b>#AS-{Math.floor(100000 + Math.random() * 900000)}</b> has been generated and dispatched.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name & Email Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-450">Full Name</label>
                  <input
                    type="text"
                    placeholder="Sarah Connor"
                    {...register("name", { required: "Name is required" })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                  {errors.name && <span className="text-[10px] text-rose-500 font-medium block">{errors.name.message}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-450">Contact Email</label>
                  <input
                    type="email"
                    placeholder="sarah@company.com"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" }
                    })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                  {errors.email && <span className="text-[10px] text-rose-500 font-medium block">{errors.email.message}</span>}
                </div>
              </div>

              {/* Issue category Choice */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-450">Incident Classification</label>
                <select
                  {...register("category")}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="Technical">System Availability / Bug</option>
                  <option value="Data discrepancy">Data Ingestion Error</option>
                  <option value="Billing">Billing & Subscription</option>
                  <option value="Security">Security & Privacy Audit</option>
                  <option value="Other">General Inquiry</option>
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-450">Summary / Subject</label>
                <input
                  type="text"
                  placeholder="Unable to export workforce Excel summary"
                  {...register("subject", { required: "Subject is required" })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition"
                />
                {errors.subject && <span className="text-[10px] text-rose-500 font-medium block">{errors.subject.message}</span>}
              </div>

              {/* Details */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-450">Description of Issue</label>
                <textarea
                  rows={4}
                  placeholder="Please describe the issue in detail, including steps to reproduce or model parameters used."
                  {...register("message", { required: "Message is required" })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition resize-none"
                ></textarea>
                {errors.message && <span className="text-[10px] text-rose-500 font-medium block">{errors.message.message}</span>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-550/15"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Dispatching request...
                  </>
                ) : (
                  <>
                    <MessageSquare size={16} />
                    Log Ticket
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* SLA Callout */}
        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex items-start gap-3">
          <ShieldAlert size={18} className="text-blue-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-350">Enterprise SLA Guarantees</h4>
            <p className="text-[11px] text-slate-450 leading-relaxed">
              AttriSense AI guarantees 99.9% uptime. High-priority incident tickets (Severity 1) receive engineer assignment within 15 minutes, with full hot-fix deployment goals under 4 hours.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Support;
