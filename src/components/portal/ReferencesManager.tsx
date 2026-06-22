"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Reference = {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string | null;
  area_m2: number | null;
  duration_days: number | null;
  location: string | null;
  year: number | null;
  cover_image: string | null;
  images: string[];
  published: boolean;
  sort_order: number;
};

const TYPES = [
  { key: "koupelna", label: "Koupelna" },
  { key: "kuchyn", label: "Kuchyně" },
  { key: "byt", label: "Byt" },
  { key: "dum", label: "Dům" },
  { key: "svj", label: "SVJ" },
];

function slugify(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    .slice(0, 50) + "-" + Math.random().toString(36).slice(2, 6);
}

const emptyForm = {
  title: "", type: "koupelna", description: "", area_m2: "", duration_days: "",
  location: "", year: String(new Date().getFullYear()), cover_image: "", published: true,
};

const inputStyle: React.CSSProperties = {
  background: "#fff", border: "1px solid var(--border)", borderRadius: "2px",
  padding: "0.55rem 0.75rem", fontSize: "0.88rem", width: "100%", boxSizing: "border-box",
  color: "var(--text)", fontFamily: "var(--ff-body)", outline: "none",
};
const labelStyle: React.CSSProperties = {
  fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em",
  color: "var(--muted)", marginBottom: "0.3rem", display: "block", fontWeight: 500,
};

export default function ReferencesManager({ initial }: { initial: Reference[] }) {
  const supabase = createClient();
  const [refs, setRefs] = useState<Reference[]>(initial);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function setField(k: string, v: string | boolean) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function startEdit(r: Reference) {
    setEditingId(r.id);
    setForm({
      title: r.title, type: r.type, description: r.description || "",
      area_m2: r.area_m2?.toString() || "", duration_days: r.duration_days?.toString() || "",
      location: r.location || "", year: r.year?.toString() || "", cover_image: r.cover_image || "",
      published: r.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null); setForm(emptyForm); setError("");
  }

  async function uploadCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `references/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("project-photos").upload(path, file);
    if (upErr) { setError("Nahrání obrázku selhalo: " + upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from("project-photos").getPublicUrl(path);
    setField("cover_image", data.publicUrl);
    setUploading(false);
  }

  async function save() {
    if (!form.title.trim()) { setError("Zadejte název reference."); return; }
    setSaving(true); setError("");
    const payload = {
      title: form.title.trim(), type: form.type, description: form.description || null,
      area_m2: form.area_m2 ? Number(form.area_m2) : null,
      duration_days: form.duration_days ? Number(form.duration_days) : null,
      location: form.location || null, year: form.year ? Number(form.year) : null,
      cover_image: form.cover_image || null, published: form.published,
    };

    if (editingId) {
      const { data, error: e } = await supabase.from("references_projects").update(payload).eq("id", editingId).select("*").single();
      if (e) { setError(e.message); setSaving(false); return; }
      setRefs((p) => p.map((r) => (r.id === editingId ? (data as Reference) : r)));
    } else {
      const { data, error: e } = await supabase.from("references_projects")
        .insert({ ...payload, slug: slugify(form.title), sort_order: refs.length }).select("*").single();
      if (e) { setError(e.message); setSaving(false); return; }
      setRefs((p) => [data as Reference, ...p]);
    }
    setSaving(false);
    resetForm();
  }

  async function togglePublished(r: Reference) {
    const { data } = await supabase.from("references_projects").update({ published: !r.published }).eq("id", r.id).select("*").single();
    if (data) setRefs((p) => p.map((x) => (x.id === r.id ? (data as Reference) : x)));
  }

  async function remove(r: Reference) {
    if (!confirm(`Smazat referenci „${r.title}"?`)) return;
    await supabase.from("references_projects").delete().eq("id", r.id);
    setRefs((p) => p.filter((x) => x.id !== r.id));
  }

  return (
    <div style={{ maxWidth: "900px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "var(--ff-head)", fontSize: "2rem", marginBottom: "0.25rem" }}>REFERENCE</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Portfolio zobrazené na webu v sekci Reference</p>
      </div>

      {/* Form */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "4px", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "var(--ff-head)", fontSize: "1.1rem", marginBottom: "1rem" }}>
          {editingId ? "Upravit referenci" : "Nová reference"}
        </h2>
        <div className="rm-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={labelStyle}>Název *</label>
            <input value={form.title} onChange={(e) => setField("title", e.target.value)} style={inputStyle} placeholder="Kompletní rekonstrukce koupelny" />
          </div>
          <div>
            <label style={labelStyle}>Typ</label>
            <select value={form.type} onChange={(e) => setField("type", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              {TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Popis</label>
          <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }} />
        </div>
        <div className="rm-grid4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
          <div><label style={labelStyle}>Plocha (m²)</label><input type="number" value={form.area_m2} onChange={(e) => setField("area_m2", e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>Doba (dní)</label><input type="number" value={form.duration_days} onChange={(e) => setField("duration_days", e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>Lokalita</label><input value={form.location} onChange={(e) => setField("location", e.target.value)} style={inputStyle} placeholder="Ostrava-Poruba" /></div>
          <div><label style={labelStyle}>Rok</label><input type="number" value={form.year} onChange={(e) => setField("year", e.target.value)} style={inputStyle} /></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <label style={{ ...labelStyle, margin: 0 }}>Titulní foto</label>
          {form.cover_image && <img src={form.cover_image} alt="" style={{ width: "60px", height: "45px", objectFit: "cover", borderRadius: "3px" }} />}
          <label style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "0.4rem 0.9rem", borderRadius: "2px", fontSize: "0.78rem", cursor: uploading ? "wait" : "pointer" }}>
            {uploading ? "Nahrávám…" : "📷 Nahrát foto"}
            <input type="file" accept="image/*" onChange={uploadCover} disabled={uploading} style={{ display: "none" }} />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", cursor: "pointer" }}>
            <input type="checkbox" checked={form.published} onChange={(e) => setField("published", e.target.checked)} /> Publikováno na webu
          </label>
        </div>
        {error && <div style={{ fontSize: "0.82rem", color: "#9a4a2a", marginBottom: "0.75rem" }}>{error}</div>}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={save} disabled={saving} style={{ background: "var(--gold)", color: "#fff", border: "none", borderRadius: "2px", padding: "0.7rem 1.5rem", fontSize: "0.88rem", fontWeight: 500, cursor: "pointer", fontFamily: "var(--ff-body)" }}>
            {saving ? "Ukládám…" : editingId ? "Uložit změny" : "Přidat referenci"}
          </button>
          {editingId && <button onClick={resetForm} style={{ background: "none", border: "1px solid var(--border)", borderRadius: "2px", padding: "0.7rem 1.2rem", fontSize: "0.85rem", color: "var(--muted)", cursor: "pointer", fontFamily: "var(--ff-body)" }}>Zrušit</button>}
        </div>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {refs.length === 0 && <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Zatím žádné reference. Web zobrazuje ukázková data, dokud nepřidáte vlastní.</p>}
        {refs.map((r) => (
          <div key={r.id} className="rm-row" style={{ display: "flex", alignItems: "center", gap: "1rem", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "4px", padding: "0.75rem 1rem" }}>
            <div style={{ width: "56px", height: "42px", borderRadius: "3px", background: "var(--surface)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {r.cover_image ? <img src={r.cover_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ opacity: 0.4 }}>🏗️</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>{r.title}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                {TYPES.find((t) => t.key === r.type)?.label || r.type}
                {r.location ? ` · ${r.location}` : ""}{r.year ? ` · ${r.year}` : ""}
              </div>
            </div>
            <button onClick={() => togglePublished(r)} title="Přepnout publikování"
              style={{ background: r.published ? "rgba(42,138,74,0.1)" : "var(--surface)", color: r.published ? "#2a8a4a" : "var(--muted)", border: `1px solid ${r.published ? "rgba(42,138,74,0.3)" : "var(--border)"}`, borderRadius: "2px", padding: "0.3rem 0.7rem", fontSize: "0.72rem", cursor: "pointer", fontFamily: "var(--ff-body)" }}>
              {r.published ? "● Publikováno" : "○ Skryto"}
            </button>
            <button onClick={() => startEdit(r)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: "2px", padding: "0.3rem 0.7rem", fontSize: "0.72rem", color: "var(--muted)", cursor: "pointer", fontFamily: "var(--ff-body)" }}>Upravit</button>
            <button onClick={() => remove(r)} title="Smazat" style={{ background: "none", border: "none", color: "#9a4a2a", cursor: "pointer", fontSize: "1.1rem" }}>×</button>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .rm-grid { grid-template-columns: 1fr !important; }
          .rm-grid4 { grid-template-columns: repeat(2, 1fr) !important; }
          .rm-row { flex-wrap: wrap !important; }
        }
        @media (max-width: 480px) {
          .rm-grid4 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
