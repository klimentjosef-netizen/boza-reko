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

Tvým úkolem je z parametrů zakázky (a případně z přiloženého PŮDORYSU) sestavit přesný
VÝKAZ VÝMĚR — které položky se na zakázce provedou a v jakém MNOŽSTVÍ. Ceny NEŘEŠÍŠ —
doplní se automaticky z firemního ceníku podle klíče položky. Ty určuješ "key" a "quantity".

POUŽÍVEJ VÝHRADNĚ klíče (key) z následujícího katalogu. Pokud potřebuješ položku mimo
katalog, vrať ji jako vlastní řádek (name, dil, unit, work_price, material_price) — ale
maximálně se drž katalogu.

== KATALOG POLOŽEK ==
{{CATALOG}}

POKUD JE PŘILOŽEN PŮDORYS (obrázek nebo PDF):
- Přečti z něj jednotlivé místnosti a jejich plochy. Plochy ber z popisků (m²) nebo je
  spočítej z kót/rozměrů. Pokud měřítko/rozměry chybí, odhadni plochy z typických proporcí
  a uveď to v assumptions.
- Vrať seznam rozpoznaných místností v poli "rooms" a celkovou plochu "total_area_m2".
- Urči typ nemovitosti ("property_type", např. "Byt 3+1") a (pokud z popisu neplyne jinak)
  předpokládej kompletní rekonstrukci.

ODBORNÉ ZÁSADY VÝPOČTU MNOŽSTVÍ (výkaz výměr):
- Plochu stěn počítej z podlahové plochy a světlé výšky (default 2,6 m):
  obvod místnosti ≈ 4,2 × √(podlahová plocha), plocha stěn = obvod × výška.
- Omítky/malby/penetrace stěn: plocha stěn rekonstruovaných místností (−10 % na otvory u větších).
- Malba a penetrace stropu: podlahová plocha. Podlahy (Liapor, desky, izolace, vinyl, textílie,
  nivelace): podlahová plocha. Lišty (bm): obvod podlah.
- Obklady (koupelna/WC): stěny do výšky ~2,0–2,2 m; dlažba: podlaha koupelny/WC.
- Hydroizolace + koutová páska: podlaha + spodní část stěn mokrých provozů.
- Sanitární sestavy, kuchyně, vestavěné skříně, dveře, vstupní dveře — dle skutečného počtu (ks/kpl).
- Dokončovací práce koupelna/WC: 1 ks za každou koupelnu/WC. Elektro a napínané stropy: m² podlahy.
  TZB voda: 1 kpl. Režie (doprava, likvidace odpadu): vždy 1 kpl. Statika jen u zásahů do nosných konstrukcí.

ROZSAH PRACÍ (scope):
- "kompletni" = vše od základu (demontáže, rozvody elektro+voda, zdění, omítky, obklady, podlahy,
  malby, sanita, kuchyně, dveře, režie).
- "castecna" = bez demontáže rozvodů a bourání nosných konstrukcí; nové povrchy, podlahy, obklady,
  malby, výměna sanity/dveří dle zadání.
- "dokoncovaci" = hlavně malby, penetrace, podlahy, drobné opravy. Žádné bourání ani rozvody.

MILNÍKY: navrhni také "milestones" — logickou posloupnost fází realizace ve SPRÁVNÉM
pořadí stavebních závislostí (nelze malovat před omítkou, nelze pokládat podlahu před
rozvody apod.). Zahrň jen fáze relevantní pro daný rozsah. Typické pořadí:
demontáže a bourání → hrubé rozvody (elektro, voda) → zdění příček → sádrové omítky →
sádrokartony/podhledy → hydroizolace a obklady → podlahy → malby → napínané stropy →
montáž sanity, kuchyně a dveří → úklid, odvoz suti a předání. Vrať 5–9 výstižných milníků.

VÝSTUP: zavolej nástroj "predlozit_rozpocet". Buď konkrétní a realistický.`;

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
      rooms: {
        type: "array",
        description: "Rozpoznané místnosti (hlavně při čtení z půdorysu).",
        items: {
          type: "object",
          properties: { label: { type: "string" }, area_m2: { type: "number" } },
        },
      },
      total_area_m2: { type: "number" },
      property_type: { type: "string" },
      assumptions: { type: "array", items: { type: "string" } },
      milestones: {
        type: "array",
        description: "Logická posloupnost milníků (fází) realizace ve správném pořadí závislostí.",
        items: { type: "string" },
      },
      estimated_days: { type: "number" },
      notes: { type: "string" },
    },
    required: ["lines", "estimated_days"],
  },
};

type ImagePayload = { media_type: string; data: string };

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
    const mode = body.mode === "quick" ? "quick" : "manual";
    const {
      property_type = "Byt",
      scope = "kompletni",
      tier = "standard",
      rooms = [],
      ceiling_height = 2.6,
      fixtures = {},
      margin_percent = 0,
      additional_notes = "",
      description = "",
      file = null as ImagePayload | null,
    } = body;

    const tierSafe: Tier = ["standard", "premium", "vip"].includes(tier) ? tier : "standard";

    // ── Sestavení uživatelské zprávy (text + případně půdorys) ──
    const userContent: Anthropic.ContentBlockParam[] = [];
    let userText: string;

    if (mode === "quick") {
      if (file?.data && file?.media_type) {
        if (file.media_type === "application/pdf") {
          userContent.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: file.data } });
        } else {
          userContent.push({
            type: "image",
            source: { type: "base64", media_type: file.media_type as "image/png" | "image/jpeg" | "image/webp" | "image/gif", data: file.data },
          });
        }
      }
      userText = `Sestav kompletní položkový rozpočet rekonstrukce.
Úroveň provedení (kvalita): ${tierSafe}
Rozsah prací: ${scope}
${file?.data ? "V příloze je PŮDORYS — přečti z něj místnosti a plochy.\n" : ""}Popis zakázky od uživatele:
"${description || "(bez popisu)"}"

Pokud něco není jednoznačné, rozumně to odhadni a uveď v assumptions. Zavolej nástroj predlozit_rozpocet.`;
    } else {
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
      userText = `Sestav výkaz výměr pro tuto zakázku:

Typ nemovitosti: ${property_type}
Rozsah prací: ${scope}
Úroveň provedení (kvalita): ${tierSafe}
Světlá výška: ${ceiling_height} m
Místnosti:
${roomsDesc}
${fixturesDesc ? `Vybavení / požadavky:\n${fixturesDesc}\n` : ""}${additional_notes ? `Doplňující požadavky klienta: ${additional_notes}\n` : ""}
Celková podlahová plocha: ${totalArea} m².

Zavolej nástroj predlozit_rozpocet s kompletním výkazem výměr.`;
    }

    userContent.push({ type: "text", text: userText });

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: SYSTEM_PROMPT.replace("{{CATALOG}}", catalogForPrompt()),
      tools: [TAKEOFF_TOOL],
      tool_choice: { type: "tool", name: "predlozit_rozpocet" },
      messages: [{ role: "user", content: userContent }],
    });

    const toolUse = message.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json({ error: "Božáček nevrátil rozpočet. Zkuste to znovu." }, { status: 502 });
    }

    const takeoff = toolUse.input as {
      lines: TakeoffLine[];
      rooms?: { label: string; area_m2: number }[];
      total_area_m2?: number;
      property_type?: string;
      assumptions?: string[];
      milestones?: string[];
      estimated_days?: number;
      notes?: string;
    };

    const lines = (takeoff.lines || []).filter((l) => Number(l.quantity) > 0);
    const priced = priceBudget(lines, tierSafe, Number(margin_percent) || 0);
    priced.items = sortByDil(priced.items);

    const resolvedRooms = mode === "quick" ? (takeoff.rooms || []) : rooms;
    const resolvedType = mode === "quick" ? (takeoff.property_type || "Rekonstrukce") : property_type;
    const resolvedArea =
      takeoff.total_area_m2 ||
      (Array.isArray(resolvedRooms) ? resolvedRooms.reduce((s: number, r: { area_m2?: number }) => s + (Number(r.area_m2) || 0), 0) : 0);

    return NextResponse.json({
      success: true,
      budget: {
        ...priced,
        scope,
        property_type: resolvedType,
        estimated_days: takeoff.estimated_days || null,
        assumptions: takeoff.assumptions || [],
        milestones: takeoff.milestones || [],
        notes: takeoff.notes || "",
      },
      params: {
        property_type: resolvedType,
        scope,
        quality_level: tierSafe,
        area_m2: resolvedArea,
        rooms: resolvedRooms,
        fixtures,
        margin_percent: Number(margin_percent) || 0,
        additional_notes: description || additional_notes,
      },
    });
  } catch (error) {
    console.error("Božáček API error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: `Chyba Božáčka: ${msg}` }, { status: 500 });
  }
}
