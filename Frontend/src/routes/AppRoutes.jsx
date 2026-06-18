import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import StudentDashboard from "../pages/student/Dashboard";
import MyCourses from "../pages/student/MyCourses";
import StudentAssignments from "../pages/student/Assignments";
import StudentQuizzes from "../pages/student/Quizzes";
import QuizTaker from "../pages/student/QuizTaker";
import QuizResults from "../pages/student/QuizResults";
import StudentAttendance from "../pages/student/Attendance";
import AiTutor from "../pages/student/AITutor";
import TaskManager from "../pages/student/TaskManager";

import FacultyDashboard from "../pages/faculty/Dashboard";
import Courses from "../pages/faculty/Courses";
import CreateCourse from "../pages/faculty/CreateCourse";
import FacultyAssignments from "../pages/faculty/Assignments";
import FacultyQuizzes from "../pages/faculty/Quizzes";
import FacultyAttendance from "../pages/faculty/Attendance";
import AiTools from "../pages/faculty/AiTools";

import AdminDashboard from "../pages/superadmin/Dashboard";
import ManageFaculty from "../pages/superadmin/ManageFaculty";
import ManageStudents from "../pages/superadmin/ManageStudents";
import ManageCourses from "../pages/superadmin/ManageCourses";
import Reports from "../pages/superadmin/Reports";
import Analytics from "../pages/superadmin/Analytics";

import Profile from "../pages/shared/Profile";
import Settings from "../pages/shared/Settings";
import Notifications from "../pages/shared/Notifications";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/courses"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <MyCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/assignments"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/quizzes"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentQuizzes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/quizzes/:quizId/take"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <QuizTaker />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/quizzes/:quizId/results"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <QuizResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/attendance"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/ai"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <AiTutor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/tasks"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <TaskManager />
          </ProtectedRoute>
        }
      />

      <Route
        path="/faculty"
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/courses"
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <Courses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/create-course"
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <CreateCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/assignments"
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <FacultyAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/quizzes"
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <FacultyQuizzes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/attendance"
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <FacultyAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/ai-tools"
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <AiTools />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superadmin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin/faculty"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ManageFaculty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin/students"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ManageStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin/courses"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ManageCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin/reports"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin/analytics"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Analytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["student", "instructor", "admin"]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={["student", "instructor", "admin"]}>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={["student", "instructor", "admin"]}>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
