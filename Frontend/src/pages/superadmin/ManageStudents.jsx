import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { createUser, deleteUser, getUsers, updateUser } from "../../services/adminService";

const emptyForm = () => ({
  name: "",
  email: "",
  password: "",
  role: "student",
});

function ManageStudents() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUsers = () =>
    getUsers({ role: "student", ...(search ? { search } : {}) }).then(setUsers);

  useEffect(() => {
    loadUsers()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search]);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
  };

  const startEdit = (user) => {
    setEditingId(user.user_id);
    setForm({ name: user.name, email: user.email, password: "", role: "student" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      if (editingId) {
        const payload = { name: form.name, email: form.email };
        if (form.password) payload.password = form.password;
        await updateUser(editingId, payload);
        setMessage("Student updated.");
      } else {
        await createUser({ ...form, role: "student" });
        setMessage("Student added.");
      }
      resetForm();
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this student? Their enrollments will also be removed.")) return;
    setMessage("");
    setError("");
    try {
      await deleteUser(userId);
      setMessage("Student deleted.");
      if (editingId === userId) resetForm();
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-2">Manage Students</h1>
      <p className="text-slate-500 mb-6">Add, edit, and remove student accounts</p>

      {message && <div className="mb-4 rounded bg-green-50 px-4 py-3 text-green-700 text-sm">{message}</div>}
      {error && <div className="mb-4 rounded bg-red-50 px-4 py-3 text-red-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 grid md:grid-cols-4 gap-4">
        <input
          className="border rounded px-3 py-2"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="border rounded px-3 py-2"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="border rounded px-3 py-2"
          type="password"
          placeholder={editingId ? "New password (optional)" : "Password"}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required={!editingId}
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex-1">
            {editingId ? "Save" : "Add Student"}
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
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Enrolled Courses</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="p-4 text-gray-500">Loading...</td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-gray-500">No students found.</td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.user_id} className="border-t">
                <td className="p-4 font-medium">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.enrolled_count}</td>
                <td className="p-4 space-x-2">
                  <button onClick={() => startEdit(user)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(user.user_id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default ManageStudents;
