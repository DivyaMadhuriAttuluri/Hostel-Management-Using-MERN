import { createContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  loginStudent,
  loginAdmin,
  logoutUser,
  refreshToken as refreshTokenAPI,
} from "../api/auth.api";
import api from "../api/axios";
import { setAuthHeader } from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true); // start true: wait for checkAuth

  // ============================================================
  // checkAuth — called once on app load
  // Strategy:
  //   1. Try POST /auth/refresh → gets new access token via cookie
  //   2. If that works, store token and call GET /auth/me
  //   3. If refresh fails → user is logged out, redirect to /login
  // ============================================================
  const checkAuth = async () => {
    setLoading(true);
    try {
      // 1️⃣ Silently restore session using refresh cookie
      const { data: refreshData } = await refreshTokenAPI();
      setAuthHeader(refreshData.accessToken);
      setAccessToken(refreshData.accessToken);

      // 2️⃣ Now fetch the user profile with the new token
      const { data } = await api.get("/auth/me");
      setAuthUser(data.user);
      setIsAuthenticated(true);
    } catch {
      // Refresh failed → unauthenticated
      setAuthUser(null);
      setIsAuthenticated(false);
      setAccessToken(null);
      setAuthHeader(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // ============================================================
  // studentLogin
  // ============================================================
  const studentLogin = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await loginStudent(credentials);
      // ✅ Store access token in memory + set bearer header
      setToken(data.accessToken);
      setAuthUser(data.user);
      setIsAuthenticated(true);
      toast.success("Login successful");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // adminLogin
  // ============================================================
  const adminLogin = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await loginAdmin(credentials);
      // ✅ Store access token in memory + set bearer header
      setToken(data.accessToken);
      setAuthUser(data.user);
      setIsAuthenticated(true);
      toast.success("Login successful");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // logout
  // ============================================================
  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setAuthUser(null);
      setIsAuthenticated(false);
      setAccessToken(null);
      setAuthHeader(null);
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout failed");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Helpers
  // ============================================================
  const setToken = (token) => {
    setAccessToken(token);
    setAuthHeader(token);
  };

  // Used by OAuthSuccess page after redirect
  const fetchUser = async () => {
    const { data } = await api.get("/auth/me");
    setAuthUser(data.user);
    setIsAuthenticated(true);
    return data; // ← return so caller can check role
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        setAuthUser,
        isAuthenticated,
        loading,
        studentLogin,
        adminLogin,
        logout,
        setToken,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
