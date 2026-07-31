import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, BrainCircuit, LineChart, FileSpreadsheet, Activity, HelpCircle, ArrowRight, BookOpen, Lock, ShieldAlert, Cpu } from "lucide-react";

const Landing = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const features = [
    {
      icon: <BrainCircuit className="text-blue-400" size={24} />,
      title: "Predictive Attrition Risk Classification",
      description: "Utilizes advanced Random Forest ensemble modeling to calculate individual flight probabilities from employee attributes."
    },
    {
      icon: <Activity className="text-indigo-400" size={24} />,
      title: "Explainable AI (SHAP Contributions)",
      description: "Maps feature deviations to clarify exactly why an employee is flagged, giving HR actionable pointers for retention."
    },
    {
      icon: <FileSpreadsheet className="text-emerald-400" size={24} />,
      title: "Bulk CSV Workforce Ingestion",
      description: "Ingests large employee directories, executing real-time classifications in bulk to update watchlists instantly."
    },
    {
      icon: <LineChart className="text-pink-400" size={24} />,
      title: "Executive PDF & Excel Reporting",
      description: "Compiles formatted spreadsheets and executive risk summary reports for stakeholder meetings."
    }
  ];

  const stats = [
    { value: "89.2%", label: "Model Accuracy" },
    { value: "0.941", label: "ROC AUC Score" },
    { value: "16+", label: "Retention Indicators" },
    { value: "4-Hr", label: "SLA Support Response" }
  ];

  const landingFaqs = [
    {
      q: "What variables drive the attrition predictions?",
      a: "Predictions are computed across 16 demographics and engagement variables including overtime, income, promotion tenure, distance from home, training hours, and job satisfaction."
    },
    {
      q: "Does my data retrain models of other tenants?",
      a: "No. AttriSense AI implements absolute database and dataset isolation, guaranteeing that your training weights are private to your workspace environment."
    },
    {
      q: "Can standard employees see their own predictions?",
      a: "Access is strictly governed by RBAC. Employees (User role) cannot access dashboards or watchlist reports; predictions are only accessible to Analysts, HR Managers, and Admins."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden relative">
      {/* Background soft ambient glows */}
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-[50%] right-[10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="relative max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900/80 z-20">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <Shield size={18} className="text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            AttriSense AI
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
          <a href="#features" className="hover:text-slate-100 transition">Features</a>
          <a href="#stats" className="hover:text-slate-100 transition">Metrics</a>
          <a href="#faq" className="hover:text-slate-100 transition">FAQ</a>
          <Link to="/help" className="flex items-center gap-1.5 hover:text-slate-100 transition">
            <BookOpen size={14} />
            Help Center
          </Link>
        </nav>
        <div>
          <Link to="/login">
            <button className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 rounded-xl text-slate-200 text-sm font-bold transition flex items-center gap-2">
              <Lock size={14} className="text-blue-400" />
              Sign In
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider"
        >
          <Cpu size={14} />
          Decision Intelligence Engine
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto"
        >
          Predict and Explain{" "}
          <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Employee Attrition
          </span>{" "}
          Risk
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
        >
          Transform raw employee directories into decision intelligence watchlists. Identify flight probabilities and clarify exact driver factors using explainable SHAP metrics.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link to="/login" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-xl shadow-blue-600/15 cursor-pointer">
              Launch Dashboard
              <ArrowRight size={18} />
            </button>
          </Link>
          <Link to="/help" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer">
              <BookOpen size={18} />
              Read Documentation
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-900/60 scroll-mt-6">
        <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl font-extrabold text-slate-100">Designed for Enterprise HR Teams</h2>
          <p className="text-slate-400 text-sm">
            Everything your people analytics, operations, and retention desks require to prevent unwanted turnovers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="bg-slate-900/30 border border-slate-900 hover:border-slate-800/80 p-8 rounded-3xl space-y-4 transition duration-200"
            >
              <div className="h-12 w-12 rounded-2xl bg-slate-950 flex items-center justify-center shadow-md">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-200">{feat.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Board */}
      <section id="stats" className="bg-slate-900/35 border-y border-slate-900/80 py-16 scroll-mt-6">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-4xl md:text-5xl font-black text-blue-500 tracking-tight">{stat.value}</div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-24 scroll-mt-6">
        <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl font-extrabold text-slate-100">Common Questions</h2>
          <p className="text-slate-400 text-sm">
            Find immediate answers regarding data security, explainable predictions, and tenant configuration.
          </p>
        </div>

        <div className="space-y-4">
          {landingFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-slate-900/30 border border-slate-900/80 rounded-2xl overflow-hidden transition"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-900/20 transition cursor-pointer"
              >
                <span className="font-semibold text-slate-200 text-sm md:text-base">{faq.q}</span>
                <HelpCircle size={18} className={`text-blue-500 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed border-t border-slate-900/60 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SLA & Security Footer Callout */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="bg-gradient-to-r from-blue-950/20 to-indigo-950/20 border border-blue-900/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
              <ShieldAlert size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-200">ISO-27001 & SOC2 Compliant</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                AttriSense AI enforces strict TLS 1.3 encryption, parameter sanitization, and automatic audit logging. Safe-guarding employee confidentiality is our fundamental mission.
              </p>
            </div>
          </div>
          <Link to="/legal" className="px-5 py-3 bg-slate-900 hover:bg-slate-850 text-slate-350 text-xs font-bold rounded-xl transition border border-slate-800 hover:border-slate-700 whitespace-nowrap">
            Read Security Policy
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900/80 py-12 relative z-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
              <Shield size={12} />
            </div>
            <span className="font-extrabold text-sm text-slate-200 tracking-tight">AttriSense AI</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
            <Link to="/legal" className="hover:text-slate-300 transition">Privacy Policy</Link>
            <Link to="/legal" className="hover:text-slate-300 transition">Terms of Service</Link>
            <Link to="/legal" className="hover:text-slate-300 transition">Cookie Settings</Link>
            <Link to="/support" className="hover:text-slate-300 transition">Support Contact</Link>
          </div>
          <div className="text-xs text-slate-650 font-medium">
            &copy; {new Date().getFullYear()} AttriSense AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;