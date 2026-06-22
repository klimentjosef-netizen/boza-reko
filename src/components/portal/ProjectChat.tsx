"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  body: string;
  sender_id: string | null;
  created_at: string;
  sender?: { full_name: string; role: string } | null;
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Majitel", worker: "Řemeslník", client: "Klient", estimator: "Rozpočtář",
};

export default function ProjectChat({
  projectId,
  profileId,
}: {
  projectId: string;
  profileId: string;
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("project_messages")
      .select("*, sender:profiles(full_name, role)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    setMessages((data as Message[]) || []);
    setLoading(false);
    // označ jako přečtené
    await supabase.from("message_reads").upsert({
      profile_id: profileId,
      project_id: projectId,
      last_read_at: new Date().toISOString(),
    });
  }, [supabase, projectId, profileId]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`messages:${projectId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "project_messages", filter: `project_id=eq.${projectId}` },
        () => load()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [projectId, supabase, load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = input.trim();
    if (!body) return;
    setSending(true);
    setInput("");
    const { error } = await supabase.from("project_messages").insert({
      project_id: projectId,
      sender_id: profileId,
      body,
    });
    if (error) { setInput(body); alert("Zprávu se nepodařilo odeslat: " + error.message); }
    setSending(false);
  }

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "4px", padding: "1.5rem", marginBottom: "1.5rem", display: "flex", flexDirection: "column" }}>
      <h2 style={{ fontFamily: "var(--ff-head)", fontSize: "1.2rem", marginBottom: "1rem" }}>💬 KOMUNIKACE</h2>

      <div style={{ maxHeight: "420px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem", paddingRight: "0.25rem" }}>
        {loading ? (
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Načítám…</p>
        ) : messages.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", textAlign: "center", padding: "1.5rem 0" }}>
            Zatím žádné zprávy. Napište první.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === profileId;
            return (
              <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
                <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginBottom: "0.2rem", padding: "0 0.3rem" }}>
                  {mine ? "Vy" : m.sender?.full_name || "—"}
                  {m.sender?.role ? ` · ${ROLE_LABELS[m.sender.role] || m.sender.role}` : ""}
                  {" · "}
                  {new Date(m.created_at).toLocaleString("cs-CZ", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
                <div style={{
                  maxWidth: "78%", padding: "0.6rem 0.9rem", borderRadius: "10px",
                  background: mine ? "var(--gold)" : "var(--surface)",
                  color: mine ? "#fff" : "var(--text)",
                  border: mine ? "none" : "1px solid var(--border)",
                  fontSize: "0.88rem", lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word",
                }}>
                  {m.body}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Napište zprávu…"
          style={{ flex: 1, background: "#fff", border: "1px solid var(--border)", borderRadius: "2px", padding: "0.7rem 0.9rem", fontSize: "0.9rem", fontFamily: "var(--ff-body)", outline: "none" }}
        />
        <button type="submit" disabled={sending || !input.trim()}
          style={{ background: "var(--gold)", color: "#fff", border: "none", borderRadius: "2px", padding: "0.7rem 1.4rem", fontSize: "0.88rem", fontWeight: 500, cursor: sending ? "wait" : "pointer", fontFamily: "var(--ff-body)" }}>
          Odeslat
        </button>
      </form>
    </div>
  );
}
