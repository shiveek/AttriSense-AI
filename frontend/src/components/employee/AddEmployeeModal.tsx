import { useState } from "react";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";
import type { EmployeeCreate } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (employee: EmployeeCreate) => void;
}

const AddEmployeeModal = ({ open, onClose, onAdd }: Props) => {
  const [step, setStep] = useState(1);
  const [employee, setEmployee] = useState<EmployeeCreate>({
    id: "",
    name: "",
    email: "",
    age: 30,
    gender: "Male",
    marital_status: "Single",
    distance_from_home: 5,
    department: "IT",
    job_role: "Software Engineer",
    job_level: 1,
    monthly_income: 4000,
    years_at_company: 2,
    years_in_current_role: 1,
    years_since_last_promotion: 0,
    performance_rating: 3,
    job_satisfaction: 3,
    work_life_balance: 3,
    training_hours: 20,
    overtime: "No",
    status: "Active"
  });

  if (!open) return null;

  const handleNext = () => {
    if (step === 1) {
      if (!employee.id || !employee.name || !employee.email) {
        alert("Please fill in ID, Name, and Email.");
        return;
      }
    }
    if (step === 2) {
      if (!employee.job_role) {
        alert("Please enter Job Role.");
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    onAdd(employee);
    // Reset state
    setEmployee({
      id: "",
      name: "",
      email: "",
      age: 30,
      gender: "Male",
      marital_status: "Single",
      distance_from_home: 5,
      department: "IT",
      job_role: "Software Engineer",
      job_level: 1,
      monthly_income: 4000,
      years_at_company: 2,
      years_in_current_role: 1,
      years_since_last_promotion: 0,
      performance_rating: 3,
      job_satisfaction: 3,
      work_life_balance: 3,
      training_hours: 20,
      overtime: "No",
      status: "Active"
    });
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add Employee Profile</h2>
            <p className="text-xs text-slate-400 mt-1">Step {step} of 3: {
              step === 1 ? "Personal Profile" : step === 2 ? "Job Role & Pay" : "Work Satisfaction & Performance"
            }</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* Form Fields */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Employee ID</label>
                <input
                  placeholder="e.g. EMP0120"
                  value={employee.id}
                  onChange={(e) => setEmployee({ ...employee, id: e.target.value })}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Full Name</label>
                <input
                  placeholder="e.g. Jane Doe"
                  value={employee.name}
                  onChange={(e) => setEmployee({ ...employee, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. jane.doe@company.com"
                  value={employee.email}
                  onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Age</label>
                  <input
                    type="number"
                    value={employee.age}
                    onChange={(e) => setEmployee({ ...employee, age: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Gender</label>
                  <select
                    value={employee.gender}
                    onChange={(e) => setEmployee({ ...employee, gender: e.target.value })}
                    className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                  >
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Marital Status</label>
                  <select
                    value={employee.marital_status}
                    onChange={(e) => setEmployee({ ...employee, marital_status: e.target.value })}
                    className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                  >
                    <option>Single</option>
                    <option>Married</option>
                    <option>Divorced</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Commute (km)</label>
                  <input
                    type="number"
                    value={employee.distance_from_home}
                    onChange={(e) => setEmployee({ ...employee, distance_from_home: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Department</label>
                <select
                  value={employee.department}
                  onChange={(e) => setEmployee({ ...employee, department: e.target.value })}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                >
                  <option>IT</option>
                  <option>HR</option>
                  <option>Sales</option>
                  <option>Finance</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Job Role</label>
                <input
                  placeholder="e.g. Software Engineer"
                  value={employee.job_role}
                  onChange={(e) => setEmployee({ ...employee, job_role: e.target.value })}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Job Level (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={employee.job_level}
                    onChange={(e) => setEmployee({ ...employee, job_level: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Monthly Salary ($)</label>
                  <input
                    type="number"
                    value={employee.monthly_income}
                    onChange={(e) => setEmployee({ ...employee, monthly_income: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Overtime Required</label>
                  <select
                    value={employee.overtime}
                    onChange={(e) => setEmployee({ ...employee, overtime: e.target.value })}
                    className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                  >
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Active Status</label>
                  <select
                    value={employee.status}
                    onChange={(e) => setEmployee({ ...employee, status: e.target.value })}
                    className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                  >
                    <option>Active</option>
                    <option>On Leave</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Years at Co.</label>
                  <input
                    type="number"
                    value={employee.years_at_company}
                    onChange={(e) => setEmployee({ ...employee, years_at_company: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Years in Role</label>
                  <input
                    type="number"
                    value={employee.years_in_current_role}
                    onChange={(e) => setEmployee({ ...employee, years_in_current_role: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Last Promo</label>
                  <input
                    type="number"
                    value={employee.years_since_last_promotion}
                    onChange={(e) => setEmployee({ ...employee, years_since_last_promotion: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Job Satisfaction (1-4)</label>
                  <select
                    value={employee.job_satisfaction}
                    onChange={(e) => setEmployee({ ...employee, job_satisfaction: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                  >
                    <option value={1}>1 - Low</option>
                    <option value={2}>2 - Medium</option>
                    <option value={3}>3 - High</option>
                    <option value={4}>4 - Outstanding</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Work Life Balance (1-4)</label>
                  <select
                    value={employee.work_life_balance}
                    onChange={(e) => setEmployee({ ...employee, work_life_balance: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                  >
                    <option value={1}>1 - Low</option>
                    <option value={2}>2 - Medium</option>
                    <option value={3}>3 - High</option>
                    <option value={4}>4 - Outstanding</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Performance (1-4)</label>
                  <select
                    value={employee.performance_rating}
                    onChange={(e) => setEmployee({ ...employee, performance_rating: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                  >
                    <option value={3}>3 - Excellent</option>
                    <option value={4}>4 - Outstanding</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Training (Hours)</label>
                  <input
                    type="number"
                    value={employee.training_hours}
                    onChange={(e) => setEmployee({ ...employee, training_hours: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-100 transition flex items-center gap-1 font-semibold text-xs"
            >
              <ChevronLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-slate-950 text-white rounded-2xl hover:bg-slate-800 transition flex items-center gap-1 font-semibold text-xs"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition flex items-center gap-1 font-semibold text-xs"
            >
              Add Employee <Check size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;