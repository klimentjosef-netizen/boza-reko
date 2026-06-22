"use client";

import { useEffect, useState } from "react";

export default function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        paddingTop: "80px",
      }}
    >
      {/* Subtle animated background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />

      {/* Gold accent circles */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "-5%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            border: "1px solid rgba(166,124,42,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-10%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            border: "1px solid rgba(166,124,42,0.05)",
          }}
        />
        {/* Floating gold dots */}
        {[
          { top: "20%", left: "78%", size: 6, dur: 6 },
          { top: "55%", left: "85%", size: 4, dur: 8 },
          { top: "35%", left: "70%", size: 7, dur: 7 },
          { top: "75%", left: "72%", size: 4, dur: 9 },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: "var(--gold)",
              borderRadius: "50%",
              opacity: 0.15,
              animation: `heroFloat ${p.dur}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "4rem 5rem",
          maxWidth: "750px",
          width: "100%",
        }}
        className="hero-content"
      >
        {/* Tag */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            background: "rgba(166,124,42,0.1)",
            border: "1px solid rgba(166,124,42,0.3)",
            color: "var(--gold)",
            fontSize: "0.72rem",
            fontWeight: 500,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "0.35rem 0.9rem",
            borderRadius: "2px",
            marginBottom: "2rem",
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
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
        <h1 style={{ margin: "0 0 1.5rem 0" }}>
          {[
            { text: "REKONSTRUKCE", color: "var(--white)" },
            { text: "NA MÍRU.", color: "var(--gold)" },
            { text: "BEZ KOMPROMISŮ.", color: "var(--muted)" },
          ].map((line, i) => (
            <span
              key={i}
              style={{
                display: "block",
                fontFamily: "var(--ff-head)",
                fontSize: "clamp(2.8rem, 5.5vw, 5rem)",
                lineHeight: 1.05,
                letterSpacing: "0.02em",
                fontWeight: 700,
                color: line.color,
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(24px)",
                transition: `opacity 0.6s ease ${0.15 + i * 0.12}s, transform 0.6s ease ${0.15 + i * 0.12}s`,
              }}
            >
              {line.text}
            </span>
          ))}
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: "1.05rem",
            color: "var(--muted)",
            maxWidth: "460px",
            fontWeight: 300,
            lineHeight: 1.7,
            marginBottom: "2.5rem",
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.6s, transform 0.6s ease 0.6s",
          }}
        >
          Koupelny, kuchyně, byty a domy. Rekonstruujeme v Ostravě a okolí.
          Vlastní řemeslníci, férové ceny, termíny dodržujeme.
        </p>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "3rem",
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.75s, transform 0.6s ease 0.75s",
          }}
        >
          <a
            href="#kontakt"
            style={{
              background: "var(--gold)",
              color: "#fff",
              padding: "1rem 2.2rem",
              borderRadius: "2px",
              fontSize: "0.9rem",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textDecoration: "none",
              transition: "background 0.2s",
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
              padding: "1rem 2.2rem",
              borderRadius: "2px",
              fontSize: "0.9rem",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textDecoration: "none",
              transition: "border-color 0.2s, color 0.2s",
            }}
          >
            Spočítat cenu
          </a>
        </div>

        {/* Stats */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "2rem",
            display: "flex",
            gap: "3rem",
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.9s, transform 0.6s ease 0.9s",
          }}
          className="hero-stats"
        >
          {[
            { value: "100", suffix: "%", label: "Vlastní řemeslo" },
            { value: "24", suffix: "h", label: "Odpověď na poptávku" },
            { value: "0", suffix: "Kč", label: "Prohlídka zdarma" },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ fontFamily: "var(--ff-head)", fontSize: "2rem", fontWeight: 700, color: "var(--white)" }}>
                {stat.value}
                <span style={{ color: "var(--gold)" }}>{stat.suffix}</span>
              </div>
              <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @media (max-width: 900px) {
          .hero-content { padding: 3rem 2rem !important; }
          .hero-stats { gap: 1.5rem !important; flex-wrap: wrap; }
        }
        @media (max-width: 480px) {
          .hero-content { padding: 2.5rem 1.25rem !important; }
        }
      `}</style>
    </section>
  );
}
