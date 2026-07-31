interface Props {
  search: string;
  setSearch: (value: string) => void;
  department: string;
  setDepartment: (value: string) => void;
  risk: string;
  setRisk: (value: string) => void;
}

const EmployeeToolbar = ({
  search,
  setSearch,
  department,
  setDepartment,
  risk,
  setRisk,
}: Props) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="grid md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2"
        />

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="All">All Departments</option>
          <option>IT</option>
          <option>HR</option>
          <option>Sales</option>
          <option>Finance</option>
        </select>

        <select
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="All">All Risk Levels</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>
    </div>
  );
};

export default EmployeeToolbar;