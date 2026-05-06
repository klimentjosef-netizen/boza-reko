import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function PortalDashboard() {
  const profile = await getProfile();
  const supabase = await createClient();

  // Fetch stats based on role
  let projectCount = 0;
  let activeCount = 0;
  let leadsCount = 0;

  if (profile.role === "owner") {
    const { count: pCount } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true });
    projectCount = pCount || 0;

    const { count: aCount } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");
    activeCount = aCount || 0;

    const { count: lCount } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "new");
    leadsCount = lCount || 0;
  } else if (profile.role === "client") {
    const { count: pCount } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("client_id", profile.id);
    projectCount = pCount || 0;
  }

  const statCards = profile.role === "owner"
    ? [
        { label: "Projekty celkem", value: projectCount, icon: "🏗️" },
        { label: "Aktivní", value: activeCount, icon: "⚡" },
        { label: "Nové poptávky", value: leadsCount, icon: "📩" },
      ]
    : profile.role === "client"
    ? [
        { label: "Moje projekty", value: projectCount, icon: "🏗️" },
      ]
    : [];

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontFamily: "var(--ff-head)",
            fontSize: "2rem",
            marginBottom: "0.25rem",
          }}
        >
          {profile.role === "owner" ? "DASHBOARD" : `VÍTEJTE, ${profile.full_name.split(" ")[0].toUpperCase()}`}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          {profile.role === "owner"
            ? "Přehled vašeho podnikání"
            : profile.role === "client"
            ? "Přehled vašich projektů"
            : profile.role === "worker"
            ? "Vaše přidělené projekty"
            : "Rozpočty k vyřízení"}
        </p>
      </div>

      {/* Stat cards */}
      {statCards.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(statCards.length, 4)}, 1fr)`,
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {statCards.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "1.5rem",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{stat.icon}</div>
              <div
                style={{
                  fontFamily: "var(--ff-head)",
                  fontSize: "2rem",
                  color: "var(--gold)",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginTop: "0.25rem",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
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
          <h2
            style={{
              fontFamily: "var(--ff-head)",
              fontSize: "1.3rem",
              marginBottom: "1.5rem",
            }}
          >
            RYCHLÉ AKCE
          </h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {[
              { label: "Nový projekt", href: "/portal/projekty/novy", icon: "➕" },
              { label: "Rozpočet s Božáčkem", href: "/portal/bozacek", icon: "🤖" },
              { label: "Přehled cashflow", href: "/portal/cashflow", icon: "💰" },
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
