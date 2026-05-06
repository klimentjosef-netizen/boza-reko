"use client";

import { useState } from "react";

/* ── types & data ────────────────────────────── */

type RoomConfig = {
  key: string;
  icon: string;
  label: string;
  count: number;
  size: number;
};

type WorkItem = { id: string; label: string; base: number; perM2: number };

const ROOM_TYPES = [
  { key: "koupelna", icon: "🛁", label: "Koupelna", defaultSize: 6 },
  { key: "wc", icon: "🚽", label: "WC", defaultSize: 2 },
  { key: "kuchyn", icon: "🍳", label: "Kuchyně", defaultSize: 12 },
  { key: "pokoj", icon: "🛋️", label: "Pokoj / obývák", defaultSize: 20 },
  { key: "loznice", icon: "🛏️", label: "Ložnice", defaultSize: 16 },
  { key: "chodba", icon: "🚪", label: "Chodba / předsíň", defaultSize: 6 },
  { key: "balkon", icon: "🌿", label: "Balkon / terasa", defaultSize: 5 },
];

const QUALITY_LEVELS = [
  {
    key: "standard",
    label: "STANDARD",
    desc: "Kvalitní materiály, funkční řešení, čistá práce",
    multiplier: 1.0,
  },
  {
    key: "premium",
    label: "PREMIUM",
    desc: "Nadstandardní materiály, detailní řešení, designové prvky",
    multiplier: 1.45,
  },
  {
    key: "vip",
    label: "VIP",
    desc: "Luxusní materiály, individuální design, nejvyšší preciznost",
    multiplier: 2.1,
  },
];

const WORK_OPTIONS: Record<string, WorkItem[]> = {
  koupelna: [
    { id: "demolice", label: "Demolice a vyklizení", base: 2200, perM2: 180 },
    { id: "rozvody", label: "Rozvody vody a odpady", base: 8000, perM2: 600 },
    { id: "elektro", label: "Elektroinstalace", base: 5000, perM2: 350 },
    { id: "obklady", label: "Obklady a dlažba", base: 1200, perM2: 450 },
    { id: "sanitarka", label: "Montáž sanitární keramiky", base: 6500, perM2: 0 },
    { id: "omitky", label: "Omítky a stěrky", base: 800, perM2: 220 },
    { id: "podlahove-topeni", label: "Podlahové vytápění", base: 4000, perM2: 350 },
    { id: "hydroizolace", label: "Hydroizolace", base: 1500, perM2: 280 },
  ],
  wc: [
    { id: "demolice", label: "Demolice a vyklizení", base: 1500, perM2: 150 },
    { id: "rozvody", label: "Rozvody vody a odpady", base: 4000, perM2: 400 },
    { id: "obklady", label: "Obklady a dlažba", base: 1000, perM2: 420 },
    { id: "sanitarka", label: "Montáž WC, umyvadla", base: 4000, perM2: 0 },
    { id: "elektro", label: "Elektroinstalace", base: 2000, perM2: 200 },
  ],
  kuchyn: [
    { id: "demolice", label: "Demolice a vyklizení", base: 2000, perM2: 150 },
    { id: "rozvody", label: "Rozvody vody a odpady", base: 5000, perM2: 400 },
    { id: "elektro", label: "Elektro a zásuvky", base: 4500, perM2: 300 },
    { id: "podlaha", label: "Podlaha / dlažba", base: 900, perM2: 320 },
    { id: "obklady", label: "Obklady za linku", base: 1500, perM2: 0 },
    { id: "omitky", label: "Omítky a malba", base: 1200, perM2: 180 },
    { id: "priprava-linky", label: "Příprava pro kuchyňskou linku", base: 3000, perM2: 0 },
  ],
  pokoj: [
    { id: "demolice", label: "Demolice / bourání příček", base: 1500, perM2: 100 },
    { id: "podlaha", label: "Podlaha (plovoucí / parkety)", base: 500, perM2: 280 },
    { id: "malba", label: "Malba a stěny", base: 400, perM2: 120 },
    { id: "elektro", label: "Elektroinstalace", base: 2500, perM2: 150 },
    { id: "omitky", label: "Oprava omítek / stěrky", base: 600, perM2: 200 },
    { id: "sadrokartony", label: "Sádrokartonové podhledy", base: 1500, perM2: 250 },
  ],
  loznice: [
    { id: "podlaha", label: "Podlaha (plovoucí / parkety)", base: 500, perM2: 280 },
    { id: "malba", label: "Malba a stěny", base: 400, perM2: 120 },
    { id: "elektro", label: "Elektro / osvětlení", base: 2000, perM2: 100 },
    { id: "omitky", label: "Oprava omítek", base: 500, perM2: 180 },
  ],
  chodba: [
    { id: "podlaha", label: "Podlaha / dlažba", base: 600, perM2: 320 },
    { id: "obklady", label: "Obklady stěn", base: 1000, perM2: 380 },
    { id: "malba", label: "Malba", base: 300, perM2: 90 },
    { id: "dvere", label: "Montáž dveří a zárubní", base: 3500, perM2: 0 },
  ],
  balkon: [
    { id: "podlaha", label: "Podlaha / dlažba", base: 800, perM2: 350 },
    { id: "hydroizolace", label: "Hydroizolace", base: 2000, perM2: 300 },
    { id: "zabradli", label: "Zábradlí", base: 4000, perM2: 0 },
  ],
};

const TABS = ["Místnosti", "Standard", "Práce", "Výsledek"];

function fmt(n: number) {
  return n.toLocaleString("cs-CZ");
}

/* ── component ───────────────────────────────── */

export default function Calculator() {
  const [step, setStep] = useState(0);
  const [rooms, setRooms] = useState<RoomConfig[]>([]);
  const [quality, setQuality] = useState("standard");
  const [selectedWork, setSelectedWork] = useState<Record<string, string[]>>({});

  function addRoom(key: string) {
    const type = ROOM_TYPES.find((r) => r.key === key)!;
    const existing = rooms.filter((r) => r.key === key).length;
    setRooms([...rooms, {
      key,
      icon: type.icon,
      label: `${type.label}${existing > 0 ? ` ${existing + 1}` : ""}`,
      count: 1,
      size: type.defaultSize,
    }]);
  }

  function removeRoom(index: number) {
    const newRooms = rooms.filter((_, i) => i !== index);
    setRooms(newRooms);
    // Clean up selected work for removed room
    const newWork = { ...selectedWork };
    delete newWork[`${index}`];
    setSelectedWork(newWork);
  }

  function updateRoomSize(index: number, size: number) {
    const newRooms = [...rooms];
    newRooms[index] = { ...newRooms[index], size };
    setRooms(newRooms);
  }

  function toggleWork(roomIndex: number, workId: string) {
    const key = `${roomIndex}`;
    const current = selectedWork[key] || [];
    setSelectedWork({
      ...selectedWork,
      [key]: current.includes(workId)
        ? current.filter((w) => w !== workId)
        : [...current, workId],
    });
  }

  function selectAllWork(roomIndex: number) {
    const room = rooms[roomIndex];
    const works = WORK_OPTIONS[room.key] || [];
    setSelectedWork({
      ...selectedWork,
      [`${roomIndex}`]: works.map((w) => w.id),
    });
  }

  function reset() {
    setStep(0);
    setRooms([]);
    setQuality("standard");
    setSelectedWork({});
  }

  // Calculate totals
  const qualityMultiplier = QUALITY_LEVELS.find((q) => q.key === quality)?.multiplier || 1;
  let totalNet = 0;
  const roomBreakdown: { label: string; subtotal: number }[] = [];

  rooms.forEach((room, i) => {
    const works = WORK_OPTIONS[room.key] || [];
    const selected = (selectedWork[`${i}`] || []);
    let roomTotal = 0;
    works.forEach((w) => {
      if (selected.includes(w.id)) {
        roomTotal += w.base + w.perM2 * room.size;
      }
    });
    roomTotal = Math.round(roomTotal * qualityMultiplier);
    totalNet += roomTotal;
    if (roomTotal > 0) {
      roomBreakdown.push({ label: `${room.icon} ${room.label} (${room.size} m²)`, subtotal: roomTotal });
    }
  });

  const dph = Math.round(totalNet * 0.21);
  const gross = totalNet + dph;
  const lo = Math.round((gross * 0.85) / 1000) * 1000;
  const hi = Math.round((gross * 1.25) / 1000) * 1000;

  const hasRooms = rooms.length > 0;
  const hasWork = Object.values(selectedWork).some((w) => w.length > 0);

  return (
    <section
      id="kalkulacka"
      style={{ background: "var(--surface)", padding: "6rem 3rem", position: "relative", overflow: "hidden" }}
      className="fade-in"
    >
      <div
        style={{
          position: "absolute",
          top: "-200px",
          right: "-200px",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(166,124,42,0.07), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ textAlign: "center", marginBottom: "4rem", position: "relative" }}>
        <div style={{ color: "var(--gold)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "0.75rem", fontWeight: 500 }}>
          Kalkulačka
        </div>
        <h2 style={{ fontFamily: "var(--ff-head)", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", margin: 0, fontWeight: 700 }}>
          ORIENTAČNÍ CENA
        </h2>
      </div>

      <div
        className="calc-layout"
        style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "5rem", alignItems: "start", maxWidth: "1100px", margin: "0 auto", position: "relative" }}
      >
        {/* Left - wizard */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "4px", overflow: "hidden" }}>
          {/* Tabs */}
          <div style={{ display: "flex", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
            {TABS.map((t, i) => {
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div
                  key={t}
                  style={{
                    flex: 1,
                    padding: "0.8rem",
                    textAlign: "center",
                    fontSize: "0.72rem",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    borderRight: i < TABS.length - 1 ? "1px solid var(--border)" : "none",
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
            {/* Step 1 - Rooms (multi-select with sizes) */}
            {step === 0 && (
              <div>
                <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1.4rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  Jaké místnosti rekonstruujete?
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--muted)", fontWeight: 300, marginBottom: "1.5rem" }}>
                  Přidejte všechny místnosti. Můžete přidat více místností stejného typu.
                </p>

                {/* Room type buttons */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
                  {ROOM_TYPES.map((r) => (
                    <button
                      key={r.key}
                      onClick={() => addRoom(r.key)}
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "2px",
                        padding: "0.5rem 0.9rem",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        color: "var(--text)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        transition: "border-color 0.2s",
                        fontFamily: "var(--ff-body)",
                      }}
                    >
                      <span>{r.icon}</span> + {r.label}
                    </button>
                  ))}
                </div>

                {/* Added rooms */}
                {rooms.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
                    {rooms.map((room, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.75rem 1rem",
                          background: "rgba(166,124,42,0.05)",
                          border: "1px solid rgba(166,124,42,0.2)",
                          borderRadius: "2px",
                        }}
                      >
                        <span style={{ fontSize: "1.1rem" }}>{room.icon}</span>
                        <span style={{ flex: 1, fontSize: "0.88rem", fontWeight: 500 }}>{room.label}</span>
                        <input
                          type="number"
                          value={room.size}
                          onChange={(e) => updateRoomSize(i, Math.max(1, Number(e.target.value)))}
                          min={1}
                          style={{
                            width: "70px",
                            background: "#fff",
                            border: "1px solid var(--border)",
                            borderRadius: "2px",
                            padding: "0.3rem 0.5rem",
                            fontSize: "0.85rem",
                            textAlign: "right",
                            fontFamily: "var(--ff-body)",
                            outline: "none",
                          }}
                        />
                        <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>m²</span>
                        <button
                          onClick={() => removeRoom(i)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#9a4a2a",
                            cursor: "pointer",
                            fontSize: "1.1rem",
                            padding: "0 0.3rem",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {rooms.length === 0 && (
                  <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)", fontSize: "0.85rem", background: "var(--surface)", borderRadius: "4px" }}>
                    Klikněte na tlačítka výše pro přidání místností
                  </div>
                )}

                <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    disabled={!hasRooms}
                    onClick={() => setStep(1)}
                    style={{
                      background: hasRooms ? "var(--gold)" : "var(--border)",
                      color: "#fff",
                      padding: "0.9rem 2rem",
                      borderRadius: "2px",
                      border: "none",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      cursor: hasRooms ? "pointer" : "not-allowed",
                      opacity: hasRooms ? 1 : 0.5,
                      fontFamily: "var(--ff-body)",
                    }}
                  >
                    Pokračovat →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 - Quality standard */}
            {step === 1 && (
              <div>
                <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1.4rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  V jakém standardu?
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--muted)", fontWeight: 300, marginBottom: "1.5rem" }}>
                  Standard ovlivňuje kvalitu provedení, detaily a celkovou cenu.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {QUALITY_LEVELS.map((q) => (
                    <button
                      key={q.key}
                      onClick={() => setQuality(q.key)}
                      style={{
                        background: quality === q.key ? "rgba(166,124,42,0.08)" : "var(--surface)",
                        border: `1px solid ${quality === q.key ? "var(--gold)" : "var(--border)"}`,
                        borderRadius: "2px",
                        padding: "1.2rem 1.25rem",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "border-color 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            border: `2px solid ${quality === q.key ? "var(--gold)" : "var(--border)"}`,
                            background: quality === q.key ? "var(--gold)" : "transparent",
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div style={{ fontFamily: "var(--ff-head)", fontSize: "1rem", fontWeight: 600, letterSpacing: "0.05em" }}>
                            {q.label}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.15rem" }}>
                            {q.desc}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setStep(0)} style={{ background: "transparent", color: "var(--white)", border: "1px solid var(--border)", padding: "0.9rem 2rem", borderRadius: "2px", fontSize: "0.9rem", fontWeight: 500, cursor: "pointer", fontFamily: "var(--ff-body)" }}>
                    ← Zpět
                  </button>
                  <button onClick={() => setStep(2)} style={{ background: "var(--gold)", color: "#fff", padding: "0.9rem 2rem", borderRadius: "2px", border: "none", fontSize: "0.9rem", fontWeight: 500, cursor: "pointer", fontFamily: "var(--ff-body)" }}>
                    Pokračovat →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 - Work items per room */}
            {step === 2 && (
              <div>
                <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1.4rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  Co vše zahrnout?
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--muted)", fontWeight: 300, marginBottom: "1.5rem" }}>
                  Vyberte práce pro každou místnost.
                </p>

                {rooms.map((room, roomIdx) => {
                  const works = WORK_OPTIONS[room.key] || [];
                  const selected = selectedWork[`${roomIdx}`] || [];

                  return (
                    <div key={roomIdx} style={{ marginBottom: "1.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <div style={{ fontFamily: "var(--ff-head)", fontSize: "1rem", fontWeight: 600 }}>
                          {room.icon} {room.label} ({room.size} m²)
                        </div>
                        <button
                          onClick={() => selectAllWork(roomIdx)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--gold)",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            fontFamily: "var(--ff-body)",
                          }}
                        >
                          Vybrat vše
                        </button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                        {works.map((w) => {
                          const checked = selected.includes(w.id);
                          return (
                            <label
                              key={w.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.6rem",
                                padding: "0.6rem 0.8rem",
                                background: checked ? "rgba(166,124,42,0.05)" : "var(--surface)",
                                border: `1px solid ${checked ? "rgba(166,124,42,0.25)" : "var(--border)"}`,
                                borderRadius: "2px",
                                cursor: "pointer",
                                transition: "border-color 0.15s",
                              }}
                            >
                              <span
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  borderRadius: "2px",
                                  border: `1px solid ${checked ? "var(--gold)" : "var(--border)"}`,
                                  background: checked ? "var(--gold)" : "transparent",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  fontSize: "0.6rem",
                                  color: "#fff",
                                }}
                              >
                                {checked && "✓"}
                              </span>
                              <input type="checkbox" checked={checked} onChange={() => toggleWork(roomIdx, w.id)} style={{ display: "none" }} />
                              <span style={{ fontSize: "0.85rem" }}>{w.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setStep(1)} style={{ background: "transparent", color: "var(--white)", border: "1px solid var(--border)", padding: "0.9rem 2rem", borderRadius: "2px", fontSize: "0.9rem", fontWeight: 500, cursor: "pointer", fontFamily: "var(--ff-body)" }}>
                    ← Zpět
                  </button>
                  <button
                    disabled={!hasWork}
                    onClick={() => setStep(3)}
                    style={{
                      background: hasWork ? "var(--gold)" : "var(--border)",
                      color: "#fff",
                      padding: "0.9rem 2rem",
                      borderRadius: "2px",
                      border: "none",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      cursor: hasWork ? "pointer" : "not-allowed",
                      opacity: hasWork ? 1 : 0.5,
                      fontFamily: "var(--ff-body)",
                    }}
                  >
                    Zobrazit cenu →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 - Result */}
            {step === 3 && (
              <div>
                <div style={{ textAlign: "center", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)", marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: "0.5rem" }}>
                    Orientační cena rekonstrukce
                  </div>
                  <div style={{ fontFamily: "var(--ff-head)", fontSize: "2.5rem", fontWeight: 700, color: "var(--gold)", lineHeight: 1.1 }}>
                    {fmt(lo)} – {fmt(hi)} Kč
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "0.3rem" }}>
                    vč. DPH 21 % / bez materiálu / standard: {QUALITY_LEVELS.find((q) => q.key === quality)?.label}
                  </div>
                </div>

                {/* Room breakdown */}
                <div style={{ marginBottom: "1.5rem" }}>
                  {roomBreakdown.map((rb) => (
                    <div key={rb.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", fontSize: "0.85rem", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--muted)" }}>{rb.label}</span>
                      <span>{fmt(rb.subtotal)} Kč</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", fontSize: "0.85rem", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--muted)" }}>DPH 21 %</span>
                    <span>{fmt(dph)} Kč</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0 0", fontFamily: "var(--ff-head)", fontSize: "1.2rem", fontWeight: 600, color: "var(--gold)" }}>
                    <span>Celkem vč. DPH</span>
                    <span>{fmt(gross)} Kč</span>
                  </div>
                </div>

                <p style={{ fontSize: "0.8rem", color: "var(--muted)", fontStyle: "italic", lineHeight: 1.5, marginBottom: "1.5rem" }}>
                  Jde o orientační odhad na základě průměrných cen prací. Skutečná cena závisí na rozsahu, stavu prostor a zvolených materiálech.
                </p>

                <div style={{ background: "rgba(166,124,42,0.06)", borderTop: "1px solid var(--border)", padding: "1.5rem", margin: "0 -2rem -2rem", textAlign: "center" }}>
                  <p style={{ fontSize: "0.88rem", marginBottom: "1rem", color: "var(--text)" }}>
                    Chcete přesnou nabídku? Pošlete nám poptávku.
                  </p>
                  <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <a href="#kontakt" style={{ background: "var(--gold)", color: "#fff", padding: "0.9rem 2rem", borderRadius: "2px", fontSize: "0.9rem", fontWeight: 500, textDecoration: "none" }}>
                      Nezávazná poptávka →
                    </a>
                    <button onClick={reset} style={{ background: "transparent", color: "var(--white)", border: "1px solid var(--border)", padding: "0.9rem 2rem", borderRadius: "2px", fontSize: "0.9rem", fontWeight: 500, cursor: "pointer", fontFamily: "var(--ff-body)" }}>
                      Počítat znovu
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right - info */}
        <div className="calc-info">
          <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            CO CENA ZAHRNUJE
          </h3>
          <p style={{ fontSize: "0.88rem", color: "var(--muted)", marginBottom: "2rem" }}>
            Kalkulace počítá s těmito položkami:
          </p>
          {[
            { title: "Práce řemeslníků", desc: "Bourání, zdění, obklady, elektro, vodo. Vše provádí naši vlastní pracovníci." },
            { title: "DPH 21 %", desc: "Jsme plátci DPH. Cena v kalkulačce je včetně daně." },
            { title: "Odvoz suti", desc: "Likvidace odpadu a stavební suti je součástí kalkulace." },
            { title: "Koordinace", desc: "Plánování, dozor, komunikace s vámi. Jeden kontakt po celou dobu." },
          ].map((item) => (
            <div key={item.title} style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
              <span style={{ width: "6px", height: "6px", background: "var(--gold)", borderRadius: "50%", marginTop: "0.55rem", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.2rem" }}>{item.title}</div>
                <div style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ background: "rgba(184,74,42,0.06)", border: "1px solid rgba(184,74,42,0.2)", borderRadius: "2px", padding: "1rem 1.2rem", fontSize: "0.82rem", color: "#9a4a2a", lineHeight: 1.5, marginTop: "1rem" }}>
            Cena nezahrnuje materiál (obklady, dlažby, sanitární keramiku apod.). Ten si vybíráte a hradíte sami, případně vám doporučíme dodavatele.
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .calc-layout { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .calc-info { order: 2; }
        }
      `}</style>
    </section>
  );
}
