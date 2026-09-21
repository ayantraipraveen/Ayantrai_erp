import { z } from "zod";

/**
 * Enterprise Sitesafe Sign In Validation Schema
 * Validates corporate email addresses or Operator IDs (e.g. EMP-1092)
 */
export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Work email or Operator ID is required")
    .refine(
      (val) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        const isOperatorId = /^[A-Za-z0-9_-]{3,25}$/.test(val);
        return isEmail || isOperatorId;
      },
      { message: "Enter a valid work email or Operator ID (e.g. EMP-1092)" }
    ),
  password: z
    .string()
    .min(1, "Security password is required")
    .min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export type SignInFormData = z.infer<typeof signInSchema>;

/**
 * Enterprise Sitesafe Pilot Site Onboarding Schema
 * Validates enterprise organization credentials, sector, role, fleet size, and credentials
 */
export const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters")
      .max(60, "Name cannot exceed 60 characters"),
    email: z
      .string()
      .trim()
      .min(1, "Work email is required")
      .email("Enter a valid enterprise email (e.g. name@company.com)"),
    company: z
      .string()
      .trim()
      .min(1, "Company / Entity name is required")
      .min(2, "Company name must be at least 2 characters"),
    industry: z.string().min(1, "Please select an industry sector"),
    role: z.string().min(1, "Please select your primary role"),
    fleetSize: z.string().min(1, "Please select target fleet size"),
    password: z
      .string()
      .min(1, "Security password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include at least 1 uppercase letter")
      .regex(/[0-9]/, "Must include at least 1 number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the Sitesafe Telemetry Policy & EHS audit terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

/**
 * API submission payload type: Allows omitting client-side confirmation & checkbox fields
 */
export type SignUpPayload = Omit<SignUpFormData, "confirmPassword"> & {
  confirmPassword?: string;
  agreeTerms?: boolean;
};
