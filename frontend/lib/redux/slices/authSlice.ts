import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "@/lib/api";
import { SignInFormData, SignUpFormData, SignUpPayload } from "@/lib/validations/auth";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  industry?: string;
  fleetSize?: string;
}

export type AuthPayload =
  | { user: UserProfile; token: string }
  | (UserProfile & { token: string });

const extractUserAndToken = (
  payload: AuthPayload
): { user: UserProfile; token: string } => {
  if ("user" in payload) {
    return { user: payload.user, token: payload.token };
  }
  const { token, ...userFields } = payload;
  return { user: userFields as UserProfile, token };
};

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastLoginTime: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastLoginTime: null,
};

/**
 * Async Thunk: Sign in user (UI-Only Mode: Zero backend API calls until backend is connected)
 */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: SignInFormData) => {
    // UI-Only Mode: Simulating instant enterprise authentication without network calls
    await new Promise((resolve) => setTimeout(resolve, 300));
    const lowerEmail = credentials.email.toLowerCase().trim();

    // 1. Check if Superadmin dummy credentials
    if (
      lowerEmail === "superadmin@ayantrai.com" ||
      lowerEmail.includes("superadmin")
    ) {
      const superUser: UserProfile = {
        id: "SA-001",
        name: "Dr. Vikram Seth",
        email: credentials.email,
        role: "Superadmin",
        company: "AyantrAI HQ Governance",
        industry: "Enterprise Industrial Safety",
        fleetSize: "4 Sites / 426 Chipsets",
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("sitesafe_user", JSON.stringify(superUser));
          localStorage.setItem("sitesafe_token", "superadmin-session-token");
        } catch (e) {}
      }
      return {
        user: superUser,
        token: "superadmin-session-token",
      };
    }

    // 2. Check if created Admin exists in localStorage
    if (typeof window !== "undefined") {
      try {
        const storedAdmins = localStorage.getItem("ayantrai_admins");
        if (storedAdmins) {
          const adminsList = JSON.parse(storedAdmins);
          const matchedAdmin = adminsList.find(
            (a: any) => a.email.toLowerCase().trim() === lowerEmail
          );
          if (matchedAdmin) {
            const adminUser: UserProfile = {
              id: matchedAdmin.id,
              name: matchedAdmin.name,
              email: matchedAdmin.email,
              role: "Site Admin",
              company: matchedAdmin.assigned_site,
              industry: "Infrastructure & Heavy Civil",
              fleetSize: "Site-Scoped Operations",
            };
            localStorage.setItem("sitesafe_user", JSON.stringify(adminUser));
            localStorage.setItem("sitesafe_token", "admin-session-token-" + matchedAdmin.id);
            return {
              user: adminUser,
              token: "admin-session-token-" + matchedAdmin.id,
            };
          }
        }
      } catch (e) {}
    }

    // 3. Fallback generic site user
    const namePart = credentials.email.split("@")[0].replace(/[._]/g, " ");
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const genericUser: UserProfile = {
      id: "usr-" + Math.random().toString(36).substring(2, 9),
      name: formattedName || "Site Administrator",
      email: credentials.email,
      role: "Site Admin",
      company: "Nx-One Tower Pilot Site",
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sitesafe_user", JSON.stringify(genericUser));
        localStorage.setItem("sitesafe_token", "generic-session-token");
      } catch (e) {}
    }

    return {
      user: genericUser,
      token: "mock-jwt-token-" + Date.now(),
    };
  }
);

/**
 * Async Thunk: Register enterprise site (UI-Only Mode: Zero backend API calls until backend is connected)
 */
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData: SignUpFormData | SignUpPayload) => {
    // UI-Only Mode: Simulating instant site registration without network calls
    await new Promise((resolve) => setTimeout(resolve, 400));

    const companyVal =
      ("companyName" in formData ? formData.companyName : (formData as any).company) ||
      "Industrial Partner Site";

    return {
      user: {
        id: "usr-" + Math.random().toString(36).substring(2, 9),
        name: formData.name || "Site Lead",
        email: formData.email,
        role: formData.role || "Operations Manager",
        company: companyVal,
        industry: formData.industry,
        fleetSize: formData.fleetSize,
      },
      token: "mock-jwt-token-" + Date.now(),
    };
  }
);

/**
 * Async Thunk: Terminate session (UI-Only Mode: Zero backend API calls)
 */
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  if (typeof window !== "undefined") {
    localStorage.removeItem("sitesafe_token");
  }
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Synchronous actions (support both nested { user, token } and flat { id, name, ..., token })
    loginSuccess: (state, action: PayloadAction<AuthPayload>) => {
      const { user, token } = extractUserAndToken(action.payload);
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = user;
      state.token = token;
      state.error = null;
      state.lastLoginTime = new Date().toISOString();
      if (typeof window !== "undefined") {
        localStorage.setItem("sitesafe_token", token);
      }
    },
    registerSuccess: (state, action: PayloadAction<AuthPayload>) => {
      const { user, token } = extractUserAndToken(action.payload);
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = user;
      state.token = token;
      state.error = null;
      state.lastLoginTime = new Date().toISOString();
      if (typeof window !== "undefined") {
        localStorage.setItem("sitesafe_token", token);
      }
    },
    restoreSession: (state) => {
      if (typeof window !== "undefined") {
        try {
          const storedUser = localStorage.getItem("sitesafe_user");
          const storedToken = localStorage.getItem("sitesafe_token");
          if (storedUser) {
            state.user = JSON.parse(storedUser);
            state.token = storedToken || "session-token";
            state.isAuthenticated = true;
          }
        } catch (e) {}
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.lastLoginTime = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("sitesafe_token");
        localStorage.removeItem("sitesafe_user");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handling loginUser Async Thunk
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        state.lastLoginTime = new Date().toISOString();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Handling registerUser Async Thunk
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        state.lastLoginTime = new Date().toISOString();
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Handling logoutUser Async Thunk
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.lastLoginTime = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("sitesafe_token");
        localStorage.removeItem("sitesafe_user");
      }
    });
  },
});

export const { loginSuccess, registerSuccess, restoreSession, logout, clearError } =
  authSlice.actions;

export default authSlice.reducer;
