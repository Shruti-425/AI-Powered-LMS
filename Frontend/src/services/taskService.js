const API_URL = "http://localhost:5000/api/tasks";

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
    throw new Error(data.message || "Task request failed");
  }
  return data;
};

export const getTasks = () => request(API_URL);

export const createTask = (payload) =>
  request(API_URL, { method: "POST", body: JSON.stringify(payload) });

export const updateTask = (taskId, payload) =>
  request(`${API_URL}/${taskId}`, { method: "PUT", body: JSON.stringify(payload) });

export const deleteTask = (taskId) =>
  request(`${API_URL}/${taskId}`, { method: "DELETE" });
