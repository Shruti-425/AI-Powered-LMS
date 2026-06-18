import { Link } from "react-router-dom";
import { useState } from "react";
import { forgotPassword } from "../../services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetToken("");
    setLoading(true);

    try {
      const data = await forgotPassword(email);
      setMessage(data.message);
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100">
      <form onSubmit={handleSubmit} className="w-96 p-8 bg-white shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold mb-2">Forgot Password</h2>
        <p className="text-sm text-slate-500 mb-6">Enter your email to get a reset token</p>

        {error && (
          <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
        )}
        {message && (
          <div className="mb-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>
        )}
        {resetToken && (
          <div className="mb-4 rounded bg-blue-50 px-3 py-2 text-sm text-blue-800 break-all">
            Reset token: <strong>{resetToken}</strong>
            <p className="mt-2">
              <Link to={`/reset-password?token=${resetToken}`} className="underline">
                Go to reset password
              </Link>
            </p>
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-300 rounded-lg p-2.5 mb-4"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2.5 w-full rounded-lg disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Reset Token"}
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

export default ForgotPassword;
