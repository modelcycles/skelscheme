import { createSupabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">대시보드</h1>
      <p className="text-gray-500 mt-2">{user.email} 으로 로그인됨</p>
    </main>
  );
}
