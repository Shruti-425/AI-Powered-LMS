import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAdminReports } from "../../services/adminService";

function Reports() {
  const [data, setData] = useState({
    enrollmentByCourse: [],
    quizPerformance: [],
    attendanceSummary: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminReports()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-2">Reports</h1>
      <p className="text-slate-500 mb-6">Enrollment, quiz performance, and attendance summaries</p>

      {error && (
        <div className="mb-4 rounded bg-red-50 px-4 py-3 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="text-gray-500">Loading reports...</div>
      ) : (
        <div className="space-y-8">
          <section className="bg-white rounded-xl shadow overflow-x-auto">
            <h2 className="text-lg font-semibold p-6 pb-0">Enrollment by Course</h2>
            <table className="w-full text-sm mt-4">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Students</th>
                </tr>
              </thead>
              <tbody>
                {data.enrollmentByCourse.map((row) => (
                  <tr key={row.code} className="border-t">
                    <td className="p-4 font-medium">{row.code}</td>
                    <td className="p-4">{row.course_name}</td>
                    <td className="p-4">{row.student_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="bg-white rounded-xl shadow overflow-x-auto">
            <h2 className="text-lg font-semibold p-6 pb-0">Quiz Performance</h2>
            <table className="w-full text-sm mt-4">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Attempts</th>
                  <th className="p-4">Avg Marks</th>
                </tr>
              </thead>
              <tbody>
                {data.quizPerformance.map((row) => (
                  <tr key={row.code} className="border-t">
                    <td className="p-4 font-medium">{row.code}</td>
                    <td className="p-4">{row.course_name}</td>
                    <td className="p-4">{row.attempts}</td>
                    <td className="p-4">{row.average_marks ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="bg-white rounded-xl shadow overflow-x-auto">
            <h2 className="text-lg font-semibold p-6 pb-0">Attendance Summary</h2>
            <table className="w-full text-sm mt-4">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Records</th>
                  <th className="p-4">Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.attendanceSummary.map((row) => (
                  <tr key={row.code} className="border-t">
                    <td className="p-4 font-medium">{row.code}</td>
                    <td className="p-4">{row.course_name}</td>
                    <td className="p-4">{row.records}</td>
                    <td className="p-4">{row.attendance_rate ?? "—"}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Reports;
