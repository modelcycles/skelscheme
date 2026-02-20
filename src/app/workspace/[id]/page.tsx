import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createProject } from "../../actions";

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
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <a
          href="/dashboard"
          className="text-sm text-gray-400 hover:text-black mb-4 inline-block"
        >
          ← 대시보드
        </a>
        <h1 className="text-2xl font-bold mb-8">{workspace.name}</h1>

        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          프로젝트
        </h2>

        <div className="flex flex-col gap-2 mb-6">
          {projects && projects.length > 0 ? (
            projects.map((p: any) => (
              <a
                key={p.id}
                href={`/workspace/${id}/project/${p.id}`}
                className="bg-white border rounded-xl px-5 py-4 text-sm font-medium hover:border-black transition-colors"
              >
                {p.name}
              </a>
            ))
          ) : (
            <p className="text-gray-400 text-sm">아직 프로젝트가 없어요</p>
          )}
        </div>
      </div>
      <form action={createProject} className="flex gap-2">
        <input type="hidden" name="workspaceId" value={id} />
        <input
          name="name"
          placeholder="새 프로젝트 이름"
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
    </main>
  );
}
