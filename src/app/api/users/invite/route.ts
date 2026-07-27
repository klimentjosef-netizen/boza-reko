import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    // Verify requester is owner
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

    const body = await req.json();
    const { email, full_name, phone, role, password } = body;

    if (!email || !full_name || !role || !password) {
      return NextResponse.json({ error: "Chybí povinná pole" }, { status: 400 });
    }

    // Přes appku lze založit jen pracovníka nebo klienta — nikdy majitele.
    if (!["worker", "client"].includes(role)) {
      return NextResponse.json({ error: "Lze založit jen roli pracovník nebo klient." }, { status: 400 });
    }

    // Create user with admin client (bypasses email confirmation)
    const admin = createAdminClient();
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role },
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // Update profile with phone if provided
    if (newUser?.user && phone) {
      await admin.from("profiles").update({ phone }).eq("id", newUser.user.id);
    }

    return NextResponse.json({ success: true, user_id: newUser?.user?.id });
  } catch (error) {
    console.error("Invite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
