import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  createQuiz,
  deleteQuiz,
  getCourses,
  getQuiz,
  getQuizzes,
  publishQuiz,
  updateQuiz,
} from "../../services/quizService";

const fallbackCourses = [
  { course_id: 1, code: "CS301", course_name: "Data Structures & Algorithms" },
  { course_id: 2, code: "CS302", course_name: "Database Management Systems" },
  { course_id: 3, code: "CS401", course_name: "Cloud Computing" },
];

const emptyQuestion = () => ({
  question_text: "",
  type: "mcq",
  options: ["", "", "", ""],
  correct_answer: "",
  marks: 1,
});

const emptyForm = (courseId = "") => ({
  course_id: courseId,
  title: "",
  duration: 30,
  passing_marks: 1,
  questions: [emptyQuestion()],
});

function Quizzes() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const loadData = async () => {
    const [courseData, quizData] = await Promise.all([
      getCourses(user?.user_id ? { instructorId: user.user_id } : {}),
      getQuizzes(user?.user_id ? { instructorId: user.user_id } : {}),
    ]);
    setCourses(courseData);
    setQuizzes(quizData);
    if (!editingQuizId && courseData[0]) {
      setForm((current) =>
        current.course_id ? current : emptyForm(courseData[0].course_id)
      );
    }
  };

  useEffect(() => {
    loadData()
      .catch((error) => {
        setMessage(`${error.message}. The form is still visible; start the backend to save to database.`);
        setCourses(fallbackCourses);
        setForm(emptyForm(fallbackCourses[0].course_id));
      })
      .finally(() => setLoading(false));
  }, [user?.user_id]);

  const updateQuestion = (index, field, value) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [field]: value } : question
      ),
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
              ),
            }
          : question
      ),
    }));
  };

  const addQuestion = () => {
    setForm((current) => ({
      ...current,
      questions: [...current.questions, emptyQuestion()],
    }));
  };

  const removeQuestion = (index) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.filter((_, i) => i !== index),
    }));
  };

  const startEdit = async (quizId) => {
    setMessage("");
    try {
      const quiz = await getQuiz(quizId, true);
      setEditingQuizId(quizId);
      setForm({
        course_id: quiz.course_id,
        title: quiz.title,
        duration: quiz.duration,
        passing_marks: quiz.passing_marks,
        questions: quiz.questions.map((q) => ({
          question_text: q.question_text,
          type: q.type || "mcq",
          options: [...(q.options || []), "", "", "", ""].slice(0, 4),
          correct_answer: q.correct_answer,
          marks: q.marks,
        })),
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setMessage(error.message);
    }
  };

  const cancelEdit = () => {
    setEditingQuizId(null);
    setForm(emptyForm(courses[0]?.course_id || ""));
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setMessage("");

    const payload = {
      ...form,
      questions: form.questions.map((question) => ({
        ...question,
        options: question.options.filter(Boolean),
      })),
    };

    try {
      if (editingQuizId) {
        await updateQuiz(editingQuizId, payload);
        setMessage("Quiz updated successfully.");
        cancelEdit();
      } else {
        await createQuiz(payload);
        setMessage("Quiz created successfully. Publish it when ready for students.");
        setForm(emptyForm(courses[0]?.course_id || ""));
      }
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm("Delete this quiz permanently?")) return;
    setMessage("");
    try {
      await deleteQuiz(quizId);
      setMessage("Quiz deleted.");
      if (editingQuizId === quizId) cancelEdit();
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handlePublish = async (quizId, publish) => {
    setMessage("");
    try {
      await publishQuiz(quizId, publish);
      setMessage(publish ? "Quiz published for students." : "Quiz unpublished.");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-2">
        {editingQuizId ? "Edit Quiz" : "Create & Upload Quiz"}
      </h1>
      <p className="text-slate-500 mb-6">Create MCQ tests, edit questions, and publish to students</p>

      {message && (
        <div className="mb-4 rounded bg-blue-50 px-4 py-3 text-blue-700 text-sm">{message}</div>
      )}

      <form onSubmit={submitForm} className="bg-white rounded-xl shadow p-6 space-y-4 mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          <select
            className="border rounded px-3 py-2"
            value={form.course_id}
            onChange={(e) => setForm({ ...form, course_id: e.target.value })}
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
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <input
            className="border rounded px-3 py-2"
            type="number"
            min="1"
            placeholder="Duration (mins)"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
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
          onChange={(e) => setForm({ ...form, passing_marks: e.target.value })}
          required
        />

        {form.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-700">Question {questionIndex + 1}</span>
              {form.questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove question
                </button>
              )}
            </div>

            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="Question statement"
              value={question.question_text}
              onChange={(e) => updateQuestion(questionIndex, "question_text", e.target.value)}
              required
            />

            <div className="grid md:grid-cols-4 gap-3">
              {question.options.map((option, optionIndex) => (
                <input
                  key={optionIndex}
                  className="border rounded px-3 py-2"
                  placeholder={`Option ${optionIndex + 1}`}
                  value={option}
                  onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                />
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="border rounded px-3 py-2"
                placeholder="Correct answer"
                value={question.correct_answer}
                onChange={(e) => updateQuestion(questionIndex, "correct_answer", e.target.value)}
                required
              />
              <input
                className="border rounded px-3 py-2"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="Marks"
                value={question.marks}
                onChange={(e) => updateQuestion(questionIndex, "marks", e.target.value)}
                required
              />
            </div>
          </div>
        ))}

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={addQuestion} className="bg-gray-700 text-white px-4 py-2 rounded">
            Add Question
          </button>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            {editingQuizId ? "Save Changes" : "Create Quiz"}
          </button>
          {editingQuizId && (
            <button type="button" onClick={cancelEdit} className="bg-slate-500 text-white px-4 py-2 rounded">
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h2 className="text-xl font-semibold mb-4">Your Quizzes</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {loading && <div className="bg-white rounded-xl shadow p-5 text-gray-600">Loading...</div>}

        {!loading && quizzes.length === 0 && (
          <div className="bg-white rounded-xl shadow p-5 text-gray-600">No quizzes yet.</div>
        )}

        {quizzes.map((quiz) => (
          <div key={quiz.quiz_id} className="bg-white rounded-xl shadow p-5">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="font-semibold">{quiz.title}</h3>
                <p className="text-gray-500 text-sm mt-1">
                  {quiz.code} · {quiz.duration} min · {quiz.total_questions} questions
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  quiz.is_published
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {quiz.is_published ? "Published" : "Draft"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => startEdit(quiz.quiz_id)}
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handlePublish(quiz.quiz_id, !quiz.is_published)}
                className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded"
              >
                {quiz.is_published ? "Unpublish" : "Publish"}
              </button>
              <button
                onClick={() => handleDelete(quiz.quiz_id)}
                className="text-sm bg-red-500 text-white px-3 py-1.5 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default Quizzes;
