import { WorkspaceLayout } from "../Component";

export default function ActivityLogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
