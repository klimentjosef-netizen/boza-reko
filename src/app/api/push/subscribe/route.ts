import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subscription, user_agent } = await req.json();
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: "Chybí subscription" }, { status: 400 });
    }

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        profile_id: user.id,
        endpoint: subscription.endpoint,
        subscription,
        user_agent: user_agent || null,
      },
      { onConflict: "endpoint" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push subscribe error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
