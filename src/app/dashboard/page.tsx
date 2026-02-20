import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createWorkspace } from "../actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: workspaces } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(id, name)")
    .eq("user_id", user.id);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Skelscheme</h1>
        <p className="text-gray-500 text-sm mb-8">{user.email}</p>

        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          워크스페이스
        </h2>

        <div className="flex flex-col gap-2 mb-6">
          {workspaces && workspaces.length > 0 ? (
            workspaces.map((w: any) => (
              <a
                key={w.workspace_id}
                href={`/workspace/${w.workspace_id}`}
                className="bg-white border rounded-xl px-5 py-4 text-sm font-medium hover:border-black transition-colors"
              >
                {w.workspaces?.name}
              </a>
            ))
          ) : (
            <p className="text-gray-400 text-sm">아직 워크스페이스가 없어요</p>
          )}
        </div>

        <form action={createWorkspace} className="flex gap-2">
          <input
            name="name"
            placeholder="새 워크스페이스 이름"
            className="flex-1 border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            required
          />
          <button
            type="submit"
            className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800"
          >
            만들기
          </button>
        </form>
      </div>
    </main>
  );
}
