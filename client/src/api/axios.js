import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:5000/api",
  withCredentials: true, // 🔥 required for refreshToken cookie
});

// 🔑 Access token holder (in-memory, lost on page refresh — recovered via checkAuth)
let accessToken = null;

// 🔑 Set or clear the in-memory access token
export const setAuthHeader = (token) => {
  accessToken = token;
};

// ======================
// Request interceptor — attach access token to every request
// ======================
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ======================
// Response interceptor — auto-refresh on 401
// ======================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔄 If 401 and we haven't already retried → try refreshing the token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      // Don't refresh on the refresh/login routes themselves
      !originalRequest.url.includes("/auth/refresh") &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/admin/login")
    ) {
      originalRequest._retry = true;

      try {
        // 🍪 The refresh cookie is sent automatically (withCredentials: true)
        const { data } = await api.post("/auth/refresh");

        // ✅ Store new access token
        setAuthHeader(data.accessToken);

        // 🔁 Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        // ❌ Refresh failed → clear token and redirect to login
        setAuthHeader(null);
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    // Pass all other errors through normally
    if (!error.response) {
      console.error("Network error:", error.message);
    } else {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      if (status === 403) console.error("Forbidden:", message);
      else if (status === 404) console.error("Not found:", message);
      else if (status >= 500) console.error("Server error:", message);
    }

    return Promise.reject(error);
  }
);

export default api;
