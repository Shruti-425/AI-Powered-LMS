import DashboardLayout from "../../components/layout/DashboardLayout";
import StatsCard from "../../components/analytics/StatsCard";

function Dashboard() {
  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-6">
        Faculty Dashboard
      </h1>

      <div className="grid md:grid-cols-4 gap-6">

        <StatsCard
          title="Courses"
          value="6"
          color="text-blue-600"
        />

        <StatsCard
          title="Students"
          value="245"
          color="text-green-600"
        />

        <StatsCard
          title="Assignments"
          value="18"
          color="text-orange-600"
        />

        <StatsCard
          title="Quizzes"
          value="12"
          color="text-red-600"
        />

      </div>

    </DashboardLayout>
  );
}

export default Dashboard;