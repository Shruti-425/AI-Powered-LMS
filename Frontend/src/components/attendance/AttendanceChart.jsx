import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function AttendanceChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
        No attendance chart data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="label" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Line type="monotone" dataKey="attendance" stroke="#2563eb" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default AttendanceChart;
