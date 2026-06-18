import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  createAssignment,
  deleteAssignment,
  getAssignments,
  getSubmissions,
  updateAssignment,
} from "../../services/assignmentService";
import { getCourses } from "../../services/quizService";

const emptyForm = () => ({
  course_id: "",
  title: "",
  description: "",
  due_date: "",
  max_marks: 100,
});

function Assignments() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [viewingId, setViewingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const instructorId = user?.user_id;
    const [courseData, assignmentData] = await Promise.all([
      getCourses(instructorId ? { instructorId } : {}),
      getAssignments(),
    ]);
    setCourses(courseData);
    setAssignments(assignmentData);
    if (!editingId && courseData[0] && !form.course_id) {
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

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm(), course_id: courses[0]?.course_id || "" });
  };

  const startEdit = (assignment) => {
    setEditingId(assignment.assignment_id);
    setForm({
      course_id: assignment.course_id,
      title: assignment.title,
      description: assignment.description || "",
      due_date: assignment.due_date?.slice(0, 16) || "",
      max_marks: assignment.max_marks,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      if (editingId) {
        await updateAssignment(editingId, form);
        setMessage("Assignment updated successfully.");
        resetForm();
      } else {
        await createAssignment(form);
        setMessage("Assignment created successfully.");
        setForm((current) => ({ ...emptyForm(), course_id: current.course_id }));
      }
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await deleteAssignment(assignmentId);
      setMessage("Assignment deleted.");
      if (editingId === assignmentId) resetForm();
      if (viewingId === assignmentId) setViewingId(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const viewSubmissions = async (assignmentId) => {
    setError("");
    try {
      const data = await getSubmissions(assignmentId);
      setSubmissions(data);
      setViewingId(assignmentId);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-2">{editingId ? "Edit Assignment" : "Assignments"}</h1>
      <p className="text-slate-500 mb-6">Create assignments and review student submissions</p>

      {message && <div className="mb-4 rounded bg-green-50 px-4 py-3 text-green-700">{message}</div>}
      {error && <div className="mb-4 rounded bg-red-50 px-4 py-3 text-red-700">{error}</div>}

      <form onSubmit={submitForm} className="bg-white rounded-xl shadow p-6 space-y-4 mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          <select
            className="border rounded px-3 py-2"
            value={form.course_id}
            onChange={(e) => setForm({ ...form, course_id: e.target.value })}
            required
            disabled={Boolean(editingId)}
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
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <textarea
          className="border rounded px-3 py-2 w-full"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border rounded px-3 py-2"
            type="datetime-local"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            required
          />
          <input
            className="border rounded px-3 py-2"
            type="number"
            min="1"
            value={form.max_marks}
            onChange={(e) => setForm({ ...form, max_marks: e.target.value })}
            required
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {editingId ? "Save Changes" : "Create Assignment"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded">
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading && <div className="text-gray-500">Loading assignments...</div>}

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div key={assignment.assignment_id} className="bg-white p-5 rounded-xl shadow">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h2 className="font-semibold text-lg">{assignment.title}</h2>
                <p className="text-gray-500">
                  {assignment.code} · Due: {new Date(assignment.due_date).toLocaleString()}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {assignment.submission_count || 0} submission(s)
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => viewSubmissions(assignment.assignment_id)}
                  className="text-sm bg-green-600 text-white px-3 py-1.5 rounded"
                >
                  View Submissions
                </button>
                <button
                  onClick={() => startEdit(assignment)}
                  className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(assignment.assignment_id)}
                  className="text-sm bg-red-500 text-white px-3 py-1.5 rounded"
                >
                  Delete
                </button>
              </div>
            </div>

            {viewingId === assignment.assignment_id && (
              <div className="mt-4 border-t pt-4">
                <h3 className="font-medium mb-3">Student Submissions</h3>
                {submissions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No submissions yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-2">Student</th>
                        <th className="pb-2">Email</th>
                        <th className="pb-2">Submitted</th>
                        <th className="pb-2">File</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub) => (
                        <tr key={sub.submission_id} className="border-b">
                          <td className="py-2">{sub.student_name}</td>
                          <td className="py-2">{sub.email}</td>
                          <td className="py-2">
                            {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : "—"}
                          </td>
                          <td className="py-2">{sub.file_name || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default Assignments;
