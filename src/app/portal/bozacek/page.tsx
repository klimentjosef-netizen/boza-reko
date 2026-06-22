"use client";

import { useState } from "react";
import BudgetEditor from "@/components/portal/BudgetEditor";
import { DISPOSITIONS, ROOM_TYPES, type RoomPreset } from "@/lib/dispositions";
import type { PricedBudget } from "@/lib/pricebook";

type Room = { label: string; area_m2: number; wet?: boolean };

export type BozacekBudget = PricedBudget & {
  scope: string;
  property_type: string;
  estimated_days: number | null;
  assumptions: string[];
  notes: string;
};

export type BozacekParams = {
  property_type: string;
  scope: string;
  quality_level: string;
  area_m2: number;
  rooms: Room[];
  fixtures: Record<string, number | boolean>;
  margin_percent: number;
  additional_notes: string;
};

const SCOPES = [
  { key: "kompletni", label: "Kompletní rekonstrukce", desc: "Vše od základu — bourání, rozvody, povrchy, podlahy, sanita." },
  { key: "castecna", label: "Částečná rekonstrukce", desc: "Nové povrchy, podlahy, obklady, malby. Bez bourání rozvodů." },
  { key: "dokoncovaci", label: "Dokončovací práce", desc: "Malby, podlahy, drobné opravy. Kosmetická úprava." },
];

const TIERS = [
  { key: "standard", label: "Standard", desc: "Kvalitní materiály, funkční řešení (low budget)." },
  { key: "premium", label: "Premium", desc: "Nadstandardní materiály a provedení (middle)." },
  { key: "vip", label: "VIP", desc: "Luxusní materiály, nejvyšší preciznost (top)." },
];

const inputStyle: React.CSSProperties = {
  background: "#fff", border: "1px solid var(--border)", borderRadius: "2px",
  padding: "0.6rem 0.8rem", fontSize: "0.9rem", width: "100%", boxSizing: "border-box",
  color: "var(--text)", fontFamily: "var(--ff-body)", outline: "none",
};
const labelStyle: React.CSSProperties = {
  fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em",
  color: "var(--muted)", marginBottom: "0.4rem", display: "block", fontWeight: 500,
};
const cardStyle: React.CSSProperties = {
  background: "var(--card)", border: "1px solid var(--border)", borderRadius: "4px",
  padding: "1.5rem", marginBottom: "1.25rem",
};
const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--ff-head)", fontSize: "1.05rem", marginBottom: "1rem", letterSpacing: "0.02em",
};

export default function BozacekPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BozacekBudget | null>(null);
  const [params, setParams] = useState<BozacekParams | null>(null);

  const [propertyType, setPropertyType] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [scope, setScope] = useState("kompletni");
  const [tier, setTier] = useState("standard");
  const [ceilingHeight, setCeilingHeight] = useState(2.6);
  const [margin, setMargin] = useState(0);
  const [notes, setNotes] = useState("");
  const [fixtures, setFixtures] = useState({
    sprchovy_kout: 0, vana: 0, umyvadlo: 0, wc: 0, kuchyne: 0, vestavene_skrine: 0, interierove_dvere: 0,
  });

  const totalArea = rooms.reduce((s, r) => s + (Number(r.area_m2) || 0), 0);

  function selectDisposition(key: string) {
    setPropertyType(DISPOSITIONS.find((d) => d.key === key)?.label || key);
    const disp = DISPOSITIONS.find((d) => d.key === key);
    if (disp) {
      setRooms(disp.rooms.map((r) => ({ ...r })));
      // odhad výchozího vybavení z dispozice
      const wetCount = disp.rooms.filter((r) => r.wet).length;
      const baths = disp.rooms.filter((r) => r.label.toLowerCase().includes("koupelna")).length;
      const wcs = disp.rooms.filter((r) => r.label.toLowerCase().includes("wc")).length;
      const doors = Math.max(0, disp.rooms.filter((r) => !r.wet).length);
      setFixtures({
        sprchovy_kout: baths, vana: 0, umyvadlo: Math.max(baths, wetCount > 0 ? 1 : 0), wc: Math.max(wcs, baths),
        kuchyne: key === "koupelna" ? 0 : 1, vestavene_skrine: 0, interierove_dvere: doors,
      });
    }
  }

  function addRoom(preset: RoomPreset) {
    setRooms((p) => [...p, { ...preset }]);
  }
  function updateRoom(i: number, field: keyof Room, value: string | number) {
    setRooms((p) => p.map((r, idx) => (idx === i ? { ...r, [field]: field === "area_m2" ? Number(value) : value } : r)));
  }
  function removeRoom(i: number) {
    setRooms((p) => p.filter((_, idx) => idx !== i));
  }

  async function generate() {
    if (!rooms.length) { setError("Přidejte alespoň jednu místnost."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/bozacek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_type: propertyType || "Rekonstrukce",
          scope, tier, rooms, ceiling_height: ceilingHeight,
          fixtures, margin_percent: margin, additional_notes: notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Něco se pokazilo."); return; }
      setResult(data.budget);
      setParams(data.params);
    } catch {
      setError("Nepodařilo se spojit s Božáčkem.");
    } finally {
      setLoading(false);
    }
  }

  if (result && params) {
    return (
      <BudgetEditor
        budget={result}
        params={params}
        onBack={() => { setResult(null); setParams(null); }}
      />
    );
  }

  return (
    <div style={{ maxWidth: "880px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "var(--ff-head)", fontSize: "2rem", marginBottom: "0.25rem" }}>🤖 AI BOŽÁČEK</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Zadejte parametry zakázky — Božáček sestaví položkový rozpočet (práce + materiál) podle reálného ceníku firmy.
        </p>
      </div>

      {/* 1. Typ / dispozice */}
      <div style={cardStyle}>
        <div style={sectionTitle}>1 · Typ nemovitosti</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(95px, 1fr))", gap: "0.5rem" }}>
          {DISPOSITIONS.map((d) => (
            <button key={d.key} onClick={() => selectDisposition(d.key)}
              style={{
                background: propertyType === d.label ? "rgba(166,124,42,0.1)" : "var(--surface)",
                border: `1.5px solid ${propertyType === d.label ? "var(--gold)" : "var(--border)"}`,
                borderRadius: "2px", padding: "0.6rem 0.4rem", cursor: "pointer", textAlign: "center",
                fontFamily: "var(--ff-head)", fontSize: "0.9rem", fontWeight: 600,
                color: propertyType === d.label ? "var(--gold)" : "var(--text)",
              }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Místnosti */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={sectionTitle}>2 · Místnosti a plochy</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Celkem <strong style={{ color: "var(--gold)" }}>{totalArea} m²</strong></div>
        </div>
        {rooms.length === 0 && (
          <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)", fontSize: "0.85rem", background: "var(--surface)", borderRadius: "4px", marginBottom: "0.75rem" }}>
            Vyberte dispozici výše, nebo přidejte místnosti tlačítky níže.
          </div>
        )}
        {rooms.map((room, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <input value={room.label} onChange={(e) => updateRoom(i, "label", e.target.value)}
              style={{ ...inputStyle, flex: 1 }} />
            <input type="number" value={room.area_m2} onChange={(e) => updateRoom(i, "area_m2", e.target.value)}
              min={1} style={{ ...inputStyle, width: "80px", textAlign: "right" }} />
            <span style={{ fontSize: "0.78rem", color: "var(--muted)", width: "24px" }}>m²</span>
            <button onClick={() => removeRoom(i)} title="Odebrat"
              style={{ background: "none", border: "none", color: "#9a4a2a", cursor: "pointer", fontSize: "1.1rem" }}>×</button>
          </div>
        ))}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.75rem" }}>
          {ROOM_TYPES.map((r) => (
            <button key={r.label} onClick={() => addRoom(r)}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "2px", padding: "0.35rem 0.7rem", cursor: "pointer", fontSize: "0.72rem", color: "var(--muted)", fontFamily: "var(--ff-body)" }}>
              + {r.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label style={{ ...labelStyle, margin: 0 }}>Světlá výška</label>
          <input type="number" step="0.1" value={ceilingHeight} onChange={(e) => setCeilingHeight(Number(e.target.value))}
            style={{ ...inputStyle, width: "90px", textAlign: "right" }} />
          <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>m</span>
        </div>
      </div>

      {/* 3. Rozsah + úroveň */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <div style={cardStyle}>
          <div style={sectionTitle}>3 · Rozsah prací</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {SCOPES.map((s) => (
              <button key={s.key} onClick={() => setScope(s.key)}
                style={{ background: scope === s.key ? "rgba(166,124,42,0.08)" : "var(--surface)", border: `1.5px solid ${scope === s.key ? "var(--gold)" : "var(--border)"}`, borderRadius: "2px", padding: "0.7rem 0.9rem", textAlign: "left", cursor: "pointer", fontFamily: "var(--ff-body)" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: "0.74rem", color: "var(--muted)", marginTop: "0.15rem" }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={cardStyle}>
          <div style={sectionTitle}>4 · Úroveň provedení</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {TIERS.map((t) => (
              <button key={t.key} onClick={() => setTier(t.key)}
                style={{ background: tier === t.key ? "rgba(166,124,42,0.08)" : "var(--surface)", border: `1.5px solid ${tier === t.key ? "var(--gold)" : "var(--border)"}`, borderRadius: "2px", padding: "0.7rem 0.9rem", textAlign: "left", cursor: "pointer", fontFamily: "var(--ff-body)" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{t.label}</div>
                <div style={{ fontSize: "0.74rem", color: "var(--muted)", marginTop: "0.15rem" }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Vybavení */}
      <div style={cardStyle}>
        <div style={sectionTitle}>5 · Vybavení (počty kusů)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.75rem" }}>
          {[
            { key: "sprchovy_kout", label: "Sprchový kout" },
            { key: "vana", label: "Vana" },
            { key: "umyvadlo", label: "Umyvadlo" },
            { key: "wc", label: "WC sestava" },
            { key: "kuchyne", label: "Kuchyňská linka" },
            { key: "vestavene_skrine", label: "Vestavěná skříň" },
            { key: "interierove_dvere", label: "Interiérové dveře" },
          ].map((f) => (
            <div key={f.key}>
              <label style={labelStyle}>{f.label}</label>
              <input type="number" min={0} value={(fixtures as Record<string, number>)[f.key]}
                onChange={(e) => setFixtures((p) => ({ ...p, [f.key]: Number(e.target.value) }))}
                style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      {/* 6. Marže + poznámky */}
      <div style={cardStyle}>
        <div style={sectionTitle}>6 · Marže a poznámky</div>
        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "1rem", alignItems: "start" }}>
          <div>
            <label style={labelStyle}>Marže (%)</label>
            <input type="number" min={0} value={margin} onChange={(e) => setMargin(Number(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Doplňující požadavky</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Např.: walk-in sprcha, podlahové vytápění, bourání příčky mezi kuchyní a obývákem, zachovat stávající dveře…"
              style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }} />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ fontSize: "0.85rem", color: "#9a4a2a", marginBottom: "1rem", padding: "0.75rem 1rem", background: "#fdf2f0", border: "1px solid #e8c8c0", borderRadius: "2px" }}>{error}</div>
      )}

      <button onClick={generate} disabled={loading}
        style={{ background: "var(--gold)", color: "#fff", padding: "1rem 2rem", borderRadius: "2px", border: "none", fontSize: "0.95rem", fontWeight: 600, letterSpacing: "0.03em", cursor: loading ? "wait" : "pointer", width: "100%", fontFamily: "var(--ff-body)" }}>
        {loading ? "🤖 Božáček počítá rozpočet…" : "Vygenerovat položkový rozpočet →"}
      </button>
    </div>
  );
}
