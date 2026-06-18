import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentCourses } from "../../services/dashboardService";

function CourseList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudentCourses()
      .then(setCourses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading your courses...</div>;
  }

  if (error) {
    return <div className="rounded bg-red-50 px-4 py-3 text-red-700 text-sm">{error}</div>;
  }

  if (courses.length === 0) {
    return <div className="text-gray-500">You are not enrolled in any courses yet.</div>;
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div
          key={course.course_id}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
        >
          <h2 className="text-xl font-bold text-gray-800">{course.course_name}</h2>
          <p className="text-gray-500 mt-2">Instructor: {course.instructor_name}</p>
          <p className="text-sm text-gray-400 mt-1">{course.code}</p>

          <div className="mt-4">
            <div className="bg-gray-200 h-3 rounded">
              <div
                className="bg-blue-600 h-3 rounded"
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm">Quiz progress: {course.progress}%</p>
          </div>

          <button
            onClick={() => navigate("/student/assignments")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Open Course
          </button>
        </div>
      ))}
    </div>
  );
}

export default CourseList;
