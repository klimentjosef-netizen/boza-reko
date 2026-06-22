"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/auth";

type NavItem = {
  label: string;
  href: string;
  icon: string;
  roles: string[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Přehled", href: "/portal", icon: "📊", roles: ["owner", "worker", "client", "estimator"] },
  { label: "Poptávky", href: "/portal/poptavky", icon: "📩", roles: ["owner"] },
  { label: "Projekty", href: "/portal/projekty", icon: "🏗️", roles: ["owner", "worker", "client"] },
  { label: "Zprávy", href: "/portal/zpravy", icon: "💬", roles: ["owner", "worker", "client", "estimator"] },
  { label: "Božáček", href: "/portal/bozacek", icon: "🤖", roles: ["owner", "estimator"] },
  { label: "Cashflow", href: "/portal/cashflow", icon: "💰", roles: ["owner"] },
  { label: "Uživatelé", href: "/portal/uzivatele", icon: "👥", roles: ["owner"] },
];

const ROLE_LABELS: Record<string, string> = {
  owner: "Majitel",
  worker: "Řemeslník",
  client: "Klient",
  estimator: "Rozpočtář",
};

export default function PortalShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(profile.role));

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        className="portal-sidebar"
        style={{
          width: "260px",
          background: "#1a1714",
          color: "#f7f4ef",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "fixed",
          top: 0,
          left: sidebarOpen ? 0 : undefined,
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <a
            href="/"
            style={{
              fontFamily: "var(--ff-head)",
              fontSize: "1.6rem",
              letterSpacing: "0.08em",
              color: "#f7f4ef",
              textDecoration: "none",
            }}
          >
            BOZA<span style={{ color: "var(--gold)" }}>·</span>REKO
          </a>
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--gold)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginTop: "0.25rem",
            }}
          >
            Portál
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "1rem 0" }}>
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/portal" && pathname.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1.5rem",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: isActive ? 500 : 400,
                  background: isActive ? "rgba(166,124,42,0.15)" : "transparent",
                  borderRight: isActive ? "3px solid var(--gold)" : "3px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* User info */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.15rem" }}>
            {profile.full_name}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {ROLE_LABELS[profile.role] || profile.role}
          </div>
          <button
            onClick={handleLogout}
            style={{
              marginTop: "0.75rem",
              background: "none",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "2px",
              color: "rgba(255,255,255,0.5)",
              padding: "0.4rem 0.8rem",
              fontSize: "0.75rem",
              cursor: "pointer",
              width: "100%",
              fontFamily: "var(--ff-body)",
              transition: "all 0.15s",
            }}
          >
            Odhlásit se
          </button>
        </div>
      </aside>

      {/* Mobile toggle */}
      <button
        className="portal-mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          display: "none",
          position: "fixed",
          top: "1rem",
          left: "1rem",
          zIndex: 200,
          background: "#1a1714",
          color: "#f7f4ef",
          border: "none",
          borderRadius: "4px",
          padding: "0.5rem 0.75rem",
          cursor: "pointer",
          fontSize: "1.2rem",
        }}
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: "260px",
          padding: "2rem 3rem",
          minHeight: "100vh",
          background: "var(--bg)",
        }}
      >
        {children}
      </main>

      <style>{`
        @media (max-width: 900px) {
          .portal-sidebar {
            transform: translateX(${sidebarOpen ? "0" : "-100%"});
            transition: transform 0.2s;
            width: 260px !important;
          }
          .portal-mobile-toggle { display: block !important; }
          main { margin-left: 0 !important; padding: 2rem 1.5rem !important; padding-top: 4rem !important; }
        }
      `}</style>
    </div>
  );
}
