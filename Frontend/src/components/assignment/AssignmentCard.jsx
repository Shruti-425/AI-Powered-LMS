function AssignmentCard({
  title,
  dueDate,
  status,
}) {
  return (
    <div className="bg-white rounded-xl shadow p-5">

      <h2 className="font-bold text-xl">
        {title}
      </h2>

      <p className="text-gray-500 mt-2">
        Due: {dueDate}
      </p>

      <span
        className={`inline-block mt-3 px-3 py-1 rounded text-white ${
          status === "Pending"
            ? "bg-red-500"
            : "bg-green-500"
        }`}
      >
        {status}
      </span>

    </div>
  );
}

export default AssignmentCard;