import webpush from "web-push";

let configured = false;

export function getWebPush() {
  if (!configured) {
    const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const priv = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || "mailto:info@boza-reko.cz";
    if (!pub || !priv) throw new Error("VAPID klíče nejsou nakonfigurovány");
    webpush.setVapidDetails(subject, pub, priv);
    configured = true;
  }
  return webpush;
}

export type PushPayload = { title: string; body: string; url?: string; tag?: string };
