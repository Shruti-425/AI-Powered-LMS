import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  getTeacherClasses,
  getClassRoster,
  markAttendance,
  updateAttendance,
} from "../../services/attendanceService";

function Attendance() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [classInfo, setClassInfo] = useState(null);
  const [roster, setRoster] = useState([]);
  const [presentIds, setPresentIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTeacherClasses(selectedDate)
      .then((data) => {
        setClasses(data);
        if (data.length > 0) {
          setSelectedClassId(String(data[0].class_id));
        } else {
          setSelectedClassId("");
          setClassInfo(null);
          setRoster([]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedClassId) return;

    getClassRoster(selectedClassId, search)
      .then((data) => {
        setClassInfo(data.classInfo);
        setRoster(data.roster);
        const present = new Set(
          data.roster
            .filter((s) => s.status === "present" || s.status === "late")
            .map((s) => s.student_id)
        );
        setPresentIds(present);
      })
      .catch((err) => setError(err.message));
  }, [selectedClassId, search]);

  const togglePresent = (studentId) => {
    setPresentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const saveAttendance = async () => {
    setMessage("");
    setError("");
    try {
      await markAttendance({
        class_id: Number(selectedClassId),
        present_student_ids: Array.from(presentIds),
      });
      setMessage("Attendance saved successfully.");
      const data = await getClassRoster(selectedClassId, search);
      setRoster(data.roster);
    } catch (err) {
      setError(err.message);
    }
  };

  const editStatus = async (attendanceId, status) => {
    setMessage("");
    setError("");
    try {
      await updateAttendance(attendanceId, status);
      setMessage("Attendance record updated.");
      const data = await getClassRoster(selectedClassId, search);
      setRoster(data.roster);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-2">Attendance Management</h1>
      <p className="text-slate-500 mb-6">Mark present/absent, search students, and filter by date</p>

      {message && (
        <div className="mb-4 rounded bg-green-50 px-4 py-3 text-green-700 text-sm">{message}</div>
      )}
      {error && (
        <div className="mb-4 rounded bg-red-50 px-4 py-3 text-red-600 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow p-6 mb-6 grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Filter by Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Select Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            {classes.map((item) => (
              <option key={item.class_id} value={item.class_id}>
                {item.code} · {item.time} · Room {item.room}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Search Students</label>
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading classes...</p>
      ) : !selectedClassId ? (
        <p className="text-slate-500">No classes found for this date.</p>
      ) : (
        <div className="bg-white rounded-xl shadow p-6">
          {classInfo && (
            <div className="mb-4 pb-4 border-b">
              <h2 className="text-xl font-semibold">{classInfo.course_name}</h2>
              <p className="text-slate-500 text-sm">
                {classInfo.code} · {classInfo.class_date} · {classInfo.time} · Room {classInfo.room}
              </p>
            </div>
          )}

          <table className="w-full">
            <thead>
              <tr className="text-left text-slate-500 text-sm border-b">
                <th className="py-2">Present</th>
                <th className="py-2">Student</th>
                <th className="py-2">Email</th>
                <th className="py-2">Status</th>
                <th className="py-2">Edit</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((student) => (
                <tr key={student.student_id} className="border-b border-slate-100">
                  <td className="py-3">
                    <input
                      type="checkbox"
                      checked={presentIds.has(student.student_id)}
                      onChange={() => togglePresent(student.student_id)}
                    />
                  </td>
                  <td className="py-3 font-medium">{student.student_name}</td>
                  <td className="py-3 text-slate-500">{student.student_email}</td>
                  <td className="py-3 capitalize">
                    <span
                      className={
                        student.status === "present" || student.status === "late"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {student.attendance_id && (
                      <select
                        value={student.status}
                        onChange={(e) => editStatus(student.attendance_id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={saveAttendance}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg"
          >
            Save Attendance
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Attendance;
