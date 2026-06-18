const API_URL = "http://localhost:5000/api/quizzes";

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
    throw new Error(data.message || "Quiz request failed");
  }
  return data;
};

export const getCourses = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`${API_URL}/courses${query ? `?${query}` : ""}`);
};

export const getQuizzes = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`${API_URL}${query ? `?${query}` : ""}`);
};

export const getQuiz = (quizId, includeAnswers = false, publishedOnly = false) =>
  request(
    `${API_URL}/${quizId}?includeAnswers=${includeAnswers}&publishedOnly=${publishedOnly}`
  );

export const createQuiz = (payload) =>
  request(API_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateQuiz = (quizId, payload) =>
  request(`${API_URL}/${quizId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteQuiz = (quizId) =>
  request(`${API_URL}/${quizId}`, {
    method: "DELETE",
  });

export const publishQuiz = (quizId, isPublished) =>
  request(`${API_URL}/${quizId}/publish`, {
    method: "PUT",
    body: JSON.stringify({ is_published: isPublished }),
  });

export const submitQuiz = (quizId, payload) =>
  request(`${API_URL}/${quizId}/submit`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getQuizResponses = (quizId) => request(`${API_URL}/${quizId}/responses`);
