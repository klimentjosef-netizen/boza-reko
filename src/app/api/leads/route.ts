import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Honeypot check — silently succeed without saving
    if (body.website) {
      return NextResponse.json({ success: true });
    }

    const { name, email, phone, type, description, calculator_result } = body;

    // Save to Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Vyplňte jméno, e-mail a telefon." }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Server není nakonfigurován." }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from("leads").insert({
      name,
      email,
      phone,
      reconstruction_type: type,
      description: description || null,
      calculator_result: calculator_result || null,
    });
    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Poptávku se nepodařilo uložit. Zkuste to prosím znovu nebo nám zavolejte." },
        { status: 500 }
      );
    }

    // E-maily přes Resend (best-effort — nesmí shodit uložení poptávky)
    const resendKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL;
    if (resendKey && contactEmail) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "BOZA REKO <onboarding@resend.dev>",
          to: contactEmail,
          replyTo: email,
          subject: `Nová poptávka: ${name}`,
          html: `
            <h2>Nová poptávka z webu</h2>
            <p><strong>Jméno:</strong> ${name}</p>
            <p><strong>E-mail:</strong> ${email}</p>
            <p><strong>Telefon:</strong> ${phone}</p>
            <p><strong>Typ:</strong> ${type || "—"}</p>
            <p><strong>Popis:</strong> ${description || "—"}</p>
          `,
        });
      } catch (mailErr) {
        console.error("Resend error (lead uložen i přesto):", mailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
