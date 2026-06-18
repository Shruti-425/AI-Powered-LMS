import { Routes, Route } from "react-router-dom";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Student Pages
import StudentDashboard from "../pages/student/Dashboard";
import MyCourses from "../pages/student/MyCourses";
import StudentAssignments from "../pages/student/Assignments";
import StudentQuizzes from "../pages/student/Quizzes";
import StudentAttendance from "../pages/student/Attendance";
import AiTutor from "../pages/student/AiTutor";
import TaskManager from "../pages/student/TaskManager";

// Faculty Pages
import FacultyDashboard from "../pages/faculty/Dashboard";
import Courses from "../pages/faculty/Courses";
import CreateCourse from "../pages/faculty/CreateCourse";
import FacultyAssignments from "../pages/faculty/Assignments";
import FacultyQuizzes from "../pages/faculty/Quizzes";
import FacultyAttendance from "../pages/faculty/Attendance";
import AiTools from "../pages/faculty/AiTools";

// Super Admin Pages
import AdminDashboard from "../pages/superadmin/Dashboard";
import ManageFaculty from "../pages/superadmin/ManageFaculty";
import ManageStudents from "../pages/superadmin/ManageStudents";
import ManageCourses from "../pages/superadmin/ManageCourses";
import Reports from "../pages/superadmin/Reports";
import Analytics from "../pages/superadmin/Analytics";

// Shared Pages
import Profile from "../pages/shared/Profile";
import Settings from "../pages/shared/Settings";
import Notifications from "../pages/shared/Notifications";

function AppRoutes() {
  return (
    <Routes>

      {/* Authentication */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student Routes */}
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/student/courses" element={<MyCourses />} />
      <Route
        path="/student/assignments"
        element={<StudentAssignments />}
      />
      <Route
        path="/student/quizzes"
        element={<StudentQuizzes />}
      />
      <Route
        path="/student/attendance"
        element={<StudentAttendance />}
      />
      <Route
        path="/student/ai"
        element={<AiTutor />}
      />
      <Route
        path="/student/tasks"
        element={<TaskManager />}
      />

      {/* Faculty Routes */}
      <Route path="/faculty" element={<FacultyDashboard />} />
      <Route path="/faculty/courses" element={<Courses />} />
      <Route
        path="/faculty/create-course"
        element={<CreateCourse />}
      />
      <Route
        path="/faculty/assignments"
        element={<FacultyAssignments />}
      />
      <Route
        path="/faculty/quizzes"
        element={<FacultyQuizzes />}
      />
      <Route
        path="/faculty/attendance"
        element={<FacultyAttendance />}
      />
      <Route
        path="/faculty/ai-tools"
        element={<AiTools />}
      />

      {/* Super Admin Routes */}
      <Route
        path="/superadmin"
        element={<AdminDashboard />}
      />
      <Route
        path="/superadmin/faculty"
        element={<ManageFaculty />}
      />
      <Route
        path="/superadmin/students"
        element={<ManageStudents />}
      />
      <Route
        path="/superadmin/courses"
        element={<ManageCourses />}
      />
      <Route
        path="/superadmin/reports"
        element={<Reports />}
      />
      <Route
        path="/superadmin/analytics"
        element={<Analytics />}
      />

      {/* Shared Routes */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route
        path="/notifications"
        element={<Notifications />}
      />

    </Routes>
  );
}

export default AppRoutes;



