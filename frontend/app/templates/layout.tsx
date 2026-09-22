import { WorkspaceLayout } from "../Component";

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
