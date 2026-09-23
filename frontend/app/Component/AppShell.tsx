"use client";

import React from "react";
import { usePathname } from "next/navigation";
import WorkspaceLayout from "./WorkspaceLayout";

const PUBLIC_ROUTES = ["/signin", "/signup"];

/**
 * AppShell provides a persistent root shell for authenticated workspace routes.
 * It prevents the WorkspaceLayout, Sidebar, Navbar, and auth-verification state
 * from unmounting/re-mounting on every page navigation.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Public/Auth routes don't mount the WorkspaceLayout shell
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublicRoute) {
    return <>{children}</>;
  }

  // All authenticated workspace routes share the same persistent WorkspaceLayout shell.
  // This guarantees that the Sidebar, Navbar, and layout state persist without unmounting
  // when navigating between pages, only loading the active page component.
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
