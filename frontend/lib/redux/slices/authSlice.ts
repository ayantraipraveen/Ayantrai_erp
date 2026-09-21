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
 * Async Thunk: Sign in user through centralized Axios authApi
 */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: SignInFormData, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to sign in");
    }
  }
);

/**
 * Async Thunk: Register enterprise site through centralized Axios authApi
 */
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData: SignUpFormData | SignUpPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.register(formData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create account");
    }
  }
);

/**
 * Async Thunk: Terminate session through centralized Axios authApi
 */
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await authApi.logout();
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
