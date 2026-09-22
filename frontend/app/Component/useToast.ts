"use client";

import { useAppDispatch } from "@/lib/redux/hooks";
import { showGlobalToast, clearGlobalToast } from "@/lib/redux/slices/reportModuleSlice";

/**
 * Universal Global Toast Hook.
 * Provides a clean, ergonomic API to trigger toast messages across the ERP without local state.
 *
 * Usage:
 * ```tsx
 * const toast = useToast();
 * toast.success("Template approved!");
 * toast.error("Action failed");
 * toast.warning("Session expiring soon");
 * toast.show("Custom notification");
 * ```
 */
export function useToast() {
  const dispatch = useAppDispatch();

  return {
    show: (message: string, duration?: number) =>
      dispatch(showGlobalToast({ message, type: "info", duration })),
    info: (message: string, duration?: number) =>
      dispatch(showGlobalToast({ message, type: "info", duration })),
    success: (message: string, duration?: number) =>
      dispatch(showGlobalToast({ message, type: "success", duration })),
    error: (message: string, duration?: number) =>
      dispatch(showGlobalToast({ message, type: "error", duration })),
    warning: (message: string, duration?: number) =>
      dispatch(showGlobalToast({ message, type: "warning", duration })),
    clear: () => dispatch(clearGlobalToast()),
  };
}
