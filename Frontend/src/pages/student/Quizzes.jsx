import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { getQuiz, getQuizzes, submitQuiz } from "../../services/quizService";

const STUDENT_ID = 5;
const fallbackQuizzes = [
  {
    quiz_id: "sample-dbms",
    title: "DBMS Quiz",
    code: "CS302",
    duration: 30,
    total_questions: 3
  },
  {
    quiz_id: "sample-cloud",
    title: "Cloud Computing Quiz",
    code: "CS401",
    duration: 20,
    total_questions: 2
  }
];

function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuizzes({ studentId: STUDENT_ID })
      .then(async (data) => {
        if (data.length > 0) {
          setQuizzes(data);
          return;
        }

        const allQuizzes = await getQuizzes();
        setQuizzes(allQuizzes);
      })
      .catch((error) => {
        setMessage(`${error.message}. Showing sample quizzes until the backend is running.`);
        setQuizzes(fallbackQuizzes);
      })
      .finally(() => setLoading(false));
  }, []);

  const startQuiz = async (quizId) => {
    if (String(quizId).startsWith("sample-")) {
      setMessage("Start the backend and import the quiz database migration to solve this quiz.");
      return;
    }

    setMessage("");
    setAnswers({});
    try {
      const quiz = await getQuiz(quizId);
      setActiveQuiz(quiz);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const submitActiveQuiz = async () => {
    try {
      const result = await submitQuiz(activeQuiz.quiz_id, {
        student_id: STUDENT_ID,
        answers
      });
      setMessage(`Quiz submitted. Marks: ${result.marks}`);
      setActiveQuiz(null);
      setQuizzes(await getQuizzes({ studentId: STUDENT_ID }));
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-6">
        Quizzes
      </h1>

      {message && (
        <div className="mb-4 rounded bg-blue-50 px-4 py-3 text-blue-700">
          {message}
        </div>
      )}

      {activeQuiz ? (
        <div className="bg-white shadow rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-xl font-semibold">{activeQuiz.title}</h2>
            <p className="text-gray-500">
              {activeQuiz.course_name} · {activeQuiz.duration} minutes
            </p>
          </div>

          {(activeQuiz.questions || []).map((question, index) => (
            <div key={question.question_id} className="border rounded-lg p-4">
              <p className="font-medium mb-3">
                {index + 1}. {question.question_text}
              </p>

              {(question.options || []).length > 0 ? (
                <div className="space-y-2">
                  {(question.options || []).map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`question-${question.question_id}`}
                        value={option}
                        checked={answers[question.question_id] === option}
                        onChange={(event) =>
                          setAnswers({ ...answers, [question.question_id]: event.target.value })
                        }
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Your answer"
                  value={answers[question.question_id] || ""}
                  onChange={(event) =>
                    setAnswers({ ...answers, [question.question_id]: event.target.value })
                  }
                />
              )}
            </div>
          ))}

          <div className="flex gap-3">
            <button onClick={submitActiveQuiz} className="bg-green-600 text-white px-4 py-2 rounded">
              Submit Quiz
            </button>
            <button onClick={() => setActiveQuiz(null)} className="bg-gray-700 text-white px-4 py-2 rounded">
              Back
            </button>
          </div>
        </div>
      ) : (
        <>
        {loading && (
          <div className="bg-white p-5 rounded-xl shadow text-gray-600">
            Loading quizzes...
          </div>
        )}

        {!loading && quizzes.length === 0 && (
          <div className="bg-white p-5 rounded-xl shadow text-gray-600">
            No quizzes are available yet.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">

          {quizzes.map((quiz) => (
            <div key={quiz.quiz_id} className="bg-white shadow rounded-xl p-6">
              <h2 className="font-semibold">
                {quiz.title}
              </h2>

              <p className="text-gray-500">
                {quiz.code} · Duration: {quiz.duration} Minutes
              </p>

              {quiz.response_id ? (
                <p className="mt-4 text-green-700 font-medium">
                  Submitted · Marks: {quiz.marks}
                </p>
              ) : (
                <button
                  onClick={() => startQuiz(quiz.quiz_id)}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
                >
                  Start Quiz
                </button>
              )}
            </div>
          ))}

        </div>
        </>
      )}

    </DashboardLayout>
  );
}

export default Quizzes;
