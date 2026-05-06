"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Project = { id: string; name: string; status: string };
type Entry = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string | null;
  date: string;
  invoice_number: string | null;
  project: { name: string } | null;
};

const inputStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid var(--border)",
  borderRadius: "2px",
  padding: "0.6rem 0.8rem",
  fontSize: "0.85rem",
  width: "100%",
  boxSizing: "border-box",
  color: "var(--text)",
  fontFamily: "var(--ff-body)",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--muted)",
  marginBottom: "0.3rem",
  display: "block",
  fontWeight: 500,
};

export default function CashflowView({
  projects,
  entries: initialEntries,
}: {
  projects: Project[];
  entries: Entry[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterProject, setFilterProject] = useState("all");

  const entries = filterProject === "all"
    ? initialEntries
    : initialEntries.filter((e) => {
        const proj = e.project as { name: string } | null;
        return proj?.name === filterProject;
      });

  const totalIncome = entries.filter((e) => e.type === "income").reduce((s, e) => s + Number(e.amount), 0);
  const totalExpense = entries.filter((e) => e.type === "expense").reduce((s, e) => s + Number(e.amount), 0);
  const balance = totalIncome - totalExpense;

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    await supabase.from("cashflow").insert({
      project_id: form.get("project_id") || null,
      type: form.get("type"),
      amount: Number(form.get("amount")),
      description: form.get("description"),
      category: form.get("category") || null,
      date: form.get("date") || new Date().toISOString().split("T")[0],
      invoice_number: form.get("invoice_number") || null,
    });

    setSaving(false);
    setShowForm(false);
    router.refresh();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--ff-head)", fontSize: "2rem", marginBottom: "0.25rem" }}>
            CASHFLOW
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Přehled příjmů a výdajů</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: "var(--gold)",
            color: "#fff",
            padding: "0.6rem 1.4rem",
            borderRadius: "2px",
            border: "none",
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "var(--ff-body)",
          }}
        >
          + Nový záznam
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
        {[
          { label: "Příjmy", value: totalIncome, color: "#2a8a4a" },
          { label: "Výdaje", value: totalExpense, color: "#9a4a2a" },
          { label: "Bilance", value: balance, color: balance >= 0 ? "#2a8a4a" : "#9a4a2a" },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "1.5rem",
            }}
          >
            <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: "0.5rem" }}>
              {card.label}
            </div>
            <div style={{ fontFamily: "var(--ff-head)", fontSize: "1.8rem", color: card.color }}>
              {card.value.toLocaleString("cs-CZ")} Kč
            </div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <h3 style={{ fontFamily: "var(--ff-head)", fontSize: "1.1rem", marginBottom: "1rem" }}>
            NOVÝ ZÁZNAM
          </h3>
          <form onSubmit={handleAdd}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div>
                <label style={labelStyle}>Typ *</label>
                <select name="type" style={{ ...inputStyle, cursor: "pointer" }} required>
                  <option value="expense">Výdaj</option>
                  <option value="income">Příjem</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Částka (Kč) *</label>
                <input name="amount" type="number" style={inputStyle} required placeholder="50000" />
              </div>
              <div>
                <label style={labelStyle}>Datum</label>
                <input name="date" type="date" style={inputStyle} defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
              <div>
                <label style={labelStyle}>Projekt</label>
                <select name="project_id" style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Bez projektu</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
              <div>
                <label style={labelStyle}>Popis *</label>
                <input name="description" style={inputStyle} required placeholder="Materiál, práce, platba klienta..." />
              </div>
              <div>
                <label style={labelStyle}>Kategorie</label>
                <select name="category" style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">—</option>
                  <option value="material">Materiál</option>
                  <option value="labor">Práce</option>
                  <option value="subcontractor">Subdodavatel</option>
                  <option value="client_payment">Platba klienta</option>
                  <option value="overhead">Režie</option>
                  <option value="other">Ostatní</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Č. faktury</label>
                <input name="invoice_number" style={inputStyle} placeholder="FV-2026001" />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: "var(--gold)",
                  color: "#fff",
                  padding: "0.6rem 1.5rem",
                  borderRadius: "2px",
                  border: "none",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "var(--ff-body)",
                }}
              >
                {saving ? "Ukládám..." : "Uložit"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "2px",
                  padding: "0.6rem 1rem",
                  fontSize: "0.8rem",
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontFamily: "var(--ff-body)",
                }}
              >
                Zrušit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entries table */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        {entries.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)", fontSize: "0.9rem" }}>
            Zatím žádné záznamy.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
                {["Datum", "Popis", "Projekt", "Kategorie", "Částka"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.6rem 1rem",
                      textAlign: "left",
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--muted)",
                      fontWeight: 500,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.6rem 1rem", color: "var(--muted)" }}>
                    {new Date(entry.date).toLocaleDateString("cs-CZ")}
                  </td>
                  <td style={{ padding: "0.6rem 1rem" }}>
                    {entry.description}
                    {entry.invoice_number && (
                      <span style={{ fontSize: "0.7rem", color: "var(--muted)", marginLeft: "0.5rem" }}>
                        ({entry.invoice_number})
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "0.6rem 1rem", color: "var(--muted)" }}>
                    {entry.project?.name || "—"}
                  </td>
                  <td style={{ padding: "0.6rem 1rem", color: "var(--muted)" }}>
                    {entry.category || "—"}
                  </td>
                  <td
                    style={{
                      padding: "0.6rem 1rem",
                      fontWeight: 500,
                      textAlign: "right",
                      color: entry.type === "income" ? "#2a8a4a" : "#9a4a2a",
                    }}
                  >
                    {entry.type === "income" ? "+" : "−"}
                    {Number(entry.amount).toLocaleString("cs-CZ")} Kč
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
