"use client";

import { useState } from "react";

type Project = {
  id: string;
  title: string;
  type: string;
  description: string;
  area_m2: number | null;
  duration_days: number | null;
  location: string | null;
  year: number | null;
  cover_image: string;
  images: string[];
};

const TYPE_LABELS: Record<string, string> = {
  all: "Vše",
  koupelna: "Koupelny",
  kuchyn: "Kuchyně",
  byt: "Byty",
  dum: "Domy",
  svj: "SVJ",
};

// Demo data — will be replaced by Supabase fetch
const DEMO_PROJECTS: Project[] = [
  {
    id: "1",
    title: "Kompletní rekonstrukce koupelny",
    type: "koupelna",
    description: "Demolice, nové rozvody, obklady a sanitární keramika. Moderní walk-in sprcha.",
    area_m2: 8,
    duration_days: 14,
    location: "Ostrava-Poruba",
    year: 2026,
    cover_image: "",
    images: [],
  },
  {
    id: "2",
    title: "Rekonstrukce bytu 3+1",
    type: "byt",
    description: "Celková přestavba panelákového bytu. Nová dispozice, podlahy, elektřina.",
    area_m2: 75,
    duration_days: 42,
    location: "Ostrava-Zábřeh",
    year: 2026,
    cover_image: "",
    images: [],
  },
  {
    id: "3",
    title: "Kuchyně s ostrovem",
    type: "kuchyn",
    description: "Bourání příčky, nové rozvody vody a elektřiny, příprava pro kuchyňskou linku s ostrovem.",
    area_m2: 18,
    duration_days: 21,
    location: "Ostrava-Hrabůvka",
    year: 2026,
    cover_image: "",
    images: [],
  },
  {
    id: "4",
    title: "Společné prostory SVJ",
    type: "svj",
    description: "Oprava a malba schodiště, nové osvětlení, výměna poštovních schránek.",
    area_m2: 120,
    duration_days: 10,
    location: "Ostrava-Výškovice",
    year: 2026,
    cover_image: "",
    images: [],
  },
  {
    id: "5",
    title: "Rekonstrukce rodinného domu",
    type: "dum",
    description: "Kompletní interiérová rekonstrukce včetně zateplení, nových rozvodů a podlah.",
    area_m2: 140,
    duration_days: 60,
    location: "Hlučín",
    year: 2026,
    cover_image: "",
    images: [],
  },
  {
    id: "6",
    title: "Malá koupelna v paneláku",
    type: "koupelna",
    description: "Rekonstrukce umakartového jádra. Nové rozvody, sprchový kout, podlahové vytápění.",
    area_m2: 4,
    duration_days: 12,
    location: "Ostrava-Dubina",
    year: 2026,
    cover_image: "",
    images: [],
  },
];

export default function ReferencesSection() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? DEMO_PROJECTS : DEMO_PROJECTS.filter((p) => p.type === filter);

  return (
    <section id="reference" style={{ background: "var(--bg)", padding: "6rem 3rem" }} className="fade-in">
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
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
          Naše práce
        </div>
        <h2
          style={{
            fontFamily: "var(--ff-head)",
            fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
            margin: "0 0 1rem 0",
          }}
        >
          REFERENCE
        </h2>
        <div
          style={{
            width: "48px",
            height: "3px",
            background: "var(--gold)",
            margin: "0 auto",
          }}
        />
      </div>

      {/* Filter buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.5rem",
          marginBottom: "3rem",
          flexWrap: "wrap",
        }}
      >
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              background: filter === key ? "var(--gold)" : "var(--card)",
              color: filter === key ? "#fff" : "var(--text)",
              border: `1px solid ${filter === key ? "var(--gold)" : "var(--border)"}`,
              borderRadius: "2px",
              padding: "0.5rem 1.2rem",
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "var(--ff-body)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Project grid */}
      <div
        className="ref-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {filtered.map((project) => (
          <div
            key={project.id}
            className="ref-card"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              overflow: "hidden",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Image placeholder */}
            <div
              style={{
                height: "200px",
                background: "var(--surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem",
                color: "var(--border)",
                position: "relative",
              }}
            >
              {project.cover_image ? (
                <img
                  src={project.cover_image}
                  alt={project.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ opacity: 0.5 }}>
                  {project.type === "koupelna" ? "🛁" :
                   project.type === "kuchyn" ? "🍳" :
                   project.type === "byt" ? "🏠" :
                   project.type === "dum" ? "🏡" : "🏢"}
                </span>
              )}
              {/* Type badge */}
              <span
                style={{
                  position: "absolute",
                  top: "0.75rem",
                  left: "0.75rem",
                  background: "var(--gold)",
                  color: "#fff",
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "2px",
                }}
              >
                {TYPE_LABELS[project.type] || project.type}
              </span>
            </div>

            {/* Content */}
            <div style={{ padding: "1.5rem" }}>
              <h3
                style={{
                  fontFamily: "var(--ff-head)",
                  fontSize: "1.15rem",
                  letterSpacing: "0.03em",
                  marginBottom: "0.5rem",
                }}
              >
                {project.title}
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                  marginBottom: "1rem",
                }}
              >
                {project.description}
              </p>

              {/* Meta */}
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  borderTop: "1px solid var(--border)",
                  paddingTop: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                {project.area_m2 && <span>{project.area_m2} m²</span>}
                {project.duration_days && <span>{project.duration_days} dní</span>}
                {project.location && <span>{project.location}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .ref-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 601px) and (max-width: 900px) {
          .ref-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
