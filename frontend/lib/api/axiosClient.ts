import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { API_ENDPOINTS } from "./endpoints";

// Base URL configured via environment variable, with fallback for local development
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const TEMPLATE_API_BASE_URL =
  process.env.NEXT_PUBLIC_TEMPLATE_API_URL || "http://localhost:5001/api/v1";

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

/**
 * Dedicated Axios Client for the Template & Canvas Blueprint Microservice (port 5001)
 */
export const templateAxiosClient: AxiosInstance = axios.create({
  baseURL: TEMPLATE_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Utility helper to build headers with Authorization Bearer token
 * and merge any caller-provided custom headers.
 */
export const buildHeadersWithToken = (
  customHeaders?: Record<string, string>,
  isFormData: boolean = false
): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(customHeaders || {}),
  };

  // Only set application/json if not uploading multipart/FormData and not overridden
  if (!isFormData && !headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Inject Bearer token if not explicitly supplied in custom headers
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("sitesafe_token");
    const hasAuth = headers["Authorization"] || headers["authorization"];
    if (token && !hasAuth) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Request Interceptor: Secondary fallback to ensure Bearer token is attached
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("sitesafe_token");
      if (token && config.headers && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

templateAxiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("sitesafe_token");
      if (token && config.headers && !config.headers.Authorization) {
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
    // If unauthorized on protected routes (not on login itself), clear stored token
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const requestUrl = error.config?.url || "";
      if (!requestUrl.includes(API_ENDPOINTS.AUTH.LOGIN)) {
        localStorage.removeItem("sitesafe_token");
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// REQUEST DEDUPLICATION & SHORT-TERM TTL CACHING
// Reduces redundant network requests across the application.
// ============================================================================

// In-flight promise cache to deduplicate concurrent identical GET requests
const inFlightRequests = new Map<string, Promise<any>>();

// In-memory response cache with TTL (in milliseconds)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}
const responseCache = new Map<string, CacheEntry<any>>();

/**
 * Manually invalidate cached GET responses
 * @param pattern Optional keyword or endpoint prefix to invalidate
 */
export const clearApiCache = (pattern?: string) => {
  if (!pattern) {
    responseCache.clear();
  } else {
    for (const key of responseCache.keys()) {
      if (key.includes(pattern)) {
        responseCache.delete(key);
      }
    }
  }
};

export interface ApiRequestOptions {
  /** Time-To-Live in milliseconds for in-memory response caching (default: 0 / disabled) */
  ttlMs?: number;
  /** Force network fetch bypassing cache (default: false) */
  forceRefresh?: boolean;
}

// ============================================================================
// CENTRALIZED CRUD HELPER FUNCTIONS
// Each function automatically injects Auth Token + default headers,
// merges new custom headers, and passes endpoint & payload.
// ============================================================================

/**
 * GET Request with automatic request deduplication and optional in-memory caching
 * @param endpoint - API endpoint (relative path or from API_ENDPOINTS)
 * @param params - Optional URL query parameters (e.g. { page: 1, limit: 10 })
 * @param headers - Optional new custom headers to attach / override
 * @param options - Optional caching parameters ({ ttlMs, forceRefresh })
 */
export const apiGet = async <T = any>(
  endpoint: string,
  params?: Record<string, any>,
  headers?: Record<string, string>,
  options?: ApiRequestOptions
): Promise<T> => {
  const cacheKey = `${endpoint}?${JSON.stringify(params || {})}`;
  const ttlMs = options?.ttlMs ?? 0;
  const forceRefresh = options?.forceRefresh ?? false;

  // 1. Check in-memory TTL cache (serves immediately with 0 network calls)
  if (!forceRefresh && ttlMs > 0) {
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttlMs) {
      return cached.data as T;
    }
  }

  // 2. Deduplicate in-flight concurrent requests to identical endpoint
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<T>;
  }

  // 3. Dispatch network request with automatic promise cleanup
  const mergedHeaders = buildHeadersWithToken(headers);
  const requestPromise = (async () => {
    try {
      const response = await axiosClient.get<T>(endpoint, {
        params,
        headers: mergedHeaders,
      });

      if (ttlMs > 0) {
        responseCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
          ttlMs,
        });
      }

      return response.data;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

/**
 * POST Request
 * @param endpoint - API endpoint (relative path or from API_ENDPOINTS)
 * @param body - Request body payload (JSON object, string, or FormData)
 * @param headers - Optional new custom headers to attach / override
 * @param params - Optional URL query parameters
 */
export const apiPost = async <T = any>(
  endpoint: string,
  body?: any,
  headers?: Record<string, string>,
  params?: Record<string, any>
): Promise<T> => {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const mergedHeaders = buildHeadersWithToken(headers, isFormData);
  const response = await axiosClient.post<T>(endpoint, body, {
    headers: mergedHeaders,
    params,
  });
  return response.data;
};

/**
 * PUT Request
 * @param endpoint - API endpoint (relative path or from API_ENDPOINTS)
 * @param body - Full replacement payload
 * @param headers - Optional new custom headers to attach / override
 * @param params - Optional URL query parameters
 */
export const apiPut = async <T = any>(
  endpoint: string,
  body?: any,
  headers?: Record<string, string>,
  params?: Record<string, any>
): Promise<T> => {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const mergedHeaders = buildHeadersWithToken(headers, isFormData);
  const response = await axiosClient.put<T>(endpoint, body, {
    headers: mergedHeaders,
    params,
  });
  return response.data;
};

/**
 * PATCH Request
 * @param endpoint - API endpoint (relative path or from API_ENDPOINTS)
 * @param body - Partial update payload
 * @param headers - Optional new custom headers to attach / override
 * @param params - Optional URL query parameters
 */
export const apiPatch = async <T = any>(
  endpoint: string,
  body?: any,
  headers?: Record<string, string>,
  params?: Record<string, any>
): Promise<T> => {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const mergedHeaders = buildHeadersWithToken(headers, isFormData);
  const response = await axiosClient.patch<T>(endpoint, body, {
    headers: mergedHeaders,
    params,
  });
  return response.data;
};

/**
 * DELETE Request
 * @param endpoint - API endpoint (relative path or from API_ENDPOINTS)
 * @param body - Optional request body or payload (e.g. { ids: [...] })
 * @param headers - Optional new custom headers to attach / override
 * @param params - Optional URL query parameters
 */
export const apiDelete = async <T = any>(
  endpoint: string,
  body?: any,
  headers?: Record<string, string>,
  params?: Record<string, any>
): Promise<T> => {
  const mergedHeaders = buildHeadersWithToken(headers);
  const response = await axiosClient.delete<T>(endpoint, {
    data: body,
    headers: mergedHeaders,
    params,
  });
  return response.data;
};

/**
 * Unified CRUD API Client Object
 */
export const apiClient = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
};

export default axiosClient;
