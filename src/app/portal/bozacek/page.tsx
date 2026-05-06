"use client";

import { useState } from "react";
import BudgetEditor from "@/components/portal/BudgetEditor";

type BudgetItem = {
  category: string;
  name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total: number;
};

type BudgetResult = {
  items: BudgetItem[];
  total_net: number;
  total_gross: number;
  estimated_days: number;
  notes: string;
};

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

export default function BozacekPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BudgetResult | null>(null);
  const [params, setParams] = useState<Record<string, string> | null>(null);

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const form = new FormData(e.currentTarget);
    const body = {
      apartment_type: form.get("apartment_type"),
      quality_level: form.get("quality_level"),
      area_m2: Number(form.get("area_m2")),
      additional_notes: form.get("additional_notes"),
    };

    try {
      const res = await fetch("/api/bozacek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Něco se pokazilo.");
        return;
      }

      setResult(data.budget);
      setParams(data.params);
    } catch {
      setError("Nepodařilo se spojit s Božáčkem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--ff-head)", fontSize: "2rem", marginBottom: "0.25rem" }}>
          🤖 AI BOŽÁČEK
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Zadejte parametry rekonstrukce a Božáček vygeneruje detailní rozpočet
        </p>
      </div>

      {!result ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          {/* Left — Form */}
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "2rem",
            }}
          >
            <form onSubmit={handleGenerate}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Typ nemovitosti *</label>
                <select name="apartment_type" style={{ ...inputStyle, cursor: "pointer" }} required defaultValue="">
                  <option value="" disabled>Vyberte...</option>
                  <option value="Byt 1+kk">Byt 1+kk</option>
                  <option value="Byt 1+1">Byt 1+1</option>
                  <option value="Byt 2+kk">Byt 2+kk</option>
                  <option value="Byt 2+1">Byt 2+1</option>
                  <option value="Byt 3+kk">Byt 3+kk</option>
                  <option value="Byt 3+1">Byt 3+1</option>
                  <option value="Byt 4+kk">Byt 4+kk</option>
                  <option value="Byt 4+1">Byt 4+1</option>
                  <option value="Rodinný dům">Rodinný dům</option>
                  <option value="Koupelna">Pouze koupelna</option>
                  <option value="Kuchyně">Pouze kuchyně</option>
                  <option value="SVJ - společné prostory">SVJ - společné prostory</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={labelStyle}>Kvalita *</label>
                  <select name="quality_level" style={{ ...inputStyle, cursor: "pointer" }} required defaultValue="">
                    <option value="" disabled>Vyberte...</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Plocha (m²) *</label>
                  <input name="area_m2" type="number" style={inputStyle} required placeholder="75" min="1" />
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Další požadavky</label>
                <textarea
                  name="additional_notes"
                  style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                  placeholder="Např.: Walk-in sprcha, podlahové vytápění, bourání příčky mezi kuchyní a obývákem..."
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

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: "var(--gold)",
                  color: "#fff",
                  padding: "0.9rem 2rem",
                  borderRadius: "2px",
                  border: "none",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                  cursor: loading ? "wait" : "pointer",
                  width: "100%",
                  fontFamily: "var(--ff-body)",
                  transition: "background 0.2s",
                }}
              >
                {loading ? "🤖 Božáček počítá..." : "Vygenerovat rozpočet"}
              </button>
            </form>
          </div>

          {/* Right — Info */}
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "2rem",
            }}
          >
            <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1.2rem", marginBottom: "1.5rem" }}>
              JAK TO FUNGUJE
            </h3>
            {[
              { step: "1", title: "Zadáte parametry", desc: "Typ, dispozice, plocha, kvalita" },
              { step: "2", title: "Božáček vygeneruje rozpočet", desc: "AI vytvoří detailní rozpis položek a cen" },
              { step: "3", title: "Rozpočtář zkontroluje", desc: "Upraví ceny a položky přímo v systému" },
              { step: "4", title: "Jedním kliknutím → projekt", desc: "Schválený rozpočet se stane projektem" },
            ].map((s) => (
              <div key={s.step} style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "var(--gold)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                >
                  {s.step}
                </div>
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 500 }}>{s.title}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{s.desc}</div>
                </div>
              </div>
            ))}

            <div
              style={{
                marginTop: "2rem",
                padding: "1rem",
                background: "var(--surface)",
                borderRadius: "4px",
                fontSize: "0.8rem",
                color: "var(--muted)",
                lineHeight: 1.6,
              }}
            >
              💡 Rozpočet obsahuje pouze ceny práce. Materiál si klient vybírá sám — ceny materiálu se do rozpočtu nepočítají.
            </div>
          </div>
        </div>
      ) : (
        <BudgetEditor
          budget={result}
          params={params || {}}
          onBack={() => { setResult(null); setParams(null); }}
        />
      )}
    </div>
  );
}
