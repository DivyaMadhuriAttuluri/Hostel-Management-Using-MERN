import api from "./axios";

export const registerStudent = (data) => api.post("/auth/register", data);

export const getUnavailableRooms = (hostelBlock) =>
  api.get(
    `/auth/unavailable-rooms?hostelBlock=${encodeURIComponent(hostelBlock)}`,
  );

export const loginStudent = (data) => api.post("/auth/login", data);

export const loginAdmin = (data) => api.post("/auth/admin/login", data);

export const logoutUser = () => api.post("/auth/logout");

// 🔄 Silently get a new access token using the HttpOnly refresh cookie
export const refreshToken = () => api.post("/auth/refresh");

// 🔑 Forgot Password
export const forgotPassword = (data) => api.post("/auth/forgot-password", data);

// 🔑 Reset Password with OTP
export const resetPasswordAPI = (data) =>
  api.post("/auth/reset-password", data);

// 📋 Check Registration Status (public)
export const checkRegistrationStatus = (data) =>
  api.post("/auth/registration-status", data);

// 👤 Admin Profile
export const getAdminProfile = () => api.get("/auth/admin/profile");
export const updateAdminProfile = (data) =>
  api.put("/auth/admin/profile", data);
export const changeAdminPassword = (data) =>
  api.put("/auth/admin/change-password", data);
export const sendChangePasswordOtp = (data) =>
  api.post("/auth/change-password/send-otp", data);
export const verifyChangePasswordOtp = (data) =>
  api.post("/auth/change-password/verify-otp", data);
