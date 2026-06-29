"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  sumItems, sortByDil, DILY_ORDER,
  type PricedItem,
} from "@/lib/pricebook";
import type { BozacekBudget, BozacekParams } from "@/app/portal/bozacek/page";

function fmt(n: number) {
  return Math.round(n).toLocaleString("cs-CZ");
}

export default function BudgetEditor({
  budget,
  params,
  onBack,
}: {
  budget: BozacekBudget;
  params: BozacekParams;
  onBack: () => void;
}) {
  const router = useRouter();
  const [items, setItems] = useState<PricedItem[]>(budget.items);
  const [margin, setMargin] = useState<number>(budget.totals.margin_percent || 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const totals = useMemo(() => sumItems(items, margin), [items, margin]);

  function recalc(it: PricedItem): PricedItem {
    const work_total = Math.round(it.work_price * it.quantity);
    const material_total = Math.round(it.material_price * it.quantity);
    return { ...it, work_total, material_total, total: work_total + material_total };
  }

  function updateItem(index: number, field: keyof PricedItem, value: string | number) {
    setItems((prev) => prev.map((it, i) => {
      if (i !== index) return it;
      const next = { ...it } as PricedItem;
      if (field === "quantity" || field === "work_price" || field === "material_price") {
        (next[field] as number) = Number(value) || 0;
        return recalc(next);
      }
      (next as Record<string, unknown>)[field] = value;
      return next;
    }));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addItem(dil: string) {
    setItems((prev) => [...prev, {
      key: null, dil, code: "", name: "Nová položka", unit: "kpl",
      quantity: 1, work_price: 0, material_price: 0, work_total: 0, material_total: 0, total: 0, bundled: false,
    }]);
  }

  async function saveAsProject() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const type = /koupelna/i.test(params.property_type) ? "koupelna"
      : /kuchyn/i.test(params.property_type) ? "kuchyn"
      : /dům|dum/i.test(params.property_type) ? "dum" : "byt";

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        name: `${params.property_type} — ${params.area_m2} m²`,
        type,
        status: "offer",
        budget_net: totals.total_net,
        budget_gross: totals.total_gross,
        area_m2: params.area_m2 || null,
        description: params.additional_notes || null,
      })
      .select("id")
      .single();

    if (projectError || !project) {
      alert("Nepodařilo se vytvořit projekt: " + (projectError?.message || ""));
      setSaving(false);
      return;
    }

    const { error: budgetError } = await supabase.from("budgets").insert({
      project_id: project.id,
      name: `Rozpočet — ${params.property_type} (${params.quality_level})`,
      status: "review",
      apartment_type: params.property_type,
      quality_level: params.quality_level,
      area_m2: params.area_m2 || null,
      ai_prompt_params: { ...params, assumptions: budget.assumptions, estimated_days: budget.estimated_days },
      items,
      total_net: totals.total_net,
      total_gross: totals.total_gross,
      margin_percent: margin,
      notes: budget.notes || null,
      created_by: user?.id || null,
    });

    if (budgetError) {
      alert("Projekt vytvořen, ale rozpočet se neuložil: " + budgetError.message);
      setSaving(false);
      return;
    }

    // Automatické milníky z Božáčka (v logickém pořadí) — rozprostřené do termínů
    if (budget.milestones?.length) {
      const totalDays = budget.estimated_days || 30;
      const per = totalDays / budget.milestones.length;
      const start = Date.now();
      const rows = budget.milestones.map((title, i) => ({
        project_id: project.id,
        title,
        sort_order: i,
        due_date: new Date(start + Math.round(per * (i + 1)) * 86400000).toISOString().slice(0, 10),
      }));
      await supabase.from("milestones").insert(rows);
    }

    fetch("/api/push/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: project.id, type: "budget" }),
    }).catch(() => {});

    setSaved(true);
    setTimeout(() => router.push(`/portal/projekty/${project.id}`), 900);
  }

  // seskup dle dílů v daném pořadí
  const grouped = useMemo(() => {
    const sorted = sortByDil(items.map((it, i) => ({ ...it, _i: i })));
    const map: { dil: string; rows: { it: PricedItem; i: number }[] }[] = [];
    for (const row of sorted) {
      const { _i, ...it } = row;
      let g = map.find((m) => m.dil === it.dil);
      if (!g) { g = { dil: it.dil, rows: [] }; map.push(g); }
      g.rows.push({ it: it as PricedItem, i: _i });
    }
    return map;
  }, [items]);

  const allDily = Array.from(new Set([...DILY_ORDER, ...items.map((i) => i.dil)]));

  return (
    <div style={{ maxWidth: "1000px" }}>
      {/* Header */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "var(--ff-head)", fontSize: "1.5rem", marginBottom: "0.25rem" }}>
            ROZPOČET — {params.property_type} · {params.area_m2} m²
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            Úroveň: {params.quality_level} · rozsah: {budget.scope}
            {budget.estimated_days ? ` · odhad ${budget.estimated_days} dní` : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => window.print()} style={ghostBtn}>🖨️ Tisk / PDF</button>
          <button onClick={onBack} style={ghostBtn}>← Nový rozpočet</button>
        </div>
      </div>

      {/* Assumptions */}
      {budget.assumptions?.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "4px", padding: "1rem 1.25rem", marginBottom: "1.25rem", fontSize: "0.82rem", color: "var(--muted)" }}>
          <strong style={{ color: "var(--text)" }}>Předpoklady Božáčka:</strong>
          <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.2rem", lineHeight: 1.6 }}>
            {budget.assumptions.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      {/* Tables by díl */}
      {grouped.map(({ dil, rows }) => {
        const dilWork = rows.reduce((s, r) => s + r.it.work_total, 0);
        const dilMat = rows.reduce((s, r) => s + r.it.material_total, 0);
        return (
          <div key={dil} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "4px", marginBottom: "1rem", overflow: "hidden" }}>
            <div style={{ padding: "0.6rem 1rem", background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--ff-head)", fontSize: "0.95rem" }}>{dil}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{fmt(dilWork + dilMat)} Kč</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", minWidth: "720px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Položka", "MJ", "Množství", "Práce/MJ", "Materiál/MJ", "Celkem", ""].map((h, idx) => (
                      <th key={h} style={{ padding: "0.4rem 0.6rem", textAlign: idx >= 2 ? "right" : "left", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ it, i }) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "0.3rem 0.6rem" }}>
                        <input value={it.name} onChange={(e) => updateItem(i, "name", e.target.value)}
                          style={cellInput} />
                        {it.bundled && <span style={{ fontSize: "0.62rem", color: "var(--muted)" }}> (vč. materiálu)</span>}
                      </td>
                      <td style={{ padding: "0.3rem 0.6rem", width: "60px", textAlign: "center", color: "var(--muted)" }}>{it.unit}</td>
                      <td style={{ padding: "0.3rem 0.4rem", width: "85px" }}>
                        <input type="number" value={it.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} style={numInput} />
                      </td>
                      <td style={{ padding: "0.3rem 0.4rem", width: "95px" }}>
                        <input type="number" value={it.work_price} onChange={(e) => updateItem(i, "work_price", e.target.value)} style={numInput} />
                      </td>
                      <td style={{ padding: "0.3rem 0.4rem", width: "95px" }}>
                        <input type="number" value={it.material_price} onChange={(e) => updateItem(i, "material_price", e.target.value)} style={numInput} disabled={it.bundled} />
                      </td>
                      <td style={{ padding: "0.3rem 0.6rem", textAlign: "right", fontWeight: 500, width: "100px", whiteSpace: "nowrap" }}>{fmt(it.total)} Kč</td>
                      <td style={{ padding: "0.3rem 0.4rem", width: "30px" }}>
                        <button onClick={() => removeItem(i)} title="Odebrat" className="no-print"
                          style={{ background: "none", border: "none", color: "#9a4a2a", cursor: "pointer", fontSize: "1rem" }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="no-print" style={{ padding: "0.4rem 1rem", borderTop: "1px solid var(--border)" }}>
              <button onClick={() => addItem(dil)} style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", fontSize: "0.78rem", fontFamily: "var(--ff-body)" }}>+ Položka do dílu</button>
            </div>
          </div>
        );
      })}

      {/* Add to new díl */}
      <div className="no-print" style={{ marginBottom: "1.5rem" }}>
        <select onChange={(e) => { if (e.target.value) { addItem(e.target.value); e.target.value = ""; } }} defaultValue=""
          style={{ background: "none", border: "1px dashed var(--border)", borderRadius: "4px", padding: "0.6rem 1rem", color: "var(--muted)", fontSize: "0.82rem", cursor: "pointer", fontFamily: "var(--ff-body)", width: "100%" }}>
          <option value="">+ Přidat položku do dílu…</option>
          {allDily.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Totals */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "4px", padding: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.4rem 2rem", fontSize: "0.9rem", maxWidth: "420px", marginLeft: "auto" }}>
          <span style={{ color: "var(--muted)" }}>Práce celkem</span>
          <span style={{ textAlign: "right" }}>{fmt(totals.work_net)} Kč</span>
          <span style={{ color: "var(--muted)" }}>Materiál celkem</span>
          <span style={{ textAlign: "right" }}>{fmt(totals.material_net)} Kč</span>
          <span style={{ color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: "0.4rem" }}>Mezisoučet</span>
          <span style={{ textAlign: "right", borderTop: "1px solid var(--border)", paddingTop: "0.4rem" }}>{fmt(totals.subtotal_net)} Kč</span>
          <span style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            Marže
            <input type="number" value={margin} onChange={(e) => setMargin(Number(e.target.value) || 0)} className="no-print"
              style={{ width: "52px", border: "1px solid var(--border)", borderRadius: "2px", padding: "0.1rem 0.3rem", textAlign: "right", fontFamily: "var(--ff-body)" }} /> %
          </span>
          <span style={{ textAlign: "right" }}>{fmt(totals.margin_amount)} Kč</span>
          <span style={{ color: "var(--muted)" }}>Celkem bez DPH</span>
          <span style={{ textAlign: "right", fontWeight: 600 }}>{fmt(totals.total_net)} Kč</span>
          <span style={{ color: "var(--muted)" }}>DPH 12 %</span>
          <span style={{ textAlign: "right" }}>{fmt(totals.dph)} Kč</span>
          <span style={{ fontFamily: "var(--ff-head)", fontSize: "1.15rem", color: "var(--gold)", borderTop: "1px solid var(--border)", paddingTop: "0.5rem" }}>CELKEM s DPH</span>
          <span style={{ fontFamily: "var(--ff-head)", fontSize: "1.15rem", color: "var(--gold)", textAlign: "right", borderTop: "1px solid var(--border)", paddingTop: "0.5rem" }}>{fmt(totals.total_gross)} Kč</span>
        </div>

        <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <button onClick={saveAsProject} disabled={saving || saved}
            style={{ background: saved ? "#2a8a4a" : "var(--gold)", color: "#fff", padding: "0.8rem 1.8rem", borderRadius: "2px", border: "none", fontSize: "0.9rem", fontWeight: 600, cursor: saving ? "wait" : "pointer", fontFamily: "var(--ff-body)" }}>
            {saved ? "✓ Uloženo" : saving ? "Ukládám…" : "Uložit jako projekt"}
          </button>
        </div>
      </div>

      {budget.notes && (
        <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--surface)", borderRadius: "4px", fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.6 }}>💡 {budget.notes}</div>
      )}

      <style>{`@media print { .no-print { display: none !important; } input { border: none !important; } }`}</style>
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  background: "none", border: "1px solid var(--border)", borderRadius: "2px",
  padding: "0.5rem 1rem", fontSize: "0.8rem", color: "var(--muted)", cursor: "pointer", fontFamily: "var(--ff-body)",
};
const cellInput: React.CSSProperties = {
  border: "none", background: "transparent", fontSize: "0.82rem", fontFamily: "var(--ff-body)", width: "100%", outline: "none", padding: "0.2rem 0",
};
const numInput: React.CSSProperties = {
  border: "1px solid var(--border)", borderRadius: "2px", background: "#fff", fontSize: "0.82rem", fontFamily: "var(--ff-body)", width: "100%", padding: "0.2rem 0.4rem", outline: "none", textAlign: "right",
};
