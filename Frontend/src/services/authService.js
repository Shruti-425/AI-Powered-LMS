const API_URL = "http://localhost:5000/api/auth";

const request = async (url, options = {}) => {
  const token = localStorage.getItem("lms_token");

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

export const login = (payload) =>
  request(`${API_URL}/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const register = (payload) =>
  request(`${API_URL}/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getMe = () => request(`${API_URL}/me`);

export const forgotPassword = (email) =>
  request(`${API_URL}/forgot-password`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const resetPassword = (payload) =>
  request(`${API_URL}/reset-password`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getDashboardPath = (role) => {
  if (role === "admin") return "/superadmin";
  if (role === "instructor") return "/faculty";
  return "/student";
};
