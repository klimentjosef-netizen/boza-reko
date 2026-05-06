"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export default function HeroSection() {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-animate slider on load
  useEffect(() => {
    let frame: number;
    let start: number;
    const duration = 2000;

    function animate(time: number) {
      if (!start) start = time;
      const progress = Math.min((time - start) / duration, 1);
      // Ease in-out: slide from 25 to 50
      const ease = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      setSliderPos(25 + ease * 25);
      if (progress < 1) frame = requestAnimationFrame(animate);
    }

    const timeout = setTimeout(() => {
      frame = requestAnimationFrame(animate);
    }, 800);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !isDragging) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(5, Math.min(95, x)));
  }, [isDragging]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => handleMove(e.clientX), [handleMove]);
  const handleTouchMove = useCallback((e: React.TouchEvent) => handleMove(e.touches[0].clientX), [handleMove]);

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
      <div style={{ padding: "5rem 3rem 3rem 5rem", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }} className="hero-left">
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
            marginBottom: "1.5rem",
            width: "fit-content",
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
            fontSize: "clamp(2.8rem, 4.5vw, 4.5rem)",
            lineHeight: 1,
            letterSpacing: "0.02em",
            fontWeight: 700,
            margin: "0 0 1.5rem 0",
          }}
        >
          REKONSTRUKCE
          <br />
          <span style={{ color: "var(--gold)" }}>NA MÍRU.</span>
          <br />
          <span style={{ color: "var(--muted)", fontSize: "0.85em" }}>BEZ KOMPROMISŮ.</span>
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: "1rem",
            color: "var(--muted)",
            maxWidth: "400px",
            fontWeight: 300,
            lineHeight: 1.7,
            marginBottom: "2rem",
          }}
        >
          Koupelny, kuchyně, byty a domy. Rekonstruujeme v Ostravě a okolí.
          Vlastní řemeslníci, férové ceny, termíny dodržujeme.
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
          <a
            href="#kontakt"
            style={{
              background: "var(--gold)",
              color: "#fff",
              padding: "0.85rem 1.8rem",
              borderRadius: "2px",
              fontSize: "0.85rem",
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
              padding: "0.85rem 1.8rem",
              borderRadius: "2px",
              fontSize: "0.85rem",
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
            paddingTop: "1.5rem",
            display: "flex",
            gap: "2.5rem",
          }}
          className="hero-stats"
        >
          {[
            { value: "100", suffix: "%", label: "Vlastní řemeslo" },
            { value: "24", suffix: "h", label: "Odpověď na poptávku" },
            { value: "0", suffix: "Kč", label: "Prohlídka zdarma" },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ fontFamily: "var(--ff-head)", fontSize: "1.8rem", fontWeight: 700, color: "var(--white)" }}>
                {stat.value}
                <span style={{ color: "var(--gold)" }}>{stat.suffix}</span>
              </div>
              <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side - Before/After slider */}
      <div
        className="hero-right"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setIsDragging(false)}
          style={{
            width: "100%",
            maxWidth: "480px",
            aspectRatio: "4/3",
            position: "relative",
            borderRadius: "6px",
            overflow: "hidden",
            cursor: isDragging ? "grabbing" : "default",
            boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
            userSelect: "none",
          }}
        >
          {/* "After" layer (new/renovated) - full background */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, #f5f0e8 0%, #e8e2d6 50%, #ddd6c8 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Modern bathroom illustration */}
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))" }}>🛁</div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: "3px",
                width: "200px",
                margin: "0 auto 1.5rem",
              }}>
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} style={{
                    aspectRatio: "1",
                    background: i % 3 === 0 ? "#c9a84c" : "#ffffff",
                    borderRadius: "1px",
                    border: "1px solid rgba(0,0,0,0.05)",
                  }} />
                ))}
              </div>
              <div style={{
                fontFamily: "var(--ff-head)",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--gold)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}>
                PO REKONSTRUKCI
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.3rem" }}>
                Moderní design, kvalitní provedení
              </div>
            </div>
          </div>

          {/* "Before" layer (old/damaged) - clipped */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, #4a4540 0%, #3a3530 50%, #2a2520 100%)",
              clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transition: isDragging ? "none" : "clip-path 0.05s ease-out",
            }}
          >
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.6, filter: "grayscale(1)" }}>🔨</div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: "3px",
                width: "200px",
                margin: "0 auto 1.5rem",
              }}>
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} style={{
                    aspectRatio: "1",
                    background: i % 4 === 0 ? "#5a5550" : "#4a4540",
                    borderRadius: "1px",
                    border: "1px solid rgba(255,255,255,0.03)",
                    transform: i % 5 === 0 ? "rotate(2deg)" : "none",
                  }} />
                ))}
              </div>
              <div style={{
                fontFamily: "var(--ff-head)",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}>
                PŘED REKONSTRUKCÍ
              </div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", marginTop: "0.3rem" }}>
                Zastaralé, opotřebované
              </div>
            </div>
          </div>

          {/* Slider handle */}
          <div
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${sliderPos}%`,
              transform: "translateX(-50%)",
              width: "3px",
              background: "#fff",
              cursor: "grab",
              zIndex: 10,
              boxShadow: "0 0 8px rgba(0,0,0,0.3)",
            }}
          >
            {/* Handle circle */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#fff",
                boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "grab",
              }}
            >
              <span style={{ fontSize: "0.8rem", color: "var(--gold)", fontWeight: 700, letterSpacing: "-1px" }}>
                ◂ ▸
              </span>
            </div>
          </div>

          {/* Labels */}
          <div style={{
            position: "absolute",
            bottom: "1rem",
            left: "1rem",
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            fontSize: "0.6rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "0.3rem 0.6rem",
            borderRadius: "2px",
            zIndex: 5,
          }}>
            PŘED
          </div>
          <div style={{
            position: "absolute",
            bottom: "1rem",
            right: "1rem",
            background: "var(--gold)",
            color: "#fff",
            fontSize: "0.6rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "0.3rem 0.6rem",
            borderRadius: "2px",
            zIndex: 5,
          }}>
            PO
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-section { grid-template-columns: 1fr !important; min-height: auto !important; }
          .hero-right { padding: 1rem 2rem 3rem !important; }
          .hero-left { padding: 5rem 2rem 2rem !important; }
          .hero-stats { gap: 1.5rem !important; }
        }
      `}</style>
    </section>
  );
}
