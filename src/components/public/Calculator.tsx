"use client";

import { useState } from "react";

/* ── types & data ────────────────────────────── */

type Room = { key: string; icon: string; label: string; size: number };

type Disposition = {
  key: string;
  label: string;
  rooms: Room[];
};

const DISPOSITIONS: Disposition[] = [
  {
    key: "1+kk",
    label: "1+kk",
    rooms: [
      { key: "pokoj", icon: "🛋️", label: "Obývák s kk", size: 22 },
      { key: "koupelna", icon: "🛁", label: "Koupelna", size: 4 },
      { key: "chodba", icon: "🚪", label: "Chodba", size: 4 },
    ],
  },
  {
    key: "1+1",
    label: "1+1",
    rooms: [
      { key: "pokoj", icon: "🛋️", label: "Pokoj", size: 18 },
      { key: "kuchyn", icon: "🍳", label: "Kuchyně", size: 8 },
      { key: "koupelna", icon: "🛁", label: "Koupelna", size: 4 },
      { key: "chodba", icon: "🚪", label: "Chodba", size: 4 },
    ],
  },
  {
    key: "2+kk",
    label: "2+kk",
    rooms: [
      { key: "pokoj", icon: "🛋️", label: "Obývák s kk", size: 22 },
      { key: "loznice", icon: "🛏️", label: "Ložnice", size: 14 },
      { key: "koupelna", icon: "🛁", label: "Koupelna", size: 5 },
      { key: "wc", icon: "🚽", label: "WC", size: 2 },
      { key: "chodba", icon: "🚪", label: "Chodba", size: 6 },
    ],
  },
  {
    key: "2+1",
    label: "2+1",
    rooms: [
      { key: "pokoj", icon: "🛋️", label: "Obývák", size: 20 },
      { key: "loznice", icon: "🛏️", label: "Ložnice", size: 14 },
      { key: "kuchyn", icon: "🍳", label: "Kuchyně", size: 9 },
      { key: "koupelna", icon: "🛁", label: "Koupelna", size: 5 },
      { key: "wc", icon: "🚽", label: "WC", size: 2 },
      { key: "chodba", icon: "🚪", label: "Chodba", size: 6 },
    ],
  },
  {
    key: "3+kk",
    label: "3+kk",
    rooms: [
      { key: "pokoj", icon: "🛋️", label: "Obývák s kk", size: 25 },
      { key: "loznice", icon: "🛏️", label: "Ložnice", size: 14 },
      { key: "pokoj2", icon: "🛋️", label: "Dětský pokoj", size: 12 },
      { key: "koupelna", icon: "🛁", label: "Koupelna", size: 6 },
      { key: "wc", icon: "🚽", label: "WC", size: 2 },
      { key: "chodba", icon: "🚪", label: "Chodba", size: 7 },
    ],
  },
  {
    key: "3+1",
    label: "3+1",
    rooms: [
      { key: "pokoj", icon: "🛋️", label: "Obývák", size: 20 },
      { key: "loznice", icon: "🛏️", label: "Ložnice", size: 14 },
      { key: "pokoj2", icon: "🛋️", label: "Dětský pokoj", size: 12 },
      { key: "kuchyn", icon: "🍳", label: "Kuchyně", size: 10 },
      { key: "koupelna", icon: "🛁", label: "Koupelna", size: 6 },
      { key: "wc", icon: "🚽", label: "WC", size: 2 },
      { key: "chodba", icon: "🚪", label: "Chodba", size: 8 },
    ],
  },
  {
    key: "4+kk",
    label: "4+kk",
    rooms: [
      { key: "pokoj", icon: "🛋️", label: "Obývák s kk", size: 28 },
      { key: "loznice", icon: "🛏️", label: "Ložnice", size: 16 },
      { key: "pokoj2", icon: "🛋️", label: "Dětský pokoj 1", size: 12 },
      { key: "pokoj3", icon: "🛋️", label: "Dětský pokoj 2", size: 10 },
      { key: "koupelna", icon: "🛁", label: "Koupelna", size: 7 },
      { key: "wc", icon: "🚽", label: "WC", size: 2 },
      { key: "chodba", icon: "🚪", label: "Chodba", size: 9 },
    ],
  },
  {
    key: "4+1",
    label: "4+1",
    rooms: [
      { key: "pokoj", icon: "🛋️", label: "Obývák", size: 22 },
      { key: "loznice", icon: "🛏️", label: "Ložnice", size: 16 },
      { key: "pokoj2", icon: "🛋️", label: "Dětský pokoj 1", size: 12 },
      { key: "pokoj3", icon: "🛋️", label: "Dětský pokoj 2", size: 10 },
      { key: "kuchyn", icon: "🍳", label: "Kuchyně", size: 12 },
      { key: "koupelna", icon: "🛁", label: "Koupelna", size: 7 },
      { key: "wc", icon: "🚽", label: "WC", size: 2 },
      { key: "chodba", icon: "🚪", label: "Chodba", size: 9 },
    ],
  },
  {
    key: "5+",
    label: "5 a více pokojů",
    rooms: [
      { key: "pokoj", icon: "🛋️", label: "Obývák", size: 25 },
      { key: "loznice", icon: "🛏️", label: "Ložnice", size: 16 },
      { key: "pokoj2", icon: "🛋️", label: "Pokoj 2", size: 14 },
      { key: "pokoj3", icon: "🛋️", label: "Pokoj 3", size: 12 },
      { key: "pokoj4", icon: "🛋️", label: "Pokoj 4", size: 10 },
      { key: "kuchyn", icon: "🍳", label: "Kuchyně", size: 14 },
      { key: "koupelna", icon: "🛁", label: "Koupelna", size: 8 },
      { key: "koupelna2", icon: "🛁", label: "Koupelna 2", size: 5 },
      { key: "wc", icon: "🚽", label: "WC", size: 2 },
      { key: "chodba", icon: "🚪", label: "Chodba", size: 10 },
    ],
  },
  {
    key: "dum",
    label: "Rodinný dům",
    rooms: [
      { key: "pokoj", icon: "🛋️", label: "Obývák", size: 30 },
      { key: "kuchyn", icon: "🍳", label: "Kuchyně", size: 16 },
      { key: "loznice", icon: "🛏️", label: "Ložnice", size: 18 },
      { key: "pokoj2", icon: "🛋️", label: "Pokoj 2", size: 14 },
      { key: "pokoj3", icon: "🛋️", label: "Pokoj 3", size: 12 },
      { key: "koupelna", icon: "🛁", label: "Koupelna", size: 8 },
      { key: "koupelna2", icon: "🛁", label: "Koupelna 2 / přízemí", size: 5 },
      { key: "wc", icon: "🚽", label: "WC", size: 2 },
      { key: "chodba", icon: "🚪", label: "Chodba + schodiště", size: 14 },
      { key: "technicka", icon: "⚙️", label: "Technická místnost", size: 6 },
    ],
  },
];

// Místnosti, které lze do dispozice doplnit (byt nemusí odpovídat vzoru)
const ROOM_TYPES = [
  { key: "koupelna", icon: "🛁", label: "Koupelna", defaultSize: 6 },
  { key: "wc", icon: "🚽", label: "WC", defaultSize: 2 },
  { key: "kuchyn", icon: "🍳", label: "Kuchyně", defaultSize: 12 },
  { key: "pokoj", icon: "🛋️", label: "Pokoj / obývák", defaultSize: 20 },
  { key: "loznice", icon: "🛏️", label: "Ložnice", defaultSize: 16 },
  { key: "chodba", icon: "🚪", label: "Chodba", defaultSize: 6 },
  { key: "balkon", icon: "🌿", label: "Balkon / terasa", defaultSize: 5 },
];

const QUALITY_OPTIONS = [
  { key: "standard", label: "STANDARD", desc: "Kvalitní materiály, funkční řešení, čistá práce", multiplier: 1.0 },
  { key: "premium", label: "PREMIUM", desc: "Nadstandardní provedení, designové prvky, detaily", multiplier: 1.45 },
  { key: "vip", label: "VIP", desc: "Luxusní materiály, individuální design, nejvyšší preciznost", multiplier: 2.1 },
];

// Cena práce za m² pro kompletní rekonstrukci podle typu místnosti (standard)
const PRICE_PER_M2: Record<string, number> = {
  koupelna: 12000,
  koupelna2: 12000,
  wc: 9000,
  kuchyn: 8500,
  pokoj: 5500,
  pokoj2: 5500,
  pokoj3: 5500,
  pokoj4: 5500,
  loznice: 5500,
  chodba: 4500,
  balkon: 6000,
  technicka: 4000,
};

// Snížená sazba DPH pro stavební práce na stavbách pro bydlení
const VAT_RATE = 0.12;

function fmt(n: number) {
  return n.toLocaleString("cs-CZ");
}

/* ── component ───────────────────────────────── */

export default function Calculator() {
  const [step, setStep] = useState(0);
  const [disposition, setDisposition] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [quality, setQuality] = useState("standard");

  const totalArea = rooms.reduce((s, r) => s + r.size, 0);

  // Výběr dispozice -> předvyplnění místností
  function selectDisposition(key: string) {
    setDisposition(key);
    const disp = DISPOSITIONS.find((d) => d.key === key);
    if (disp) setRooms(disp.rooms.map((r) => ({ ...r })));
  }

  function updateRoomSize(index: number, size: number) {
    const updated = [...rooms];
    updated[index] = { ...updated[index], size: Math.max(1, size) };
    setRooms(updated);
  }

  function addRoom(key: string) {
    const type = ROOM_TYPES.find((r) => r.key === key)!;
    const existing = rooms.filter((r) => r.key === key).length;
    setRooms([...rooms, {
      key,
      icon: type.icon,
      label: existing > 0 ? `${type.label} ${existing + 1}` : type.label,
      size: type.defaultSize,
    }]);
  }

  function removeRoom(index: number) {
    setRooms(rooms.filter((_, i) => i !== index));
  }

  function reset() {
    setStep(0);
    setDisposition("");
    setRooms([]);
    setQuality("standard");
  }

  // Výpočet
  const qualMul = QUALITY_OPTIONS.find((q) => q.key === quality)?.multiplier || 1;

  let totalNet = 0;
  const breakdown: { label: string; subtotal: number }[] = [];
  rooms.forEach((room) => {
    const priceM2 = PRICE_PER_M2[room.key] || 5500;
    const roomTotal = Math.round(room.size * priceM2 * qualMul);
    totalNet += roomTotal;
    breakdown.push({ label: `${room.icon} ${room.label} (${room.size} m²)`, subtotal: roomTotal });
  });

  const dph = Math.round(totalNet * VAT_RATE);
  const gross = totalNet + dph;
  const lo = Math.round((gross * 0.85) / 1000) * 1000;
  const hi = Math.round((gross * 1.25) / 1000) * 1000;

  const steps = ["Dispozice", "Místnosti", "Standard", "Cena"];

  // Sdílené styly
  const radioStyle = (active: boolean): React.CSSProperties => ({
    background: active ? "rgba(166,124,42,0.08)" : "var(--surface)",
    border: `1.5px solid ${active ? "var(--gold)" : "var(--border)"}`,
    borderRadius: "2px",
    padding: "1.1rem 1.2rem",
    textAlign: "left",
    cursor: "pointer",
    transition: "border-color 0.15s",
    width: "100%",
    fontFamily: "var(--ff-body)",
  });

  const btnPrimary: React.CSSProperties = {
    background: "var(--gold)",
    color: "#fff",
    padding: "0.85rem 2rem",
    borderRadius: "2px",
    border: "none",
    fontSize: "0.88rem",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "var(--ff-body)",
  };

  const btnBack: React.CSSProperties = {
    background: "transparent",
    color: "var(--white)",
    border: "1px solid var(--border)",
    padding: "0.85rem 2rem",
    borderRadius: "2px",
    fontSize: "0.88rem",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "var(--ff-body)",
  };

  const btnDisabled: React.CSSProperties = { ...btnPrimary, background: "var(--border)", cursor: "not-allowed", opacity: 0.5 };

  /* ── Jednotlivé kroky ── */

  function renderDisposition() {
    return (
      <div>
        <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1.3rem", fontWeight: 600, marginBottom: "0.5rem" }}>
          Jaká je dispozice?
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
          Vyberte a systém automaticky nastaví místnosti. Potom je můžete upravit.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
          {DISPOSITIONS.map((d) => (
            <button
              key={d.key}
              onClick={() => selectDisposition(d.key)}
              style={{
                background: disposition === d.key ? "rgba(166,124,42,0.1)" : "var(--surface)",
                border: `1.5px solid ${disposition === d.key ? "var(--gold)" : "var(--border)"}`,
                borderRadius: "2px",
                padding: "0.7rem",
                cursor: "pointer",
                textAlign: "center",
                fontFamily: "var(--ff-head)",
                fontSize: "1rem",
                fontWeight: 600,
                color: disposition === d.key ? "var(--gold)" : "var(--text)",
                transition: "all 0.15s",
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
          <button disabled={!disposition} onClick={() => setStep(1)} style={disposition ? btnPrimary : btnDisabled}>
            Pokračovat →
          </button>
        </div>
      </div>
    );
  }

  function renderRoomsList() {
    return (
      <div>
        <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1.3rem", fontWeight: 600, marginBottom: "0.5rem" }}>
          Zkontrolujte místnosti
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
          Upravte velikosti, přidejte nebo odeberte místnosti.
        </p>

        {/* Přidání místnosti */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
          {ROOM_TYPES.map((r) => (
            <button
              key={r.key}
              onClick={() => addRoom(r.key)}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "2px",
                padding: "0.35rem 0.7rem",
                cursor: "pointer",
                fontSize: "0.72rem",
                color: "var(--muted)",
                fontFamily: "var(--ff-body)",
              }}
            >
              + {r.icon} {r.label}
            </button>
          ))}
        </div>

        {/* Seznam místností */}
        {rooms.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1rem" }}>
            {rooms.map((room, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.6rem 0.8rem",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "2px",
                }}
              >
                <span style={{ fontSize: "1rem" }}>{room.icon}</span>
                <span style={{ flex: 1, fontSize: "0.85rem", fontWeight: 500 }}>{room.label}</span>
                <input
                  type="number"
                  value={room.size}
                  onChange={(e) => updateRoomSize(i, Number(e.target.value))}
                  min={1}
                  style={{
                    width: "60px",
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: "2px",
                    padding: "0.25rem 0.4rem",
                    fontSize: "0.85rem",
                    textAlign: "right",
                    fontFamily: "var(--ff-body)",
                    outline: "none",
                  }}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>m²</span>
                <button
                  onClick={() => removeRoom(i)}
                  style={{ background: "none", border: "none", color: "#9a4a2a", cursor: "pointer", fontSize: "1rem", padding: "0 0.2rem" }}
                >
                  ×
                </button>
              </div>
            ))}
            {/* Součet */}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "0.4rem 0.8rem", fontSize: "0.82rem", color: "var(--muted)" }}>
              Celkem: <strong style={{ color: "var(--text)", marginLeft: "0.3rem" }}>{totalArea} m²</strong>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button onClick={() => setStep(0)} style={btnBack}>← Zpět</button>
          <button
            disabled={rooms.length === 0}
            onClick={() => setStep(2)}
            style={rooms.length > 0 ? btnPrimary : btnDisabled}
          >
            Pokračovat →
          </button>
        </div>
      </div>
    );
  }

  function renderQuality() {
    return (
      <div>
        <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1.3rem", fontWeight: 600, marginBottom: "0.5rem" }}>
          V jakém standardu?
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
          Standard ovlivňuje kvalitu provedení a celkovou cenu.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {QUALITY_OPTIONS.map((q) => (
            <button key={q.key} onClick={() => setQuality(q.key)} style={radioStyle(quality === q.key)}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    border: `2px solid ${quality === q.key ? "var(--gold)" : "var(--border)"}`,
                    background: quality === q.key ? "var(--gold)" : "transparent",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontFamily: "var(--ff-head)", fontSize: "0.95rem", fontWeight: 600, letterSpacing: "0.03em" }}>
                    {q.label}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.15rem" }}>{q.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between" }}>
          <button onClick={() => setStep(1)} style={btnBack}>← Zpět</button>
          <button onClick={() => setStep(3)} style={btnPrimary}>Zobrazit cenu →</button>
        </div>
      </div>
    );
  }

  function renderResult() {
    const qualLabel = QUALITY_OPTIONS.find((q) => q.key === quality)?.label || "";
    const dispLabel = DISPOSITIONS.find((d) => d.key === disposition)?.label || "";

    return (
      <div>
        <div style={{ textAlign: "center", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: "0.5rem" }}>
            Orientační cena kompletní rekonstrukce
          </div>
          <div style={{ fontFamily: "var(--ff-head)", fontSize: "2.4rem", fontWeight: 700, color: "var(--gold)", lineHeight: 1.1 }}>
            {fmt(lo)} – {fmt(hi)} Kč
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.4rem" }}>
            {dispLabel} / {totalArea} m² / {qualLabel.toLowerCase()} / vč. DPH 12 % / bez materiálu
          </div>
        </div>

        {/* Rozpis */}
        <div style={{ marginBottom: "1.5rem" }}>
          {breakdown.map((rb, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.45rem 0", fontSize: "0.84rem", borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--muted)" }}>{rb.label}</span>
              <span>{fmt(rb.subtotal)} Kč</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0.45rem 0", fontSize: "0.84rem", borderBottom: "1px solid var(--border)" }}>
            <span style={{ color: "var(--muted)" }}>DPH 12 %</span>
            <span>{fmt(dph)} Kč</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0 0", fontFamily: "var(--ff-head)", fontSize: "1.15rem", fontWeight: 600, color: "var(--gold)" }}>
            <span>Celkem vč. DPH</span>
            <span>{fmt(gross)} Kč</span>
          </div>
        </div>

        <p style={{ fontSize: "0.78rem", color: "var(--muted)", fontStyle: "italic", lineHeight: 1.5, marginBottom: "1.5rem" }}>
          Jde o orientační odhad na základě průměrných cen prací. Skutečná cena závisí na rozsahu,
          stavu prostor a zvolených materiálech.
        </p>

        <div style={{ background: "rgba(166,124,42,0.06)", borderTop: "1px solid var(--border)", padding: "1.5rem", margin: "0 -2rem -2rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.88rem", marginBottom: "1rem", color: "var(--text)" }}>
            Chcete přesnou nabídku? Pošlete nám poptávku.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#kontakt" style={{ ...btnPrimary, textDecoration: "none", display: "inline-block" }}>
              Nezávazná poptávka →
            </a>
            <button onClick={reset} style={btnBack}>Počítat znovu</button>
          </div>
        </div>
      </div>
    );
  }

  function renderStep() {
    if (step === 0) return renderDisposition();
    if (step === 1) return renderRoomsList();
    if (step === 2) return renderQuality();
    return renderResult();
  }

  return (
    <section
      id="kalkulacka"
      style={{ background: "var(--surface)", padding: "6rem 3rem", position: "relative", overflow: "hidden" }}
      className="fade-in calc-section"
    >
      <div style={{ position: "absolute", top: "-200px", right: "-200px", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(166,124,42,0.07), transparent 70%)", pointerEvents: "none" }} />

      {/* Hlavička */}
      <div style={{ textAlign: "center", marginBottom: "3rem", position: "relative" }}>
        <div style={{ color: "var(--gold)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "0.75rem", fontWeight: 500 }}>
          Kalkulačka
        </div>
        <h2 style={{ fontFamily: "var(--ff-head)", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", margin: "0 0 1rem 0", fontWeight: 700 }}>
          ORIENTAČNÍ CENA
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--muted)", maxWidth: "540px", margin: "0 auto" }}>
          Děláme kompletní rekonstrukce celých bytů a domů. Vyberte dispozici a během chvilky víte,
          na čem jste.
        </p>
      </div>

      {/* Layout */}
      <div
        className="calc-layout"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start", maxWidth: "1050px", margin: "0 auto", position: "relative" }}
      >
        {/* Vlevo - průvodce */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "4px", overflow: "hidden" }}>
          {/* Ukazatel kroků */}
          <div style={{ display: "flex", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
            {steps.map((t, i) => {
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div
                  key={t}
                  style={{
                    flex: 1,
                    padding: "0.7rem",
                    textAlign: "center",
                    fontSize: "0.68rem",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    borderRight: i < steps.length - 1 ? "1px solid var(--border)" : "none",
                    color: isActive || isDone ? "var(--gold)" : "var(--muted)",
                    background: isActive ? "rgba(166,124,42,0.08)" : "transparent",
                  }}
                >
                  {isDone ? `${t} ✓` : t}
                </div>
              );
            })}
          </div>

          <div style={{ padding: "2rem" }}>
            {renderStep()}
          </div>
        </div>

        {/* Vpravo - info panel */}
        <div className="calc-info">
          <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1.4rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            CO CENA ZAHRNUJE
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "2rem" }}>
            Kalkulace počítá s těmito položkami:
          </p>
          {[
            { title: "Kompletní rekonstrukce", desc: "Bourání, nové rozvody elektro i vody, povrchy, podlahy a dokončení. Byt předáváme hotový." },
            { title: "Práce řemeslníků", desc: "Bourání, zdění, obklady, elektro, vodo. Vše provádí naši vlastní pracovníci." },
            { title: "DPH 12 %", desc: "Jsme plátci DPH. U rekonstrukcí bytů a domů platí snížená sazba." },
            { title: "Odvoz suti", desc: "Likvidace odpadu a stavební suti je součástí kalkulace." },
            { title: "Koordinace", desc: "Plánování, dozor, komunikace s vámi. Jeden kontakt po celou dobu." },
          ].map((item) => (
            <div key={item.title} style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
              <span style={{ width: "6px", height: "6px", background: "var(--gold)", borderRadius: "50%", marginTop: "0.55rem", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "0.88rem", fontWeight: 500, marginBottom: "0.2rem" }}>{item.title}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ background: "rgba(184,74,42,0.06)", border: "1px solid rgba(184,74,42,0.2)", borderRadius: "2px", padding: "1rem 1.2rem", fontSize: "0.8rem", color: "#9a4a2a", lineHeight: 1.5, marginTop: "1rem" }}>
            Cena nezahrnuje materiál (obklady, dlažby, sanitární keramiku apod.). Ten si vybíráte a hradíte sami, případně vám doporučíme dodavatele.
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .calc-layout { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .calc-info { order: 2; }
        }
        @media (max-width: 768px) {
          .calc-section { padding: 4rem 1.25rem !important; }
        }
      `}</style>
    </section>
  );
}
