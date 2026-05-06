"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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

export default function BudgetEditor({
  budget,
  params,
  onBack,
}: {
  budget: BudgetResult;
  params: Record<string, string>;
  onBack: () => void;
}) {
  const router = useRouter();
  const [items, setItems] = useState<BudgetItem[]>(budget.items);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const totalNet = items.reduce((sum, item) => sum + item.total, 0);
  const totalGross = Math.round(totalNet * 1.21);

  function updateItem(index: number, field: keyof BudgetItem, value: string | number) {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === "quantity" || field === "unit_price") {
        const num = Number(value);
        item[field] = num;
        item.total = Math.round(item.quantity * item.unit_price);
      } else {
        (item as Record<string, unknown>)[field] = value;
      }

      updated[index] = item;
      return updated;
    });
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { category: "", name: "Nová položka", unit: "kpl", quantity: 1, unit_price: 0, total: 0 },
    ]);
  }

  async function saveAsProject() {
    setSaving(true);
    const supabase = createClient();

    // Create project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        name: `${params.apartment_type || "Rekonstrukce"} — ${params.area_m2 || "?"} m²`,
        type: params.apartment_type?.includes("koupelna")
          ? "koupelna"
          : params.apartment_type?.includes("kuchyn")
          ? "kuchyn"
          : "byt",
        budget_net: totalNet,
        budget_gross: totalGross,
        area_m2: params.area_m2 ? Number(params.area_m2) : null,
        description: params.additional_notes || null,
      })
      .select("id")
      .single();

    if (projectError || !project) {
      alert("Nepodařilo se vytvořit projekt.");
      setSaving(false);
      return;
    }

    // Save budget
    await supabase.from("budgets").insert({
      project_id: project.id,
      name: `Rozpočet — ${params.apartment_type}`,
      status: "review",
      apartment_type: params.apartment_type,
      quality_level: params.quality_level,
      area_m2: params.area_m2 ? Number(params.area_m2) : null,
      ai_prompt_params: params,
      items,
      total_net: totalNet,
      total_gross: totalGross,
    });

    setSaved(true);
    setTimeout(() => {
      router.push(`/portal/projekty/${project.id}`);
    }, 1000);
  }

  // Group items by category
  const categories = items.reduce<Record<string, { items: BudgetItem[]; indices: number[] }>>((acc, item, i) => {
    const cat = item.category || "Ostatní";
    if (!acc[cat]) acc[cat] = { items: [], indices: [] };
    acc[cat].items.push(item);
    acc[cat].indices.push(i);
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontFamily: "var(--ff-head)", fontSize: "1.5rem", marginBottom: "0.25rem" }}>
            ROZPOČET — {params.apartment_type} · {params.area_m2} m² · {params.quality_level}
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            Upravte položky a ceny, pak uložte jako projekt
          </p>
        </div>
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "2px",
            padding: "0.5rem 1rem",
            fontSize: "0.8rem",
            color: "var(--muted)",
            cursor: "pointer",
            fontFamily: "var(--ff-body)",
          }}
        >
          ← Nový rozpočet
        </button>
      </div>

      {/* Budget table by categories */}
      {Object.entries(categories).map(([category, { items: catItems, indices }]) => (
        <div
          key={category}
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            marginBottom: "1rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "var(--surface)",
              fontFamily: "var(--ff-head)",
              fontSize: "0.95rem",
              letterSpacing: "0.03em",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {category}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Položka", "Jednotka", "Množství", "Cena/j.", "Celkem", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.5rem 0.75rem",
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
              {catItems.map((item, localIdx) => {
                const globalIdx = indices[localIdx];
                return (
                  <tr key={globalIdx} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.5rem 0.75rem" }}>
                      <input
                        value={item.name}
                        onChange={(e) => updateItem(globalIdx, "name", e.target.value)}
                        style={{
                          border: "none",
                          background: "transparent",
                          fontSize: "0.85rem",
                          fontFamily: "var(--ff-body)",
                          width: "100%",
                          outline: "none",
                          padding: "0.25rem 0",
                        }}
                      />
                    </td>
                    <td style={{ padding: "0.5rem 0.75rem", width: "80px" }}>
                      <input
                        value={item.unit}
                        onChange={(e) => updateItem(globalIdx, "unit", e.target.value)}
                        style={{
                          border: "none",
                          background: "transparent",
                          fontSize: "0.85rem",
                          fontFamily: "var(--ff-body)",
                          width: "100%",
                          outline: "none",
                          textAlign: "center",
                          color: "var(--muted)",
                        }}
                      />
                    </td>
                    <td style={{ padding: "0.5rem 0.75rem", width: "90px" }}>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(globalIdx, "quantity", e.target.value)}
                        style={{
                          border: "1px solid var(--border)",
                          borderRadius: "2px",
                          background: "#fff",
                          fontSize: "0.85rem",
                          fontFamily: "var(--ff-body)",
                          width: "100%",
                          padding: "0.25rem 0.5rem",
                          outline: "none",
                          textAlign: "right",
                        }}
                      />
                    </td>
                    <td style={{ padding: "0.5rem 0.75rem", width: "110px" }}>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateItem(globalIdx, "unit_price", e.target.value)}
                        style={{
                          border: "1px solid var(--border)",
                          borderRadius: "2px",
                          background: "#fff",
                          fontSize: "0.85rem",
                          fontFamily: "var(--ff-body)",
                          width: "100%",
                          padding: "0.25rem 0.5rem",
                          outline: "none",
                          textAlign: "right",
                        }}
                      />
                    </td>
                    <td
                      style={{
                        padding: "0.5rem 0.75rem",
                        fontWeight: 500,
                        textAlign: "right",
                        width: "110px",
                      }}
                    >
                      {item.total.toLocaleString("cs-CZ")} Kč
                    </td>
                    <td style={{ padding: "0.5rem 0.75rem", width: "40px" }}>
                      <button
                        onClick={() => removeItem(globalIdx)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#9a4a2a",
                          cursor: "pointer",
                          fontSize: "1rem",
                        }}
                        title="Odebrat položku"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      <button
        onClick={addItem}
        style={{
          background: "none",
          border: "1px dashed var(--border)",
          borderRadius: "4px",
          padding: "0.75rem",
          width: "100%",
          color: "var(--muted)",
          fontSize: "0.85rem",
          cursor: "pointer",
          marginBottom: "2rem",
          fontFamily: "var(--ff-body)",
        }}
      >
        + Přidat položku
      </button>

      {/* Totals + actions */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          padding: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Celkem bez DPH
          </div>
          <div style={{ fontFamily: "var(--ff-head)", fontSize: "2rem", color: "var(--gold)" }}>
            {totalNet.toLocaleString("cs-CZ")} Kč
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            s DPH 21%: {totalGross.toLocaleString("cs-CZ")} Kč
          </div>
          {budget.estimated_days && (
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.25rem" }}>
              Odhadovaná doba: {budget.estimated_days} dní
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={saveAsProject}
            disabled={saving || saved}
            style={{
              background: saved ? "#2a8a4a" : "var(--gold)",
              color: "#fff",
              padding: "0.75rem 1.5rem",
              borderRadius: "2px",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: saving ? "wait" : "pointer",
              fontFamily: "var(--ff-body)",
            }}
          >
            {saved ? "✓ Uloženo" : saving ? "Ukládám..." : "Uložit jako projekt"}
          </button>
        </div>
      </div>

      {budget.notes && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "var(--surface)",
            borderRadius: "4px",
            fontSize: "0.85rem",
            color: "var(--muted)",
            lineHeight: 1.6,
          }}
        >
          💡 {budget.notes}
        </div>
      )}
    </div>
  );
}
