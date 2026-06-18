import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatsCard from "../../components/analytics/StatsCard";
import { getTeacherDashboard } from "../../services/dashboardService";

const FALLBACK_STATS = {
  totalStudents: 0,
  todayAttendance: 0,
  totalTests: 0,
  averageScore: 0,
};

function Dashboard() {
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTeacherDashboard()
      .then((data) => {
        setStats(data.stats);
        setRecentActivities(data.recentActivities || []);
      })
      .catch((err) => {
        setError(err.message);
        setStats(FALLBACK_STATS);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
      <p className="text-slate-500 mb-6">Overview of your classes, tests, and student performance</p>

      {error && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-sm">
          {error}. Showing empty stats until the backend and database are connected.
        </div>
      )}

      {loading ? (
        <div className="text-slate-500">Loading dashboard...</div>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-6">
            <StatsCard title="Total Students" value={stats.totalStudents} color="text-green-600" />
            <StatsCard
              title="Today's Attendance"
              value={`${stats.todayAttendance}%`}
              color="text-blue-600"
            />
            <StatsCard title="Total Tests Created" value={stats.totalTests} color="text-red-600" />
            <StatsCard
              title="Average Student Score"
              value={stats.averageScore}
              color="text-orange-600"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/faculty/attendance"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Mark Attendance
                </Link>
                <Link
                  to="/faculty/quizzes"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Create MCQ Test
                </Link>
                <Link
                  to="/faculty/quizzes"
                  className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Manage Tests
                </Link>
                <Link
                  to="/faculty/assignments"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Manage Assignments
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
              {recentActivities.length === 0 ? (
                <p className="text-slate-500 text-sm">No recent quiz submissions yet.</p>
              ) : (
                <ul className="space-y-3">
                  {recentActivities.map((item, index) => (
                    <li
                      key={`${item.activity_title}-${item.activity_date}-${index}`}
                      className="flex justify-between items-start border-b border-slate-100 pb-2"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{item.student_name}</p>
                        <p className="text-sm text-slate-500">{item.activity_title}</p>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        {item.marks} marks
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default Dashboard;
