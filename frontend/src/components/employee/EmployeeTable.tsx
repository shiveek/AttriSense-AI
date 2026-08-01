import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, AlertCircle, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { Employee } from "../../types";

interface EmployeeTableProps {
  employees?: Employee[];
}

const getRiskColor = (risk?: string) => {
  switch (risk) {
    case "High":
      return "bg-rose-50 text-rose-700 border-rose-100";
    case "Medium":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "Low":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    default:
      return "bg-slate-50 text-slate-700 border-slate-100";
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case "Active":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "On Leave":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "Inactive":
    case "Terminated":
      return "bg-rose-50 text-rose-700 border-rose-100";
    default:
      return "bg-slate-50 text-slate-700 border-slate-100";
  }
};

const EmployeeTable = ({ employees = [] }: EmployeeTableProps) => {
  const navigate = useNavigate();

  // Defensive array fallback
  const safeEmployees = Array.isArray(employees) ? employees : [];

  // Sorting State
  const [sortField, setSortField] = useState<keyof Employee>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(150);

  // Sorting logic
  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const sortedEmployees = useMemo(() => {
    const sorted = [...safeEmployees];
    if (!sortField) return sorted;

    sorted.sort((a, b) => {
      const valA = a ? a[sortField] : "";
      const valB = b ? b[sortField] : "";

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return sortOrder === "asc" ? -1 : 1;
      if (strA > strB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [safeEmployees, sortField, sortOrder]);

  // Pagination logic
  const totalItems = sortedEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedEmployees.slice(start, start + rowsPerPage);
  }, [sortedEmployees, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const SortIcon = ({ field }: { field: keyof Employee }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp size={14} className="inline ml-1 text-slate-700" />
    ) : (
      <ChevronDown size={14} className="inline ml-1 text-slate-700" />
    );
  };

  if (safeEmployees.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
          <AlertCircle size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            No Employees Found
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            No workforce records found matching search query or filters. Upload a CSV or add an employee to populate directory.
          </p>
        </div>
      </div>
    );
  }

  // Calculate showing index
  const startIdx = (currentPage - 1) * rowsPerPage + 1;
  const endIdx = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider select-none">
              <th
                onClick={() => handleSort("id")}
                className="text-left p-4 pl-6 font-semibold cursor-pointer hover:bg-slate-100 transition"
              >
                Employee ID <SortIcon field="id" />
              </th>
              <th
                onClick={() => handleSort("name")}
                className="text-left p-4 font-semibold cursor-pointer hover:bg-slate-100 transition"
              >
                Name <SortIcon field="name" />
              </th>
              <th
                onClick={() => handleSort("department")}
                className="text-left p-4 font-semibold cursor-pointer hover:bg-slate-100 transition"
              >
                Department <SortIcon field="department" />
              </th>
              <th
                onClick={() => handleSort("job_role")}
                className="text-left p-4 font-semibold cursor-pointer hover:bg-slate-100 transition"
              >
                Role <SortIcon field="job_role" />
              </th>
              <th
                onClick={() => handleSort("risk_score")}
                className="text-left p-4 font-semibold cursor-pointer hover:bg-slate-100 transition"
              >
                Attrition Risk <SortIcon field="risk_score" />
              </th>
              <th
                onClick={() => handleSort("status")}
                className="text-left p-4 font-semibold cursor-pointer hover:bg-slate-100 transition"
              >
                Status <SortIcon field="status" />
              </th>
              <th className="text-center p-4 pr-6 font-semibold">Details</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedEmployees.map((employee, idx) => {
              const empId = employee?.id || `EMP-${idx}`;
              const empName = employee?.name || "Unnamed Employee";
              const empDept = employee?.department || "General";
              const empRole = employee?.job_role || "Staff";
              const empRiskScore = typeof employee?.risk_score === "number" ? Math.round(employee.risk_score) : 0;
              const empRiskLevel = employee?.risk_level || "Low";
              const empStatus = employee?.status || "Active";

              return (
                <tr
                  key={empId}
                  className="hover:bg-slate-50/70 transition duration-150"
                >
                  <td className="p-4 pl-6 font-semibold text-slate-900 font-mono text-xs">
                    {empId}
                  </td>

                  <td className="p-4 font-bold text-slate-900">
                    {empName}
                  </td>

                  <td className="p-4 text-slate-600">
                    {empDept}
                  </td>

                  <td className="p-4 text-slate-600">
                    {empRole}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskColor(empRiskLevel)}`}
                    >
                      {empRiskScore}% {empRiskLevel}
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(empStatus)}`}
                    >
                      {empStatus}
                    </span>
                  </td>

                  <td className="p-4 pr-6 text-center">
                    <button
                      onClick={() => navigate(`/employees/${empId}`)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                      title="Inspect Employee Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 font-medium">
        <div>
          Showing <span className="font-bold text-slate-900">{totalItems > 0 ? startIdx : 0}</span> to{" "}
          <span className="font-bold text-slate-900">{endIdx}</span> of{" "}
          <span className="font-bold text-slate-900">{totalItems}</span> employee profiles
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold text-slate-900 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTable;