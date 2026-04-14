"use client";

const SERVICES = [
  {
    icon: "🛁",
    title: "KOUPELNY",
    desc: "Kompletní rekonstrukce koupelen — demolice, rozvody vody a elektřiny, obklady, dlažba, sanitárka. Malé záchody i velké koupelnové suite.",
  },
  {
    icon: "🍳",
    title: "KUCHYNĚ",
    desc: "Přestavby kuchyní včetně bourání příček, přesunu rozvodů, podlah a povrchů. Spolupracujeme s vaším dodavatelem kuchyňské linky.",
  },
  {
    icon: "🏠",
    title: "BYTY & DOMY",
    desc: "Celkové rekonstrukce bytů a rodinných domů. Bourání, dispozice, povrchy, podlahy — od projektu po předání.",
  },
  {
    icon: "🏢",
    title: "SVJ & SPOLEČNÉ PROSTORY",
    desc: "Chodby, schodiště, sklepy, společné prostory. Zkušenosti s koordinací zakázek pro bytová družstva a SVJ.",
  },
  {
    icon: "🔨",
    title: "PŘÍPRAVNÉ PRÁCE",
    desc: "Demolice, vybourání otvorů, strhání dlažby a obkladů, vyklizení. Rychle, čistě, s odvozem suti.",
  },
  {
    icon: "✨",
    title: "DOKONČOVACÍ PRÁCE",
    desc: "Malby, štukové omítky, podlahy, obklady, malířské práce. Dokončení po jiném řemeslníkovi nebo jako finální fáze naší zakázky.",
  },
];

export default function ServicesSection() {
  return (
    <section id="sluzby" style={{ background: "var(--surface)", padding: "6rem 3rem" }} className="fade-in">
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
          Co děláme
        </div>
        <h2
          style={{
            fontFamily: "var(--ff-head)",
            fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
            margin: "0 0 1rem 0",
          }}
        >
          NAŠE SLUŽBY
        </h2>
        <div
          style={{
            width: "48px",
            height: "3px",
            background: "var(--gold)",
            margin: "0 auto",
          }}
        />
      </div>

      {/* Grid */}
      <div
        className="services-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5px",
          border: "1.5px solid var(--border)",
          borderRadius: "4px",
          overflow: "hidden",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {SERVICES.map((s) => (
          <div
            key={s.title}
            className="service-card"
            style={{
              background: "var(--card)",
              padding: "2.5rem",
              position: "relative",
              overflow: "hidden",
              transition: "background 0.2s",
              cursor: "default",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0ece4")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--card)")}
          >
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{s.icon}</div>
            <h3
              style={{
                fontFamily: "var(--ff-head)",
                fontSize: "1.3rem",
                letterSpacing: "0.05em",
                marginBottom: "0.75rem",
              }}
            >
              {s.title}
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.6 }}>{s.desc}</p>
            {/* Bottom line pseudo-element via inline style workaround */}
            <span
              className="service-line"
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "var(--gold)",
                transform: "scaleX(0)",
                transformOrigin: "left",
                transition: "transform 0.3s",
              }}
            />
          </div>
        ))}
      </div>

      <style>{`
        .service-card:hover .service-line {
          transform: scaleX(1) !important;
        }
        @media (max-width: 900px) {
          .services-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
