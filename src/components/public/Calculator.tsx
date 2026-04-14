"use client";

import { useState } from "react";

/* ─── data ──────────────────────────────────────────── */

type WorkItem = { id: string; label: string; icon: string; base: number; perM2: number };

const WORK_OPTIONS: Record<string, WorkItem[]> = {
  koupelna: [
    { id: "demolice", label: "Demolice a vyklizení", icon: "🔨", base: 2200, perM2: 180 },
    { id: "rozvody", label: "Rozvody vody a odpady", icon: "🔧", base: 8000, perM2: 600 },
    { id: "elektro", label: "Elektroinstalace", icon: "⚡", base: 5000, perM2: 350 },
    { id: "obklady", label: "Obklady stěn", icon: "🪟", base: 1200, perM2: 420 },
    { id: "dlazba", label: "Pokládka dlažby", icon: "⬜", base: 1000, perM2: 380 },
    { id: "sanitarka", label: "Montáž sanitárky", icon: "🚿", base: 6500, perM2: 0 },
    { id: "omitky", label: "Omítky a stěrky", icon: "🪣", base: 800, perM2: 220 },
  ],
  kuchyn: [
    { id: "demolice", label: "Demolice a vyklizení", icon: "🔨", base: 2000, perM2: 150 },
    { id: "rozvody", label: "Rozvody vody a odpady", icon: "🔧", base: 5000, perM2: 400 },
    { id: "elektro", label: "Elektroinstalace a zásuvky", icon: "⚡", base: 4500, perM2: 300 },
    { id: "dlazba", label: "Podlaha / dlažba", icon: "⬜", base: 900, perM2: 320 },
    { id: "obklady", label: "Obklady za linku", icon: "🪟", base: 1500, perM2: 0 },
    { id: "omitky", label: "Omítky a malba", icon: "🪣", base: 1200, perM2: 180 },
  ],
  pokoj: [
    { id: "demolice", label: "Demolice / bourání příček", icon: "🔨", base: 1500, perM2: 100 },
    { id: "podlaha", label: "Podlaha (plovoucí / parkety)", icon: "🟫", base: 500, perM2: 280 },
    { id: "malba", label: "Malba a tapety", icon: "🖌️", base: 400, perM2: 120 },
    { id: "elektro", label: "Elektroinstalace", icon: "⚡", base: 2500, perM2: 150 },
    { id: "omitky", label: "Oprava omítek / stěrky", icon: "🪣", base: 600, perM2: 200 },
  ],
  loznice: [
    { id: "podlaha", label: "Podlaha (plovoucí / parkety)", icon: "🟫", base: 500, perM2: 280 },
    { id: "malba", label: "Malba a tapety", icon: "🖌️", base: 400, perM2: 120 },
    { id: "elektro", label: "Elektroinstalace / osvětlení", icon: "⚡", base: 2000, perM2: 100 },
    { id: "omitky", label: "Oprava omítek", icon: "🪣", base: 500, perM2: 180 },
  ],
  chodba: [
    { id: "podlaha", label: "Podlaha / dlažba", icon: "🟫", base: 600, perM2: 320 },
    { id: "obklady", label: "Obklady stěn", icon: "🪟", base: 1000, perM2: 380 },
    { id: "malba", label: "Malba", icon: "🖌️", base: 300, perM2: 90 },
    { id: "dvere", label: "Montáž dveří a zárubní", icon: "🚪", base: 3500, perM2: 0 },
  ],
  "cely-byt": [
    { id: "demolice", label: "Demolice a vyklizení", icon: "🔨", base: 8000, perM2: 150 },
    { id: "rozvody", label: "Rozvody vody a topení", icon: "🔧", base: 20000, perM2: 400 },
    { id: "elektro", label: "Kompletní elektroinstalace", icon: "⚡", base: 25000, perM2: 350 },
    { id: "podlaha", label: "Podlahy celého bytu", icon: "🟫", base: 2000, perM2: 280 },
    { id: "koupelna", label: "Koupelna (komplet)", icon: "🛁", base: 35000, perM2: 0 },
    { id: "omitky", label: "Omítky a malby", icon: "🪣", base: 3000, perM2: 200 },
    { id: "dvere", label: "Interiérové dveře", icon: "🚪", base: 12000, perM2: 0 },
  ],
};

const ROOM_OPTIONS = [
  { key: "koupelna", icon: "🛁", label: "Koupelna / WC" },
  { key: "kuchyn", icon: "🍳", label: "Kuchyň" },
  { key: "pokoj", icon: "🛋️", label: "Pokoj / obývák" },
  { key: "loznice", icon: "🛏️", label: "Ložnice" },
  { key: "chodba", icon: "🚪", label: "Chodba / předsíň" },
  { key: "cely-byt", icon: "🏠", label: "Celý byt / dům" },
];

const TABS = ["Místnost", "Plocha", "Práce", "Výsledek"];

function fmt(n: number) {
  return n.toLocaleString("cs-CZ");
}

/* ─── component ────────────────────────────────────── */

export default function Calculator() {
  const [step, setStep] = useState(0);
  const [room, setRoom] = useState("");
  const [size, setSize] = useState(8);
  const [selectedWork, setSelectedWork] = useState<string[]>([]);

  const works = WORK_OPTIONS[room] || [];

  function toggleWork(id: string) {
    setSelectedWork((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]));
  }

  function reset() {
    setStep(0);
    setRoom("");
    setSize(8);
    setSelectedWork([]);
  }

  // calculations
  const selected = works.filter((w) => selectedWork.includes(w.id));
  const totalNet = selected.reduce((sum, w) => sum + w.base + w.perM2 * size, 0);
  const dph = Math.round(totalNet * 0.21);
  const gross = totalNet + dph;
  const lo = Math.round((gross * 0.85) / 1000) * 1000;
  const hi = Math.round((gross * 1.25) / 1000) * 1000;

  return (
    <section
      id="kalkulacka"
      style={{
        background: "var(--surface)",
        padding: "6rem 3rem",
        position: "relative",
        overflow: "hidden",
      }}
      className="fade-in"
    >
      {/* Radial glow */}
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

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "4rem", position: "relative" }}>
        <div
          style={{
            color: "var(--gold)",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            marginBottom: "0.75rem",
            fontWeight: 500,
          }}
        >
          Kalkulačka
        </div>
        <h2 style={{ fontFamily: "var(--ff-head)", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", margin: 0 }}>
          ORIENTAČNÍ CENA
        </h2>
      </div>

      {/* Layout */}
      <div
        className="calc-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: "5rem",
          alignItems: "start",
          maxWidth: "1100px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* Left — wizard */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              background: "var(--bg)",
              borderBottom: "1px solid var(--border)",
            }}
          >
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
                    transition: "all 0.2s",
                  }}
                >
                  {isDone ? `${t} ✓` : t}
                </div>
              );
            })}
          </div>

          {/* Body */}
          <div style={{ padding: "2.5rem" }}>
            {/* Step 1 — Room */}
            {step === 0 && (
              <div>
                <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                  Jakou místnost rekonstruujete?
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--muted)", fontWeight: 300, marginBottom: "1.5rem" }}>
                  Vyberte typ prostoru — každý má jiný rozsah prací a materiálů.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {ROOM_OPTIONS.map((r) => (
                    <button
                      key={r.key}
                      onClick={() => {
                        setRoom(r.key);
                        setSelectedWork([]);
                      }}
                      style={{
                        background: room === r.key ? "rgba(166,124,42,0.08)" : "var(--surface)",
                        border: `1px solid ${room === r.key ? "var(--gold)" : "var(--border)"}`,
                        borderRadius: "2px",
                        padding: "0.9rem 1rem",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.7rem",
                        cursor: "pointer",
                        fontSize: "0.88rem",
                        color: "var(--text)",
                        transition: "border-color 0.2s",
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>{r.icon}</span>
                      {r.label}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    disabled={!room}
                    onClick={() => setStep(1)}
                    style={{
                      background: room ? "var(--gold)" : "var(--border)",
                      color: "#fff",
                      padding: "0.9rem 2rem",
                      borderRadius: "2px",
                      border: "none",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      letterSpacing: "0.05em",
                      cursor: room ? "pointer" : "not-allowed",
                      opacity: room ? 1 : 0.5,
                      transition: "background 0.2s",
                    }}
                  >
                    Pokračovat →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Size */}
            {step === 1 && (
              <div>
                <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                  Jak velká je místnost?
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--muted)", fontWeight: 300, marginBottom: "2rem" }}>
                  Přibližná podlahová plocha v m²
                </p>
                <div
                  style={{
                    textAlign: "center",
                    fontFamily: "var(--ff-head)",
                    fontSize: "2rem",
                    color: "var(--gold)",
                    marginBottom: "1.5rem",
                  }}
                >
                  {size} m²
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
                  <span>3 m²</span>
                  <span>50 m²</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={50}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
                <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
                  <button
                    onClick={() => setStep(0)}
                    style={{
                      background: "transparent",
                      color: "var(--white)",
                      border: "1px solid var(--border)",
                      padding: "0.9rem 2rem",
                      borderRadius: "2px",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "border-color 0.2s, color 0.2s",
                    }}
                  >
                    ← Zpět
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    style={{
                      background: "var(--gold)",
                      color: "#fff",
                      padding: "0.9rem 2rem",
                      borderRadius: "2px",
                      border: "none",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      letterSpacing: "0.05em",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    Pokračovat →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Work items */}
            {step === 2 && (
              <div>
                <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                  Co vše zahrnout?
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--muted)", fontWeight: 300, marginBottom: "1.5rem" }}>
                  Zaškrtněte práce, které chcete. Více prací = přesnější odhad.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {works.map((w) => {
                    const checked = selectedWork.includes(w.id);
                    const cost = w.base + w.perM2 * size;
                    return (
                      <label
                        key={w.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.8rem",
                          padding: "0.75rem 1rem",
                          background: "var(--surface)",
                          border: `1px solid ${checked ? "var(--gold)" : "var(--border)"}`,
                          borderRadius: "2px",
                          cursor: "pointer",
                          transition: "border-color 0.2s",
                        }}
                      >
                        {/* Custom checkbox */}
                        <span
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "2px",
                            border: `1px solid ${checked ? "var(--gold)" : "var(--border)"}`,
                            background: checked ? "var(--gold)" : "transparent",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            fontSize: "0.7rem",
                            color: "#fff",
                            transition: "all 0.2s",
                          }}
                        >
                          {checked && "✓"}
                        </span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleWork(w.id)}
                          style={{ display: "none" }}
                        />
                        <span style={{ fontSize: "1.1rem" }}>{w.icon}</span>
                        <span style={{ flex: 1, fontSize: "0.88rem" }}>{w.label}</span>
                        <span style={{ fontSize: "0.78rem", color: "var(--gold)", fontWeight: 500 }}>
                          {fmt(cost)} Kč
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between" }}>
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      background: "transparent",
                      color: "var(--white)",
                      border: "1px solid var(--border)",
                      padding: "0.9rem 2rem",
                      borderRadius: "2px",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    ← Zpět
                  </button>
                  <button
                    disabled={selectedWork.length === 0}
                    onClick={() => setStep(3)}
                    style={{
                      background: selectedWork.length > 0 ? "var(--gold)" : "var(--border)",
                      color: "#fff",
                      padding: "0.9rem 2rem",
                      borderRadius: "2px",
                      border: "none",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      letterSpacing: "0.05em",
                      cursor: selectedWork.length > 0 ? "pointer" : "not-allowed",
                      opacity: selectedWork.length > 0 ? 1 : 0.5,
                    }}
                  >
                    Pokračovat →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 — Result */}
            {step === 3 && (
              <div>
                {/* Header */}
                <div
                  style={{
                    textAlign: "center",
                    paddingBottom: "1.5rem",
                    borderBottom: "1px solid var(--border)",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--muted)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Orientační cena rekonstrukce
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--ff-head)",
                      fontSize: "2.8rem",
                      color: "var(--gold)",
                      lineHeight: 1.1,
                    }}
                  >
                    {fmt(lo)} – {fmt(hi)} Kč
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "0.3rem" }}>
                    vč. DPH 21 % · bez materiálu dle specifikace
                  </div>
                </div>

                {/* Breakdown */}
                <div style={{ marginBottom: "1.5rem" }}>
                  {selected.map((w) => {
                    const cost = w.base + w.perM2 * size;
                    return (
                      <div
                        key={w.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "0.5rem 0",
                          fontSize: "0.85rem",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <span style={{ color: "var(--muted)" }}>
                          {w.icon} {w.label}
                        </span>
                        <span>{fmt(cost)} Kč</span>
                      </div>
                    );
                  })}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.5rem 0",
                      fontSize: "0.85rem",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <span style={{ color: "var(--muted)" }}>DPH 21 %</span>
                    <span>{fmt(dph)} Kč</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.75rem 0 0",
                      fontFamily: "var(--ff-head)",
                      fontSize: "1.2rem",
                      color: "var(--gold)",
                    }}
                  >
                    <span>Celkem vč. DPH</span>
                    <span>{fmt(gross)} Kč</span>
                  </div>
                </div>

                {/* Note */}
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--muted)",
                    fontStyle: "italic",
                    lineHeight: 1.5,
                    marginBottom: "1.5rem",
                  }}
                >
                  Jde o hrubý orientační odhad na základě průměrných cen prací. Skutečná cena závisí na rozsahu,
                  stavu prostor a zvolených materiálech.
                </p>

                {/* CTA */}
                <div
                  style={{
                    background: "rgba(166,124,42,0.06)",
                    borderTop: "1px solid var(--border)",
                    padding: "1.5rem",
                    margin: "0 -2.5rem -2.5rem",
                    textAlign: "center",
                  }}
                >
                  <p style={{ fontSize: "0.88rem", marginBottom: "1rem", color: "var(--text)" }}>
                    Chcete přesnou nabídku? Pošlete nám poptávku.
                  </p>
                  <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <a
                      href="#kontakt"
                      style={{
                        background: "var(--gold)",
                        color: "#fff",
                        padding: "0.9rem 2rem",
                        borderRadius: "2px",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        transition: "background 0.2s",
                      }}
                    >
                      Nezávazná poptávka →
                    </a>
                    <button
                      onClick={reset}
                      style={{
                        background: "transparent",
                        color: "var(--white)",
                        border: "1px solid var(--border)",
                        padding: "0.9rem 2rem",
                        borderRadius: "2px",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Počítat znovu
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — info panel */}
        <div className="calc-info">
          <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
            CO CENA ZAHRNUJE
          </h3>
          <p style={{ fontSize: "0.88rem", color: "var(--muted)", marginBottom: "2rem" }}>
            Kalkulace počítá s těmito položkami:
          </p>

          {[
            {
              title: "Práce řemeslníků",
              desc: "Bourání, zdění, obklady, elektro, vodo — vše provádí naši vlastní pracovníci.",
            },
            { title: "DPH 21 %", desc: "Jsme plátci DPH. Cena v kalkulačce je včetně daně." },
            {
              title: "Odvoz suti",
              desc: "Likvidace odpadu a stavební suti je součástí kalkulace.",
            },
            {
              title: "Koordinace",
              desc: "Plánování, dozor, komunikace s vámi — jeden kontakt po celou dobu.",
            },
          ].map((item) => (
            <div key={item.title} style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  background: "var(--gold)",
                  borderRadius: "50%",
                  marginTop: "0.55rem",
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.2rem" }}>{item.title}</div>
                <div style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}

          {/* Disclaimer */}
          <div
            style={{
              background: "rgba(184,74,42,0.06)",
              border: "1px solid rgba(184,74,42,0.2)",
              borderRadius: "2px",
              padding: "1rem 1.2rem",
              fontSize: "0.82rem",
              color: "#9a4a2a",
              lineHeight: 1.5,
              marginTop: "1rem",
            }}
          >
            Cena nezahrnuje materiál (obklady, dlažby, sanitární keramiku apod.) — ten si vybíráte a hradíte sami,
            případně vám doporučíme dodavatele.
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
