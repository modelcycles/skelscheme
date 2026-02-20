import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createItem } from "../../../../actions";
import Views from "./views";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { id, projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!project) redirect(`/workspace/${id}`);

  const { data: statuses } = await supabase
    .from("statuses")
    .select("*")
    .eq("project_id", projectId)
    .order("order");

  const { data: items } = await supabase
    .from("items")
    .select(
      "id, title, description, status_id, priority, start_at, end_at, start_includes_time, end_includes_time, order",
    )
    .eq("project_id", projectId)
    .is("parent_id", null)
    .order("order");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-8 py-4 flex items-center gap-4">
        <a
          href={`/workspace/${id}`}
          className="text-sm text-gray-400 hover:text-black"
        >
          ← 워크스페이스
        </a>
        <h1 className="text-lg font-bold">{project.name}</h1>
      </div>

      <div className="p-8">
        <form action={createItem} className="flex gap-2 mb-6">
          <input type="hidden" name="projectId" value={projectId} />
          <input
            type="hidden"
            name="statusId"
            value={statuses?.[0]?.id ?? ""}
          />
          <input
            name="title"
            placeholder="새 아이템 추가..."
            className="flex-1 border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            required
          />
          <button
            type="submit"
            className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800"
          >
            추가
          </button>
        </form>

        <Views statuses={statuses ?? []} items={items ?? []} />
      </div>
    </main>
  );
}
