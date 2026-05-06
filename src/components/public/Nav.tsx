"use client";

import { useState } from "react";
import Logo from "@/components/ui/Logo";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "rgba(247,244,239,0.9)",
        borderBottom: "1px solid var(--border)",
        padding: "1.2rem 3rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <a href="#" style={{ textDecoration: "none", lineHeight: 0 }}>
        <Logo variant="full" theme="color" size="sm" />
      </a>

      <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
        {[
          { label: "Služby", href: "#sluzby" },
          { label: "Reference", href: "#reference" },
          { label: "Jak to funguje", href: "#proces" },
          { label: "Kalkulačka", href: "#kalkulacka" },
          { label: "Kontakt", href: "#kontakt" },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            style={{
              color: "var(--muted)",
              fontSize: "0.85rem",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            {link.label}
          </a>
        ))}
      </div>

      <a
        href="#kontakt"
        className="nav-cta"
        style={{
          background: "var(--gold)",
          color: "#fff",
          padding: "0.5rem 1.4rem",
          borderRadius: "2px",
          fontSize: "0.85rem",
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          textDecoration: "none",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gold-light)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--gold)")}
      >
        Poptávka zdarma
      </a>

      {/* Mobile menu button */}
      <button
        className="nav-mobile-btn"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        style={{
          display: "none",
          background: "none",
          border: "none",
          cursor: "pointer",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <span style={{ display: "block", width: "20px", height: "2px", background: "var(--white)" }} />
        <span style={{ display: "block", width: "20px", height: "2px", background: "var(--white)" }} />
        <span style={{ display: "block", width: "20px", height: "2px", background: "var(--white)" }} />
      </button>

      <style>{`
        @media (max-width: 900px) {
          .nav-links { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
