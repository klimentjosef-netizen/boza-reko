"use client";

import type { UserRole } from "@/lib/auth";
import PhotoUpload from "@/components/portal/PhotoUpload";

type Project = {
  id: string;
  name: string;
  type: string;
  status: string;
  address: string | null;
  area_m2: number | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  budget_net: number | null;
  budget_gross: number | null;
  created_at: string;
};

type Milestone = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
};

type Photo = {
  id: string;
  url: string;
  caption: string | null;
  phase: string | null;
  created_at: string;
};

type Member = {
  id: string;
  role: string;
  profile: {
    full_name: string;
    phone: string | null;
    role: string;
  };
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Návrh", color: "#7a7570" },
  offer: { label: "Nabídka", color: "#a67c2a" },
  active: { label: "Aktivní", color: "#2a8a4a" },
  paused: { label: "Pozastaveno", color: "#a67c2a" },
  completed: { label: "Dokončeno", color: "#2a6a8a" },
  cancelled: { label: "Zrušeno", color: "#9a4a2a" },
};

export default function ProjectDetail({
  project,
  milestones,
  photos,
  members,
  userRole,
}: {
  project: Project;
  milestones: Milestone[];
  photos: Photo[];
  members: Member[];
  userRole: UserRole;
}) {
  const status = STATUS_LABELS[project.status] || { label: project.status, color: "#7a7570" };
  const completedMilestones = milestones.filter((m) => m.completed_at).length;
  const progress = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
            <h1 style={{ fontFamily: "var(--ff-head)", fontSize: "2rem", margin: 0 }}>
              {project.name}
            </h1>
            <span
              style={{
                padding: "0.2rem 0.6rem",
                borderRadius: "2px",
                fontSize: "0.7rem",
                fontWeight: 500,
                textTransform: "uppercase",
                background: `${status.color}15`,
                color: status.color,
                border: `1px solid ${status.color}30`,
              }}
            >
              {status.label}
            </span>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            {project.address || "Adresa neuvedena"} · {project.area_m2 ? `${project.area_m2} m²` : ""}
          </p>
        </div>
        <a
          href="/portal/projekty"
          style={{ color: "var(--muted)", fontSize: "0.85rem", textDecoration: "none" }}
        >
          ← Zpět
        </a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        {/* Left column */}
        <div>
          {/* Progress */}
          {milestones.length > 0 && (
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", fontWeight: 500 }}>
                  Postup
                </span>
                <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--gold)" }}>
                  {progress}%
                </span>
              </div>
              <div style={{ height: "6px", background: "var(--surface)", borderRadius: "3px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: "var(--gold)",
                    borderRadius: "3px",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          )}

          {/* Milestones */}
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <h2 style={{ fontFamily: "var(--ff-head)", fontSize: "1.2rem", marginBottom: "1rem" }}>
              MILNÍKY
            </h2>
            {milestones.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Zatím žádné milníky.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      padding: "0.75rem",
                      background: m.completed_at ? "rgba(42,138,74,0.05)" : "var(--surface)",
                      borderRadius: "4px",
                      border: `1px solid ${m.completed_at ? "rgba(42,138,74,0.15)" : "var(--border)"}`,
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        border: `2px solid ${m.completed_at ? "#2a8a4a" : "var(--border)"}`,
                        background: m.completed_at ? "#2a8a4a" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: "2px",
                        color: "#fff",
                        fontSize: "0.6rem",
                      }}
                    >
                      {m.completed_at ? "✓" : ""}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.88rem", fontWeight: 500 }}>{m.title}</div>
                      {m.description && (
                        <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.2rem" }}>
                          {m.description}
                        </div>
                      )}
                      {m.due_date && (
                        <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                          Termín: {new Date(m.due_date).toLocaleDateString("cs-CZ")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Photos */}
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "1.5rem",
            }}
          >
            <h2 style={{ fontFamily: "var(--ff-head)", fontSize: "1.2rem", marginBottom: "1rem" }}>
              FOTODOKUMENTACE
            </h2>
            <PhotoUpload projectId={project.id} userRole={userRole} />
            {photos.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Zatím žádné fotky.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
                {photos.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      aspectRatio: "4/3",
                      background: "var(--surface)",
                      borderRadius: "4px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <img
                      src={p.url}
                      alt={p.caption || "Foto"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {p.phase && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: "0.5rem",
                          left: "0.5rem",
                          background: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          fontSize: "0.6rem",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "2px",
                          textTransform: "uppercase",
                        }}
                      >
                        {p.phase === "before" ? "Před" : p.phase === "during" ? "Během" : "Po"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div>
          {/* Project info */}
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1rem", marginBottom: "1rem" }}>
              DETAIL PROJEKTU
            </h3>
            {[
              { label: "Typ", value: project.type },
              { label: "Plocha", value: project.area_m2 ? `${project.area_m2} m²` : "—" },
              { label: "Zahájení", value: project.start_date ? new Date(project.start_date).toLocaleDateString("cs-CZ") : "—" },
              { label: "Ukončení", value: project.end_date ? new Date(project.end_date).toLocaleDateString("cs-CZ") : "—" },
              ...(userRole === "owner"
                ? [
                    { label: "Rozpočet bez DPH", value: project.budget_net ? `${Number(project.budget_net).toLocaleString("cs-CZ")} Kč` : "—" },
                    { label: "Rozpočet s DPH", value: project.budget_gross ? `${Number(project.budget_gross).toLocaleString("cs-CZ")} Kč` : "—" },
                  ]
                : []),
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{row.label}</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Team */}
          {(userRole === "owner" || userRole === "worker") && (
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1rem", marginBottom: "1rem" }}>
                TÝM
              </h3>
              {members.length === 0 ? (
                <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Nikdo nepřiřazen.</p>
              ) : (
                members.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.5rem 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "var(--surface)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: "var(--muted)",
                      }}
                    >
                      {m.profile.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>{m.profile.full_name}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{m.role}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {project.description && (
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "1.5rem",
              }}
            >
              <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1rem", marginBottom: "0.75rem" }}>
                POPIS
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.7 }}>
                {project.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
