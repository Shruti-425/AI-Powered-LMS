import { createContext, useContext, useEffect, useState } from "react";
import { getDashboardPath, getMe, login as loginApi, register as registerApi } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("lms_token");
    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("lms_token");
        localStorage.removeItem("lms_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (token, sessionUser) => {
    localStorage.setItem("lms_token", token);
    localStorage.setItem("lms_user", JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const login = async (credentials) => {
    const data = await loginApi(credentials);
    persistSession(data.token, data.user);
    return data;
  };

  const register = async (payload) => {
    const data = await registerApi(payload);
    persistSession(data.token, data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    getDashboardPath: () => (user ? getDashboardPath(user.role) : "/"),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
