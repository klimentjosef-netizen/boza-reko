import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `Jsi Božáček, AI asistent stavební firmy BOZA REKO s.r.o. z Ostravy.
Tvým úkolem je generovat detailní rozpočty rekonstrukcí.

Vstupní parametry:
- Typ nemovitosti (byt, dům, koupelna, kuchyně...)
- Dispozice (1+1, 2+kk, 3+1, rodinný dům...)
- Kvalita (standard, premium, VIP)
- Plocha v m²
- Další požadavky klienta

Výstup MUSÍ být validní JSON v tomto formátu:
{
  "items": [
    {
      "category": "Kategorie prací",
      "name": "Název položky",
      "unit": "m²/ks/hod/kpl",
      "quantity": 10,
      "unit_price": 500,
      "total": 5000
    }
  ],
  "total_net": 150000,
  "total_gross": 181500,
  "estimated_days": 30,
  "notes": "Poznámky k rozpočtu"
}

Kategorie prací zahrnují:
- Bourací a přípravné práce
- Hrubá stavba / zednické práce
- Rozvody elektřiny
- Rozvody vody a kanalizace
- Obklady a dlažba
- Podlahy
- Malby a nátěry
- Instalatérské práce
- Truhlářské práce
- Úklid a odvoz suti

Ceny jsou orientační pro region Ostrava, v Kč bez DPH.
DPH je vždy 21%.
Neuvádíš ceny materiálu — pouze práci.
Buď realistický — ceny odpovídají trhu 2026.`;

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["owner", "estimator"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI not configured" }, { status: 503 });
    }

    const body = await req.json();
    const { apartment_type, quality_level, area_m2, additional_notes } = body;

    const userPrompt = `Vygeneruj detailní rozpočet rekonstrukce:
- Typ: ${apartment_type}
- Kvalita: ${quality_level}
- Plocha: ${area_m2} m²
${additional_notes ? `- Další požadavky: ${additional_notes}` : ""}

Vrať POUZE validní JSON, žádný další text.`;

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    // Parse the JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    const budget = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      budget,
      params: { apartment_type, quality_level, area_m2, additional_notes },
    });
  } catch (error) {
    console.error("Božáček API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
