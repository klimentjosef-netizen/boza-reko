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

    if (supabaseUrl && supabaseKey) {
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
      }
    } else {
      console.log("Supabase not configured — lead received:", { name, email, phone, type });
    }

    // Send emails via Resend if configured
    const resendKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL;

    if (resendKey && contactEmail) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      // Notification to company
      await resend.emails.send({
        from: "BOZA REKO <noreply@bozareko.vercel.app>",
        to: contactEmail,
        subject: `Nová poptávka: ${name}`,
        html: `
          <h2>Nová poptávka z webu</h2>
          <p><strong>Jméno:</strong> ${name}</p>
          <p><strong>E-mail:</strong> ${email}</p>
          <p><strong>Telefon:</strong> ${phone}</p>
          <p><strong>Typ:</strong> ${type}</p>
          <p><strong>Popis:</strong> ${description || "—"}</p>
        `,
      });

      // Confirmation to client
      await resend.emails.send({
        from: "BOZA REKO <noreply@bozareko.vercel.app>",
        to: email,
        subject: "Děkujeme za poptávku — BOZA REKO",
        html: `
          <h2>Děkujeme za vaši poptávku!</h2>
          <p>Dobrý den, ${name},</p>
          <p>vaši poptávku jsme přijali a ozveme se vám co nejdříve.</p>
          <br>
          <p>S pozdravem,<br>BOZA REKO s.r.o.</p>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
