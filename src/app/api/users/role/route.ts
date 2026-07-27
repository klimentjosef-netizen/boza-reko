import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Přes appku lze přidělit JEN pracovníka nebo klienta. Roli majitele nelze přidělit ani odebrat mimo databázi.
const ASSIGNABLE_ROLES = ["worker", "client"];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { user_id, role } = await req.json();
    if (!user_id || !ASSIGNABLE_ROLES.includes(role)) {
      return NextResponse.json({ error: "Lze přidělit jen roli pracovník nebo klient." }, { status: 400 });
    }

    // Service role obejde RLS (změna role je citlivá operace, jen pro majitele)
    const admin = createAdminClient();

    // Majitele nelze měnit přes appku — jeho roli lze upravit jen přímo v databázi.
    const { data: target } = await admin.from("profiles").select("role").eq("id", user_id).single();
    if (target?.role === "owner") {
      return NextResponse.json({ error: "Roli majitele nelze měnit přes portál." }, { status: 403 });
    }

    const { error } = await admin.from("profiles").update({ role }).eq("id", user_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Role change error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
