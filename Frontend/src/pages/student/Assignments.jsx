import DashboardLayout from "../../components/layout/DashboardLayout";

function Assignments() {
  const assignments = [
    {
      title: "Database Project",
      due: "20 June"
    },
    {
      title: "Cloud Report",
      due: "22 June"
    },
    {
      title: "OS Assignment",
      due: "25 June"
    }
  ];

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        Assignments
      </h1>

      <div className="space-y-4">

        {assignments.map((item, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-xl shadow"
          >
            <h2 className="font-semibold text-lg">
              {item.title}
            </h2>

            <p className="text-gray-500">
              Due Date: {item.due}
            </p>

            <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded">
              Submit
            </button>
          </div>
        ))}

      </div>
    </DashboardLayout>
  );
}

export default Assignments;