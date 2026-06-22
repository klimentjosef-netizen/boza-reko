import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWebPush } from "@/lib/push";

export const maxDuration = 30;

// Sestaví titulek/text notifikace podle typu události
function buildMessage(type: string, actorName: string, projectName: string, preview?: string) {
  switch (type) {
    case "message":
      return { title: `Nová zpráva — ${projectName}`, body: `${actorName}: ${preview || ""}`.slice(0, 140) };
    case "budget":
      return { title: `Nový rozpočet — ${projectName}`, body: `${actorName} připravil rozpočet k projektu` };
    case "photo":
      return { title: `Nové fotky — ${projectName}`, body: `${actorName} nahrál fotodokumentaci` };
    case "milestone":
      return { title: `Milník — ${projectName}`, body: preview || `${actorName} aktualizoval milníky` };
    default:
      return { title: projectName, body: preview || "Aktualizace projektu" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { project_id, type, preview } = await req.json();
    if (!project_id || !type) return NextResponse.json({ error: "Chybí parametry" }, { status: 400 });

    const admin = createAdminClient();

    // Projekt + odesílatel
    const [{ data: project }, { data: actor }] = await Promise.all([
      admin.from("projects").select("id, name, client_id").eq("id", project_id).single(),
      admin.from("profiles").select("full_name").eq("id", user.id).single(),
    ]);
    if (!project) return NextResponse.json({ error: "Projekt nenalezen" }, { status: 404 });

    // Příjemci = všichni majitelé + klient projektu + přiřazení řemeslníci, mimo odesílatele
    const [{ data: owners }, { data: members }] = await Promise.all([
      admin.from("profiles").select("id").eq("role", "owner"),
      admin.from("project_members").select("profile_id").eq("project_id", project_id),
    ]);

    const recipientIds = new Set<string>();
    (owners || []).forEach((o) => recipientIds.add(o.id));
    if (project.client_id) recipientIds.add(project.client_id);
    (members || []).forEach((m) => m.profile_id && recipientIds.add(m.profile_id));
    recipientIds.delete(user.id); // ne sobě

    if (recipientIds.size === 0) return NextResponse.json({ success: true, sent: 0 });

    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("endpoint, subscription")
      .in("profile_id", Array.from(recipientIds));

    if (!subs || subs.length === 0) return NextResponse.json({ success: true, sent: 0 });

    const msg = buildMessage(type, actor?.full_name || "Někdo", project.name, preview);
    const payload = JSON.stringify({
      title: msg.title,
      body: msg.body,
      url: `/portal/projekty/${project_id}`,
      tag: `project-${project_id}`,
    });

    const webpush = getWebPush();
    let sent = 0;
    const dead: string[] = [];
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(s.subscription as webpushSub, payload);
          sent++;
        } catch (err: unknown) {
          const code = (err as { statusCode?: number }).statusCode;
          if (code === 404 || code === 410) dead.push(s.endpoint); // odběr zaniknul
        }
      })
    );
    if (dead.length) await admin.from("push_subscriptions").delete().in("endpoint", dead);

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error("Push notify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// minimální typ pro web-push subscription
type webpushSub = { endpoint: string; keys: { p256dh: string; auth: string } };
