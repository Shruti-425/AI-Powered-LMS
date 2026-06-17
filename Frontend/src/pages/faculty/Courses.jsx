import DashboardLayout from "../../components/layout/DashboardLayout";

function Courses() {
  const courses = [
    "Data Structures",
    "Cloud Computing",
    "DBMS"
  ];

  return (
    <DashboardLayout>

      <div className="flex justify-between mb-6">

        <h1 className="text-3xl font-bold">
          Courses
        </h1>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Course
        </button>

      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {courses.map((course, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow p-6"
          >
            <h2 className="font-semibold text-xl">
              {course}
            </h2>

            <p className="text-gray-500 mt-2">
              Students Enrolled: 45
            </p>
          </div>
        ))}

      </div>

    </DashboardLayout>
  );
}

export default Courses;