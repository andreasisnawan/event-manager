import { createContext, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import authService from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (username, password) => {
      try {
        const data = await authService.login(username, password);
        setUser(data.user);
        // Navigate to the intended page or home
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
        return data;
      } catch (error) {
        throw error;
      }
    },
    [navigate, location]
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const register = useCallback(async (userData) => {
    try {
      const data = await authService.register(userData);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
