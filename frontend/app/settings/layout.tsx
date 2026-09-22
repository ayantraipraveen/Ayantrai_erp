import { WorkspaceLayout } from "../Component";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
