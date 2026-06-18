const API_URL = "http://localhost:5000/api/dashboard";

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
    throw new Error(data.message || "Dashboard request failed");
  }
  return data;
};

export const getTeacherDashboard = () => request(`${API_URL}/teacher`);

export const getStudentDashboard = () => request(`${API_URL}/student`);
