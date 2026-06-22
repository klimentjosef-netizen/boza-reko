import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProjectDetail from "@/components/portal/ProjectDetail";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", id)
    .order("sort_order");

  const { data: photos } = await supabase
    .from("project_photos")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: members } = await supabase
    .from("project_members")
    .select("*, profile:profiles(*)")
    .eq("project_id", id);

  const { data: budgets } = await supabase
    .from("budgets")
    .select("id, name, status, quality_level, margin_percent, items, total_net, total_gross, notes")
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .limit(1);
  const budget = budgets?.[0] || null;

  // Majitel: seznam řemeslníků a klientů pro správu projektu
  let workers: { id: string; full_name: string; role: string }[] = [];
  let clients: { id: string; full_name: string; role: string }[] = [];
  if (profile.role === "owner") {
    const { data: people } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("role", ["worker", "client"])
      .order("full_name");
    workers = (people || []).filter((p) => p.role === "worker");
    clients = (people || []).filter((p) => p.role === "client");
  }

  return (
    <ProjectDetail
      project={project}
      milestones={milestones || []}
      photos={photos || []}
      members={members || []}
      userRole={profile.role}
      profileId={profile.id}
      workers={workers}
      clients={clients}
      budget={budget}
    />
  );
}
