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
export const loginUser = createAsyncThunk<
  { user: UserProfile; token: string },
  SignInFormData,
  { rejectValue: string }
>(
  "auth/loginUser",
  async (credentials: SignInFormData, { rejectWithValue }) => {
    // UI-Only Mode: Simulating instant enterprise authentication without network calls
    await new Promise((resolve) => setTimeout(resolve, 350));
    const lowerEmail = credentials.email.toLowerCase().trim();
    const enteredPassword = credentials.password;
    console.log("login credentilas ", credentials)
    // 1. Check Superadmin credentials
    if (
      lowerEmail === "superadmin@ayantrai.com"
    ) {
      if (enteredPassword !== "Sitesafe@2026") {
        return rejectWithValue("Incorrect password for Superadmin account. (Default: Sitesafe@2026)");
      }

      const superUser: UserProfile = {
        id: "SA-001",
        name: "Superadmin",
        email: "[EMAIL_ADDRESS]",
        role: "Superadmin",
        company: "AyantrAI HQ Governance",
        industry: "Enterprise Industrial Safety",
        fleetSize: "4 Sites / 426 Chipsets",
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("sitesafe_user", JSON.stringify(superUser));
          localStorage.setItem("sitesafe_token", "superadmin-session-token");
        } catch (e) { }
      }
      return {
        user: superUser,
        token: "superadmin-session-token",
      };
    }

    // 2. Check Pre-configured Verified Personas
    const verifiedPersonas = [
      {
        email: "vikram.seth@lt-infra.com",
        aliases: ["admin@ayantrai.com", "vikram.seth"],
        name: "Vikram Seth",
        role: "Site Admin",
        company: "Nx-One Tower Pilot Site (Greater Noida)",
        passwords: ["Sitesafe@2026", "Password@123", "Admin@123"],
        id: "adm-1",
      },
      {
        email: "anita.sharma@mumbai-metro.in",
        aliases: ["anita.sharma"],
        name: "Anita Sharma",
        role: "Project Head",
        company: "Metro Line 4 Underground Tunnel (Mumbai)",
        passwords: ["Sitesafe@2026", "Password@123"],
        id: "adm-2",
      },
      {
        email: "rajesh.gupta@hsr-infra.gov.in",
        aliases: ["rajesh.gupta"],
        name: "Rajesh Gupta",
        role: "Site Admin",
        company: "High-Speed Rail Viaduct C-2 (Ahmedabad)",
        passwords: ["Sitesafe@2026", "Password@123"],
        id: "adm-3",
      },
      {
        email: "devendra.k@tata-steel.com",
        aliases: ["devendra.k"],
        name: "Devendra K.",
        role: "Site Admin",
        company: "Steel Plant Blast Furnace Revamp (Jamshedpur)",
        passwords: ["Sitesafe@2026", "Password@123"],
        id: "adm-4",
        status: "Inactive",
      },
    ];

    const matchedPersona = verifiedPersonas.find(
      (p) => p.email === lowerEmail || p.aliases.includes(lowerEmail)
    );

    if (matchedPersona) {
      if (matchedPersona.status === "Inactive") {
        return rejectWithValue("This enterprise account is currently Inactive. Please contact Superadmin.");
      }
      if (!matchedPersona.passwords.includes(enteredPassword)) {
        return rejectWithValue(`Incorrect password for ${matchedPersona.name}. (Default: Sitesafe@2026)`);
      }

      const personaUser: UserProfile = {
        id: matchedPersona.id,
        name: matchedPersona.name,
        email: matchedPersona.email,
        role: matchedPersona.role,
        company: matchedPersona.company,
        industry: "Infrastructure & Heavy Civil",
        fleetSize: "Site-Scoped Operations",
      };

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("sitesafe_user", JSON.stringify(personaUser));
          localStorage.setItem("sitesafe_token", "admin-session-token-" + matchedPersona.id);
        } catch (e) { }
      }

      return {
        user: personaUser,
        token: "admin-session-token-" + matchedPersona.id,
      };
    }

    // 3. Check custom Admins provisioned in localStorage ('ayantrai_admins')
    if (typeof window !== "undefined") {
      try {
        const storedAdmins = localStorage.getItem("ayantrai_admins");
        if (storedAdmins) {
          const adminsList = JSON.parse(storedAdmins);
          const matchedAdmin = adminsList.find(
            (a: any) => a.email && a.email.toLowerCase().trim() === lowerEmail
          );
          if (matchedAdmin) {
            if (matchedAdmin.status === "Inactive" || matchedAdmin.status === "Suspended") {
              return rejectWithValue(`Administrator account for ${matchedAdmin.name} is Inactive. Please contact Superadmin.`);
            }

            const validAdminPasswords = ["Sitesafe@2026", "Password@123", matchedAdmin.password].filter(Boolean);
            if (!validAdminPasswords.includes(enteredPassword)) {
              return rejectWithValue(`Incorrect password for ${matchedAdmin.name}. (Default: Sitesafe@2026)`);
            }

            const adminUser: UserProfile = {
              id: matchedAdmin.id,
              name: matchedAdmin.name,
              email: matchedAdmin.email,
              role: "Site Admin",
              company: matchedAdmin.assigned_site || "Industrial Infrastructure Site",
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
      } catch (e) { }
    }

    // 4. Check registered accounts from /signup in localStorage ('ayantrai_registered_users')
    if (typeof window !== "undefined") {
      try {
        const storedUsers = localStorage.getItem("ayantrai_registered_users");
        if (storedUsers) {
          const usersList = JSON.parse(storedUsers);
          const matchedUser = usersList.find(
            (u: any) => u.email && u.email.toLowerCase().trim() === lowerEmail
          );
          if (matchedUser) {
            if (matchedUser.password && matchedUser.password !== enteredPassword) {
              return rejectWithValue("Incorrect password for registered account.");
            }
            const regUser: UserProfile = {
              id: matchedUser.id || "usr-" + Date.now(),
              name: matchedUser.name,
              email: matchedUser.email,
              role: matchedUser.role || "Site Admin",
              company: matchedUser.company || "Industrial Partner Site",
              industry: matchedUser.industry || "General Industry",
              fleetSize: matchedUser.fleetSize,
            };
            localStorage.setItem("sitesafe_user", JSON.stringify(regUser));
            localStorage.setItem("sitesafe_token", "user-token-" + regUser.id);
            return {
              user: regUser,
              token: "user-token-" + regUser.id,
            };
          }
        }
      } catch (e) { }
    }

    // 5. Unrecognized Credentials -> Strictly Reject
    return rejectWithValue(
      `Access Denied: Unrecognized enterprise credentials for "${credentials.email}". Only verified personnel can access the portal.`
    );
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
        } catch (e) { }
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
