import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data, error } = await supabase.from("workspaces").select("*");

  return (
    <main>
      <h1>Skelscheme</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {error && <p>에러: {error.message}</p>}
    </main>
  );
}
