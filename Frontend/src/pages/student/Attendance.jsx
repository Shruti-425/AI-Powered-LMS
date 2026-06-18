import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import AttendanceChart from "../../components/attendance/AttendanceChart";
import { getStudentAttendance } from "../../services/attendanceService";

function Attendance() {
  const [summary, setSummary] = useState({
    totalClasses: 0,
    presentCount: 0,
    attendancePercent: 0,
  });
  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAttendance = () => {
    setLoading(true);
    getStudentAttendance({
      ...(search ? { search } : {}),
      ...(filterDate ? { date: filterDate } : {}),
    })
      .then((data) => {
        setSummary(data.summary);
        setHistory(data.history);
        setChartData(data.chartData);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAttendance();
  }, [search, filterDate]);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-2">Attendance Report</h1>
      <p className="text-slate-500 mb-6">View your attendance percentage and history</p>

      {error && (
        <div className="mb-4 rounded bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-slate-500 text-sm">Attendance Percentage</p>
          <p className="text-4xl font-bold text-red-500 mt-2">{summary.attendancePercent}%</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-slate-500 text-sm">Classes Attended</p>
          <p className="text-4xl font-bold text-green-600 mt-2">{summary.presentCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-slate-500 text-sm">Total Classes</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">{summary.totalClasses}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6 grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Search by course</label>
          <input
            type="text"
            placeholder="e.g. DBMS"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Filter by date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Attendance Trend</h2>
        <AttendanceChart data={chartData} />
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Attendance History</h2>
        {loading ? (
          <p className="text-slate-500">Loading attendance...</p>
        ) : history.length === 0 ? (
          <p className="text-slate-500">No attendance records found.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-slate-500 text-sm border-b">
                <th className="py-2">Date</th>
                <th className="py-2">Course</th>
                <th className="py-2">Time</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.attendance_id} className="border-b border-slate-100">
                  <td className="py-3">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="py-3">
                    {item.course_code} · {item.course_name}
                  </td>
                  <td className="py-3">{item.time}</td>
                  <td
                    className={`py-3 capitalize font-medium ${
                      item.status === "present" || item.status === "late"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {item.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Attendance;
