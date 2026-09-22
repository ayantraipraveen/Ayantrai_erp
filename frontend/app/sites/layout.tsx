import { WorkspaceLayout } from "../Component";

export default function SitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
