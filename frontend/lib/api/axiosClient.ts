import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

// Base URL configured via environment variable, with fallback for local development
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.sitesafe.ayantrai.com/api/v1";

/**
 * Centralized Enterprise Axios Client for AyantrAI Sitesafe ERP
 * Automatically handles:
 * - Base URL resolution
 * - Authorization Bearer Token injection from browser storage
 * - Request timeouts (15s)
 * - Standardized error extraction
 */
export const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: Attach JWT token if available
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("sitesafe_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global error interceptor
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected server error occurred.";

    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("sitesafe_token");
    }

    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
