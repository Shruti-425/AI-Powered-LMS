import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { month: "Jan", attendance: 85 },
  { month: "Feb", attendance: 90 },
  { month: "Mar", attendance: 88 },
  { month: "Apr", attendance: 95 }
];

function AttendanceChart() {
  return (
    <ResponsiveContainer
      width="100%"
      height={300}
    >
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="attendance"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default AttendanceChart;