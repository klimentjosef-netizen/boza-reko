"use client";

export default function PortalSection() {
  return (
    <section id="portal" style={{ background: "var(--bg)", padding: "6rem 3rem" }} className="fade-in portalsec-section">
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
          Unikátní služba
        </div>
        <h2
          style={{
            fontFamily: "var(--ff-head)",
            fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
            margin: "0 0 1rem 0",
            fontWeight: 700,
          }}
        >
          VÁŠ PROJEKT POD KONTROLOU
        </h2>
        <p style={{ fontSize: "1rem", color: "var(--muted)", maxWidth: "550px", margin: "0 auto", lineHeight: 1.7 }}>
          Každý klient dostane přístup do vlastního portálu, kde vidí stav své rekonstrukce v reálném čase.
        </p>
      </div>

      {/* Features grid */}
      <div
        className="portal-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
          maxWidth: "1100px",
          margin: "0 auto 4rem",
        }}
      >
        {[
          {
            icon: "📊",
            title: "PŘEHLED V REÁLNÉM ČASE",
            desc: "Vidíte aktuální stav projektu, splněné milníky a co vás čeká. Žádné překvapení.",
          },
          {
            icon: "📸",
            title: "FOTODOKUMENTACE",
            desc: "Fotky z průběhu prací. Před, během i po. Máte přehled, i když nejste na stavbě.",
          },
          {
            icon: "📅",
            title: "MILNÍKY A TERMÍNY",
            desc: "Jasný plán s termíny. Víte přesně, co se kdy děje a kolik je hotovo.",
          },
          {
            icon: "🤖",
            title: "AI ROZPOČET",
            desc: "Náš AI Božáček vytvoří detailní rozpočet za minuty. Rozpočtář ho zkontroluje a vy schvalujete.",
          },
          {
            icon: "💬",
            title: "JEDEN KONTAKT",
            desc: "Žádné hledání telefonních čísel. Vše řešíte přes portál s jedním kontaktním bodem.",
          },
          {
            icon: "🔒",
            title: "BEZPEČNOST DAT",
            desc: "Vaše data jsou na evropských serverech. Vidíte pouze svůj projekt, nic jiného.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="portal-feature"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "2rem",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{feature.icon}</div>
            <h3
              style={{
                fontFamily: "var(--ff-head)",
                fontSize: "1rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                marginBottom: "0.5rem",
              }}
            >
              {feature.title}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.6 }}>
              {feature.desc}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "2rem 3rem",
            maxWidth: "600px",
          }}
          className="portalsec-cta"
        >
          <div style={{ fontFamily: "var(--ff-head)", fontSize: "1.3rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            PORTÁL DOSTANE KAŽDÝ KLIENT ZDARMA
          </div>
          <p style={{ fontSize: "0.88rem", color: "var(--muted)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            Stačí odeslat poptávku. Po zahájení rekonstrukce vám vytvoříme přístup do portálu s kompletním přehledem vašeho projektu.
          </p>
          <a
            href="/portal"
            style={{
              background: "var(--gold)",
              color: "#fff",
              padding: "0.85rem 2rem",
              borderRadius: "2px",
              fontSize: "0.88rem",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textDecoration: "none",
              transition: "background 0.2s",
              display: "inline-block",
            }}
          >
            Prohlédnout portál →
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .portal-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 601px) and (max-width: 900px) {
          .portal-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .portalsec-section { padding: 4rem 1.25rem !important; }
          .portalsec-cta { padding: 1.75rem 1.5rem !important; }
        }
      `}</style>
    </section>
  );
}
