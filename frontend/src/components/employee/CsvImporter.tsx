import { useState, useRef } from "react";
import {
  Upload,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  FileSpreadsheet,
  AlertTriangle,
  Database
} from "lucide-react";
import toast from "react-hot-toast";
import { EmployeeAPI } from "../../services/api";

interface CsvImporterProps {
  onSuccess: () => void;
}

interface PreviewState {
  valid: boolean;
  filename: string;
  total_rows: number;
  headers: string[];
  missing_required_columns: string[];
  rows_preview: Record<string, any>[];
  detected_encoding: string;
  detected_delimiter: string;
  error_message?: string | null;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const CsvImporter = ({ onSuccess }: CsvImporterProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [results, setResults] = useState<{
    success_count: number;
    error_count: number;
    errors: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processSelectedFile = async (selectedFile: File) => {
    // 1. Extension validation
    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      toast.error("Unsupported file format. Please select a .csv file.");
      setFile(null);
      setPreview(null);
      return;
    }

    // 2. File size validation
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      toast.error("File exceeds maximum upload size (10MB limit).");
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selectedFile);
    setResults(null);
    setPreviewLoading(true);

    try {
      const previewData = await EmployeeAPI.previewCsv(selectedFile);
      setPreview(previewData);
      if (!previewData.valid) {
        toast.error(previewData.error_message || "Invalid CSV structure detected.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to parse CSV preview.";
      setPreview({
        valid: false,
        filename: selectedFile.name,
        total_rows: 0,
        headers: [],
        missing_required_columns: [],
        rows_preview: [],
        detected_encoding: "unknown",
        detected_delimiter: "unknown",
        error_message: msg
      });
      toast.error(msg);
    } finally {
      setPreviewLoading(false);
    }
  };

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
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
  };

  const formatErrorMessage = (err: any): string => {
    if (!err) return "Failed to process CSV file.";
    if (err.code === "ECONNABORTED") {
      return "Upload request timed out while processing calculations. Please retry or try a smaller CSV batch.";
    }
    if (!err.response) {
      return "Unable to reach server. Please check your network connection or backend API status.";
    }
    const detail = err.response.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail.map((d: any) => (typeof d === "string" ? d : d.msg || JSON.stringify(d))).join(", ");
    }
    if (typeof detail === "object" && detail !== null) {
      return detail.message || JSON.stringify(detail);
    }
    return err.message || "Failed to process CSV file.";
  };

  const handleUpload = async () => {
    if (!file || !preview?.valid) return;
    setLoading(true);
    const toastId = toast.loading("Ingesting workforce CSV records & running predictive ML...");

    try {
      const res = await EmployeeAPI.uploadCsv(file);
      setResults(res);
      if (res.error_count === 0) {
        toast.success(`Successfully uploaded & processed ${res.success_count} employee profiles!`, { id: toastId });
      } else {
        toast(
          `Processed ${res.success_count} profiles. Encountered ${res.error_count} row discrepancies.`,
          { id: toastId, icon: "⚠️" }
        );
      }
      onSuccess();
    } catch (err: any) {
      const errorMsg = formatErrorMessage(err);
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
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
    <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Bulk Directory Ingestion</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload multi-record CSV files for automated batch prediction and workforce analytics.
            </p>
          </div>
        </div>
        <button
          onClick={downloadTemplate}
          className="text-xs text-blue-600 hover:text-blue-700 font-bold cursor-pointer border border-blue-200 hover:border-blue-300 rounded-xl px-4 py-2 bg-blue-50 hover:bg-blue-100/60 transition duration-200 flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <FileText size={14} />
          Download CSV Template
        </button>
      </div>

      {/* Upload Drag & Drop Area */}
      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition duration-300 ${
            dragActive
              ? "border-blue-500 bg-blue-50/60"
              : "border-slate-300 hover:border-blue-400 hover:bg-slate-50/80 bg-slate-50/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="hidden"
          />
          <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 mb-4 shadow-sm">
            <Upload size={24} />
          </div>
          <p className="text-sm font-bold text-slate-800">
            Drag and drop your workforce CSV here, or <span className="text-blue-600 underline">browse</span>
          </p>
          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-2">
            <span>Supports UTF-8 / Latin-1 CSV up to 10MB</span>
            <span>•</span>
            <span>Auto-detects delimiters (comma, semicolon, tab)</span>
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* File Card Header */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB • Encoding: {preview?.detected_encoding || "UTF-8"} • Delimiter: [{preview?.detected_delimiter || "Auto"}]
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {previewLoading ? (
                <div className="flex items-center gap-2 text-xs text-blue-700 font-bold px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <RefreshCw size={14} className="animate-spin" />
                  Validating CSV...
                </div>
              ) : preview?.valid && !results ? (
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {loading ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />}
                  {loading ? "Ingesting..." : "Upload & Analyze"}
                </button>
              ) : null}

              <button
                onClick={removeFile}
                disabled={loading}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition cursor-pointer"
                title="Remove File"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Validation Alert Status Banner */}
          {preview && !preview.valid && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-900 shadow-sm">
              <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-800">Validation Failure</h4>
                <p className="text-xs leading-relaxed font-semibold text-rose-900">
                  {preview.error_message || "Invalid CSV structure."}
                </p>
                {preview.missing_required_columns && preview.missing_required_columns.length > 0 && (
                  <p className="text-[11px] text-rose-700 mt-1">
                    Missing required fields: <b>{preview.missing_required_columns.join(", ")}</b>. Expected columns include: MonthlyIncome, Age, Department, JobRole.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* First 10 Rows Preview Table */}
          {preview?.valid && preview.rows_preview && preview.rows_preview.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Eye size={14} className="text-blue-600" />
                  CSV Data Preview (First {preview.rows_preview.length} of {preview.total_rows} Records)
                </div>
                <span className="text-[11px] px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={12} /> Structure Valid
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-64 bg-white shadow-sm">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-[11px] uppercase">#</th>
                      {preview.headers.map((h, i) => (
                        <th key={i} className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-[11px] uppercase font-bold text-slate-900">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                    {preview.rows_preview.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 transition">
                        <td className="py-2 px-3 border-r border-slate-200 text-slate-400 font-bold">{rIdx + 1}</td>
                        {preview.headers.map((h, cIdx) => (
                          <td key={cIdx} className="py-2 px-3 border-r border-slate-200 whitespace-nowrap text-slate-800">
                            {row[h] !== undefined && row[h] !== null ? String(row[h]) : "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Results Summary Card */}
      {results && (
        <div className="border border-slate-200 rounded-3xl p-5 space-y-4 bg-white shadow-sm">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            Ingestion Processing Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-600 font-semibold">Successfully Ingested</div>
                <div className="text-xl font-bold text-slate-900">{results.success_count} profiles</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
              <div className="text-rose-600">
                <AlertCircle size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-600 font-semibold">Failed Discrepancies</div>
                <div className="text-xl font-bold text-slate-900">{results.error_count} rows</div>
              </div>
            </div>
          </div>

          {/* Row error messages list */}
          {results.errors.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700">Ingestion Discrepancy Logs:</div>
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-2xl p-3 bg-slate-50 space-y-1 text-slate-800 font-mono text-[11px]">
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
