import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatsCard from "../../components/analytics/StatsCard";
import { getAdminAnalytics } from "../../services/adminService";

function Analytics() {
  const [data, setData] = useState({
    enrollmentChart: [],
    roleDistribution: { students: 0, faculty: 0, admins: 0 },
    quizTrend: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminAnalytics()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const { roleDistribution } = data;

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
      <p className="text-slate-500 mb-6">Visual insights across enrollment and quiz activity</p>

      {error && (
        <div className="mb-4 rounded bg-red-50 px-4 py-3 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="text-gray-500">Loading analytics...</div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <StatsCard title="Students" value={roleDistribution.students} color="text-blue-600" />
            <StatsCard title="Faculty" value={roleDistribution.faculty} color="text-green-600" />
            <StatsCard title="Admins" value={roleDistribution.admins} color="text-purple-600" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Students per Course</h2>
              {data.enrollmentChart.length === 0 ? (
                <p className="text-gray-500 text-sm">No enrollment data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.enrollmentChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="students" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Quiz Submissions Over Time</h2>
              {data.quizTrend.length === 0 ? (
                <p className="text-gray-500 text-sm">No quiz submission data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={data.quizTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis yAxisId="left" allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="submissions" fill="#16a34a" name="Submissions" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="average_score"
                      stroke="#f97316"
                      strokeWidth={2}
                      name="Avg Score"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default Analytics;
