import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { resetPassword } from "../../services/authService";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    token: searchParams.get("token") || "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const data = await resetPassword(form);
      setMessage(data.message);
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100">
      <form onSubmit={handleSubmit} className="w-96 p-8 bg-white shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
        <p className="text-sm text-slate-500 mb-6">Enter your reset token and new password</p>

        {error && (
          <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
        )}
        {message && (
          <div className="mb-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>
        )}

        <input
          type="text"
          placeholder="Reset Token"
          value={form.token}
          onChange={(e) => setForm({ ...form, token: e.target.value })}
          className="w-full border border-slate-300 rounded-lg p-2.5 mb-3"
          required
        />

        <input
          type="password"
          placeholder="New Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border border-slate-300 rounded-lg p-2.5 mb-3"
          required
          minLength={8}
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          className="w-full border border-slate-300 rounded-lg p-2.5 mb-4"
          required
          minLength={8}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2.5 w-full rounded-lg disabled:opacity-60"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p className="mt-4 text-sm">
          <Link to="/" className="text-blue-600 hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default ResetPassword;
