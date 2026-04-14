"use client";

const STEPS = [
  {
    num: "01",
    title: "POPTÁVKA",
    desc: "Kontaktujete nás, popíšete co potřebujete. Ideálně s fotkami a přibližnými rozměry.",
  },
  {
    num: "02",
    title: "PROHLÍDKA",
    desc: "Přijedeme na místo, změříme, zhodnotíme rozsah a probereme vaše představy.",
  },
  {
    num: "03",
    title: "NABÍDKA",
    desc: "Do týdne dostanete cenovou nabídku s rozpisem prací. Žádné skryté položky.",
  },
  {
    num: "04",
    title: "REALIZACE",
    desc: "Domluvíme termín, podepíšeme smlouvu a jdeme do toho. Průběžně vás informujeme.",
  },
];

export default function ProcessSection() {
  return (
    <section id="proces" style={{ background: "var(--bg)", padding: "6rem 3rem" }} className="fade-in">
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <div
          style={{
            color: "var(--gold)",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            marginBottom: "0.75rem",
            fontWeight: 500,
          }}
        >
          Jak to funguje
        </div>
        <h2
          style={{
            fontFamily: "var(--ff-head)",
            fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
            margin: 0,
          }}
        >
          4 KROKY OD NÁPADU PO VÝSLEDEK
        </h2>
      </div>

      {/* Steps grid */}
      <div
        className="process-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "2rem",
          maxWidth: "1000px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* Horizontal connecting line */}
        <div
          className="process-line"
          style={{
            position: "absolute",
            top: "28px",
            left: "10%",
            right: "10%",
            height: "1px",
            background: "linear-gradient(90deg, transparent, var(--border), var(--border), transparent)",
            pointerEvents: "none",
          }}
        />

        {STEPS.map((step) => (
          <div
            key={step.num}
            className="process-step"
            style={{ textAlign: "center", position: "relative" }}
          >
            <div
              className="step-number"
              style={{
                width: "56px",
                height: "56px",
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "2px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--ff-head)",
                fontSize: "1.4rem",
                color: "var(--gold)",
                marginBottom: "1.2rem",
                transition: "background 0.2s, border-color 0.2s",
              }}
            >
              {step.num}
            </div>
            <h3
              style={{
                fontFamily: "var(--ff-head)",
                fontSize: "1.2rem",
                letterSpacing: "0.05em",
                marginBottom: "0.5rem",
              }}
            >
              {step.title}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.6 }}>{step.desc}</p>
          </div>
        ))}
      </div>

      <style>{`
        .process-step:hover .step-number {
          background: rgba(166,124,42,0.12) !important;
          border-color: var(--gold) !important;
        }
        @media (max-width: 900px) {
          .process-grid { grid-template-columns: 1fr 1fr !important; }
          .process-line { display: none !important; }
        }
      `}</style>
    </section>
  );
}
