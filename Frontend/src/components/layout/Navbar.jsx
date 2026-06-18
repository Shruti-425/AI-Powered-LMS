import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPath } from "../../services/authService";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = user ? getDashboardPath(user.role) : "/";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(dashboardPath);
    }
  };

  const roleLabel =
    user?.role === "instructor" ? "Teacher" : user?.role === "admin" ? "Admin" : "Student";

  return (
    <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(dashboardPath)}
          className="text-2xl font-bold text-blue-600 hover:text-blue-700"
        >
          AI LMS
        </button>
        {user && (
          <>
            <button
              onClick={goBack}
              className="text-sm text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg"
            >
              ← Back
            </button>
            <button
              onClick={() => navigate(dashboardPath)}
              className="text-sm text-blue-600 hover:text-blue-800 hidden sm:inline"
            >
              Dashboard
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="font-medium">Welcome, {user?.name || "User"}</span>
        <span className="text-xs uppercase tracking-wide bg-slate-100 px-2 py-1 rounded text-slate-600">
          {roleLabel}
        </span>
        <button
          onClick={handleLogout}
          className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
