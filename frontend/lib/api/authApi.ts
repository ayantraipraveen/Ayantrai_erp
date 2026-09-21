import axiosClient from "./axiosClient";
import { SignInFormData, SignUpFormData, SignUpPayload } from "@/lib/validations/auth";
import { UserProfile } from "@/lib/redux/slices/authSlice";

export interface AuthResponse {
  user: UserProfile;
  token: string;
  message?: string;
}

/**
 * Helper to simulate realistic network delay and mock user profile
 * when backend API server is offline or in development prototype mode.
 */
const simulateDelay = (ms: number = 650) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Centralized Auth API Service using Axios
 */
export const authApi = {
  /**
   * POST /auth/login - Authenticate user credentials
   */
  login: async (credentials: SignInFormData): Promise<AuthResponse> => {
    try {
      const response = await axiosClient.post<AuthResponse>(
        "/auth/login",
        credentials
      );
      if (typeof window !== "undefined" && response.data.token) {
        localStorage.setItem("sitesafe_token", response.data.token);
      }
      return response.data;
    } catch (error: any) {
      // If live backend is not reachable (network error), fallback to simulation
      if (!error.response || error.code === "ERR_NETWORK") {
        await simulateDelay();
        const simulatedToken = "jwt_sitesafe_" + Math.random().toString(36).substring(2);
        const namePart = credentials.email.split("@")[0].replace(".", " ");
        const simulatedUser: UserProfile = {
          id: `usr_${Date.now()}`,
          name: namePart
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          email: credentials.email,
          role: "Safety Head / EHS",
          company: "Industrial Site Operator",
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("sitesafe_token", simulatedToken);
        }

        return {
          user: simulatedUser,
          token: simulatedToken,
          message: "Signed in successfully (Development Mode)",
        };
      }
      throw error;
    }
  },

  /**
   * POST /auth/register - Provision new enterprise site account
   */
  register: async (data: SignUpFormData | SignUpPayload): Promise<AuthResponse> => {
    try {
      const response = await axiosClient.post<AuthResponse>(
        "/auth/register",
        data
      );
      if (typeof window !== "undefined" && response.data.token) {
        localStorage.setItem("sitesafe_token", response.data.token);
      }
      return response.data;
    } catch (error: any) {
      // If live backend is not reachable, fallback to simulation
      if (!error.response || error.code === "ERR_NETWORK") {
        await simulateDelay();
        const simulatedToken = "jwt_sitesafe_" + Math.random().toString(36).substring(2);
        const simulatedUser: UserProfile = {
          id: `usr_${Date.now()}`,
          name: data.name,
          email: data.email,
          company: data.company,
          industry: data.industry,
          role: data.role,
          fleetSize: data.fleetSize,
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("sitesafe_token", simulatedToken);
        }

        return {
          user: simulatedUser,
          token: simulatedToken,
          message: "Enterprise workspace provisioned (Development Mode)",
        };
      }
      throw error;
    }
  },

  /**
   * GET /auth/me - Fetch authenticated user profile
   */
  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await axiosClient.get<{ user: UserProfile }>("/auth/me");
    return response.data.user;
  },

  /**
   * POST /auth/logout - Terminate session
   */
  logout: async (): Promise<void> => {
    try {
      await axiosClient.post("/auth/logout");
    } catch (e) {
      // ignore
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("sitesafe_token");
      }
    }
  },
};

export default authApi;
