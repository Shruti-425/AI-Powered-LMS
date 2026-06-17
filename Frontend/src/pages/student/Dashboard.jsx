import DashboardLayout from "../../components/layout/DashboardLayout";

function Dashboard() {
  return (
    <DashboardLayout>

      <h1 className="text-4xl font-bold mb-8">
        Student Dashboard
      </h1>

      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Enrolled Courses
          </h2>

          <p className="text-4xl font-bold text-blue-600 mt-3">
            5
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Assignments
          </h2>

          <p className="text-4xl font-bold text-green-600 mt-3">
            12
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Quizzes
          </h2>

          <p className="text-4xl font-bold text-yellow-500 mt-3">
            8
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Attendance
          </h2>

          <p className="text-4xl font-bold text-red-500 mt-3">
            92%
          </p>
        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-semibold mb-4">
            Recent Assignments
          </h2>

          <ul className="space-y-3">
            <li>Database Project</li>
            <li>OS Assignment</li>
            <li>Cloud Computing Quiz</li>
          </ul>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-semibold mb-4">
            Upcoming Classes
          </h2>

          <ul className="space-y-3">
            <li>DSA - 10:00 AM</li>
            <li>DBMS - 12:00 PM</li>
            <li>Cloud Computing - 2:00 PM</li>
          </ul>

        </div>

      </div>

    </DashboardLayout>
  );
}

export default Dashboard;