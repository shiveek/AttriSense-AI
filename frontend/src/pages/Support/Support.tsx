import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  MessageSquare,
  ShieldAlert,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Bug,
  Lightbulb,
  Paperclip,
  Clock,
  Mail,
  Send,
  X
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import toast from "react-hot-toast";
import { SupportAPI } from "../../services/api";

type TicketType = "ticket" | "bug" | "feature" | "contact";

interface SupportFormInputs {
  name: string;
  email: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  module?: string;
  severity?: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  businessImpact?: string;
}

const Support = () => {
  const [activeType, setActiveType] = useState<TicketType>("ticket");
  const [loading, setLoading] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<any>(null);
  const [attachment, setAttachment] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SupportFormInputs>({
    defaultValues: {
      name: "",
      email: "",
      category: "CSV Ingestion & Data Pipeline",
      priority: "Medium",
      subject: "",
      description: "",
      module: "CSV Ingestion",
      severity: "High"
    }
  });

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        toast.error("Attachment exceeds 10MB limit.");
        return;
      }
      setAttachment(selected);
      toast.success(`Attached ${selected.name}`);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const onSubmit = async (data: SupportFormInputs) => {
    setLoading(true);
    const toastId = toast.loading("Submitting ticket to enterprise service desk...");

    try {
      let responseTicket: any = null;

      if (activeType === "ticket") {
        responseTicket = await SupportAPI.submitTicket({
          name: data.name,
          email: data.email,
          category: data.category,
          priority: data.priority,
          subject: data.subject,
          description: data.description,
          attachment_name: attachment ? attachment.name : undefined
        });
      } else if (activeType === "bug") {
        responseTicket = await SupportAPI.reportBug({
          name: data.name,
          email: data.email,
          module: data.module,
          severity: data.severity,
          subject: data.subject,
          description: data.description,
          steps_to_reproduce: data.stepsToReproduce,
          expected_behavior: data.expectedBehavior,
          actual_behavior: data.actualBehavior,
          attachment_name: attachment ? attachment.name : undefined
        });
      } else if (activeType === "feature") {
        responseTicket = await SupportAPI.submitFeatureRequest({
          name: data.name,
          email: data.email,
          category: data.category,
          subject: data.subject,
          description: data.description,
          business_impact: data.businessImpact
        });
      } else if (activeType === "contact") {
        responseTicket = await SupportAPI.submitContactForm({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.description
        });
      }

      setSubmittedTicket(responseTicket);
      toast.success(`Ticket ${responseTicket.ticket_number || "submitted"} logged successfully!`, { id: toastId });
      reset();
      setAttachment(null);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to log ticket. Please try again.";
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Enterprise Support Desk</h1>
            <p className="text-slate-600 text-sm mt-1">
              Submit support tickets, log system bugs, or request features. Guaranteed SLA response within 15 mins for critical issues.
            </p>
          </div>
          <Link
            to="/help"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-slate-700 text-xs font-bold transition shadow-sm self-start md:self-auto"
          >
            <ArrowLeft size={14} />
            Help Center & SLAs
          </Link>
        </div>

        {/* Support Channel Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: "ticket", label: "Support Ticket", icon: MessageSquare, desc: "General technical issues" },
            { id: "bug", label: "Report a Bug", icon: Bug, desc: "Log system errors" },
            { id: "feature", label: "Feature Request", icon: Lightbulb, desc: "Product enhancements" },
            { id: "contact", label: "Contact Us", icon: Mail, desc: "General & Enterprise inquiries" }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveType(tab.id as TicketType);
                  setSubmittedTicket(null);
                }}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between shadow-sm ${
                  isActive
                    ? "bg-blue-50 border-blue-300 text-blue-900 ring-1 ring-blue-500/20"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center mb-3 ${
                  isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  <Icon size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{tab.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{tab.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Success Confirmation State */}
        {submittedTicket ? (
          <div className="bg-white border border-emerald-300 rounded-3xl p-8 text-center space-y-5 shadow-sm">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Ticket Dispatched Successfully</h2>
              <p className="text-xs text-slate-600 mt-1">
                Reference ID: <span className="font-mono font-bold text-blue-700 text-sm px-2.5 py-0.5 bg-blue-50 rounded-md border border-blue-200">{submittedTicket.ticket_number}</span>
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Category:</span>
                <span className="font-bold text-slate-900">{submittedTicket.category}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Priority Level:</span>
                <span className="font-bold text-blue-700">{submittedTicket.priority}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status:</span>
                <span className="font-bold text-emerald-700">{submittedTicket.status}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SLA Response Target:</span>
                <span className="font-bold text-slate-900">
                  {submittedTicket.priority === "Urgent" || submittedTicket.priority === "High" ? "15 Minutes" : "4 Hours"}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              A confirmation email has been logged for <b>{submittedTicket.user_email}</b>. SRE engineers will investigate immediately.
            </p>
            <button
              onClick={() => setSubmittedTicket(null)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Submit Another Ticket
            </button>
          </div>
        ) : (
          /* Main Form Card */
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {activeType === "ticket" && <MessageSquare className="text-blue-600" size={18} />}
                {activeType === "bug" && <Bug className="text-rose-600" size={18} />}
                {activeType === "feature" && <Lightbulb className="text-amber-500" size={18} />}
                {activeType === "contact" && <Mail className="text-indigo-600" size={18} />}
                {activeType === "ticket" && "Submit Technical Support Ticket"}
                {activeType === "bug" && "Submit Detailed Bug Report"}
                {activeType === "feature" && "Submit Feature & Product Request"}
                {activeType === "contact" && "Submit Enterprise Inquiry"}
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name & Email */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    placeholder="Sarah Connor"
                    {...register("name", { required: "Name is required" })}
                    className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                  />
                  {errors.name && <span className="text-[10px] text-rose-600 font-semibold block">{errors.name.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Contact Email</label>
                  <input
                    type="email"
                    placeholder="sarah@company.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" }
                    })}
                    className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                  />
                  {errors.email && <span className="text-[10px] text-rose-600 font-semibold block">{errors.email.message}</span>}
                </div>
              </div>

              {/* Ticket specifics based on active tab */}
              {activeType === "ticket" && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Issue Category</label>
                    <select
                      {...register("category")}
                      className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                    >
                      <option value="CSV Ingestion & Data Pipeline">CSV Ingestion & Data Pipeline</option>
                      <option value="Model Predictions & Analytics">Model Predictions & Analytics</option>
                      <option value="System Availability & Bug">System Availability & Bug</option>
                      <option value="Billing & Enterprise Plan">Billing & Enterprise Plan</option>
                      <option value="Account & Role Access">Account & Role Access</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Priority Level</label>
                    <select
                      {...register("priority")}
                      className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                    >
                      <option value="Low">Low - Informational inquiry</option>
                      <option value="Medium">Medium - Normal operational impact</option>
                      <option value="High">High - Impaired functionality</option>
                      <option value="Urgent">Urgent / Critical - Service outage (15-min SLA)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeType === "bug" && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Affected Module</label>
                    <select
                      {...register("module")}
                      className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                    >
                      <option value="CSV Ingestion">Bulk CSV Ingestion</option>
                      <option value="Prediction Engine">ML Prediction Engine & SHAP</option>
                      <option value="Analytics Dashboard">Dashboard & Metrics</option>
                      <option value="PDF/Excel Exports">Reports Generator</option>
                      <option value="Authentication">Login & Security</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Severity</label>
                    <select
                      {...register("severity")}
                      className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                    >
                      <option value="Critical">Critical - System crash or data loss</option>
                      <option value="High">High - Major feature broken</option>
                      <option value="Medium">Medium - Minor workaround available</option>
                      <option value="Low">Low - UI/UX alignment cosmetic issue</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Subject / Title</label>
                <input
                  type="text"
                  placeholder={
                    activeType === "bug"
                      ? "e.g., CSV upload returns 'Missing required column' for valid header"
                      : activeType === "feature"
                      ? "e.g., Add Slack notification integration for high-risk alerts"
                      : "Summary of technical issue"
                  }
                  {...register("subject", { required: "Subject is required" })}
                  className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                />
                {errors.subject && <span className="text-[10px] text-rose-600 font-semibold block">{errors.subject.message}</span>}
              </div>

              {/* Bug specific extra fields */}
              {activeType === "bug" && (
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-600">Steps to Reproduce</label>
                    <textarea
                      rows={3}
                      placeholder="1. Go to Employees&#10;2. Upload sample.csv&#10;3. Click Ingest"
                      {...register("stepsToReproduce")}
                      className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-600">Expected Behavior</label>
                    <textarea
                      rows={3}
                      placeholder="System parses 100 rows successfully"
                      {...register("expectedBehavior")}
                      className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-600">Actual Behavior</label>
                    <textarea
                      rows={3}
                      placeholder="Displays error banner"
                      {...register("actualBehavior")}
                      className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Detailed Description</label>
                <textarea
                  rows={4}
                  placeholder="Please describe the issue, dataset details, or requested feature in depth..."
                  {...register("description", { required: "Description is required" })}
                  className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition resize-none"
                />
                {errors.description && <span className="text-[10px] text-rose-600 font-semibold block">{errors.description.message}</span>}
              </div>

              {/* Attachment Upload */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Optional File Attachment (Screenshot or CSV Sample)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Max 10MB</span>
                </label>

                {!attachment ? (
                  <label className="border border-dashed border-slate-300 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition text-slate-600 text-xs">
                    <Paperclip size={14} className="text-blue-600" />
                    <span>Attach file (.csv, .png, .jpeg, .pdf)</span>
                    <input type="file" onChange={handleAttachmentChange} className="hidden" />
                  </label>
                ) : (
                  <div className="border border-slate-200 bg-slate-50 p-3 rounded-xl flex items-center justify-between text-xs text-slate-800">
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip size={14} className="text-blue-600 shrink-0" />
                      <span className="truncate font-semibold">{attachment.name}</span>
                      <span className="text-[10px] text-slate-500">({(attachment.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="text-slate-400 hover:text-rose-600 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Dispatching Ticket...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Submit Support Ticket
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* SLA & Guidelines Callout */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-3 shadow-sm">
            <ShieldAlert size={18} className="text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900">Enterprise SLA Guarantees</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Critical Severity 1 outages receive engineer response within 15 minutes. Standard tickets receive assignment within 4 hours.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-3 shadow-sm">
            <Clock size={18} className="text-indigo-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900">Support Operating Hours</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Standard Support: Mon - Fri, 9:00 AM - 6:00 PM EST. Emergency on-call SRE coverage active 24/7.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Support;
