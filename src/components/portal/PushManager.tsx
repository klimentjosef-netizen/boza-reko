"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function ensureSubscribed(reg: ServiceWorkerRegistration) {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) return;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });
  }
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: sub, user_agent: navigator.userAgent }),
  });
}

export default function PushManager() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [standalone, setStandalone] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const ok = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setSupported(ok);
    if (!ok) return;
    setPermission(Notification.permission);
    // iOS: push funguje jen v appce přidané na plochu
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setStandalone(!isIOS || isStandalone);

    navigator.serviceWorker
      .register("/sw.js")
      .then(async (reg) => {
        if (Notification.permission === "granted") await ensureSubscribed(reg).catch(() => {});
      })
      .catch(() => {});
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === "granted") {
        const reg = await navigator.serviceWorker.ready;
        await ensureSubscribed(reg);
      }
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  if (!supported) return null;

  if (permission === "granted") {
    return <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", marginTop: "0.6rem" }}>🔔 Notifikace zapnuté</div>;
  }

  if (!standalone) {
    return (
      <div style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.4)", marginTop: "0.6rem", lineHeight: 1.4 }}>
        🔔 Pro notifikace přidejte appku na plochu (Sdílet → Přidat na plochu) a otevřete ji odtud.
      </div>
    );
  }

  return (
    <button
      onClick={enable}
      disabled={busy || permission === "denied"}
      style={{
        marginTop: "0.6rem",
        background: permission === "denied" ? "transparent" : "rgba(166,124,42,0.2)",
        border: "1px solid rgba(166,124,42,0.4)",
        borderRadius: "2px",
        color: "#e8c98a",
        padding: "0.4rem 0.7rem",
        fontSize: "0.7rem",
        cursor: permission === "denied" ? "default" : "pointer",
        width: "100%",
        fontFamily: "var(--ff-body)",
      }}
    >
      {permission === "denied" ? "🔕 Notifikace blokované" : busy ? "Zapínám…" : "🔔 Zapnout notifikace"}
    </button>
  );
}
