import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, FileText, Landmark, Cookie, ArrowLeft } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";

type PolicyTab = "terms" | "privacy" | "cookies";

const LegalPages = () => {
  const [activeTab, setActiveTab] = useState<PolicyTab>("privacy");

  const renderTabContent = () => {
    switch (activeTab) {
      case "terms":
        return (
          <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <FileText className="text-blue-500" size={20} />
              Terms of Service
            </h2>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Last Updated: July 31, 2026
            </p>

            <div className="space-y-4">
              <h3 className="text-md font-bold text-slate-200">1. Acceptance of Terms</h3>
              <p>
                By creating a system profile or accessing the AttriSense AI Decision Intelligence Engine, you agree to comply with and be bound by these Terms of Service. If you are entering into this agreement on behalf of an enterprise entity, you certify you have administrative power to bind the workspace client to these conditions.
              </p>

              <h3 className="text-md font-bold text-slate-200">2. Licensing and Permitted Usage</h3>
              <p>
                AttriSense AI grants the subscriber a non-exclusive, non-transferable right to access and execute predictive retention modeling on corporate employees. Users must not: reverse engineer classification models, scrape predicting indices, or input personal data without explicit organizational consent.
              </p>

              <h3 className="text-md font-bold text-slate-200">3. Predictive ML Accuracy Disclaimer</h3>
              <p>
                AttriSense AI generates risk percentages based on statistical correlations. Prediction indices are advisory tools and must not be used as the sole criteria for compensation decisions, layoffs, promotions, or direct employee terminations. All retention strategies should involve human oversight.
              </p>

              <h3 className="text-md font-bold text-slate-200">4. Service Level Agreement (SLA)</h3>
              <p>
                Standard subscriptions guarantee 99.9% platform availability. Maintenances are performed during off-peak hours, with announcements posted at least 48 hours in advance. Emergency hotfixes are excluded from downtime metrics.
              </p>
            </div>
          </div>
        );
      case "privacy":
        return (
          <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" size={20} />
              Privacy Policy
            </h2>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Last Updated: July 31, 2026
            </p>

            <div className="space-y-4">
              <h3 className="text-md font-bold text-slate-200">1. Data Processing and Collection</h3>
              <p>
                AttriSense AI processes standard employee profile fields (including Age, Job Level, Monthly Income, Overtime status, Distance from Home, and Job Satisfaction) to construct prediction watchlists. This data is exclusively uploaded by the organization and processed locally within isolated database containers.
              </p>

              <h3 className="text-md font-bold text-slate-200">2. Data Security Compliance</h3>
              <p>
                We maintain full compliance with SOC2 Type II, GDPR, and CCPA standards. Data is protected with end-to-end encryption in transit (HTTPS/TLS 1.3) and at rest (AES-256). JWT session structures expire after 30 minutes, and refresh tokens are restricted to verification processes.
              </p>

              <h3 className="text-md font-bold text-slate-200">3. Model Isolation</h3>
              <p>
                Organizations have dedicated datasets and machine learning weights. The Random Forest model trained on your directory data is isolated and never shared with other workspaces, ensuring zero data leakage between corporate domains.
              </p>

              <h3 className="text-md font-bold text-slate-200">4. Right to Deletion (GDPR)</h3>
              <p>
                Employees can request their records to be purged. HR managers can permanently delete profiles via the Directory panel, which initiates a cascade trigger removing all prediction history and associated SHAP explanations instantly.
              </p>
            </div>
          </div>
        );
      case "cookies":
        return (
          <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Cookie className="text-amber-500" size={20} />
              Cookie Policy
            </h2>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Last Updated: July 31, 2026
            </p>

            <div className="space-y-4">
              <h3 className="text-md font-bold text-slate-200">1. Strictly Necessary Cookies</h3>
              <p>
                These cookies are required for core security features. We use cryptographic local tokens and session identifier cookies to authenticate users, prevent Cross-Site Request Forgery (CSRF) tokens, and remember selected dark/light visual modes.
              </p>

              <h3 className="text-md font-bold text-slate-200">2. Functional and Performance Cookies</h3>
              <p>
                These cookies count page visits, monitor latencies, and track component errors. We use this data to identify API bottlenecks and optimize chart rendering speeds, never for third-party advertising tracking.
              </p>

              <h3 className="text-md font-bold text-slate-200">3. Cookie Configuration</h3>
              <p>
                Users can restrict cookies via browser privacy settings. However, doing so will invalidate authentication sessions, requiring a full password login on every page redirection.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-500 font-semibold text-sm uppercase tracking-wider mb-2">
              <Landmark size={16} />
              Compliance Center
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Legal & Policy Terms</h1>
            <p className="text-slate-400 mt-2">
              Review AttriSense AI compliance structures, SLA guarantees, data processing terms, and security standards.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 text-sm font-semibold transition"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </div>

        {/* Layout Tabs Grid */}
        <div className="grid md:grid-cols-4 gap-8 items-start">
          {/* Navigation Tabs */}
          <div className="md:col-span-1 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("privacy")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer text-left ${
                activeTab === "privacy"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-650/15"
                  : "bg-slate-900/50 border border-slate-800/80 text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldCheck size={18} />
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab("terms")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer text-left ${
                activeTab === "terms"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-650/15"
                  : "bg-slate-900/50 border border-slate-800/80 text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText size={18} />
              Terms of Service
            </button>
            <button
              onClick={() => setActiveTab("cookies")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer text-left ${
                activeTab === "cookies"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-650/15"
                  : "bg-slate-900/50 border border-slate-800/80 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cookie size={18} />
              Cookie Policy
            </button>
          </div>

          {/* Active Policy content */}
          <div className="md:col-span-3 bg-slate-900/40 border border-slate-800/80 p-8 rounded-3xl shadow-xl min-h-[400px]">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LegalPages;
