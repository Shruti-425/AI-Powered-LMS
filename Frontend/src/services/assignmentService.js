const API_URL = "http://localhost:5000/api/assignments";

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Assignment request failed");
  }
  return data;
};

export const getAssignments = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`${API_URL}${query ? `?${query}` : ""}`);
};

export const createAssignment = (payload) =>
  request(API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const submitAssignment = (assignmentId, payload) =>
  request(`${API_URL}/${assignmentId}/submit`, {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const getSubmissions = (assignmentId) =>
  request(`${API_URL}/${assignmentId}/submissions`);

export const downloadFile = (submissionId) =>
  `${API_URL}/file/${submissionId}`;