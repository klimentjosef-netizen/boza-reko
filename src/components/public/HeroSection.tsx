"use client";

import { useEffect, useState } from "react";

export default function HeroSection() {
  const [offset, setOffset] = useState(0);
  const [visible, setVisible] = useState(false);

  // Parallax on scroll
  useEffect(() => {
    function handleScroll() {
      setOffset(window.scrollY * 0.3);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Staggered entrance animation
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
      }}
    >
      {/* Animated background - diagonal moving grid */}
      <div
        style={{
          position: "absolute",
          inset: "-50%",
          backgroundImage: `
            linear-gradient(45deg, transparent 48%, rgba(166,124,42,0.06) 49%, rgba(166,124,42,0.06) 51%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, rgba(166,124,42,0.04) 49%, rgba(166,124,42,0.04) 51%, transparent 52%)
          `,
          backgroundSize: "80px 80px",
          transform: `translate(${offset * 0.1}px, ${-offset * 0.15}px)`,
          animation: "heroGridMove 20s linear infinite",
          pointerEvents: "none",
        }}
      />

      {/* Floating construction elements */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {/* Large accent circle */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "-5%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            border: "1px solid rgba(166,124,42,0.08)",
            transform: `translateY(${-offset * 0.2}px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "15%",
            right: "-2%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            border: "1px solid rgba(166,124,42,0.05)",
            transform: `translateY(${-offset * 0.15}px)`,
          }}
        />

        {/* Floating particles */}
        {[
          { top: "20%", left: "75%", size: 6, delay: 0, dur: 6 },
          { top: "60%", left: "85%", size: 4, delay: 2, dur: 8 },
          { top: "40%", left: "65%", size: 8, delay: 1, dur: 7 },
          { top: "80%", left: "70%", size: 5, delay: 3, dur: 5 },
          { top: "30%", left: "90%", size: 3, delay: 4, dur: 9 },
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
              opacity: 0.2,
              animation: `heroFloat ${p.dur}s ease-in-out ${p.delay}s infinite`,
              transform: `translateY(${-offset * 0.1}px)`,
            }}
          />
        ))}

        {/* Construction line accents */}
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            right: "10%",
            width: "200px",
            height: "2px",
            background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
            opacity: 0.15,
            transform: `translateX(${offset * 0.1}px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "25%",
            right: "20%",
            width: "120px",
            height: "2px",
            background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
            opacity: 0.1,
            transform: `translateX(${-offset * 0.05}px)`,
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "8rem 5rem 5rem",
          maxWidth: "800px",
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
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
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

        {/* H1 - staggered lines */}
        <h1 style={{ margin: "0 0 1.5rem 0" }}>
          {["REKONSTRUKCE", "NA MÍRU.", "BEZ KOMPROMISŮ."].map((line, i) => (
            <span
              key={line}
              style={{
                display: "block",
                fontFamily: "var(--ff-head)",
                fontSize: i === 0 ? "clamp(3.5rem, 6vw, 6rem)" : "clamp(3rem, 5vw, 5rem)",
                lineHeight: 1,
                letterSpacing: "0.02em",
                fontWeight: 700,
                color: i === 1 ? "var(--gold)" : i === 2 ? "var(--muted)" : "var(--white)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: `opacity 0.8s ease ${0.2 + i * 0.15}s, transform 0.8s ease ${0.2 + i * 0.15}s`,
              }}
            >
              {line}
            </span>
          ))}
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: "1.1rem",
            color: "var(--muted)",
            maxWidth: "480px",
            fontWeight: 300,
            lineHeight: 1.7,
            marginBottom: "2.5rem",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease 0.7s, transform 0.8s ease 0.7s",
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
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease 0.9s, transform 0.8s ease 0.9s",
          }}
        >
          <a
            href="#kontakt"
            className="hero-btn-primary"
            style={{
              background: "var(--gold)",
              color: "#fff",
              padding: "1rem 2.2rem",
              borderRadius: "2px",
              fontSize: "0.9rem",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textDecoration: "none",
              transition: "background 0.2s, transform 0.2s",
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
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease 1.1s, transform 0.8s ease 1.1s",
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

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          opacity: visible ? 0.4 : 0,
          transition: "opacity 1s ease 1.5s",
          animation: "heroScrollPulse 2s ease-in-out infinite",
        }}
      >
        <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>
          Scroll
        </div>
        <div style={{ width: "1px", height: "30px", background: "linear-gradient(to bottom, var(--muted), transparent)" }} />
      </div>

      <style>{`
        @keyframes heroGridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(80px, 80px); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes heroScrollPulse {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
        .hero-btn-primary:hover {
          background: var(--gold-light) !important;
          transform: translateY(-2px);
        }
        @media (max-width: 900px) {
          .hero-content { padding: 7rem 2rem 4rem !important; }
          .hero-stats { gap: 1.5rem !important; flex-wrap: wrap; }
        }
      `}</style>
    </section>
  );
}
