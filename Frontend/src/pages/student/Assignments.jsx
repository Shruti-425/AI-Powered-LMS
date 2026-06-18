import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { getAssignments, submitAssignment } from "../../services/assignmentService";

const STUDENT_ID = 5;
const fallbackAssignments = [
  {
    assignment_id: "sample-db-project",
    title: "Database Project",
    code: "CS302",
    due_date: "2026-09-20T23:59:00",
    description: "Full RDBMS project with normalization and stored procedures."
  },
  {
    assignment_id: "sample-cloud-report",
    title: "Cloud Report",
    code: "CS401",
    due_date: "2026-08-15T23:59:00",
    description: "Deploy a web app on EC2 and document the process."
  }
];

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [files, setFiles] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAssignments = async () => {
    const data = await getAssignments({ studentId: STUDENT_ID });
    if (data.length > 0) {
      setAssignments(data);
      return;
    }

    const allAssignments = await getAssignments();
    setAssignments(allAssignments);
  };

  useEffect(() => {
    loadAssignments()
      .catch((error) => {
        setMessage(`${error.message}. Showing sample assignments until the backend is running.`);
        setAssignments(fallbackAssignments);
      })
      .finally(() => setLoading(false));
  }, []);

  const uploadFile = async (assignmentId) => {
    const file = files[assignmentId];
    if (!file) {
      setMessage("Please choose a file before submitting.");
      return;
    }

    try {
      await submitAssignment(assignmentId, {
        student_id: STUDENT_ID,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_data: await toBase64(file)
      });
      setMessage("Assignment submitted successfully.");
      await loadAssignments();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        Assignments
      </h1>

      {message && (
        <div className="mb-4 rounded bg-blue-50 px-4 py-3 text-blue-700">
          {message}
        </div>
      )}

      {loading && (
        <div className="bg-white p-5 rounded-xl shadow text-gray-600">
          Loading assignments...
        </div>
      )}

      {!loading && assignments.length === 0 && (
        <div className="bg-white p-5 rounded-xl shadow text-gray-600">
          No assignments are available yet.
        </div>
      )}

      <div className="space-y-4">

        {assignments.map((item) => (
          <div
            key={item.assignment_id}
            className="bg-white p-5 rounded-xl shadow"
          >
            <h2 className="font-semibold text-lg">
              {item.title}
            </h2>

            <p className="text-gray-500">
              {item.code} · Due Date: {new Date(item.due_date).toLocaleString()}
            </p>

            {item.description && (
              <p className="text-gray-600 mt-2">
                {item.description}
              </p>
            )}

            {item.submission_id && (
              <p className="mt-2 text-green-700">
                Submitted: {item.file_name || "File uploaded"}
              </p>
            )}

            <div className="mt-3 flex flex-col md:flex-row gap-3">
              <input
                type="file"
                className="border rounded px-3 py-2"
                onChange={(event) =>
                  setFiles({ ...files, [item.assignment_id]: event.target.files[0] })
                }
              />
              <button
                onClick={() => uploadFile(item.assignment_id)}
                disabled={String(item.assignment_id).startsWith("sample-")}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {String(item.assignment_id).startsWith("sample-") ? "Connect Backend" : "Submit"}
              </button>
            </div>
          </div>
        ))}

      </div>
    </DashboardLayout>
  );
}

export default Assignments;
