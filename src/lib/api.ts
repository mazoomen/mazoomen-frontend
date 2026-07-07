import axios from "axios";
import { API_BASE_URL } from "./env";
import { logger } from "./logger";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ── Request Interceptor ────────────────────────────────────────────────
// Attach default headers (like accept language) to outgoing requests.
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const lang = localStorage.getItem("lang") || "ar";
      config.headers["Accept-Language"] = lang;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ───────────────────────────────────────────────
// Global handler for 401 responses — handles silent JWT access token refresh 
// via HTTP-only refresh token, or redirects to login if refresh fails.
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If request gets 401 Unauthorized, we attempt to refresh the tokens.
    // Prevent infinite loop by checking originalRequest._retry and ensuring
    // we don't intercept /auth/refresh failures.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      typeof window !== "undefined"
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Silent token refresh — cookies are set/rotated automatically by backend
        await api.post("/auth/refresh");
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);

        logger.warn("Session expired or refresh token invalid — clearing auth and redirecting to login");
        localStorage.removeItem("user");

        const path = window.location.pathname;
        if (path !== "/") {
          window.location.href = "/?auth=login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
