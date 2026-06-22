import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Zprávy | BOZA REKO" };

type Msg = {
  project_id: string;
  body: string;
  created_at: string;
  sender_id: string | null;
  project?: { name: string; status: string } | null;
  sender?: { full_name: string } | null;
};

export default async function ZpravyInbox() {
  const profile = await getProfile();
  const supabase = await createClient();

  const [{ data: messages }, { data: reads }] = await Promise.all([
    supabase
      .from("project_messages")
      .select("project_id, body, created_at, sender_id, project:projects(name, status), sender:profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("message_reads").select("project_id, last_read_at").eq("profile_id", profile.id),
  ]);

  const readMap = new Map((reads || []).map((r) => [r.project_id, r.last_read_at]));
  const msgs = (messages as unknown as Msg[]) || [];

  // seskup podle projektu: poslední zpráva + počet nepřečtených
  const byProject = new Map<string, { last: Msg; unread: number }>();
  for (const m of msgs) {
    let entry = byProject.get(m.project_id);
    if (!entry) { entry = { last: m, unread: 0 }; byProject.set(m.project_id, entry); }
    const lastRead = readMap.get(m.project_id);
    const isUnread = m.sender_id !== profile.id && (!lastRead || new Date(m.created_at) > new Date(lastRead));
    if (isUnread) entry.unread++;
  }
  const threads = Array.from(byProject.entries())
    .map(([project_id, v]) => ({ project_id, ...v }))
    .sort((a, b) => new Date(b.last.created_at).getTime() - new Date(a.last.created_at).getTime());

  return (
    <div style={{ maxWidth: "760px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "var(--ff-head)", fontSize: "2rem", marginBottom: "0.25rem" }}>ZPRÁVY</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Komunikace ke všem vašim projektům na jednom místě</p>
      </div>

      {threads.length === 0 ? (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "4px", padding: "2.5rem", textAlign: "center", color: "var(--muted)", fontSize: "0.9rem" }}>
          Zatím žádné zprávy. Otevřete projekt a napište první zprávu.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {threads.map((t) => (
            <a key={t.project_id} href={`/portal/projekty/${t.project_id}`}
              style={{ display: "flex", alignItems: "center", gap: "1rem", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "4px", padding: "1rem 1.25rem", textDecoration: "none", color: "inherit" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.2rem" }}>
                  <span style={{ fontWeight: 500, fontSize: "0.92rem" }}>{t.last.project?.name || "Projekt"}</span>
                  {t.unread > 0 && (
                    <span style={{ background: "var(--gold)", color: "#fff", fontSize: "0.65rem", fontWeight: 600, borderRadius: "10px", padding: "0.05rem 0.45rem" }}>{t.unread}</span>
                  )}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <strong style={{ color: "var(--text)", fontWeight: 500 }}>{t.last.sender_id === profile.id ? "Vy" : t.last.sender?.full_name || "—"}:</strong> {t.last.body}
                </div>
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--muted)", flexShrink: 0 }}>
                {new Date(t.last.created_at).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" })}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
