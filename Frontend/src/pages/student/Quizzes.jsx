import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getQuizzes } from "../../services/quizService";

function Quizzes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentId = user?.user_id;
  const [quizzes, setQuizzes] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    getQuizzes({ studentId })
      .then(setQuizzes)
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [studentId]);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-2">Quizzes</h1>
      <p className="text-slate-500 mb-6">Take timed MCQ tests for your enrolled courses</p>

      {message && (
        <div className="mb-4 rounded bg-blue-50 px-4 py-3 text-blue-700">{message}</div>
      )}

      {loading && (
        <div className="bg-white p-5 rounded-xl shadow text-gray-600">Loading quizzes...</div>
      )}

      {!loading && quizzes.length === 0 && (
        <div className="bg-white p-5 rounded-xl shadow text-gray-600">
          No published quizzes are available yet.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.quiz_id} className="bg-white shadow rounded-xl p-6">
            <h2 className="font-semibold">{quiz.title}</h2>
            <p className="text-gray-500">
              {quiz.code} · {quiz.duration} min · {quiz.total_questions} questions
            </p>

            {quiz.response_id ? (
              <div className="mt-4">
                <p className="text-green-700 font-medium">
                  Submitted · {quiz.marks} / {quiz.total_marks} marks
                </p>
              </div>
            ) : (
              <button
                onClick={() => navigate(`/student/quizzes/${quiz.quiz_id}/take`)}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
              >
                Start Quiz
              </button>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default Quizzes;
