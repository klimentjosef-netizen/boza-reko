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

export default async function PortalDashboard() {
  const profile = await getProfile();
  const supabase = await createClient();

  // Stats
  let projectCount = 0;
  let activeCount = 0;
  let leadsCount = 0;
  let budgetCount = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentProjects: any[] = [];

  if (profile.role === "owner") {
    const [pRes, aRes, lRes, bRes, rpRes] = await Promise.all([
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("budgets").select("*", { count: "exact", head: true }).eq("status", "review"),
      supabase.from("projects").select("id, name, status, type, updated_at").order("updated_at", { ascending: false }).limit(5),
    ]);
    projectCount = pRes.count || 0;
    activeCount = aRes.count || 0;
    leadsCount = lRes.count || 0;
    budgetCount = bRes.count || 0;
    recentProjects = rpRes.data || [];
  } else if (profile.role === "client") {
    const { data } = await supabase
      .from("projects")
      .select("id, name, status, type, updated_at, milestones(id, title, completed_at, sort_order)")
      .eq("client_id", profile.id)
      .order("updated_at", { ascending: false });
    recentProjects = data || [];
    projectCount = recentProjects.length;
  } else if (profile.role === "worker") {
    const { data } = await supabase
      .from("project_members")
      .select("project:projects(id, name, status, type, updated_at)")
      .eq("profile_id", profile.id);
    recentProjects = (data || []).map((d) => d.project).filter(Boolean);
    projectCount = recentProjects.length;
  } else if (profile.role === "estimator") {
    const { data } = await supabase
      .from("budgets")
      .select("id, name, status, total_gross, created_at, project:projects(name)")
      .eq("status", "review")
      .order("created_at", { ascending: false });
    budgetCount = (data || []).length;
  }

  const statCards = profile.role === "owner"
    ? [
        { label: "Projekty celkem", value: projectCount, icon: "🏗️", href: "/portal/projekty" },
        { label: "Aktivní", value: activeCount, icon: "⚡", href: "/portal/projekty" },
        { label: "Nové poptávky", value: leadsCount, icon: "📩", href: "/portal/poptavky" },
        { label: "Rozpočty ke kontrole", value: budgetCount, icon: "📋", href: "/portal/bozacek" },
      ]
    : profile.role === "client"
    ? [
        { label: "Moje projekty", value: projectCount, icon: "🏗️", href: "/portal/projekty" },
      ]
    : profile.role === "worker"
    ? [
        { label: "Přiřazené projekty", value: projectCount, icon: "🏗️", href: "/portal/projekty" },
      ]
    : [
        { label: "Rozpočty ke kontrole", value: budgetCount, icon: "📋", href: "/portal/bozacek" },
      ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--ff-head)", fontSize: "2rem", marginBottom: "0.25rem" }}>
          {profile.role === "owner"
            ? "DASHBOARD"
            : `VÍTEJTE, ${(profile.full_name.split(" ")[0] || "").toUpperCase()}`}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          {profile.role === "owner" ? "Přehled vašeho podnikání"
            : profile.role === "client" ? "Přehled vašich projektů"
            : profile.role === "worker" ? "Vaše přidělené projekty"
            : "Rozpočty k vyřízení"}
        </p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(statCards.length, 4)}, 1fr)`,
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {statCards.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "1.5rem",
              textDecoration: "none",
              color: "inherit",
              transition: "border-color 0.2s",
            }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{stat.icon}</div>
            <div style={{ fontFamily: "var(--ff-head)", fontSize: "2rem", color: "var(--gold)" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "0.25rem" }}>
              {stat.label}
            </div>
          </a>
        ))}
      </div>

      {/* Recent projects / Client timeline */}
      {recentProjects.length > 0 && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ fontFamily: "var(--ff-head)", fontSize: "1.3rem", marginBottom: "1rem" }}>
            {profile.role === "client" ? "VAŠE PROJEKTY" : "POSLEDNÍ PROJEKTY"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {recentProjects.map((p: Record<string, unknown>) => {
              const status = STATUS_LABELS[p.status as string] || { label: p.status, color: "#7a7570" };
              const milestones = (p.milestones || []) as { id: string; completed_at: string | null }[];
              const completed = milestones.filter((m) => m.completed_at).length;
              const total = milestones.length;
              const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <a
                  key={p.id as string}
                  href={`/portal/projekty/${p.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1rem",
                    background: "var(--surface)",
                    borderRadius: "4px",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "background 0.15s",
                    border: "1px solid transparent",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>{p.name as string}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span
                        style={{
                          padding: "0.15rem 0.5rem",
                          borderRadius: "2px",
                          fontSize: "0.65rem",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          background: `${status.color}15`,
                          color: status.color,
                          border: `1px solid ${status.color}30`,
                        }}
                      >
                        {status.label}
                      </span>
                      {total > 0 && (
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                          {completed}/{total} milníků
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Progress bar for client view */}
                  {profile.role === "client" && total > 0 && (
                    <div style={{ width: "120px" }}>
                      <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${progress}%`, background: "var(--gold)", borderRadius: "2px" }} />
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "var(--muted)", textAlign: "right", marginTop: "0.2rem" }}>
                        {progress}%
                      </div>
                    </div>
                  )}
                  <span style={{ color: "var(--gold)", fontSize: "0.85rem" }}>→</span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick actions for owner */}
      {profile.role === "owner" && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "2rem",
          }}
        >
          <h2 style={{ fontFamily: "var(--ff-head)", fontSize: "1.3rem", marginBottom: "1.5rem" }}>
            RYCHLÉ AKCE
          </h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {[
              { label: "Nový projekt", href: "/portal/projekty/novy", icon: "➕" },
              { label: "Rozpočet s Božáčkem", href: "/portal/bozacek", icon: "🤖" },
              { label: "Poptávky", href: "/portal/poptavky", icon: "📩" },
              { label: "Přehled cashflow", href: "/portal/cashflow", icon: "💰" },
              { label: "Přidat uživatele", href: "/portal/uzivatele", icon: "👥" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 1.2rem",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "2px",
                  textDecoration: "none",
                  color: "var(--text)",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  transition: "border-color 0.2s",
                }}
              >
                <span>{action.icon}</span>
                {action.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
