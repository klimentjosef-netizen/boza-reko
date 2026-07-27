"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Member = { id: string; role: string; profile_id?: string; profile: { full_name: string; role: string } };
type Person = { id: string; full_name: string; role: string };

const STATUSES = [
  { key: "draft", label: "Návrh" },
  { key: "offer", label: "Nabídka" },
  { key: "active", label: "Aktivní" },
  { key: "paused", label: "Pozastaveno" },
  { key: "completed", label: "Dokončeno" },
  { key: "cancelled", label: "Zrušeno" },
];

const inputStyle: React.CSSProperties = {
  background: "#fff", border: "1px solid var(--border)", borderRadius: "2px",
  padding: "0.45rem 0.6rem", fontSize: "0.82rem", width: "100%", boxSizing: "border-box",
  fontFamily: "var(--ff-body)", outline: "none",
};
const labelStyle: React.CSSProperties = {
  fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em",
  color: "var(--muted)", marginBottom: "0.25rem", display: "block",
};

export default function ProjectAdminPanel({
  project,
  members,
  workers,
  clients,
}: {
  project: { id: string; status: string; start_date: string | null; end_date: string | null; client_id: string | null };
  members: Member[];
  workers: Person[];
  clients: Person[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [status, setStatus] = useState(project.status);
  const [start, setStart] = useState(project.start_date || "");
  const [end, setEnd] = useState(project.end_date || "");
  const [clientId, setClientId] = useState(project.client_id || "");
  const [team, setTeam] = useState<Member[]>(members);
  const [addWorker, setAddWorker] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function saveField(patch: Record<string, unknown>, msg = "Uloženo") {
    const { error } = await supabase.from("projects").update(patch).eq("id", project.id);
    if (error) { alert("Chyba: " + error.message); return; }
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(""), 1500);
    router.refresh();
  }

  async function assignWorker() {
    if (!addWorker) return;
    const { data, error } = await supabase.from("project_members")
      .insert({ project_id: project.id, profile_id: addWorker, role: "worker" })
      .select("*, profile:profiles(full_name, role)").single();
    if (error) { alert("Chyba: " + error.message); return; }
    setTeam((p) => [...p, data as Member]);
    setAddWorker("");
  }

  async function removeMember(m: Member) {
    setTeam((p) => p.filter((x) => x.id !== m.id));
    await supabase.from("project_members").delete().eq("id", m.id);
  }

  async function deleteProject() {
    if (!confirm("Opravdu SMAZAT celou zakázku? Smažou se i rozpočty, milníky, fotky, zprávy a cashflow záznamy této zakázky. Nelze vzít zpět.")) return;
    setDeleting(true);
    const { error } = await supabase.from("projects").delete().eq("id", project.id);
    if (error) {
      setDeleting(false);
      alert("Smazání se nezdařilo: " + error.message);
      return;
    }
    router.push("/portal/projekty");
    router.refresh();
  }

  const teamIds = new Set(team.map((m) => m.profile_id));
  const availableWorkers = workers.filter((w) => !teamIds.has(w.id));

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "4px", padding: "1.5rem", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1rem", margin: 0 }}>⚙️ SPRÁVA PROJEKTU</h3>
        {savedMsg && <span style={{ fontSize: "0.72rem", color: "#2a8a4a" }}>✓ {savedMsg}</span>}
      </div>

      <div style={{ marginBottom: "0.9rem" }}>
        <label style={labelStyle}>Stav</label>
        <select value={status} onChange={(e) => { setStatus(e.target.value); saveField({ status: e.target.value }); }} style={{ ...inputStyle, cursor: "pointer" }}>
          {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      <div className="pap-dates" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "0.9rem" }}>
        <div>
          <label style={labelStyle}>Zahájení</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} onBlur={() => saveField({ start_date: start || null })} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Ukončení</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} onBlur={() => saveField({ end_date: end || null })} style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={labelStyle}>Klient</label>
        <select value={clientId} onChange={(e) => { setClientId(e.target.value); saveField({ client_id: e.target.value || null }); }} style={{ ...inputStyle, cursor: "pointer" }}>
          <option value="">— bez klienta —</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Tým (řemeslníci)</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "0.5rem" }}>
          {team.length === 0 && <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Nikdo nepřiřazen.</span>}
          {team.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", padding: "0.25rem 0" }}>
              <span>{m.profile?.full_name || "—"}</span>
              <button onClick={() => removeMember(m)} title="Odebrat" style={{ background: "none", border: "none", color: "#9a4a2a", cursor: "pointer", fontSize: "1rem" }}>×</button>
            </div>
          ))}
        </div>
        {availableWorkers.length > 0 && (
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <select value={addWorker} onChange={(e) => setAddWorker(e.target.value)} style={{ ...inputStyle, cursor: "pointer", flex: 1 }}>
              <option value="">+ Přidat řemeslníka…</option>
              {availableWorkers.map((w) => <option key={w.id} value={w.id}>{w.full_name}</option>)}
            </select>
            <button onClick={assignWorker} disabled={!addWorker} style={{ background: "var(--gold)", color: "#fff", border: "none", borderRadius: "2px", padding: "0 0.9rem", fontSize: "0.8rem", cursor: "pointer", fontFamily: "var(--ff-body)" }}>Přidat</button>
          </div>
        )}
      </div>

      {/* Nebezpečná zóna — smazání zakázky */}
      <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
        <button
          onClick={deleteProject}
          disabled={deleting}
          style={{
            width: "100%",
            background: "none",
            border: "1px solid #d8b0a4",
            color: "#9a4a2a",
            borderRadius: "2px",
            padding: "0.5rem 0.9rem",
            fontSize: "0.8rem",
            fontWeight: 500,
            cursor: deleting ? "wait" : "pointer",
            fontFamily: "var(--ff-body)",
          }}
        >
          {deleting ? "Mažu…" : "🗑 Smazat zakázku"}
        </button>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .pap-dates { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
