import DashboardLayout from "../../components/layout/DashboardLayout";
import AttendanceChart from "../../components/attendance/AttendanceChart";

function Attendance() {
  // Example: Dynamic data would be better
  const attendanceData = [
    { date: "16 June", status: "Present", isPresent: true },
    { date: "17 June", status: "Absent", isPresent: false },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        Attendance Report
      </h1>
      
      <div className="bg-white mt-6 p-6 rounded-xl shadow">
        <AttendanceChart />
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow mt-6">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Date</th>
              <th className="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td className={item.isPresent ? "text-green-600" : "text-red-600"}>
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Attendance;