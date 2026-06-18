const API_URL = "http://localhost:5000/api/attendance";

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
    throw new Error(data.message || "Attendance request failed");
  }
  return data;
};

export const getTeacherClasses = (date) =>
  request(`${API_URL}/teacher/classes?date=${date}`);

export const getClassRoster = (classId, search = "") => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const query = params.toString();
  return request(`${API_URL}/class/${classId}/roster${query ? `?${query}` : ""}`);
};

export const markAttendance = (payload) =>
  request(`${API_URL}/mark`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateAttendance = (attendanceId, status) =>
  request(`${API_URL}/${attendanceId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

export const getStudentAttendance = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`${API_URL}/student${query ? `?${query}` : ""}`);
};
