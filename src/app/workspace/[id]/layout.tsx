import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GlobalSidebar from "./global-sidebar";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", id)
    .single();

  if (!workspace) redirect("/dashboard");

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", id);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#ffffff",
        overflow: "hidden",
      }}
    >
      <GlobalSidebar
        workspaceId={id}
        workspaceName={workspace.name}
        projects={projects ?? []}
        userEmail={user.email ?? ""}
      />
      <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
    </div>
  );
}
