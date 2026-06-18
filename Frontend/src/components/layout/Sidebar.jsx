import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  STUDENT_MENU,
  FACULTY_MENU,
  ADMIN_MENU,
  PANEL_TITLES,
} from "../../utils/constants";

function Sidebar() {
  const { user } = useAuth();

  let menu = STUDENT_MENU;
  if (user?.role === "instructor") menu = FACULTY_MENU;
  if (user?.role === "admin") menu = ADMIN_MENU;

  const panelTitle = PANEL_TITLES[user?.role] || "LMS Panel";

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
              className="block p-3 rounded hover:bg-slate-700 transition-colors"
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
