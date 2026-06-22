import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  catalogForPrompt,
  priceBudget,
  sortByDil,
  type Tier,
  type TakeoffLine,
} from "@/lib/pricebook";

export const maxDuration = 60;

const SYSTEM_PROMPT = `Jsi Božáček — špičkový rozpočtář stavební firmy BOZA REKO s.r.o. (Ostrava),
specialista na rekonstrukce bytů, domů a jednotlivých místností.

Tvým úkolem je z parametrů zakázky sestavit přesný VÝKAZ VÝMĚR — tedy které
položky se na zakázce provedou a v jakém MNOŽSTVÍ. Ceny NEŘEŠÍŠ — ty se doplní
automaticky z firemního ceníku podle klíče položky. Ty určuješ pouze "key" a "quantity".

POUŽÍVEJ VÝHRADNĚ klíče (key) z následujícího katalogu. Když potřebuješ položku,
která v katalogu není, vrať ji jako vlastní řádek (vyplň name, dil, unit, work_price,
material_price) — ale snaž se maximálně držet katalogu.

== KATALOG POLOŽEK ==
{{CATALOG}}

ODBORNÉ ZÁSADY VÝPOČTU MNOŽSTVÍ (výkaz výměr):
- Plochu stěn počítej z podlahové plochy a světlé výšky (default 2,6 m):
  obvod místnosti ≈ 4,2 × √(podlahová plocha), plocha stěn = obvod × výška.
- Omítky/malby/penetrace stěn: plocha stěn všech rekonstruovaných místností
  (odečti cca 10 % na otvory u větších místností).
- Malba stropu a penetrace stropu: podlahová plocha místností.
- Podlahy (Liapor, desky, izolace, vinyl, textílie, nivelace): podlahová plocha.
- Obvodové/přechodové lišty (bm): obvod podlah.
- Obklady (koupelna/WC): stěny do výšky cca 2,0–2,2 m; dlažba: podlaha koupelny/WC.
- Hydroizolace + koutová páska: podlaha + spodní část stěn mokrých provozů.
- Sanitární sestavy (sprchový kout, umyvadlo, WC, vana), kuchyně, vestavěné skříně,
  dveře (mont_dvere), vstupní dveře — počítej podle skutečného počtu (ks/kpl).
- Dokončovací práce koupelna/WC: 1 ks za každou koupelnu/WC (montáž sanity).
- Elektro (el_rozvody) a napínané stropy: m² podlahové plochy. TZB voda: 1 kpl.
- Režie (doprava, likvidace odpadu): vždy 1 kpl. Statika jen u zásahů do nosných konstrukcí.

ROZSAH PRACÍ (scope) řídí, KTERÉ díly zahrneš:
- "kompletni" = kompletní rekonstrukce: demontáže, bourání, nové rozvody elektro i voda,
  zdění/příčky dle potřeby, omítky, obklady, podlahy, malby, sanitární sestavy, kuchyně,
  dveře, režie. Vše od základu.
- "castecna" = částečná: bez demontáže rozvodů a bourání nosných konstrukcí; nové povrchy,
  podlahy, obklady, malby, výměna sanity/dveří dle zadání. Vynech demontáž elektro/vody,
  napínané stropy obvykle ne.
- "dokoncovaci" = dokončovací/kosmetické: hlavně malby, penetrace, podlahy (vinyl, lišty),
  drobné opravy. Žádné bourání, rozvody ani obklady, pokud klient výslovně nechce.

VÝSTUP: zavolej nástroj "predlozit_rozpocet" s polem "lines" (výkaz výměr),
seznamem "assumptions" (předpoklady, ze kterých jsi vyšel — česky, stručně),
"estimated_days" (odhad doby realizace ve dnech) a "notes" (poznámky k rozpočtu).
Buď konkrétní a realistický. Množství zaokrouhluj rozumně.`;

const TAKEOFF_TOOL: Anthropic.Tool = {
  name: "predlozit_rozpocet",
  description: "Předlož výkaz výměr (položky a množství) pro rozpočet rekonstrukce.",
  input_schema: {
    type: "object",
    properties: {
      lines: {
        type: "array",
        description: "Výkaz výměr — položky a jejich množství.",
        items: {
          type: "object",
          properties: {
            key: { type: "string", description: "Klíč položky z katalogu (preferuj)." },
            quantity: { type: "number", description: "Množství v MJ položky." },
            name: { type: "string", description: "Jen pro vlastní položku mimo katalog." },
            dil: { type: "string", description: "Jen pro vlastní položku — díl/sekce." },
            unit: { type: "string", description: "Jen pro vlastní položku — MJ." },
            work_price: { type: "number", description: "Jen pro vlastní položku — cena práce/MJ." },
            material_price: { type: "number", description: "Jen pro vlastní položku — cena materiálu/MJ." },
          },
          required: ["quantity"],
        },
      },
      assumptions: { type: "array", items: { type: "string" } },
      estimated_days: { type: "number" },
      notes: { type: "string" },
    },
    required: ["lines", "estimated_days"],
  },
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      return NextResponse.json(
        { error: "Božáček není nakonfigurován (chybí ANTHROPIC_API_KEY)." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const {
      property_type = "Byt",
      scope = "kompletni",
      tier = "standard",
      rooms = [],
      ceiling_height = 2.6,
      fixtures = {},
      margin_percent = 0,
      additional_notes = "",
    } = body;

    const tierSafe: Tier = ["standard", "premium", "vip"].includes(tier) ? tier : "standard";

    const totalArea =
      Array.isArray(rooms) && rooms.length
        ? rooms.reduce((s: number, r: { area_m2?: number }) => s + (Number(r.area_m2) || 0), 0)
        : Number(body.total_area_m2) || 0;

    const roomsDesc =
      Array.isArray(rooms) && rooms.length
        ? rooms.map((r: { label?: string; area_m2?: number }) => `  • ${r.label || "Místnost"}: ${r.area_m2 || "?"} m²`).join("\n")
        : `  • Celková plocha: ${totalArea} m²`;

    const fixturesDesc = Object.entries(fixtures)
      .filter(([, v]) => v)
      .map(([k, v]) => `  • ${k}: ${v}`)
      .join("\n");

    const userPrompt = `Sestav výkaz výměr pro tuto zakázku:

Typ nemovitosti: ${property_type}
Rozsah prací: ${scope}
Úroveň provedení (kvalita): ${tierSafe}
Světlá výška: ${ceiling_height} m
Místnosti:
${roomsDesc}
${fixturesDesc ? `Vybavení / požadavky:\n${fixturesDesc}\n` : ""}${additional_notes ? `Doplňující požadavky klienta: ${additional_notes}\n` : ""}
Celková podlahová plocha: ${totalArea} m².

Zavolej nástroj predlozit_rozpocet s kompletním výkazem výměr.`;

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: SYSTEM_PROMPT.replace("{{CATALOG}}", catalogForPrompt()),
      tools: [TAKEOFF_TOOL],
      tool_choice: { type: "tool", name: "predlozit_rozpocet" },
      messages: [{ role: "user", content: userPrompt }],
    });

    const toolUse = message.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json({ error: "Božáček nevrátil rozpočet. Zkuste to znovu." }, { status: 502 });
    }

    const takeoff = toolUse.input as {
      lines: TakeoffLine[];
      assumptions?: string[];
      estimated_days?: number;
      notes?: string;
    };

    const lines = (takeoff.lines || []).filter((l) => Number(l.quantity) > 0);
    const priced = priceBudget(lines, tierSafe, Number(margin_percent) || 0);
    priced.items = sortByDil(priced.items);

    return NextResponse.json({
      success: true,
      budget: {
        ...priced,
        scope,
        property_type,
        estimated_days: takeoff.estimated_days || null,
        assumptions: takeoff.assumptions || [],
        notes: takeoff.notes || "",
      },
      params: {
        property_type,
        scope,
        quality_level: tierSafe,
        area_m2: totalArea,
        rooms,
        fixtures,
        margin_percent: Number(margin_percent) || 0,
        additional_notes,
      },
    });
  } catch (error) {
    console.error("Božáček API error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: `Chyba Božáčka: ${msg}` }, { status: 500 });
  }
}
