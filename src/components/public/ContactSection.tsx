"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Zadejte jméno"),
  phone: z.string().min(9, "Zadejte platný telefon"),
  email: z.string().email("Zadejte platný e-mail"),
  type: z.string().min(1, "Vyberte typ rekonstrukce"),
  description: z.string().optional(),
  website: z.string().max(0).optional(), // honeypot
});

type FormData = z.infer<typeof schema>;

const inputStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid var(--border)",
  borderRadius: "2px",
  padding: "0.8rem 1rem",
  fontSize: "0.9rem",
  width: "100%",
  boxSizing: "border-box",
  color: "var(--text)",
  fontFamily: "var(--ff-body)",
  transition: "border-color 0.2s",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--muted)",
  marginBottom: "0.4rem",
  display: "block",
  fontWeight: 500,
};

const errorStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#9a4a2a",
  marginTop: "0.3rem",
};

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setSending(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSubmitted(true);
    } catch {
      alert("Něco se pokazilo. Zkuste to prosím znovu.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="kontakt" style={{ background: "var(--bg)", padding: "6rem 3rem" }} className="fade-in">
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
          Kontakt
        </div>
        <h2 style={{ fontFamily: "var(--ff-head)", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", margin: 0 }}>
          NEZÁVAZNÁ POPTÁVKA
        </h2>
      </div>

      <div
        className="contact-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "5rem",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Left — Form */}
        <div>
          {submitted ? (
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "3rem 2rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
              <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                POPTÁVKA ODESLÁNA
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                Děkujeme! Ozveme se vám co nejdříve.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Honeypot */}
              <div style={{ display: "none" }} aria-hidden="true">
                <input type="text" {...register("website")} tabIndex={-1} autoComplete="off" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={labelStyle}>Jméno *</label>
                  <input
                    {...register("name")}
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  />
                  {errors.name && <div style={errorStyle}>{errors.name.message}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Telefon *</label>
                  <input
                    {...register("phone")}
                    type="tel"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  />
                  {errors.phone && <div style={errorStyle}>{errors.phone.message}</div>}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>E-mail *</label>
                <input
                  {...register("email")}
                  type="email"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                {errors.email && <div style={errorStyle}>{errors.email.message}</div>}
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Typ rekonstrukce *</label>
                <select
                  {...register("type")}
                  style={{ ...inputStyle, cursor: "pointer" }}
                  defaultValue=""
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  <option value="" disabled>
                    Vyberte...
                  </option>
                  <option value="koupelna">Koupelna</option>
                  <option value="kuchyn">Kuchyně</option>
                  <option value="byt">Celý byt</option>
                  <option value="dum">Rodinný dům</option>
                  <option value="svj">SVJ / společné prostory</option>
                  <option value="jine">Jiné</option>
                </select>
                {errors.type && <div style={errorStyle}>{errors.type.message}</div>}
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Popis projektu</label>
                <textarea
                  {...register("description")}
                  style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                style={{
                  background: "var(--gold)",
                  color: "#fff",
                  padding: "0.9rem 2rem",
                  borderRadius: "2px",
                  border: "none",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                  cursor: sending ? "wait" : "pointer",
                  width: "100%",
                  transition: "background 0.2s",
                }}
              >
                {sending ? "Odesílám..." : "Odeslat poptávku"}
              </button>
            </form>
          )}
        </div>

        {/* Right — Contact info */}
        <div>
          <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1.8rem", marginBottom: "2rem" }}>
            KONTAKTNÍ ÚDAJE
          </h3>

          {[
            {
              icon: "📍",
              label: "Sídlo",
              value: "Zajcevova 465/2, Zábřeh, 700 30 Ostrava",
            },
            {
              icon: "🏢",
              label: "Firma",
              value: "BOZA REKO s.r.o. / IČO: 24052477",
            },
            {
              icon: "⚡",
              label: "Provoz",
              value: "Zakázky od března 2026 / Ostrava a okolí",
            },
            {
              icon: "🧾",
              label: "DPH",
              value: "Plátce DPH · fakturujeme s DPH",
            },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--muted)",
                    marginBottom: "0.2rem",
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: "0.9rem" }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
        }
      `}</style>
    </section>
  );
}
