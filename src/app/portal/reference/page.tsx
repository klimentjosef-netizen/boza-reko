import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ReferencesManager from "@/components/portal/ReferencesManager";

export const metadata = { title: "Reference | BOZA REKO" };

export default async function ReferencesAdminPage() {
  await requireRole("owner");
  const supabase = await createClient();
  const { data } = await supabase
    .from("references_projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return <ReferencesManager initial={data || []} />;
}
