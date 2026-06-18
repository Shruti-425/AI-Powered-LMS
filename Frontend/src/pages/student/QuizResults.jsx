import { useLocation, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";

function QuizResults() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const result = state?.result;

  if (!result) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-600 mb-4">No results to display. Take the quiz first.</p>
          <button
            onClick={() => navigate("/student/quizzes")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Back to Quizzes
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const { title, marks, total_marks, passing_marks, passed, results = [] } = result;
  const correctCount = results.filter((item) => item.isCorrect).length;
  const percentage = total_marks > 0 ? Math.round((marks / total_marks) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow p-8 text-center mb-6">
          <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">Quiz Complete</p>
          <h1 className="text-3xl font-bold mb-2">{title || `Quiz #${quizId}`}</h1>

          <div
            className={`inline-block mt-4 px-4 py-1.5 rounded-full text-sm font-medium ${
              passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {passed ? "Passed" : "Did not pass"}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-blue-600">{marks}</p>
              <p className="text-sm text-gray-500 mt-1">Score</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-3xl font-bold">{total_marks}</p>
              <p className="text-sm text-gray-500 mt-1">Total Marks</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-3xl font-bold">{percentage}%</p>
              <p className="text-sm text-gray-500 mt-1">Percentage</p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            {correctCount} of {results.length} correct · Passing marks: {passing_marks}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Answer Review</h2>
          <div className="space-y-4">
            {results.map((item, index) => (
              <div
                key={item.questionId}
                className={`border rounded-lg p-4 ${
                  item.isCorrect ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <p className="font-medium">
                    {index + 1}. {item.question_text}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                      item.isCorrect ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                    }`}
                  >
                    {item.isCorrect ? "Correct" : "Wrong"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Your answer: <span className="font-medium">{item.answer || "—"}</span>
                </p>
                {!item.isCorrect && (
                  <p className="text-sm text-gray-600 mt-1">
                    Correct answer: <span className="font-medium">{item.correct_answer}</span>
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">{item.marks} mark(s)</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/student/quizzes")}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default QuizResults;
