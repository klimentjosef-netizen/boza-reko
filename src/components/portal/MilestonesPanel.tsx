"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type Milestone = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
};

export default function MilestonesPanel({
  projectId,
  initial,
  canEdit,
}: {
  projectId: string;
  initial: Milestone[];
  canEdit: boolean;
}) {
  const supabase = createClient();
  const [milestones, setMilestones] = useState<Milestone[]>(initial);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");

  const completed = milestones.filter((m) => m.completed_at).length;
  const progress = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;

  async function toggle(m: Milestone) {
    if (!canEdit) return;
    const completed_at = m.completed_at ? null : new Date().toISOString();
    setMilestones((p) => p.map((x) => (x.id === m.id ? { ...x, completed_at } : x)));
    await supabase.from("milestones").update({ completed_at }).eq("id", m.id);
  }

  async function add() {
    if (!title.trim()) return;
    const { data } = await supabase.from("milestones").insert({
      project_id: projectId, title: title.trim(),
      due_date: due || null, sort_order: milestones.length,
    }).select("*").single();
    if (data) setMilestones((p) => [...p, data as Milestone]);
    setTitle(""); setDue(""); setAdding(false);
  }

  async function remove(m: Milestone) {
    if (!confirm(`Smazat milník „${m.title}"?`)) return;
    setMilestones((p) => p.filter((x) => x.id !== m.id));
    await supabase.from("milestones").delete().eq("id", m.id);
  }

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "4px", padding: "1.5rem", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontFamily: "var(--ff-head)", fontSize: "1.2rem", margin: 0 }}>MILNÍKY</h2>
        {milestones.length > 0 && <span style={{ fontSize: "0.8rem", color: "var(--gold)", fontWeight: 500 }}>{progress} %</span>}
      </div>

      {milestones.length > 0 && (
        <div style={{ height: "6px", background: "var(--surface)", borderRadius: "3px", overflow: "hidden", marginBottom: "1rem" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "var(--gold)", borderRadius: "3px", transition: "width 0.4s" }} />
        </div>
      )}

      {milestones.length === 0 && !adding && (
        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Zatím žádné milníky.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {milestones.map((m) => (
          <div key={m.id} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.7rem", background: m.completed_at ? "rgba(42,138,74,0.05)" : "var(--surface)", borderRadius: "4px", border: `1px solid ${m.completed_at ? "rgba(42,138,74,0.15)" : "var(--border)"}` }}>
            <button onClick={() => toggle(m)} disabled={!canEdit} title={canEdit ? "Označit jako dokončené" : ""}
              style={{ width: "20px", height: "20px", borderRadius: "50%", border: `2px solid ${m.completed_at ? "#2a8a4a" : "var(--border)"}`, background: m.completed_at ? "#2a8a4a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px", color: "#fff", fontSize: "0.6rem", cursor: canEdit ? "pointer" : "default", padding: 0 }}>
              {m.completed_at ? "✓" : ""}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.88rem", fontWeight: 500, textDecoration: m.completed_at ? "line-through" : "none", opacity: m.completed_at ? 0.7 : 1 }}>{m.title}</div>
              {m.due_date && <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.2rem" }}>Termín: {new Date(m.due_date).toLocaleDateString("cs-CZ")}</div>}
            </div>
            {canEdit && <button onClick={() => remove(m)} title="Smazat" style={{ background: "none", border: "none", color: "#9a4a2a", cursor: "pointer", fontSize: "1rem" }}>×</button>}
          </div>
        ))}
      </div>

      {canEdit && (
        adding ? (
          <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Název milníku" autoFocus
              style={{ flex: 1, minWidth: "160px", background: "#fff", border: "1px solid var(--border)", borderRadius: "2px", padding: "0.5rem 0.7rem", fontSize: "0.85rem", fontFamily: "var(--ff-body)", outline: "none" }} />
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)}
              style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "2px", padding: "0.5rem", fontSize: "0.85rem", fontFamily: "var(--ff-body)" }} />
            <button onClick={add} style={{ background: "var(--gold)", color: "#fff", border: "none", borderRadius: "2px", padding: "0.5rem 1rem", fontSize: "0.82rem", cursor: "pointer", fontFamily: "var(--ff-body)" }}>Přidat</button>
            <button onClick={() => { setAdding(false); setTitle(""); }} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.82rem" }}>Zrušit</button>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} style={{ marginTop: "0.75rem", background: "none", border: "1px dashed var(--border)", borderRadius: "4px", padding: "0.6rem", width: "100%", color: "var(--muted)", fontSize: "0.82rem", cursor: "pointer", fontFamily: "var(--ff-body)" }}>+ Přidat milník</button>
        )
      )}
    </div>
  );
}
