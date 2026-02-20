import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Chat from "./chat";
import Sidebar from "./sidebar";

export default async function WorkspacePage({
  params,
}: {
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
      style={{ display: "flex", height: "100vh", backgroundColor: "#36393f" }}
    >
      <Sidebar
        workspaceId={id}
        workspaceName={workspace.name}
        projects={projects ?? []}
        userEmail={user.email ?? ""}
        userId={user.id}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #26282c",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#36393f",
            boxShadow: "0 1px 0 rgba(0,0,0,0.2)",
          }}
        >
          <span style={{ color: "#72767d", fontSize: "18px" }}>#</span>
          <span style={{ color: "white", fontWeight: 600, fontSize: "15px" }}>
            일반
          </span>
        </div>

        <Chat workspaceId={id} currentUserId={user.id} />
      </div>
    </div>
  );
}
