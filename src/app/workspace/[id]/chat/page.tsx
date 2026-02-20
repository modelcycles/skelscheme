import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Chat from "../chat";

export default async function ChatPage({
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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #e5e5e3",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "#ffffff",
        }}
      >
        <span style={{ fontSize: "16px" }}>💬</span>
        <span style={{ fontWeight: 600, fontSize: "15px", color: "#1a1a1a" }}>
          일반
        </span>
      </div>
      <Chat workspaceId={id} currentUserId={user.id} />
    </div>
  );
}
