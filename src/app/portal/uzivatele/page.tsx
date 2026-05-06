import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import UsersManager from "@/components/portal/UsersManager";

export default async function UsersPage() {
  await requireRole("owner");
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .order("name");

  return <UsersManager users={users || []} projects={projects || []} />;
}
