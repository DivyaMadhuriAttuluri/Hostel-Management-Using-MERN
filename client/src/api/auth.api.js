import api from "./axios";

export const registerStudent = (data) => api.post("/auth/register", data);

export const loginStudent = (data) => api.post("/auth/login", data);

export const loginAdmin = (data) => api.post("/auth/admin/login", data);

export const logoutUser = () => api.post("/auth/logout");

// 🔄 Silently get a new access token using the HttpOnly refresh cookie
export const refreshToken = () => api.post("/auth/refresh");
