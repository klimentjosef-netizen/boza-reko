"use client";

import { useEffect, useState } from "react";

/**
 * Animovaný půdorys v hero sekci.
 * Ve smyčce projde 4 fázemi, které odpovídají tomu, jak firma reálně pracuje:
 * poptávka → prohlídka → nabídka → realizace a předání.
 */

const PHASES = [
  { num: "01", title: "POPTÁVKA", desc: "Řeknete nám, co potřebujete." },
  { num: "02", title: "PROHLÍDKA", desc: "Přijedeme, změříme, poradíme." },
  { num: "03", title: "NABÍDKA", desc: "Rozpis prací a pevná cena." },
  { num: "04", title: "REALIZACE", desc: "Stavíme a předáváme hotový byt." },
];

const PHASE_MS = 4200;

type RoomShape = { id: string; x: number; y: number; w: number; h: number; icon: string; name: string };

// Půdorys 3+kk, plocha 9,2 × 7,1 m
const ROOMS: RoomShape[] = [
  { id: "obyvak", x: 50, y: 45, w: 210, h: 170, icon: "🛋️", name: "Obývák s kk" },
  { id: "loznice", x: 260, y: 45, w: 150, h: 170, icon: "🛏️", name: "Ložnice" },
  { id: "detsky", x: 50, y: 215, w: 150, h: 110, icon: "🧸", name: "Dětský pokoj" },
  { id: "chodba", x: 200, y: 215, w: 120, h: 110, icon: "🚪", name: "Chodba" },
  { id: "koupelna", x: 320, y: 215, w: 90, h: 110, icon: "🛁", name: "Koupelna" },
];

// Vnitřní příčky (kreslí se postupně za obrysem)
const WALLS = [
  { x1: 260, y1: 45, x2: 260, y2: 215 },
  { x1: 50, y1: 215, x2: 410, y2: 215 },
  { x1: 200, y1: 215, x2: 200, y2: 325 },
  { x1: 320, y1: 215, x2: 320, y2: 325 },
];

const WORK_ITEMS = [
  "Bourací práce a odvoz suti",
  "Nové rozvody elektro",
  "Rozvody vody a odpady",
  "Obklady, dlažby, podlahy",
  "Omítky, malby, dokončení",
];

export default function HeroFloorplan() {
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setPhase((p) => {
        const next = (p + 1) % PHASES.length;
        if (next === 0) setCycle((c) => c + 1);
        return next;
      });
    }, PHASE_MS);
    return () => clearInterval(t);
  }, []);

  const active = PHASES[phase];

  return (
    <div style={{ width: "100%", maxWidth: "520px" }}>
      {/* Rám s "výkresem" */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          padding: "1.25rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Hlavička výkresu */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "0.7rem",
            marginBottom: "0.6rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--ff-head)",
              fontSize: "0.8rem",
              letterSpacing: "0.12em",
              color: "var(--muted)",
            }}
          >
            BYT 3+kk · 65 m²
          </span>
          <span style={{ display: "flex", gap: "0.3rem" }}>
            {PHASES.map((p, i) => (
              <span
                key={p.num}
                style={{
                  width: i === phase ? "18px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background: i <= phase ? "var(--gold)" : "var(--border)",
                  transition: "all 0.4s ease",
                }}
              />
            ))}
          </span>
        </div>

        <svg viewBox="0 0 460 360" style={{ width: "100%", display: "block" }} role="img" aria-label="Průběh rekonstrukce bytu">
          {/* Milimetrový podklad */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.5" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="460" height="360" fill="url(#grid)" opacity={phase === 0 ? 0.9 : 0.35} style={{ transition: "opacity 0.8s" }} />

          {/* ── Výplň místností (od fáze 2 nabídka, dokončení ve fázi 3) ── */}
          {ROOMS.map((r, i) => {
            const offered = phase >= 2;
            const done = phase === 3;
            return (
              <g key={r.id}>
                <rect
                  x={r.x}
                  y={r.y}
                  width={r.w}
                  height={r.h}
                  fill={done ? "rgba(166,124,42,0.16)" : "rgba(166,124,42,0.05)"}
                  opacity={offered ? 1 : 0}
                  style={{
                    transition: `opacity 0.6s ease ${i * 0.1}s, fill 0.7s ease ${i * 0.22}s`,
                  }}
                />
                {/* Vybavení se objeví, až je hotovo */}
                <text
                  x={r.x + r.w / 2}
                  y={r.y + r.h / 2 + 8}
                  textAnchor="middle"
                  fontSize="24"
                  opacity={done ? 1 : 0}
                  style={{ transition: `opacity 0.5s ease ${0.3 + i * 0.22}s` }}
                >
                  {r.icon}
                </text>
                {/* Odškrtnutí hotové místnosti */}
                <circle
                  cx={r.x + r.w - 14}
                  cy={r.y + 14}
                  r="7"
                  fill="var(--gold)"
                  opacity={done ? 1 : 0}
                  style={{ transition: `opacity 0.4s ease ${0.5 + i * 0.22}s` }}
                />
                <text
                  x={r.x + r.w - 14}
                  y={r.y + 17.5}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#fff"
                  opacity={done ? 1 : 0}
                  style={{ transition: `opacity 0.4s ease ${0.5 + i * 0.22}s` }}
                >
                  ✓
                </text>
              </g>
            );
          })}

          {/* ── Zdi: kreslí se linkou při každém novém cyklu ── */}
          <g key={`draw-${cycle}`} className="fp-draw">
            <path
              d="M50,45 H410 V325 H50 Z"
              fill="none"
              stroke="var(--white)"
              strokeWidth="3"
              pathLength={1}
              className="fp-line fp-line-outer"
            />
            {WALLS.map((w, i) => (
              <path
                key={i}
                d={`M${w.x1},${w.y1} L${w.x2},${w.y2}`}
                fill="none"
                stroke="var(--white)"
                strokeWidth="2"
                pathLength={1}
                className="fp-line"
                style={{ animationDelay: `${0.5 + i * 0.18}s` }}
              />
            ))}
          </g>

          {/* ── Fáze 2: kóty a měřicí body ── */}
          <g opacity={phase === 1 ? 1 : 0} style={{ transition: "opacity 0.5s ease" }}>
            {/* Horní kóta */}
            <line x1="50" y1="28" x2="410" y2="28" stroke="var(--gold)" strokeWidth="1" />
            <line x1="50" y1="22" x2="50" y2="34" stroke="var(--gold)" strokeWidth="1" />
            <line x1="410" y1="22" x2="410" y2="34" stroke="var(--gold)" strokeWidth="1" />
            <rect x="207" y="18" width="46" height="18" fill="var(--card)" />
            <text x="230" y="31" textAnchor="middle" fontSize="11" fill="var(--gold)" fontFamily="var(--ff-body)">
              9,2 m
            </text>
            {/* Levá kóta */}
            <line x1="34" y1="45" x2="34" y2="325" stroke="var(--gold)" strokeWidth="1" />
            <line x1="28" y1="45" x2="40" y2="45" stroke="var(--gold)" strokeWidth="1" />
            <line x1="28" y1="325" x2="40" y2="325" stroke="var(--gold)" strokeWidth="1" />
            <rect x="20" y="176" width="28" height="18" fill="var(--card)" />
            <text x="34" y="189" textAnchor="middle" fontSize="11" fill="var(--gold)" fontFamily="var(--ff-body)">
              7,1 m
            </text>
            {/* Měřicí body */}
            {[
              [50, 45], [410, 45], [50, 325], [410, 325], [260, 215], [200, 215],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="4" fill="var(--gold)" className="fp-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </g>

          {/* ── Fáze 3: položky nabídky ── */}
          <g opacity={phase === 2 ? 1 : 0} style={{ transition: "opacity 0.5s ease" }}>
            <rect x="66" y="60" width="230" height="150" rx="3" fill="var(--card)" stroke="var(--gold)" strokeWidth="1" opacity="0.97" />
            <text x="80" y="80" fontSize="11" fill="var(--gold)" fontFamily="var(--ff-head)" letterSpacing="0.1">
              CENOVÁ NABÍDKA
            </text>
            {WORK_ITEMS.map((item, i) => (
              <g key={item} opacity={phase === 2 ? 1 : 0} style={{ transition: `opacity 0.35s ease ${0.4 + i * 0.28}s` }}>
                <text x="80" y={102 + i * 21} fontSize="10.5" fill="var(--gold)">✓</text>
                <text x="94" y={102 + i * 21} fontSize="10.5" fill="var(--text)" fontFamily="var(--ff-body)">
                  {item}
                </text>
              </g>
            ))}
          </g>

          {/* ── Fáze 4: průběh realizace ── */}
          <g opacity={phase === 3 ? 1 : 0} style={{ transition: "opacity 0.5s ease" }}>
            <rect x="50" y="336" width="360" height="6" rx="3" fill="var(--border)" />
            <rect x="50" y="336" width="360" height="6" rx="3" fill="var(--gold)" className={phase === 3 ? "fp-progress" : ""} />
          </g>

          {/* Razítko PŘEDÁNO */}
          <g
            opacity={phase === 3 ? 1 : 0}
            style={{
              transition: "opacity 0.4s ease 2.4s, transform 0.4s ease 2.4s",
              transform: phase === 3 ? "none" : "scale(0.7)",
              transformOrigin: "230px 185px",
            }}
          >
            <rect x="152" y="158" width="156" height="52" rx="3" fill="var(--card)" stroke="var(--gold)" strokeWidth="2" transform="rotate(-6 230 184)" />
            <text
              x="230"
              y="184"
              textAnchor="middle"
              fontSize="19"
              fill="var(--gold)"
              fontFamily="var(--ff-head)"
              letterSpacing="2"
              transform="rotate(-6 230 184)"
            >
              PŘEDÁNO
            </text>
            <text
              x="230"
              y="200"
              textAnchor="middle"
              fontSize="9"
              fill="var(--muted)"
              fontFamily="var(--ff-body)"
              transform="rotate(-6 230 184)"
            >
              klíče zpátky u vás
            </text>
          </g>
        </svg>

        {/* Popisek fáze */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "0.8rem",
            marginTop: "0.4rem",
            display: "flex",
            alignItems: "baseline",
            gap: "0.7rem",
            minHeight: "48px",
          }}
        >
          <span
            key={`n-${phase}`}
            style={{
              fontFamily: "var(--ff-head)",
              fontSize: "1.5rem",
              color: "var(--gold)",
              lineHeight: 1,
              animation: "fpFade 0.4s ease",
            }}
          >
            {active.num}
          </span>
          <span key={`t-${phase}`} style={{ animation: "fpFade 0.4s ease 0.05s both" }}>
            <span
              style={{
                display: "block",
                fontFamily: "var(--ff-head)",
                fontSize: "0.95rem",
                letterSpacing: "0.1em",
                color: "var(--white)",
              }}
            >
              {active.title}
            </span>
            <span style={{ display: "block", fontSize: "0.78rem", color: "var(--muted)" }}>{active.desc}</span>
          </span>
        </div>
      </div>

      <style>{`
        .fp-line {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: fpDraw 1s ease forwards;
        }
        .fp-line-outer { animation-duration: 1.4s; }
        @keyframes fpDraw { to { stroke-dashoffset: 0; } }
        @keyframes fpPulse {
          0%, 100% { r: 3.5; opacity: 0.5; }
          50% { r: 6; opacity: 1; }
        }
        .fp-pulse { animation: fpPulse 1.6s ease-in-out infinite; }
        @keyframes fpProgress { from { width: 0; } to { width: 360px; } }
        .fp-progress { animation: fpProgress 3s ease-out forwards; }
        @keyframes fpFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fp-line, .fp-pulse, .fp-progress { animation: none !important; stroke-dashoffset: 0 !important; }
        }
      `}</style>
    </div>
  );
}
