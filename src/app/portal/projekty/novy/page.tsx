"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error: insertError } = await supabase.from("projects").insert({
      name: form.get("name"),
      type: form.get("type"),
      address: form.get("address") || null,
      area_m2: form.get("area_m2") ? Number(form.get("area_m2")) : null,
      description: form.get("description") || null,
      start_date: form.get("start_date") || null,
      budget_net: form.get("budget_net") ? Number(form.get("budget_net")) : null,
      budget_gross: form.get("budget_net")
        ? Math.round(Number(form.get("budget_net")) * 1.21)
        : null,
    });

    if (insertError) {
      setError("Nepodařilo se vytvořit projekt. Zkuste to znovu.");
      setLoading(false);
      return;
    }

    router.push("/portal/projekty");
    router.refresh();
  }

  return (
    <div style={{ maxWidth: "600px" }}>
      <h1 style={{ fontFamily: "var(--ff-head)", fontSize: "2rem", marginBottom: "0.25rem" }}>
        NOVÝ PROJEKT
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "2rem" }}>
        Vytvořte novou rekonstrukci
      </p>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "2rem",
          }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Název projektu *</label>
            <input name="name" style={inputStyle} required placeholder="např. Rekonstrukce koupelny Nováková" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={labelStyle}>Typ *</label>
              <select name="type" style={{ ...inputStyle, cursor: "pointer" }} required defaultValue="">
                <option value="" disabled>Vyberte...</option>
                <option value="koupelna">Koupelna</option>
                <option value="kuchyn">Kuchyně</option>
                <option value="byt">Celý byt</option>
                <option value="dum">Rodinný dům</option>
                <option value="svj">SVJ / společné prostory</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Plocha (m²)</label>
              <input name="area_m2" type="number" style={inputStyle} placeholder="75" />
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Adresa</label>
            <input name="address" style={inputStyle} placeholder="Ulice, město" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={labelStyle}>Rozpočet bez DPH (Kč)</label>
              <input name="budget_net" type="number" style={inputStyle} placeholder="250000" />
            </div>
            <div>
              <label style={labelStyle}>Zahájení</label>
              <input name="start_date" type="date" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Popis</label>
            <textarea
              name="description"
              style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
              placeholder="Podrobnosti o projektu..."
            />
          </div>

          {error && (
            <div
              style={{
                fontSize: "0.85rem",
                color: "#9a4a2a",
                marginBottom: "1rem",
                padding: "0.75rem 1rem",
                background: "#fdf2f0",
                border: "1px solid #e8c8c0",
                borderRadius: "2px",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "var(--gold)",
                color: "#fff",
                padding: "0.8rem 2rem",
                borderRadius: "2px",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: 500,
                letterSpacing: "0.05em",
                cursor: loading ? "wait" : "pointer",
                fontFamily: "var(--ff-body)",
              }}
            >
              {loading ? "Vytvářím..." : "Vytvořit projekt"}
            </button>
            <a
              href="/portal/projekty"
              style={{
                padding: "0.8rem 1.5rem",
                borderRadius: "2px",
                border: "1px solid var(--border)",
                fontSize: "0.85rem",
                color: "var(--muted)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Zrušit
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
