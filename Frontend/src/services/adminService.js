const API_URL = "http://localhost:5000/api/admin";

const getToken = () => localStorage.getItem("lms_token");

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Admin request failed");
  }
  return data;
};

export const getAdminDashboard = () => request(`${API_URL}/dashboard`);

export const getUsers = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`${API_URL}/users${query ? `?${query}` : ""}`);
};

export const createUser = (payload) =>
  request(`${API_URL}/users`, { method: "POST", body: JSON.stringify(payload) });

export const updateUser = (userId, payload) =>
  request(`${API_URL}/users/${userId}`, { method: "PUT", body: JSON.stringify(payload) });

export const deleteUser = (userId) =>
  request(`${API_URL}/users/${userId}`, { method: "DELETE" });

export const getAdminCourses = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`${API_URL}/courses${query ? `?${query}` : ""}`);
};

export const createCourse = (payload) =>
  request(`${API_URL}/courses`, { method: "POST", body: JSON.stringify(payload) });

export const updateCourse = (courseId, payload) =>
  request(`${API_URL}/courses/${courseId}`, { method: "PUT", body: JSON.stringify(payload) });

export const deleteCourse = (courseId) =>
  request(`${API_URL}/courses/${courseId}`, { method: "DELETE" });

export const getAdminReports = () => request(`${API_URL}/reports`);

export const getAdminAnalytics = () => request(`${API_URL}/analytics`);
