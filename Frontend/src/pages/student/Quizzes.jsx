import DashboardLayout from "../../components/layout/DashboardLayout";

function Quizzes() {
  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-6">
        Quizzes
      </h1>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="font-semibold">
            DBMS Quiz
          </h2>

          <p className="text-gray-500">
            Duration: 30 Minutes
          </p>

          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
            Start Quiz
          </button>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="font-semibold">
            Cloud Computing Quiz
          </h2>

          <p className="text-gray-500">
            Duration: 20 Minutes
          </p>

          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
            Start Quiz
          </button>
        </div>

      </div>

    </DashboardLayout>
  );
}

export default Quizzes;