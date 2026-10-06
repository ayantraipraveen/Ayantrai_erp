/**
 * Centralized API Endpoint Constants for Sitesafe ERP by AyantrAI
 * 
 * Single Source of Truth for all frontend API endpoints.
 * All route paths are relative to baseURL (/api/v1).
 * 
 * Usage:
 * import { API_ENDPOINTS } from "@/lib/api";
 * axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
 */

export const API_ENDPOINTS = {
  // System Health & Diagnostics
  HEALTH: {
    CHECK: "/health",
  },

  // Authentication & Session Management
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
  },

  // Users & Personnel Administration
  USERS: {
    BASE: "/users",
    BY_ID: (id: string) => `/users/${id}`,
    STATUS: (id: string) => `/users/${id}/status`,
    UPDATE_ROLE: (id: string) => `/users/${id}/role`,
    AVATAR: (id: string) => `/users/${id}/avatar`,
  },

  // Roles & RBAC Permissions
  ROLES: {
    BASE: "/roles",
    BY_ID: (id: string) => `/roles/${id}`,
    PERMISSIONS: "/roles/permissions",
  },
  PERMISSIONS: {
    BASE: "/permissions",
  },

  // Industrial Sites & Geofences
  SITES: {
    BASE: "/sites",
    BY_ID: (id: string) => `/sites/${id}`,
    ASSIGN_USERS: (id: string) => `/sites/${id}/users`,
    ZONES: (id: string) => `/sites/${id}/zones`,
  },

  // Hardware Chipsets & Telemetry Streams (Helmet, Vest, Boot)
  TELEMETRY: {
    BASE: "/telemetry",
    REALTIME: "/telemetry/realtime",
    BY_SITE: (siteId: string) => `/telemetry/site/${siteId}`,
    ALERTS: "/telemetry/alerts",
    STATS: "/telemetry/stats",
  },

  // Report Module (Canvas Studio & Templates)
  TEMPLATES: {
    BASE: "/templates",
    BY_ID: (id: string) => `/templates/${id}`,
    CLONE: (id: string) => `/templates/${id}/clone`,
    SECTIONS: (id: string) => `/templates/${id}/sections`,
    PUBLISH: (id: string) => `/templates/${id}/publish`,
  },
  SECTIONS: {
    BASE: "/sections",
    BY_ID: (id: string) => `/sections/${id}`,
    REORDER: "/sections/reorder",
    TYPES: "/sections/types",
  },
  WATERMARKS: {
    BASE: "/watermarks",
    BY_ID: (id: string) => `/watermarks/${id}`,
  },
  REPORTS: {
    BASE: "/reports",
    BY_ID: (id: string) => `/reports/${id}`,
    GENERATE: "/reports/generate",
    EXPORT: (id: string) => `/reports/${id}/export`,
  },

  // Audit Logs & Security History
  ACTIVITY_LOG: {
    BASE: "/activity-log",
    BY_USER: (userId: string) => `/activity-log/user/${userId}`,
    BY_SITE: (siteId: string) => `/activity-log/site/${siteId}`,
  },

  // System & Organization Settings
  SETTINGS: {
    BASE: "/settings",
    COMPANY: "/settings/company",
    NOTIFICATIONS: "/settings/notifications",
  },
} as const;

export default API_ENDPOINTS;
