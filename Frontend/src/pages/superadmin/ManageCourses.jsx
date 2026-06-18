import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  createCourse,
  deleteCourse,
  getAdminCourses,
  getUsers,
  updateCourse,
} from "../../services/adminService";

const emptyForm = () => ({
  course_name: "",
  code: "",
  instructor_id: "",
  credits: 3,
  semester: "Fall 2026",
});

function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [courseData, facultyData] = await Promise.all([
      getAdminCourses(search ? { search } : {}),
      getUsers({ role: "instructor" }),
    ]);
    setCourses(courseData);
    setInstructors(facultyData);
    if (!editingId && facultyData[0] && !form.instructor_id) {
      setForm((current) => ({ ...current, instructor_id: facultyData[0].user_id }));
    }
  };

  useEffect(() => {
    loadData()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search]);

  const resetForm = () => {
    setForm({ ...emptyForm(), instructor_id: instructors[0]?.user_id || "" });
    setEditingId(null);
  };

  const startEdit = (course) => {
    setEditingId(course.course_id);
    setForm({
      course_name: course.course_name,
      code: course.code,
      instructor_id: course.instructor_id,
      credits: course.credits,
      semester: course.semester,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const payload = {
        ...form,
        instructor_id: Number(form.instructor_id),
        credits: Number(form.credits),
      };
      if (editingId) {
        await updateCourse(editingId, payload);
        setMessage("Course updated.");
      } else {
        await createCourse(payload);
        setMessage("Course created.");
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Delete this course and related data?")) return;
    setMessage("");
    setError("");
    try {
      await deleteCourse(courseId);
      setMessage("Course deleted.");
      if (editingId === courseId) resetForm();
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-2">Manage Courses</h1>
      <p className="text-slate-500 mb-6">Create courses and assign instructors</p>

      {message && <div className="mb-4 rounded bg-green-50 px-4 py-3 text-green-700 text-sm">{message}</div>}
      {error && <div className="mb-4 rounded bg-red-50 px-4 py-3 text-red-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 grid md:grid-cols-3 gap-4">
        <input
          className="border rounded px-3 py-2"
          placeholder="Course name"
          value={form.course_name}
          onChange={(e) => setForm({ ...form, course_name: e.target.value })}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Course code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          required
        />
        <select
          className="border rounded px-3 py-2"
          value={form.instructor_id}
          onChange={(e) => setForm({ ...form, instructor_id: e.target.value })}
          required
        >
          <option value="">Select instructor</option>
          {instructors.map((instructor) => (
            <option key={instructor.user_id} value={instructor.user_id}>
              {instructor.name}
            </option>
          ))}
        </select>
        <input
          className="border rounded px-3 py-2"
          type="number"
          min="1"
          max="6"
          placeholder="Credits"
          value={form.credits}
          onChange={(e) => setForm({ ...form, credits: e.target.value })}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Semester"
          value={form.semester}
          onChange={(e) => setForm({ ...form, semester: e.target.value })}
          required
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex-1">
            {editingId ? "Save Course" : "Add Course"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mb-4">
        <input
          className="border rounded px-3 py-2 w-full md:w-80"
          placeholder="Search courses or instructors"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-4">Code</th>
              <th className="p-4">Course</th>
              <th className="p-4">Instructor</th>
              <th className="p-4">Semester</th>
              <th className="p-4">Students</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-4 text-gray-500">Loading...</td>
              </tr>
            )}
            {!loading && courses.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-gray-500">No courses found.</td>
              </tr>
            )}
            {courses.map((course) => (
              <tr key={course.course_id} className="border-t">
                <td className="p-4 font-medium">{course.code}</td>
                <td className="p-4">{course.course_name}</td>
                <td className="p-4">{course.instructor_name}</td>
                <td className="p-4">{course.semester}</td>
                <td className="p-4">{course.enrollment_count}</td>
                <td className="p-4 space-x-2">
                  <button onClick={() => startEdit(course)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(course.course_id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default ManageCourses;
