import { useState, useRef } from "react";
import { Upload, X, FileText, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import { EmployeeAPI } from "../../services/api";

interface CsvImporterProps {
  onSuccess: () => void;
}

const CsvImporter = ({ onSuccess }: CsvImporterProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    success_count: number;
    error_count: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile);
        setResults(null);
      } else {
        toast.error("Only CSV files are supported.");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile);
        setResults(null);
      } else {
        toast.error("Only CSV files are supported.");
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
    setResults(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const toastId = toast.loading("Ingesting CSV records and calculating risk metrics...");
    try {
      const res = await EmployeeAPI.uploadCsv(file);
      setResults(res);
      if (res.error_count === 0) {
        toast.success(`Successfully uploaded ${res.success_count} employees!`, { id: toastId });
      } else {
        toast(
          `Imported ${res.success_count} profiles. Encountered ${res.error_count} validation failures.`,
          { id: toastId, icon: "⚠️" }
        );
      }
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Failed to process CSV file.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Standard template CSV matching training fields
    const headers = [
      "EmployeeID", "Name", "Email", "Age", "Gender", "MaritalStatus", "DistanceFromHome",
      "Department", "JobRole", "JobLevel", "MonthlyIncome", "YearsAtCompany", "YearsInCurrentRole",
      "YearsSinceLastPromotion", "PerformanceRating", "JobSatisfaction", "WorkLifeBalance",
      "TrainingHours", "Overtime", "Status", "Location", "ManagerName"
    ].join(",");
    
    const sampleRow = [
      "EMP9999", "Sarah Connor", "sconnor@cyberdyne.com", "32", "Female", "Single", "12",
      "IT", "Software Engineer", "2", "6400", "4", "2",
      "1", "3", "3", "3",
      "32", "No", "Active", "Remote", "John Doe"
    ].join(",");

    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + sampleRow;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attrisense_employee_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Bulk Ingestion</h2>
          <p className="text-xs text-slate-400 mt-1">
            Import multiple employee records via a structured spreadsheet file.
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="text-xs text-blue-600 hover:text-blue-500 font-semibold cursor-pointer border border-blue-100 rounded-xl px-4 py-2 hover:bg-blue-50/30 transition duration-200"
        >
          Download CSV Template
        </button>
      </div>

      {/* Drag & Drop Area */}
      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition duration-300 ${
            dragActive
              ? "border-blue-500 bg-blue-50/20"
              : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="hidden"
          />
          <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
            <Upload size={20} />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Drag and drop your spreadsheet here
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Accepts standard formatted CSV file up to 10MB.
          </p>
        </div>
      ) : (
        <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-500">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                {file.name}
              </p>
              <p className="text-xs text-slate-400">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!results && (
              <button
                onClick={handleUpload}
                disabled={loading}
                className="px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                {loading && <RefreshCw size={12} className="animate-spin" />}
                {loading ? "Ingesting..." : "Upload & Analyze"}
              </button>
            )}
            <button
              onClick={removeFile}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Upload Results Summary */}
      {results && (
        <div className="border border-slate-100 rounded-3xl p-5 space-y-4 bg-white shadow-inner">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Processing Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50/30 border border-emerald-100/30">
              <div className="text-emerald-500">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Successfully Imported</div>
                <div className="text-lg font-bold text-slate-800">{results.success_count} profiles</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-50/30 border border-rose-100/30">
              <div className="text-rose-500">
                <AlertCircle size={18} />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Failed Records</div>
                <div className="text-lg font-bold text-slate-800">{results.error_count} rows</div>
              </div>
            </div>
          </div>

          {/* Row error messages if any */}
          {results.errors.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500">Ingestion Discrepancy Logs:</div>
              <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-2xl p-3 bg-slate-50/50 space-y-1 text-slate-600 font-mono text-[10px]">
                {results.errors.map((err, idx) => (
                  <div key={idx} className="flex gap-2 text-rose-600">
                    <span>•</span>
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CsvImporter;
