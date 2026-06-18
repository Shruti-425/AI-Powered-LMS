import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { createQuiz, getCourses, getQuizzes } from "../../services/quizService";

const fallbackCourses = [
  { course_id: 1, code: "CS301", course_name: "Data Structures & Algorithms" },
  { course_id: 2, code: "CS302", course_name: "Database Management Systems" },
  { course_id: 3, code: "CS401", course_name: "Cloud Computing" }
];

function Quizzes() {
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    course_id: "",
    title: "",
    duration: 30,
    passing_marks: 1,
    questions: [
      {
        question_text: "",
        type: "mcq",
        options: ["", "", "", ""],
        correct_answer: "",
        marks: 1
      }
    ]
  });

  const loadData = async () => {
    const [courseData, quizData] = await Promise.all([
      getCourses(),
      getQuizzes()
    ]);
    setCourses(courseData);
    setQuizzes(quizData);
    if (!form.course_id && courseData[0]) {
      setForm((current) => ({ ...current, course_id: courseData[0].course_id }));
    }
  };

  useEffect(() => {
    loadData()
      .catch((error) => {
        setMessage(`${error.message}. The form is still visible; start the backend to save to database.`);
        setCourses(fallbackCourses);
        setForm((current) => ({ ...current, course_id: current.course_id || fallbackCourses[0].course_id }));
      })
      .finally(() => setLoading(false));
  }, []);

  const updateQuestion = (index, field, value) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [field]: value } : question
      )
    }));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              options: question.options.map((option, itemIndex) =>
                itemIndex === optionIndex ? value : option
              )
            }
          : question
      )
    }));
  };

  const addQuestion = () => {
    setForm((current) => ({
      ...current,
      questions: [
        ...current.questions,
        {
          question_text: "",
          type: "mcq",
          options: ["", "", "", ""],
          correct_answer: "",
          marks: 1
        }
      ]
    }));
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await createQuiz({
        ...form,
        questions: form.questions.map((question) => ({
          ...question,
          options: question.options.filter(Boolean)
        }))
      });
      setMessage("Quiz uploaded successfully.");
      setForm((current) => ({
        ...current,
        title: "",
        questions: [
          {
            question_text: "",
            type: "mcq",
            options: ["", "", "", ""],
            correct_answer: "",
            marks: 1
          }
        ]
      }));
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Create & Upload Quiz</h1>

      {message && (
        <div className="mb-4 rounded bg-blue-50 px-4 py-3 text-blue-700">
          {message}
        </div>
      )}

      <form onSubmit={submitForm} className="bg-white rounded-xl shadow p-6 space-y-4 mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          <select
            className="border rounded px-3 py-2"
            value={form.course_id}
            onChange={(event) => setForm({ ...form, course_id: event.target.value })}
          >
            {courses.map((course) => (
              <option key={course.course_id} value={course.course_id}>
                {course.code} - {course.course_name}
              </option>
            ))}
          </select>

          <input
            className="border rounded px-3 py-2 md:col-span-2"
            placeholder="Quiz title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
          />

          <input
            className="border rounded px-3 py-2"
            type="number"
            min="1"
            placeholder="Duration"
            value={form.duration}
            onChange={(event) => setForm({ ...form, duration: event.target.value })}
            required
          />
        </div>

        <input
          className="border rounded px-3 py-2 w-full md:w-64"
          type="number"
          min="0"
          step="0.5"
          placeholder="Passing marks"
          value={form.passing_marks}
          onChange={(event) => setForm({ ...form, passing_marks: event.target.value })}
          required
        />

        {form.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="border rounded-lg p-4 space-y-3">
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder={`Question ${questionIndex + 1}`}
              value={question.question_text}
              onChange={(event) =>
                updateQuestion(questionIndex, "question_text", event.target.value)
              }
              required
            />

            <div className="grid md:grid-cols-4 gap-3">
              {question.options.map((option, optionIndex) => (
                <input
                  key={optionIndex}
                  className="border rounded px-3 py-2"
                  placeholder={`Option ${optionIndex + 1}`}
                  value={option}
                  onChange={(event) =>
                    updateOption(questionIndex, optionIndex, event.target.value)
                  }
                />
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="border rounded px-3 py-2"
                placeholder="Correct answer"
                value={question.correct_answer}
                onChange={(event) =>
                  updateQuestion(questionIndex, "correct_answer", event.target.value)
                }
                required
              />
              <input
                className="border rounded px-3 py-2"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="Marks"
                value={question.marks}
                onChange={(event) =>
                  updateQuestion(questionIndex, "marks", event.target.value)
                }
                required
              />
            </div>
          </div>
        ))}

        <div className="flex gap-3">
          <button type="button" onClick={addQuestion} className="bg-gray-700 text-white px-4 py-2 rounded">
            Add Question
          </button>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            Upload Quiz
          </button>
        </div>
      </form>

      <div className="grid md:grid-cols-2 gap-4">
        {loading && (
          <div className="bg-white rounded-xl shadow p-5 text-gray-600">
            Loading saved quizzes...
          </div>
        )}

        {!loading && quizzes.length === 0 && (
          <div className="bg-white rounded-xl shadow p-5 text-gray-600">
            No uploaded quizzes found yet.
          </div>
        )}

        {quizzes.map((quiz) => (
          <div key={quiz.quiz_id} className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold">{quiz.title}</h2>
            <p className="text-gray-500">
              {quiz.code} · {quiz.duration} minutes · {quiz.total_questions} questions
            </p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default Quizzes;
