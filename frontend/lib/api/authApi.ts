import axiosClient, { apiGet, clearApiCache } from "./axiosClient";
import { API_ENDPOINTS } from "./endpoints";
import { SignInFormData, SignUpFormData, SignUpPayload } from "@/lib/validations/auth";
import { UserProfile } from "@/lib/redux/slices/authSlice";

export interface AuthResponse {
  user: UserProfile;
  token: string;
  message?: string;
}

/**
 * Centralized Auth API Service using Axios
 */
export const authApi = {
  /**
   * POST /auth/login - Authenticate user credentials
   */
  login: async (credentials: SignInFormData): Promise<AuthResponse> => {
    const response = await axiosClient.post<any>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    const resPayload = response.data?.data || response.data;
    if (typeof window !== "undefined" && resPayload?.token) {
      localStorage.setItem("sitesafe_token", resPayload.token);
      if (resPayload.user) {
        localStorage.setItem("sitesafe_user", JSON.stringify(resPayload.user));
      }
    }
    return {
      user: resPayload.user,
      token: resPayload.token,
      message: response.data?.message || "Signed in successfully",
    };
  },

  /**
   * POST /auth/register - Provision new enterprise site account
   */
  register: async (data: SignUpFormData | SignUpPayload): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    if (typeof window !== "undefined" && response.data.token) {
      localStorage.setItem("sitesafe_token", response.data.token);
    }
    return response.data;
  },

  /**
   * GET /auth/me - Fetch authenticated user profile
   * Uses 2-minute in-memory cache and in-flight request deduplication to prevent redundant calls.
   */
  getCurrentUser: async (forceRefresh: boolean = false): Promise<UserProfile> => {
    const data = await apiGet<{ user: UserProfile } | UserProfile>(
      API_ENDPOINTS.AUTH.ME,
      undefined,
      undefined,
      { ttlMs: 120000, forceRefresh }
    );
    const resPayload = (data as any)?.data || (data as any)?.user || data;
    return resPayload;
  },

  /**
   * POST /auth/logout - Terminate session & clear cached API states
   */
  logout: async (): Promise<void> => {
    try {
      await axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (e) {
      // ignore
    } finally {
      clearApiCache();
      if (typeof window !== "undefined") {
        localStorage.removeItem("sitesafe_token");
        localStorage.removeItem("sitesafe_user");
      }
    }
  },
};

export default authApi;
