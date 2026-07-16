import axios from "axios";
import { API_BASE_URL } from "./env";
import { logger } from "./logger";

console.log("========== API DEBUG ==========");
console.log("Imported API_BASE_URL:", API_BASE_URL);
console.log("ENV NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("FILE:", import.meta.url);
console.log("===============================");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

console.log("Axios defaults baseURL:", api.defaults.baseURL);

// ── Request Interceptor ────────────────────────────────────────────────
// Attach default headers (like accept language) and Authorization header to outgoing requests.
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const lang = localStorage.getItem("lang") || "ar";
      config.headers["Accept-Language"] = lang;

      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ───────────────────────────────────────────────
// Global handler for successful responses (to capture tokens) and 401 responses 
// — handles silent JWT access token refresh via body-based refresh token fallback 
// if cookies are blocked, or redirects to login if refresh fails.
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
  (response) => {
    if (response.data && typeof window !== "undefined") {
      if (response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
      }
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

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
        const refreshToken = localStorage.getItem("refreshToken");
        await api.post("/auth/refresh", { refreshToken });
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);

        logger.warn(
          "Session expired or refresh token invalid — clearing auth and redirecting to login",
        );

        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

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