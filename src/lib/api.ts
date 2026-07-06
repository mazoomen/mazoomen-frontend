import axios from "axios";
import { API_BASE_URL } from "./env";
import { logger } from "./logger";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor ────────────────────────────────────────────────
// Automatically attach the JWT token (if present) to every outgoing request.
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const lang = localStorage.getItem("lang") || "ar";
      config.headers["Accept-Language"] = lang;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ───────────────────────────────────────────────
// Global handler for 401 responses — clears stale tokens and redirects
// the user back to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      logger.warn("Received 401 — clearing auth and redirecting to login");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      const path = window.location.pathname;
      if (path !== "/") {
        window.location.href = "/?auth=login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
