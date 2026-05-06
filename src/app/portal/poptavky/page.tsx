import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import LeadsManager from "@/components/portal/LeadsManager";

export default async function LeadsPage() {
  await requireRole("owner");
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return <LeadsManager leads={leads || []} />;
}
