import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { createAssignment, getAssignments } from "../../services/assignmentService";
import { getCourses } from "../../services/quizService";

function Assignments() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    course_id: "",
    title: "",
    description: "",
    due_date: "",
    max_marks: 100,
  });

  const loadData = async () => {
    const instructorId = user?.user_id;
    const [courseData, assignmentData] = await Promise.all([
      getCourses(instructorId ? { instructorId } : {}),
      getAssignments(),
    ]);
    setCourses(courseData);
    setAssignments(assignmentData);
    if (!form.course_id && courseData[0]) {
      setForm((current) => ({ ...current, course_id: courseData[0].course_id }));
    }
  };

  useEffect(() => {
    if (!user?.user_id) {
      setLoading(false);
      return;
    }

    loadData()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user?.user_id]);

  const submitForm = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await createAssignment(form);
      setMessage("Assignment uploaded successfully.");
      setForm((current) => ({ ...current, title: "", description: "", due_date: "" }));
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-2">Create Assignment</h1>
      <p className="text-slate-500 mb-6">Upload assignments for your courses</p>

      {message && <div className="mb-4 rounded bg-green-50 px-4 py-3 text-green-700">{message}</div>}
      {error && <div className="mb-4 rounded bg-red-50 px-4 py-3 text-red-700">{error}</div>}

      <form onSubmit={submitForm} className="bg-white rounded-xl shadow p-6 space-y-4 mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          <select
            className="border rounded px-3 py-2"
            value={form.course_id}
            onChange={(event) => setForm({ ...form, course_id: event.target.value })}
            required
          >
            {courses.length === 0 && <option value="">No courses assigned</option>}
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

        <button
          type="submit"
          disabled={courses.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Upload Assignment
        </button>
      </form>

      <div className="space-y-4">
        {loading && (
          <div className="bg-white p-5 rounded-xl shadow text-gray-600">Loading saved assignments...</div>
        )}

        {!loading && assignments.length === 0 && (
          <div className="bg-white p-5 rounded-xl shadow text-gray-600">No uploaded assignments found yet.</div>
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
