"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: string;
  created_at: string;
};

type Project = { id: string; name: string };

const ROLE_LABELS: Record<string, string> = {
  owner: "Majitel",
  estimator: "Rozpočtář",
  worker: "Pracovník",
  client: "Klient",
};

const ROLE_COLORS: Record<string, string> = {
  owner: "#a67c2a",
  estimator: "#2a6a8a",
  worker: "#2a8a4a",
  client: "#7a7570",
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

export default function UsersManager({
  users: initialUsers,
  projects,
}: {
  users: User[];
  projects: Project[];
}) {
  const router = useRouter();
  const [showInvite, setShowInvite] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInviting(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/users/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        full_name: form.get("full_name"),
        phone: form.get("phone"),
        role: form.get("role"),
        password: form.get("password"),
      }),
    });

    if (res.ok) {
      setShowInvite(false);
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Nepodařilo se vytvořit uživatele.");
    }
    setInviting(false);
  }

  async function handleRoleChange(userId: string, newRole: string) {
    const supabase = createClient();
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    setEditingRole(null);
    router.refresh();
  }

  async function handleDelete(user: User) {
    if (!confirm(`Opravdu smazat uživatele „${user.full_name}"? Tato akce je nevratná.`)) return;
    setDeletingId(user.id);
    const res = await fetch("/api/users/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Nepodařilo se smazat uživatele.");
    } else {
      router.refresh();
    }
    setDeletingId(null);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--ff-head)", fontSize: "2rem", marginBottom: "0.25rem" }}>
            UŽIVATELÉ
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            Správa přístupů do portálu
          </p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
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
          + Přidat uživatele
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
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
            NOVÝ UŽIVATEL
          </h3>
          <form onSubmit={handleInvite}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div>
                <label style={labelStyle}>Jméno *</label>
                <input name="full_name" style={inputStyle} required placeholder="Jan Novák" />
              </div>
              <div>
                <label style={labelStyle}>E-mail *</label>
                <input name="email" type="email" style={inputStyle} required placeholder="jan@email.cz" />
              </div>
              <div>
                <label style={labelStyle}>Telefon</label>
                <input name="phone" type="tel" style={inputStyle} placeholder="+420..." />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
              <div>
                <label style={labelStyle}>Role *</label>
                <select name="role" style={{ ...inputStyle, cursor: "pointer" }} required defaultValue="">
                  <option value="" disabled>Vyberte...</option>
                  <option value="worker">Pracovník</option>
                  <option value="estimator">Rozpočtář</option>
                  <option value="client">Klient</option>
                  <option value="owner">Majitel</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Heslo *</label>
                <input name="password" type="text" style={inputStyle} required placeholder="Min. 6 znaků" minLength={6} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="submit"
                disabled={inviting}
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
                {inviting ? "Vytvářím..." : "Vytvořit uživatele"}
              </button>
              <button
                type="button"
                onClick={() => setShowInvite(false)}
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

      {/* Users list */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
              {["Jméno", "E-mail", "Telefon", "Role", "Vytvořen", ""].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontSize: "0.7rem",
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
            {initialUsers.map((user) => {
              const roleColor = ROLE_COLORS[user.role] || "#7a7570";
              return (
                <tr key={user.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: `${roleColor}15`,
                          border: `1px solid ${roleColor}30`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          color: roleColor,
                        }}
                      >
                        {user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                      </div>
                      <span style={{ fontWeight: 500 }}>{user.full_name || "—"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--muted)" }}>
                    {user.email || "—"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--muted)" }}>
                    {user.phone || "—"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    {editingRole === user.id ? (
                      <select
                        defaultValue={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        onBlur={() => setEditingRole(null)}
                        autoFocus
                        style={{ ...inputStyle, width: "auto", padding: "0.3rem 0.5rem", fontSize: "0.8rem" }}
                      >
                        <option value="owner">Majitel</option>
                        <option value="estimator">Rozpočtář</option>
                        <option value="worker">Pracovník</option>
                        <option value="client">Klient</option>
                      </select>
                    ) : (
                      <span
                        onClick={() => setEditingRole(user.id)}
                        style={{
                          display: "inline-block",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "2px",
                          fontSize: "0.7rem",
                          fontWeight: 500,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          background: `${roleColor}15`,
                          color: roleColor,
                          border: `1px solid ${roleColor}30`,
                          cursor: "pointer",
                        }}
                        title="Klikni pro změnu role"
                      >
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--muted)", fontSize: "0.8rem" }}>
                    {new Date(user.created_at).toLocaleDateString("cs-CZ")}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                    <button
                      onClick={() => handleDelete(user)}
                      disabled={deletingId === user.id}
                      title="Smazat uživatele"
                      style={{
                        background: "none",
                        border: "1px solid var(--border)",
                        borderRadius: "2px",
                        padding: "0.25rem 0.6rem",
                        fontSize: "0.72rem",
                        color: "#9a4a2a",
                        cursor: "pointer",
                        fontFamily: "var(--ff-body)",
                      }}
                    >
                      {deletingId === user.id ? "Mažu…" : "Smazat"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
