import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_ROLES = ["owner", "estimator", "worker", "client"];

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
    if (!user_id || !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Neplatné parametry" }, { status: 400 });
    }

    // Service role obejde RLS (změna role je citlivá operace, jen pro majitele)
    const admin = createAdminClient();
    const { error } = await admin.from("profiles").update({ role }).eq("id", user_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Role change error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
