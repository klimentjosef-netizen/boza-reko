"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  reconstruction_type: string | null;
  description: string | null;
  status: string;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: "new", label: "Nová", color: "#a67c2a" },
  { value: "contacted", label: "Kontaktován", color: "#2a6a8a" },
  { value: "scheduled", label: "Prohlídka", color: "#6a2a8a" },
  { value: "offered", label: "Nabídnuto", color: "#2a8a4a" },
  { value: "won", label: "Získáno", color: "#2a8a4a" },
  { value: "lost", label: "Ztraceno", color: "#9a4a2a" },
];

const TYPE_LABELS: Record<string, string> = {
  koupelna: "Koupelna",
  kuchyn: "Kuchyně",
  byt: "Celý byt",
  dum: "Rodinný dům",
  svj: "SVJ",
  jine: "Jiné",
};

export default function LeadsManager({ leads: initialLeads }: { leads: Lead[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [converting, setConverting] = useState<string | null>(null);

  const leads = filter === "all" ? initialLeads : initialLeads.filter((l) => l.status === filter);

  const counts = initialLeads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {});

  async function updateStatus(leadId: string, status: string) {
    const supabase = createClient();
    await supabase.from("leads").update({ status }).eq("id", leadId);
    router.refresh();
  }

  async function convertToProject(lead: Lead) {
    setConverting(lead.id);
    const supabase = createClient();

    // Create project from lead
    const { data: project } = await supabase
      .from("projects")
      .insert({
        name: `${TYPE_LABELS[lead.reconstruction_type || ""] || "Rekonstrukce"} — ${lead.name}`,
        type: lead.reconstruction_type || "byt",
        description: lead.description || null,
      })
      .select("id")
      .single();

    if (project) {
      // Mark lead as won
      await supabase.from("leads").update({ status: "won" }).eq("id", lead.id);
      router.push(`/portal/projekty/${project.id}`);
    }
    setConverting(null);
    router.refresh();
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--ff-head)", fontSize: "2rem", marginBottom: "0.25rem" }}>
          POPTÁVKY
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Poptávky z webu · {initialLeads.length} celkem
        </p>
      </div>

      {/* Status filter pills */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "0.4rem 1rem",
            borderRadius: "2px",
            border: `1px solid ${filter === "all" ? "var(--gold)" : "var(--border)"}`,
            background: filter === "all" ? "var(--gold)" : "var(--card)",
            color: filter === "all" ? "#fff" : "var(--text)",
            fontSize: "0.8rem",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "var(--ff-body)",
          }}
        >
          Vše ({initialLeads.length})
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "2px",
              border: `1px solid ${filter === s.value ? s.color : "var(--border)"}`,
              background: filter === s.value ? `${s.color}15` : "var(--card)",
              color: filter === s.value ? s.color : "var(--muted)",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "var(--ff-body)",
            }}
          >
            {s.label} ({counts[s.value] || 0})
          </button>
        ))}
      </div>

      {/* Leads cards */}
      {leads.length === 0 ? (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "3rem",
            textAlign: "center",
            color: "var(--muted)",
          }}
        >
          Žádné poptávky{filter !== "all" ? " v tomto stavu" : ""}.
        </div>
      ) : (
        <div className="lm-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
          {leads.map((lead) => {
            const statusOpt = STATUS_OPTIONS.find((s) => s.value === lead.status) || STATUS_OPTIONS[0];
            return (
              <div
                key={lead.id}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  padding: "1.25rem",
                  borderLeft: `3px solid ${statusOpt.color}`,
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: "1rem", marginBottom: "0.2rem" }}>{lead.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                      {TYPE_LABELS[lead.reconstruction_type || ""] || lead.reconstruction_type || "Neuvedeno"}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "0.2rem 0.5rem",
                      borderRadius: "2px",
                      fontSize: "0.65rem",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      background: `${statusOpt.color}15`,
                      color: statusOpt.color,
                      border: `1px solid ${statusOpt.color}30`,
                    }}
                  >
                    {statusOpt.label}
                  </span>
                </div>

                {/* Contact */}
                <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
                  <div>📧 {lead.email}</div>
                  <div>📱 {lead.phone}</div>
                </div>

                {/* Description */}
                {lead.description && (
                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text)",
                      background: "var(--surface)",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "2px",
                      marginBottom: "0.75rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {lead.description}
                  </div>
                )}

                {/* Date */}
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
                  {new Date(lead.created_at).toLocaleString("cs-CZ")}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <select
                    value={lead.status}
                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                    style={{
                      background: "#fff",
                      border: "1px solid var(--border)",
                      borderRadius: "2px",
                      padding: "0.3rem 0.5rem",
                      fontSize: "0.75rem",
                      color: "var(--text)",
                      fontFamily: "var(--ff-body)",
                      cursor: "pointer",
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>

                  {lead.status !== "won" && lead.status !== "lost" && (
                    <button
                      onClick={() => convertToProject(lead)}
                      disabled={converting === lead.id}
                      style={{
                        background: "var(--gold)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "2px",
                        padding: "0.3rem 0.75rem",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "var(--ff-body)",
                      }}
                    >
                      {converting === lead.id ? "..." : "→ Vytvořit projekt"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .lm-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
