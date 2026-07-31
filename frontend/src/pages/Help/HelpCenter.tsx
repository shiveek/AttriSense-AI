import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, Shield, BrainCircuit, Activity, ArrowLeft, Search, BookOpen, MessageSquare } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Methodology",
      question: "How does the AI predict attrition risk?",
      answer: "AttriSense AI utilizes a Random Forest Classifier trained on 16 core employee metrics (such as compensation, department, tenure, satisfaction, and overtime). It calculates a probability score between 0% and 100% representing the likelihood of resignation. Scores >= 70% are categorized as High Risk, 35%-69% as Medium Risk, and < 35% as Low Risk."
    },
    {
      category: "SHAP Explainability",
      question: "What are SHAP values and how should I interpret them?",
      answer: "SHAP (SHapley Additive exPlanations) values measure the direct impact of each factor on an individual employee's prediction. A positive contribution value (red/warning indicators) increases the risk of attrition (e.g. working overtime or stagnation). A negative contribution value (green/stable indicators) decreases the risk (e.g. high job satisfaction or competitive monthly income). The sum of all contributions determines the final risk score deviation from the base rate."
    },
    {
      category: "Model Accuracy",
      question: "How accurate are these predictions?",
      answer: "The current production model has an accuracy of 89.2% and an ROC AUC score of 0.941, evaluated on test splits. It is trained to balance Precision (minimizing false alerts) and Recall (ensuring true flight-risks are not missed)."
    },
    {
      category: "Data Updates",
      question: "How often should we retrain the machine learning model?",
      answer: "We recommend retraining the model monthly or after significant workforce adjustments (like promotions or salary reviews). Admins can trigger retraining from the Settings panel, which runs in the background via Celery and dynamically updates the predictions cache."
    },
    {
      category: "Security & GDPR",
      question: "Is employee demographic data secure?",
      answer: "Yes. All data is processed using enterprise-grade encryption (TLS/HTTPS in transit, AES at rest). Access to employee details and predictions is strictly governed by Role-Based Access Controls (RBAC): only authorized HR managers and system admins can modify or view risk watchlists."
    }
  ];

  const filteredFaqs = faqs.filter(
    faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-500 font-semibold text-sm uppercase tracking-wider mb-2">
              <BookOpen size={16} />
              Knowledge Hub
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Help Center & FAQs</h1>
            <p className="text-slate-400 mt-2">
              Learn how AttriSense AI computes employee risk levels, explains predictions, and secures your workspace.
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

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <span className="absolute inset-y-0 left-4 flex items-center text-slate-500 pointer-events-none">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search help articles (e.g. SHAP, accuracy, GDPR)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
        </div>

        {/* Platform Core Pillars */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl space-y-3">
            <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
              <BrainCircuit size={20} />
            </div>
            <h3 className="text-md font-bold text-slate-200">ML Predictions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Random Forest analytics process features to extract predictive scores. Retrain modules to adjust to workforce updates.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl space-y-3">
            <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
              <Activity size={20} />
            </div>
            <h3 className="text-md font-bold text-slate-200">Explainable AI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              SHAP metrics highlight positive and negative factors driving attrition risk, allowing targeted local retention actions.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl space-y-3">
            <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
              <Shield size={20} />
            </div>
            <h3 className="text-md font-bold text-slate-200">Data Governance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Role-Based Access Control limits profile editing and report downloads to authorized HR Leaders and Administrators.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <HelpCircle size={20} className="text-blue-500" />
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div key={index} className="bg-slate-900/30 border border-slate-850 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-extrabold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md">
                      {faq.category}
                    </span>
                  </div>
                  <h3 className="text-md font-semibold text-slate-200">{faq.question}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{faq.answer}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl">
                <Search size={32} className="mx-auto text-slate-650 mb-3" />
                <p className="text-slate-500 text-sm">No help articles match your search criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-800/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg font-bold text-slate-250 flex items-center justify-center md:justify-start gap-2">
              <MessageSquare size={18} className="text-blue-400" />
              Still need assistance?
            </h3>
            <p className="text-sm text-slate-400 max-w-md">
              Get in touch with our Site Reliability or Product Engineering team for technical questions.
            </p>
          </div>
          <Link
            to="/support"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-sm font-semibold transition whitespace-nowrap shadow-lg shadow-blue-650/10"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default HelpCenter;
