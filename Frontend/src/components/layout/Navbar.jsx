import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const roleLabel =
    user?.role === "instructor" ? "Teacher" : user?.role === "admin" ? "Admin" : "Student";

  return (
    <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-blue-600">AI LMS</h1>
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
