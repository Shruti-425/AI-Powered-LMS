import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { createAssignment, getAssignments } from "../../services/assignmentService";
import { getCourses } from "../../services/quizService";

const fallbackCourses = [
  { course_id: 1, code: "CS301", course_name: "Data Structures & Algorithms" },
  { course_id: 2, code: "CS302", course_name: "Database Management Systems" },
  { course_id: 3, code: "CS401", course_name: "Cloud Computing" }
];

function Assignments() {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    course_id: "",
    title: "",
    description: "",
    due_date: "",
    max_marks: 100
  });

  const loadData = async () => {
    const [courseData, assignmentData] = await Promise.all([
      getCourses(),
      getAssignments()
    ]);
    setCourses(courseData);
    setAssignments(assignmentData);
    if (!form.course_id && courseData[0]) {
      setForm((current) => ({ ...current, course_id: courseData[0].course_id }));
    }
  };

  useEffect(() => {
    loadData()
      .catch((error) => {
        setMessage(`${error.message}. The form is still visible; start the backend to save to database.`);
        setCourses(fallbackCourses);
        setForm((current) => ({ ...current, course_id: current.course_id || fallbackCourses[0].course_id }));
      })
      .finally(() => setLoading(false));
  }, []);

  const submitForm = async (event) => {
    event.preventDefault();
    try {
      await createAssignment(form);
      setMessage("Assignment uploaded successfully.");
      setForm((current) => ({ ...current, title: "", description: "", due_date: "" }));
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Create Assignment</h1>

      {message && (
        <div className="mb-4 rounded bg-blue-50 px-4 py-3 text-blue-700">
          {message}
        </div>
      )}

      <form onSubmit={submitForm} className="bg-white rounded-xl shadow p-6 space-y-4 mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          <select
            className="border rounded px-3 py-2"
            value={form.course_id}
            onChange={(event) => setForm({ ...form, course_id: event.target.value })}
          >
            {courses.map((course) => (
              <option key={course.course_id} value={course.course_id}>
                {course.code} - {course.course_name}
              </option>
            ))}
          </select>

          <input
            className="border rounded px-3 py-2"
            placeholder="Assignment title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
          />
        </div>

        <textarea
          className="border rounded px-3 py-2 w-full"
          placeholder="Description"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border rounded px-3 py-2"
            type="datetime-local"
            value={form.due_date}
            onChange={(event) => setForm({ ...form, due_date: event.target.value })}
            required
          />
          <input
            className="border rounded px-3 py-2"
            type="number"
            min="1"
            value={form.max_marks}
            onChange={(event) => setForm({ ...form, max_marks: event.target.value })}
            required
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Upload Assignment
        </button>
      </form>

      <div className="space-y-4">
        {loading && (
          <div className="bg-white p-5 rounded-xl shadow text-gray-600">
            Loading saved assignments...
          </div>
        )}

        {!loading && assignments.length === 0 && (
          <div className="bg-white p-5 rounded-xl shadow text-gray-600">
            No uploaded assignments found yet.
          </div>
        )}

        {assignments.map((assignment) => (
          <div key={assignment.assignment_id} className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-semibold text-lg">{assignment.title}</h2>
            <p className="text-gray-500">
              {assignment.code} · Due: {new Date(assignment.due_date).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default Assignments;
