import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

    const { user_id } = await req.json();
    if (!user_id) return NextResponse.json({ error: "Chybí user_id" }, { status: 400 });
    if (user_id === user.id) {
      return NextResponse.json({ error: "Nemůžete smazat sami sebe." }, { status: 400 });
    }

    // Smazání z auth.users; profil se smaže kaskádově (FK on delete cascade)
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
