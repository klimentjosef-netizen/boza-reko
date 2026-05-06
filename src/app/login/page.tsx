"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/portal";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Nesprávný e-mail nebo heslo.");
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

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

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <a
            href="/"
            style={{
              fontFamily: "var(--ff-head)",
              fontSize: "2.5rem",
              letterSpacing: "0.08em",
              color: "var(--white)",
              textDecoration: "none",
            }}
          >
            BOZA<span style={{ color: "var(--gold)" }}>·</span>REKO
          </a>
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--muted)",
              marginTop: "0.5rem",
            }}
          >
            Přihlášení do portálu
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Heslo</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
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
              transition: "background 0.2s",
              fontFamily: "var(--ff-body)",
            }}
          >
            {loading ? "Přihlašuji..." : "Přihlásit se"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <a
            href="/"
            style={{
              fontSize: "0.82rem",
              color: "var(--muted)",
              textDecoration: "none",
            }}
          >
            ← Zpět na web
          </a>
        </div>
      </div>
    </div>
  );
}
