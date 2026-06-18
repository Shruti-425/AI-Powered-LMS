import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatsCard from "../../components/analytics/StatsCard";
import { getStudentDashboard } from "../../services/dashboardService";

const FALLBACK_STATS = {
  enrolledCourses: 0,
  assignments: 0,
  attendancePercent: 0,
  upcomingTests: 0,
  completedTests: 0,
  averageScore: 0,
};

function Dashboard() {
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recentQuizResults, setRecentQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudentDashboard()
      .then((data) => {
        setStats(data.stats);
        setRecentAssignments(data.recentAssignments || []);
        setUpcomingClasses(data.upcomingClasses || []);
        setRecentQuizResults(data.recentQuizResults || []);
      })
      .catch((err) => {
        setError(err.message);
        setStats(FALLBACK_STATS);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-2">Student Dashboard</h1>
      <p className="text-slate-500 mb-8">Your attendance, tests, and performance at a glance</p>

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
            <Link to="/student/courses">
              <StatsCard
                title="Enrolled Courses"
                value={stats.enrolledCourses}
                color="text-blue-600"
              />
            </Link>
            <Link to="/student/assignments">
              <StatsCard
                title="Assignments"
                value={stats.assignments}
                color="text-green-600"
              />
            </Link>
            <Link to="/student/quizzes">
              <StatsCard
                title="Upcoming Tests"
                value={stats.upcomingTests}
                color="text-yellow-500"
              />
            </Link>
            <Link to="/student/attendance">
              <StatsCard
                title="Attendance"
                value={`${stats.attendancePercent}%`}
                color="text-red-500"
              />
            </Link>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mt-6">
            <StatsCard
              title="Completed Tests"
              value={stats.completedTests}
              color="text-purple-600"
            />
            <StatsCard
              title="Average Score"
              value={stats.averageScore}
              color="text-orange-500"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Assignments</h2>
                <Link to="/student/assignments" className="text-sm text-blue-600 hover:underline">
                  View all
                </Link>
              </div>
              {recentAssignments.length === 0 ? (
                <p className="text-slate-500 text-sm">No assignments yet.</p>
              ) : (
                <ul className="space-y-3">
                  {recentAssignments.map((item) => (
                    <li key={`${item.title}-${item.due_date}`} className="border-b border-slate-100 pb-2">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-slate-500">
                        {item.course_code} · Due {new Date(item.due_date).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Upcoming Classes</h2>
              {upcomingClasses.length === 0 ? (
                <p className="text-slate-500 text-sm">No classes scheduled for today.</p>
              ) : (
                <ul className="space-y-3">
                  {upcomingClasses.map((item) => (
                    <li key={`${item.course_code}-${item.time}`} className="border-b border-slate-100 pb-2">
                      <p className="font-medium">{item.course_name}</p>
                      <p className="text-sm text-slate-500">
                        {item.time} · Room {item.room}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Test Results</h2>
                <Link to="/student/quizzes" className="text-sm text-blue-600 hover:underline">
                  Take a test
                </Link>
              </div>
              {recentQuizResults.length === 0 ? (
                <p className="text-slate-500 text-sm">No quiz results yet.</p>
              ) : (
                <ul className="space-y-3">
                  {recentQuizResults.map((item) => (
                    <li key={`${item.title}-${item.attempted_at}`} className="border-b border-slate-100 pb-2">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-green-600 font-semibold">
                        {item.marks} / {item.total_marks} marks
                      </p>
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
