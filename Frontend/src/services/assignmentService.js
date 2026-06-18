const API_URL = "http://localhost:5000/api/assignments";

const getToken = () => localStorage.getItem("lms_token");

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Assignment request failed");
  }
  return data;
};

export const getAssignments = () => request(API_URL);

export const createAssignment = (payload) =>
  request(API_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const submitAssignment = (assignmentId, payload) =>
  request(`${API_URL}/${assignmentId}/submit`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getSubmissions = (assignmentId) =>
  request(`${API_URL}/${assignmentId}/submissions`);

export const downloadFile = (submissionId) =>
  `${API_URL}/file/${submissionId}`;
