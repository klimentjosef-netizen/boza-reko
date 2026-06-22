import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Návrh", color: "#7a7570" },
  offer: { label: "Nabídka", color: "#a67c2a" },
  active: { label: "Aktivní", color: "#2a8a4a" },
  paused: { label: "Pozastaveno", color: "#a67c2a" },
  completed: { label: "Dokončeno", color: "#2a6a8a" },
  cancelled: { label: "Zrušeno", color: "#9a4a2a" },
};

const TYPE_LABELS: Record<string, string> = {
  koupelna: "Koupelna",
  kuchyn: "Kuchyně",
  byt: "Byt",
  dum: "Dům",
  svj: "SVJ",
};

export default async function ProjectsPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  let query = supabase
    .from("projects")
    .select("*, client:profiles!client_id(full_name)")
    .order("created_at", { ascending: false });

  if (profile.role === "client") {
    query = query.eq("client_id", profile.id);
  }

  const { data: projects } = await query;

  return (
    <div>
      <div
        className="proj-head"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontFamily: "var(--ff-head)", fontSize: "2rem", marginBottom: "0.25rem" }}>
            PROJEKTY
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            {profile.role === "client" ? "Vaše rekonstrukce" : "Všechny rekonstrukce"}
          </p>
        </div>
        {(profile.role === "owner" || profile.role === "estimator") && (
          <a
            href="/portal/projekty/novy"
            style={{
              background: "var(--gold)",
              color: "#fff",
              padding: "0.6rem 1.4rem",
              borderRadius: "2px",
              fontSize: "0.85rem",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "background 0.2s",
            }}
          >
            + Nový projekt
          </a>
        )}
      </div>

      {/* Projects table */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        {!projects || projects.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "0.9rem",
            }}
          >
            Zatím žádné projekty.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: "700px",
              borderCollapse: "collapse",
              fontSize: "0.88rem",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border)",
                  background: "var(--surface)",
                }}
              >
                {["Název", "Typ", "Klient", "Stav", "Rozpočet", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--muted)",
                      fontWeight: 500,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((project: Record<string, unknown>) => {
                const status = STATUS_LABELS[project.status as string] || { label: project.status, color: "#7a7570" };
                const client = project.client as { full_name: string } | null;
                return (
                  <tr
                    key={project.id as string}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 500 }}>
                      {project.name as string}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--muted)" }}>
                      {TYPE_LABELS[project.type as string] || (project.type as string)}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--muted)" }}>
                      {client?.full_name || "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "2px",
                          fontSize: "0.7rem",
                          fontWeight: 500,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          background: `${status.color}15`,
                          color: status.color,
                          border: `1px solid ${status.color}30`,
                        }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--muted)" }}>
                      {project.budget_gross
                        ? `${Number(project.budget_gross).toLocaleString("cs-CZ")} Kč`
                        : "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <a
                        href={`/portal/projekty/${project.id}`}
                        style={{
                          color: "var(--gold)",
                          textDecoration: "none",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                        }}
                      >
                        Detail →
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .proj-head { flex-wrap: wrap !important; gap: 1rem !important; }
        }
      `}</style>
    </div>
  );
}
