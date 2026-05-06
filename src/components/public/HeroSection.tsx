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
            fontSize: "clamp(3rem, 5.5vw, 5.5rem)",
            lineHeight: 0.95,
            letterSpacing: "0.02em",
            fontWeight: 700,
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
            fontSize: "1.05rem",
            color: "var(--muted)",
            maxWidth: "420px",
            fontWeight: 300,
            lineHeight: 1.7,
            marginBottom: "2rem",
          }}
        >
          Koupelny, kuchyně, byty a domy. Rekonstruujeme v Ostravě a okolí.
          Vlastní řemeslníci, férové ceny, termíny dodržujeme.
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
            { value: "24", suffix: "h", label: "Odpověď na poptávku" },
            { value: "0", suffix: "Kč", label: "Prohlídka zdarma" },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ fontFamily: "var(--ff-head)", fontSize: "2.2rem", fontWeight: 600, color: "var(--white)" }}>
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

      {/* Right side - Portal phone mockup */}
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
        {/* Phone frame */}
        <div
          style={{
            width: "280px",
            height: "560px",
            background: "#1a1714",
            borderRadius: "32px",
            padding: "12px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.1)",
            position: "relative",
          }}
        >
          {/* Notch */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100px",
              height: "24px",
              background: "#1a1714",
              borderRadius: "0 0 16px 16px",
              zIndex: 10,
            }}
          />
          {/* Screen */}
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "var(--bg)",
              borderRadius: "22px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Portal header */}
            <div
              style={{
                background: "#1a1714",
                padding: "2.5rem 1.2rem 1rem",
                color: "#f7f4ef",
              }}
            >
              <div style={{ fontFamily: "var(--ff-head)", fontSize: "0.85rem", letterSpacing: "0.08em", fontWeight: 600 }}>
                BOZA<span style={{ color: "var(--gold)" }}>.</span>REKO
              </div>
              <div style={{ fontSize: "0.55rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: "0.15rem" }}>
                Portál
              </div>
            </div>

            {/* Portal content */}
            <div style={{ padding: "1rem", flex: 1 }}>
              {/* Welcome */}
              <div style={{ fontFamily: "var(--ff-head)", fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                DASHBOARD
              </div>

              {/* Mini stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.75rem" }}>
                {[
                  { v: "3", l: "Projekty", c: "var(--gold)" },
                  { v: "1", l: "Aktivní", c: "#2a8a4a" },
                ].map((s) => (
                  <div
                    key={s.l}
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      padding: "0.5rem",
                    }}
                  >
                    <div style={{ fontFamily: "var(--ff-head)", fontSize: "1.2rem", color: s.c, fontWeight: 600 }}>{s.v}</div>
                    <div style={{ fontSize: "0.5rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Mini project card */}
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  padding: "0.75rem",
                  marginBottom: "0.5rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 500 }}>Koupelna Nováková</div>
                  <span
                    style={{
                      fontSize: "0.45rem",
                      background: "rgba(42,138,74,0.15)",
                      color: "#2a8a4a",
                      padding: "0.1rem 0.3rem",
                      borderRadius: "2px",
                      fontWeight: 500,
                      textTransform: "uppercase",
                    }}
                  >
                    Aktivní
                  </span>
                </div>
                {/* Progress */}
                <div style={{ height: "3px", background: "var(--border)", borderRadius: "2px", overflow: "hidden", marginBottom: "0.3rem" }}>
                  <div style={{ width: "65%", height: "100%", background: "var(--gold)", borderRadius: "2px" }} />
                </div>
                <div style={{ fontSize: "0.5rem", color: "var(--muted)" }}>4/6 milníků</div>
              </div>

              {/* Mini project card 2 */}
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  padding: "0.75rem",
                  marginBottom: "0.5rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 500 }}>Byt 3+1 Zábřeh</div>
                  <span
                    style={{
                      fontSize: "0.45rem",
                      background: "rgba(166,124,42,0.15)",
                      color: "var(--gold)",
                      padding: "0.1rem 0.3rem",
                      borderRadius: "2px",
                      fontWeight: 500,
                      textTransform: "uppercase",
                    }}
                  >
                    Nabídka
                  </span>
                </div>
                <div style={{ fontSize: "0.5rem", color: "var(--muted)" }}>Čeká na schválení</div>
              </div>

              {/* AI Božáček badge */}
              <div
                style={{
                  background: "rgba(166,124,42,0.08)",
                  border: "1px solid rgba(166,124,42,0.2)",
                  borderRadius: "4px",
                  padding: "0.6rem 0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginTop: "0.5rem",
                }}
              >
                <span style={{ fontSize: "1rem" }}>🤖</span>
                <div>
                  <div style={{ fontSize: "0.6rem", fontWeight: 500, color: "var(--gold)" }}>AI Božáček</div>
                  <div style={{ fontSize: "0.45rem", color: "var(--muted)" }}>Rozpočet za minuty</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating label */}
        <div
          style={{
            position: "absolute",
            bottom: "3rem",
            right: "2rem",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "0.75rem 1.2rem",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            fontSize: "0.75rem",
            color: "var(--muted)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span style={{ color: "var(--gold)", fontSize: "1rem" }}>✦</span>
          Váš projekt pod kontrolou 24/7
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
