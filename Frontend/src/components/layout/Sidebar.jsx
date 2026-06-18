import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  STUDENT_MENU,
  FACULTY_MENU,
  ADMIN_MENU,
  PANEL_TITLES,
} from "../../utils/constants";

function Sidebar() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  let menu = STUDENT_MENU;
  if (user?.role === "instructor") menu = FACULTY_MENU;
  if (user?.role === "admin") menu = ADMIN_MENU;

  const panelTitle = PANEL_TITLES[user?.role] || "LMS Panel";

  const isActive = (path) => {
    if (path === "/student" || path === "/faculty" || path === "/superadmin") {
      return pathname === path;
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-800 text-white">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold">{panelTitle}</h2>
      </div>

      <ul className="p-4 space-y-2">
        {menu.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`block p-3 rounded transition-colors ${
                isActive(item.path)
                  ? "bg-blue-600 text-white font-medium"
                  : "hover:bg-slate-700 text-slate-200"
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
