export default function Footer() {
  return (
    <footer
      className="site-footer"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        padding: "2.5rem 3rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      {/* Logo */}
      <a
        href="#"
        style={{
          fontFamily: "var(--ff-head)",
          fontSize: "1.4rem",
          letterSpacing: "0.08em",
          color: "var(--white)",
          textDecoration: "none",
        }}
      >
        BOZA<span style={{ color: "var(--gold)" }}>·</span>REKO
      </a>

      {/* Copyright */}
      <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
        © 2025 BOZA REKO s.r.o. · IČO 24052477 · Ostrava
      </div>

      {/* Quick links */}
      <div style={{ display: "flex", gap: "1.5rem" }}>
        {[
          { label: "Služby", href: "#sluzby" },
          { label: "Reference", href: "#reference" },
          { label: "Kalkulačka", href: "#kalkulacka" },
          { label: "Kontakt", href: "#kontakt" },
          { label: "Portál", href: "/login" },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            style={{
              fontSize: "0.82rem",
              color: "var(--muted)",
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

      <style>{`
        @media (max-width: 900px) {
          .site-footer {
            flex-direction: column !important;
            text-align: center !important;
          }
        }
      `}</style>
    </footer>
  );
}
