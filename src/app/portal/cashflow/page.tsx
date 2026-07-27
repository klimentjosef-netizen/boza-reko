import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import CashflowView from "@/components/portal/CashflowView";

export default async function CashflowPage() {
  await requireRole("owner");
  const supabase = await createClient();

  // Get all projects for filter
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status")
    .order("created_at", { ascending: false });

  // Get cashflow entries
  const { data: entries } = await supabase
    .from("cashflow")
    .select("*, project:projects(id, name)")
    .order("date", { ascending: false });

  return (
    <CashflowView
      projects={projects || []}
      entries={entries || []}
    />
  );
}
