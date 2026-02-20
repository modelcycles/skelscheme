import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardSidebar from "./dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(id, name)")
    .eq("user_id", user.id);

  const workspaces =
    memberships?.map((m: any) => m.workspaces).filter(Boolean) ?? [];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#ffffff",
        overflow: "hidden",
      }}
    >
      <DashboardSidebar workspaces={workspaces} userEmail={user.email ?? ""} />
      <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
    </div>
  );
}
