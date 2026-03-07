import { createContext, useState, useContext, useEffect } from "react";
import { authAPI, setAccessToken } from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(true);

  const isAuthenticated = !!user;

  const login = (userData, accessToken) => {
    setAccessToken(accessToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore errors — always clear local state
    }
    setAccessToken(null);
    localStorage.removeItem("user");
    setUser(null);
  };

  // Silent refresh on app load — restore session from HttpOnly cookie
  useEffect(() => {
    const silentRefresh = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        // No previous session — skip refresh
        setAuthLoading(false);
        return;
      }

      try {
        const response = await authAPI.refresh();
        setAccessToken(response.data.accessToken);
        // Update user data from server (in case profile changed)
        setUser(response.data.data);
      } catch {
        // Refresh failed — session expired, clear local state
        setAccessToken(null);
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    silentRefresh();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, isAuthenticated, login, logout, authLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
