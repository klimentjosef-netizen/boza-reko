"use client";

const SERVICES = [
  {
    num: "01",
    title: "KOUPELNY A WC",
    desc: "Kompletní rekonstrukce koupelen, demolice, rozvody vody a elektřiny, obklady, dlažba, sanitární keramika. Od malých WC po velké koupelny.",
  },
  {
    num: "02",
    title: "KUCHYNĚ",
    desc: "Přestavby kuchyní včetně bourání příček, přesunu rozvodů, podlah a povrchů. Příprava pro kuchyňskou linku dle vašeho návrhu.",
  },
  {
    num: "03",
    title: "BYTY NA KLÍČ",
    desc: "Celkové rekonstrukce bytů od projektu po předání. Nová dispozice, rozvody, povrchy, podlahy. Vše pod jednou střechou.",
  },
  {
    num: "04",
    title: "RODINNÉ DOMY",
    desc: "Interiérové rekonstrukce domů. Koordinace všech řemesel, od hrubé stavby po finální úpravy. Včetně zateplení a rozvodů.",
  },
  {
    num: "05",
    title: "SVJ A SPOLEČNÉ PROSTORY",
    desc: "Chodby, schodiště, sklepy, společné prostory. Zkušenosti s koordinací zakázek pro bytová družstva a SVJ.",
  },
  {
    num: "06",
    title: "ELEKTRO A ROZVODY",
    desc: "Kompletní elektroinstalace, rozvody vody, topení a kanalizace. Revize, nové rozvaděče, podlahové vytápění.",
  },
];

export default function ServicesSection() {
  return (
    <section id="sluzby" style={{ background: "var(--surface)", padding: "6rem 3rem" }} className="fade-in svc-section">
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
            fontWeight: 700,
          }}
        >
          NAŠE SLUŽBY
        </h2>
        <div style={{ width: "48px", height: "3px", background: "var(--gold)", margin: "0 auto" }} />
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
            key={s.num}
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
            {/* Number */}
            <div
              style={{
                fontFamily: "var(--ff-head)",
                fontSize: "2.5rem",
                fontWeight: 700,
                color: "var(--border)",
                lineHeight: 1,
                marginBottom: "1rem",
              }}
            >
              {s.num}
            </div>
            <h3
              style={{
                fontFamily: "var(--ff-head)",
                fontSize: "1.15rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                marginBottom: "0.75rem",
              }}
            >
              {s.title}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.6, marginBottom: "1.25rem" }}>{s.desc}</p>

            {/* CTA link */}
            <a
              href="#kalkulacka"
              style={{
                fontSize: "0.78rem",
                fontWeight: 500,
                color: "var(--gold)",
                textDecoration: "none",
                letterSpacing: "0.05em",
                transition: "color 0.2s",
              }}
            >
              Spočítat cenu →
            </a>

            {/* Bottom accent line */}
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
        @media (max-width: 768px) {
          .svc-section { padding: 4rem 1.25rem !important; }
          .service-card { padding: 2rem 1.5rem !important; }
        }
      `}</style>
    </section>
  );
}
