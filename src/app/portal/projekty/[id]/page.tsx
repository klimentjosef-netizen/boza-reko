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

  return (
    <ProjectDetail
      project={project}
      milestones={milestones || []}
      photos={photos || []}
      members={members || []}
      userRole={profile.role}
      profileId={profile.id}
    />
  );
}
