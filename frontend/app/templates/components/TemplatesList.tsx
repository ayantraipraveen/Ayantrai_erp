"use client";

import React from "react";
import { Layers } from "lucide-react";
import { useTemplates } from "./TemplatesContext";
import TemplatesTable from "./TemplatesTable";
import TemplatesGrid from "./TemplatesGrid";

/**
 * Main templates list container.
 * Takes ZERO props - handles empty state and switches between Table & Grid views based on context.
 */
export default function TemplatesList() {
  const { viewMode } = useTemplates();

  return viewMode === "table" ? <TemplatesTable /> : <TemplatesGrid />;
}
