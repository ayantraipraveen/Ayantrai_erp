"use client";

import React from "react";
import { GlobalToast } from "../../Component";

/**
 * Toast feedback banner for Templates module.
 * Global toast notifications are centrally managed and rendered via `WorkspaceLayout`.
 * This component remains available for backwards compatibility and standalone rendering.
 */
export default function TemplateToast() {
  // GlobalToast is automatically mounted inside WorkspaceLayout at the application root level.
  return null;
}
