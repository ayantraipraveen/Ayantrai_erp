import React from "react";
import { WorkspaceLayout } from "../Component";

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
