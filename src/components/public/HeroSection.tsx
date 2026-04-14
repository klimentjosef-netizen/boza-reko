"use client";

export default function HeroSection() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        paddingTop: "80px",
        position: "relative",
      }}
      className="hero-section"
    >
      {/* Grid pattern background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />

      {/* Left side */}
      <div style={{ padding: "6rem 3rem 4rem 6rem", position: "relative", zIndex: 1 }} className="hero-left">
        {/* Tag */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            background: "rgba(166,124,42,0.1)",
            border: "1px solid rgba(166,124,42,0.3)",
            color: "var(--gold)",
            fontSize: "0.75rem",
            fontWeight: 500,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "0.35rem 0.9rem",
            borderRadius: "2px",
            marginBottom: "1.5rem",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              background: "var(--gold)",
              borderRadius: "50%",
              animation: "blink 2s infinite",
            }}
          />
          Přijímáme zakázky
        </div>

        {/* H1 */}
        <h1
          style={{
            fontFamily: "var(--ff-head)",
            fontSize: "clamp(3.5rem, 6vw, 6rem)",
            lineHeight: 0.95,
            letterSpacing: "0.03em",
            margin: "0 0 1.5rem 0",
          }}
        >
          REKONSTRUKCE
          <br />
          <span style={{ color: "var(--gold)" }}>NA MÍRU.</span>
          <br />
          <span style={{ color: "var(--muted)" }}>BEZ KOMPROMISŮ.</span>
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: "1.1rem",
            color: "var(--muted)",
            maxWidth: "420px",
            fontWeight: 300,
            lineHeight: 1.7,
            marginBottom: "2rem",
          }}
        >
          Koupelny, kuchyně, byty a domy — rekonstruujeme v Ostravě a okolí. Vlastní řemeslníci, férové ceny, termíny
          dodržujeme.
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
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
              transition: "background 0.2s, transform 0.2s",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--gold-light)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--gold)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Nezávazná poptávka
          </a>
          <a
            href="#kalkulacka"
            style={{
              background: "transparent",
              color: "var(--white)",
              border: "1px solid var(--border)",
              padding: "0.9rem 2rem",
              borderRadius: "2px",
              fontSize: "0.9rem",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textDecoration: "none",
              transition: "border-color 0.2s, color 0.2s",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--gold)";
              e.currentTarget.style.color = "var(--gold)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--white)";
            }}
          >
            Spočítat cenu
          </a>
        </div>

        {/* Stats */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            marginTop: "3rem",
            paddingTop: "2rem",
            display: "flex",
            gap: "3rem",
          }}
          className="hero-stats"
        >
          {[
            { value: "100", suffix: "%", label: "Vlastní řemeslo" },
            { value: "2", suffix: "×", label: "Zkušení jednatelé" },
            { value: "DPH", suffix: "✓", label: "Plátce DPH" },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ fontFamily: "var(--ff-head)", fontSize: "2.2rem", color: "var(--white)" }}>
                {stat.value}
                <span style={{ color: "var(--gold)" }}>{stat.suffix}</span>
              </div>
              <div
                style={{
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--muted)",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side — card stack */}
      <div
        className="hero-right"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ width: "340px", height: "420px", position: "relative" }}>
          {/* Back card */}
          <div
            style={{
              position: "absolute",
              top: "40px",
              right: 0,
              width: "300px",
              height: "380px",
              background: "linear-gradient(135deg, #e8e4db, #dedad0)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
            }}
          />
          {/* Front card */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "300px",
              height: "380px",
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🏗️</div>
            <div
              style={{
                fontFamily: "var(--ff-head)",
                fontSize: "1.6rem",
                marginBottom: "0.5rem",
              }}
            >
              AKTIVNÍ ZAKÁZKA
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              Koupelna 7 m² · Zábřeh, Ostrava
              <br />
              Obklady, dlažba, sanitárka, elektro
            </p>

            {/* Progress bars */}
            {[
              { label: "Demolice", pct: 35 },
              { label: "Rozvody", pct: 0 },
              { label: "Povrchy", pct: 0 },
            ].map((bar) => (
              <div key={bar.label} style={{ marginBottom: "0.75rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    color: "var(--muted)",
                    marginBottom: "0.3rem",
                  }}
                >
                  <span>{bar.label}</span>
                  <span>{bar.pct}%</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "4px",
                    background: "var(--border)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${bar.pct}%`,
                      height: "100%",
                      background: "var(--gold)",
                      borderRadius: "2px",
                      animation: bar.pct > 0 ? "grow 1.5s ease forwards" : undefined,
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Status tag */}
            <div style={{ marginTop: "auto" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "rgba(166,124,42,0.1)",
                  border: "1px solid rgba(166,124,42,0.25)",
                  color: "var(--gold)",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "0.3rem 0.7rem",
                  borderRadius: "2px",
                }}
              >
                ⬤ PROBÍHÁ
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-section { grid-template-columns: 1fr !important; }
          .hero-right { display: none !important; }
          .hero-left { padding: 6rem 2rem 4rem !important; }
        }
      `}</style>
    </section>
  );
}
