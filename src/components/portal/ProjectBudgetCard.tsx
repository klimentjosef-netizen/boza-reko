"use client";

import { useMemo, useState } from "react";
import { sumItems, sortByDil, type PricedItem } from "@/lib/pricebook";

function fmt(n: number) { return Math.round(n || 0).toLocaleString("cs-CZ"); }

type Budget = {
  id: string;
  name: string;
  status: string;
  quality_level: string | null;
  margin_percent: number | null;
  items: PricedItem[];
  total_net: number | null;
  total_gross: number | null;
  notes: string | null;
};

export default function ProjectBudgetCard({
  budget,
  title = "📋 ROZPOČET",
  locked = false,
}: {
  budget: Budget;
  title?: string;
  locked?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const items = Array.isArray(budget.items) ? budget.items : [];
  const totals = useMemo(() => sumItems(items, budget.margin_percent || 0), [items, budget.margin_percent]);

  const grouped = useMemo(() => {
    const sorted = sortByDil(items);
    const map: { dil: string; rows: PricedItem[] }[] = [];
    for (const it of sorted) {
      let g = map.find((m) => m.dil === it.dil);
      if (!g) { g = { dil: it.dil, rows: [] }; map.push(g); }
      g.rows.push(it);
    }
    return map;
  }, [items]);

  return (
    <div style={{ background: "var(--card)", border: locked ? "1px solid var(--gold)" : "1px solid var(--border)", borderRadius: "4px", padding: "1.5rem", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: locked ? "0.5rem" : "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <h2 style={{ fontFamily: "var(--ff-head)", fontSize: "1.2rem", margin: 0 }}>{title}</h2>
        <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{budget.quality_level || ""}</span>
      </div>
      {locked && (
        <p style={{ fontSize: "0.72rem", color: "var(--gold)", marginBottom: "1rem" }}>
          Vidí pouze majitel. Klient ani pracovník tento rozpočet nikdy nevidí.
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.3rem 1.5rem", fontSize: "0.88rem", marginBottom: "1rem" }}>
        <span style={{ color: "var(--muted)" }}>Práce</span><span style={{ textAlign: "right" }}>{fmt(totals.work_net)} Kč</span>
        <span style={{ color: "var(--muted)" }}>Materiál</span><span style={{ textAlign: "right" }}>{fmt(totals.material_net)} Kč</span>
        {totals.margin_amount > 0 && (<><span style={{ color: "var(--muted)" }}>Marže {totals.margin_percent} %</span><span style={{ textAlign: "right" }}>{fmt(totals.margin_amount)} Kč</span></>)}
        <span style={{ color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: "0.3rem" }}>Celkem bez DPH</span>
        <span style={{ textAlign: "right", borderTop: "1px solid var(--border)", paddingTop: "0.3rem" }}>{fmt(totals.total_net)} Kč</span>
        <span style={{ fontFamily: "var(--ff-head)", color: "var(--gold)", fontSize: "1.05rem" }}>Celkem s DPH</span>
        <span style={{ fontFamily: "var(--ff-head)", color: "var(--gold)", fontSize: "1.05rem", textAlign: "right" }}>{fmt(totals.total_gross)} Kč</span>
      </div>

      <button onClick={() => setOpen((o) => !o)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: "2px", padding: "0.4rem 0.9rem", fontSize: "0.78rem", color: "var(--muted)", cursor: "pointer", fontFamily: "var(--ff-body)" }}>
        {open ? "Skrýt položky ▲" : `Zobrazit ${items.length} položek ▼`}
      </button>

      {open && (
        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {grouped.map((g) => (
            <div key={g.dil}>
              <div style={{ fontFamily: "var(--ff-head)", fontSize: "0.82rem", color: "var(--gold)", marginBottom: "0.3rem" }}>{g.dil}</div>
              {g.rows.map((it, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", fontSize: "0.8rem", padding: "0.15rem 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--muted)" }}>{it.name} <span style={{ opacity: 0.6 }}>· {it.quantity} {it.unit}</span></span>
                  <span style={{ whiteSpace: "nowrap" }}>{fmt(it.total)} Kč</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
