import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, AlertCircle, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { Employee } from "../../types";

interface EmployeeTableProps {
  employees: Employee[];
}

const getRiskColor = (risk: string) => {
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

const getStatusColor = (status: string) => {
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

const EmployeeTable = ({ employees }: EmployeeTableProps) => {
  const navigate = useNavigate();

  // Sorting State
  const [sortField, setSortField] = useState<keyof Employee>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(150);

  // Sorting logic
  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset page on sort
  };

  const sortedEmployees = useMemo(() => {
    const sorted = [...employees];
    if (!sortField) return sorted;

    sorted.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA === undefined || valB === undefined) return 0;

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
  }, [employees, sortField, sortOrder]);

  // Pagination logic
  const totalItems = sortedEmployees.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  
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
      <ChevronUp size={14} className="inline ml-1 text-slate-800" />
    ) : (
      <ChevronDown size={14} className="inline ml-1 text-slate-800" />
    );
  };

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
          <AlertCircle size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            No Employees Found
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Try adjusting your search query or filters.
          </p>
        </div>
      </div>
    );
  }

  // Calculate showing index
  const startIdx = (currentPage - 1) * rowsPerPage + 1;
  const endIdx = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs uppercase font-bold tracking-wider select-none">
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

          <tbody className="divide-y divide-slate-50">
            {paginatedEmployees.map((employee) => (
              <tr
                key={employee.id}
                className="hover:bg-slate-50/50 transition duration-150"
              >
                <td className="p-4 pl-6 font-semibold text-slate-900">
                  {employee.id}
                </td>

                <td className="p-4 font-medium text-slate-800">
                  {employee.name}
                </td>

                <td className="p-4 text-slate-500">
                  {employee.department}
                </td>

                <td className="p-4 text-slate-500">
                  {employee.job_role}
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(
                      employee.risk_level
                    )}`}
                  >
                    {employee.risk_score.toFixed(1)}% ({employee.risk_level})
                  </span>
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      employee.status
                    )}`}
                  >
                    {employee.status}
                  </span>
                </td>

                <td className="p-4 text-center pr-6">
                  <button
                    onClick={() => navigate(`/employees/${employee.id}`)}
                    className="h-8 w-8 rounded-lg border border-slate-100 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition self-center mx-auto cursor-pointer"
                  >
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-slate-700 font-bold">{startIdx}</span> to{" "}
          <span className="text-slate-700 font-bold">{endIdx}</span> of{" "}
          <span className="text-slate-700 font-bold">{totalItems}</span> employees
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg text-xs p-1 text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={150}>150 (All)</option>
              <option value={200}>200</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-slate-500 font-semibold select-none">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTable;