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
    await new Promise((resolve) => setTimeout(resolve, 350));
    const namePart = credentials.email.split("@")[0].replace(/[._]/g, " ");
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    return {
      user: {
        id: "usr-" + Math.random().toString(36).substring(2, 9),
        name: formattedName || "Site Administrator",
        email: credentials.email,
        role: "Safety Head / EHS",
        company: "AyantrAI Enterprise Partner",
      },
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
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.lastLoginTime = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("sitesafe_token");
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
    });
  },
});

export const { loginSuccess, registerSuccess, logout, clearError } =
  authSlice.actions;

export default authSlice.reducer;
