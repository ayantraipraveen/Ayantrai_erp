import { WorkspaceLayout } from "../Component";

export default function AdminsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
