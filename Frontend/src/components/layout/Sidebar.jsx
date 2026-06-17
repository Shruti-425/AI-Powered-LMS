import { Link } from "react-router-dom";
import { FiClipboard } from "react-icons/fi";

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white">

      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold">
          Student Panel
        </h2>
      </div>

      <ul className="p-4 space-y-3">

        <li>
          <Link
            to="/student"
            className="block p-3 rounded hover:bg-slate-700"
          >
            Dashboard
          </Link>
        </li>

        <li>
          <Link
            to="/student/courses"
            className="block p-3 rounded hover:bg-slate-700"
          >
            My Courses
          </Link>
        </li>

        <li>
          <Link
            to="/student/assignments"
            className="block p-3 rounded hover:bg-slate-700"
          >
            Assignments
          </Link>
        </li>

        <li>
          <Link
            to="/student/quizzes"
            className="block p-3 rounded hover:bg-slate-700"
          >
            Quizzes
          </Link>
        </li>

        <li>
          <Link
            to="/student/attendance"
            className="block p-3 rounded hover:bg-slate-700"
          >
            Attendance
          </Link>
        </li>

        <li>
          <Link
            to="/student/ai"
            className="block p-3 rounded hover:bg-slate-700"
          >
            AI Tutor
          </Link>
        </li>

        <li>
          <Link
            to="/student/tasks"
            className="flex items-center gap-2 p-3 rounded hover:bg-slate-700"
          >
            <FiClipboard className="h-4 w-4 text-fuchsia-400" />
            Task Manager
          </Link>
        </li>

      </ul>
    </aside>
  );
}

export default Sidebar;