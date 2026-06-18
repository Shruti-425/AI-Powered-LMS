import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { getQuiz, submitQuiz } from "../../services/quizService";

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

function QuizTaker() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentId = user?.user_id;

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [timeUp, setTimeUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentIndex];
  const answeredCount = questions.filter((q) => answers[q.question_id]).length;

  const handleSubmit = useCallback(async () => {
    if (!quiz || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      const result = await submitQuiz(quiz.quiz_id, { answers });
      navigate(`/student/quizzes/${quiz.quiz_id}/results`, { state: { result } });
    } catch (err) {
      setError(err.message);
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [answers, navigate, quiz]);

  useEffect(() => {
    if (!quizId || !studentId) return;

    getQuiz(quizId, false, true)
      .then((data) => {
        setQuiz(data);
        setSecondsLeft(Number(data.duration || 30) * 60);
        setTimeUp(false);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [quizId, studentId]);

  useEffect(() => {
    if (!quiz || secondsLeft === null) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, secondsLeft === null]);

  useEffect(() => {
    if (timeUp && quiz) {
      handleSubmit();
    }
  }, [timeUp, quiz, handleSubmit]);

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-xl shadow p-8 text-gray-600">Loading quiz...</div>
      </DashboardLayout>
    );
  }

  if (error && !quiz) {
    return (
      <DashboardLayout>
        <div className="mb-4 rounded bg-red-50 px-4 py-3 text-red-700">{error}</div>
        <button
          onClick={() => navigate("/student/quizzes")}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          Back to Quizzes
        </button>
      </DashboardLayout>
    );
  }

  if (!currentQuestion) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-xl shadow p-8 text-gray-600">No questions in this quiz.</div>
      </DashboardLayout>
    );
  }

  const timerWarning = secondsLeft !== null && secondsLeft <= 60;

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow p-6 mb-4">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl font-bold">{quiz.title}</h1>
                <p className="text-gray-500 text-sm mt-1">
                  {quiz.course_name} · Question {currentIndex + 1} of {questions.length}
                </p>
              </div>
              <div
                className={`text-lg font-mono font-semibold px-4 py-2 rounded-lg ${
                  timerWarning ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-700"
                }`}
              >
                {secondsLeft !== null ? formatTime(secondsLeft) : "--:--"}
              </div>
            </div>

            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded bg-red-50 px-4 py-3 text-red-700 text-sm">{error}</div>
          )}

          <div className="bg-white rounded-xl shadow p-6">
            <p className="font-medium text-lg mb-4">
              {currentIndex + 1}. {currentQuestion.question_text}
            </p>

            {(currentQuestion.options || []).length > 0 ? (
              <div className="space-y-3">
                {(currentQuestion.options || []).map((option) => (
                  <label
                    key={option}
                    className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition ${
                      answers[currentQuestion.question_id] === option
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.question_id}`}
                      value={option}
                      checked={answers[currentQuestion.question_id] === option}
                      onChange={(e) => setAnswer(currentQuestion.question_id, e.target.value)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                className="border rounded px-3 py-2 w-full"
                placeholder="Your answer"
                value={answers[currentQuestion.question_id] || ""}
                onChange={(e) => setAnswer(currentQuestion.question_id, e.target.value)}
              />
            )}

            <div className="flex flex-wrap justify-between gap-3 mt-6">
              <button
                onClick={() => goToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-40"
              >
                Previous
              </button>

              <div className="flex gap-3">
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => goToQuestion(currentIndex + 1)}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:w-72">
          <div className="bg-white rounded-xl shadow p-5 sticky top-4">
            <h2 className="font-semibold mb-3">Question Navigator</h2>
            <p className="text-sm text-gray-500 mb-4">
              {answeredCount} of {questions.length} answered
            </p>

            <div className="grid grid-cols-5 gap-2 mb-5">
              {questions.map((question, index) => {
                const isAnswered = Boolean(answers[question.question_id]);
                const isCurrent = index === currentIndex;
                return (
                  <button
                    key={question.question_id}
                    onClick={() => goToQuestion(index)}
                    className={`h-9 rounded text-sm font-medium ${
                      isCurrent
                        ? "bg-blue-600 text-white"
                        : isAnswered
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>

            <button
              onClick={() => navigate("/student/quizzes")}
              className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Exit without submitting
            </button>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}

export default QuizTaker;
