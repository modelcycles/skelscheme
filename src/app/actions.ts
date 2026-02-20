"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createWorkspace(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = formData.get("name") as string;

  // profiles 먼저 등록 (workspaces가 profiles를 참조하므로)
  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
  });

  const { data, error } = await supabase
    .from("workspaces")
    .insert({ name, owner_id: user.id })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("workspace_members").insert({
    workspace_id: data.id,
    user_id: user.id,
    role: "admin",
  });

  revalidatePath("/dashboard");
  redirect(`/workspace/${data.id}`);
}

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const workspaceId = formData.get("workspaceId") as string;

  const { data, error } = await supabase
    .from("projects")
    .insert({ name, workspace_id: workspaceId })
    .select()
    .single();

  if (error) throw error;

  // 기본 상태 자동 생성
  await supabase.from("statuses").insert([
    { project_id: data.id, name: "할 일", color: "#6B7280", order: 0 },
    { project_id: data.id, name: "진행 중", color: "#3B82F6", order: 1 },
    { project_id: data.id, name: "완료", color: "#22C55E", order: 2 },
  ]);

  revalidatePath(`/workspace/${workspaceId}`);
  redirect(`/workspace/${workspaceId}/project/${data.id}`);
}

export async function createItem(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const projectId = formData.get("projectId") as string;
  const statusId = formData.get("statusId") as string;

  const { error } = await supabase.from("items").insert({
    title,
    project_id: projectId,
    status_id: statusId || null,
    assignee_id: user.id,
  });

  if (error) throw error;

  revalidatePath(`/workspace`);
}
