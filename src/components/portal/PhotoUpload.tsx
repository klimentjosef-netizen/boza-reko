"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function PhotoUpload({
  projectId,
  userRole,
}: {
  projectId: string;
  userRole: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [phase, setPhase] = useState("during");

  const canUpload = userRole === "owner" || userRole === "worker";
  if (!canUpload) return null;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const supabase = createClient();

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("project-photos")
        .upload(path, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("project-photos")
        .getPublicUrl(path);

      // Save to project_photos table
      await supabase.from("project_photos").insert({
        project_id: projectId,
        url: urlData.publicUrl,
        phase,
        caption: file.name.replace(/\.[^.]+$/, ""),
      });
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
        marginBottom: "1rem",
        flexWrap: "wrap",
      }}
    >
      <select
        value={phase}
        onChange={(e) => setPhase(e.target.value)}
        style={{
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: "2px",
          padding: "0.4rem 0.6rem",
          fontSize: "0.75rem",
          fontFamily: "var(--ff-body)",
          cursor: "pointer",
        }}
      >
        <option value="before">Před</option>
        <option value="during">Během</option>
        <option value="after">Po</option>
      </select>

      <label
        style={{
          background: "var(--gold)",
          color: "#fff",
          padding: "0.4rem 1rem",
          borderRadius: "2px",
          fontSize: "0.75rem",
          fontWeight: 500,
          cursor: uploading ? "wait" : "pointer",
          fontFamily: "var(--ff-body)",
          opacity: uploading ? 0.6 : 1,
        }}
      >
        {uploading ? "Nahrávám..." : "📷 Nahrát fotky"}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
}
