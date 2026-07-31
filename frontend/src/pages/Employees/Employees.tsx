import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import MainLayout from "../../components/layout/MainLayout";
import EmployeeToolbar from "../../components/employee/EmployeeToolbar";
import EmployeeTable from "../../components/employee/EmployeeTable";
import AddEmployeeModal from "../../components/employee/AddEmployeeModal";
import CsvImporter from "../../components/employee/CsvImporter";
import { EmployeeAPI } from "../../services/api";
import type { Employee, EmployeeCreate } from "../../types";

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering states
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [risk, setRisk] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showImporter, setShowImporter] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await EmployeeAPI.getEmployees(
        search,
        department,
        risk,
        undefined, // All statuses
        0,
        150
      );
      setEmployees(data.employees);
    } catch (error) {
      console.error("Failed to load employees list", error);
      toast.error("Failed to sync employee records.");
    } finally {
      setLoading(false);
    }
  };

  // Re-run search/filters query
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEmployees();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, department, risk]);

  const handleAddEmployee = async (newEmployee: EmployeeCreate) => {
    try {
      toast.loading("Analyzing profile risk parameters...", { id: "add_emp" });
      const added = await EmployeeAPI.createEmployee(newEmployee);
      setEmployees((prev) => [added, ...prev]);
      toast.success(`Successfully added ${added.name}. AI Risk Score: ${added.risk_score}%`, { id: "add_emp" });
    } catch (error) {
      console.error("Failed to add employee", error);
      toast.error("Failed to create employee profile.", { id: "add_emp" });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Employee Directory
            </h1>
            <p className="text-slate-500 mt-2">
              Manage workforce records and inspect individual machine learning risk explanations.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <button
              onClick={() => setShowImporter(!showImporter)}
              className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-semibold hover:bg-slate-50 hover:text-slate-900 transition text-sm cursor-pointer shadow-sm hover:shadow"
            >
              {showImporter ? "Close Bulk Ingest" : "Bulk Upload CSV"}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-950 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-slate-800 transition shadow-md hover:shadow-lg text-sm cursor-pointer"
            >
              + Add Employee
            </button>
          </div>
        </div>

        {/* Collapsible bulk importer card */}
        {showImporter && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <CsvImporter onSuccess={fetchEmployees} />
          </div>
        )}

        {/* Filters */}
        <EmployeeToolbar
          search={search}
          setSearch={setSearch}
          department={department}
          setDepartment={setDepartment}
          risk={risk}
          setRisk={setRisk}
        />

        {/* Directory Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 min-h-[300px] space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
            <p className="text-slate-400 text-xs">Querying workforce registry...</p>
          </div>
        ) : (
          <EmployeeTable employees={employees} />
        )}

        {/* Modal Entry */}
        <AddEmployeeModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddEmployee}
        />
      </div>
    </MainLayout>
  );
};

export default Employees;