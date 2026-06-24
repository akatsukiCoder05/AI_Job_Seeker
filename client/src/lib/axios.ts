import axios from "axios";

let rawApiUrl = import.meta.env.VITE_API_URL || "https://ai-job-seeker-6.onrender.com/api";

// Robust check: append /api suffix if missing from the configured environment URL
if (rawApiUrl && !rawApiUrl.endsWith("/api") && !rawApiUrl.endsWith("/api/")) {
  rawApiUrl = rawApiUrl.replace(/\/$/, "") + "/api";
}

const API_URL = rawApiUrl;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, we could clear local storage or redirect
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;
