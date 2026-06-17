import DashboardLayout from "../../components/layout/DashboardLayout";
import StatsCard from "../../components/analytics/StatsCard";

function Dashboard() {
  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-6">
        Super Admin Dashboard
      </h1>

      <div className="grid md:grid-cols-4 gap-6">

        <StatsCard
          title="Students"
          value="1250"
          color="text-blue-600"
        />

        <StatsCard
          title="Faculty"
          value="120"
          color="text-green-600"
        />

        <StatsCard
          title="Courses"
          value="75"
          color="text-orange-600"
        />

        <StatsCard
          title="Revenue"
          value="$50K"
          color="text-purple-600"
        />

      </div>

    </DashboardLayout>
  );
}

export default Dashboard;