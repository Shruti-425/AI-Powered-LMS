import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatsCard from "../../components/analytics/StatsCard";
import { getAdminDashboard } from "../../services/adminService";

const FALLBACK_STATS = {
  totalStudents: 0,
  totalFaculty: 0,
  totalCourses: 0,
  totalEnrollments: 0,
  quizSubmissions: 0,
  averageQuizScore: 0,
};

function Dashboard() {
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminDashboard()
      .then((data) => {
        setStats(data.stats);
        setRecentEnrollments(data.recentEnrollments || []);
      })
      .catch((err) => {
        setError(err.message);
        setStats(FALLBACK_STATS);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
      <p className="text-slate-500 mb-6">System-wide overview of users, courses, and activity</p>

      {error && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-sm">
          {error}. Showing empty stats until the backend is connected.
        </div>
      )}

      {loading ? (
        <div className="text-slate-500">Loading dashboard...</div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatsCard title="Students" value={stats.totalStudents} color="text-blue-600" />
            <StatsCard title="Faculty" value={stats.totalFaculty} color="text-green-600" />
            <StatsCard title="Courses" value={stats.totalCourses} color="text-orange-600" />
            <StatsCard title="Enrollments" value={stats.totalEnrollments} color="text-purple-600" />
            <StatsCard title="Quiz Submissions" value={stats.quizSubmissions} color="text-red-600" />
            <StatsCard title="Avg Quiz Score" value={stats.averageQuizScore} color="text-indigo-600" />
          </div>

          <div className="bg-white rounded-xl shadow p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Enrollments</h2>
            {recentEnrollments.length === 0 ? (
              <p className="text-gray-500 text-sm">No enrollments yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">Student</th>
                      <th className="pb-2">Course</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEnrollments.map((row, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-3">{row.student_name}</td>
                        <td className="py-3">{row.code} — {row.course_name}</td>
                        <td className="py-3">{row.enrolled_date?.slice?.(0, 10) || row.enrolled_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default Dashboard;
