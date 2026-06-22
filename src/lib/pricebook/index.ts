/**
 * BOZA REKO — Ceník (pricebook)
 * ------------------------------------------------------------------
 * Zdroj: reálné podklady firmy (VIVO Build / BOZA REKO), 2023–2026:
 *   - "rozpočet bozak"        → jednotkové ceny PRÁCE (labor) po dílech
 *   - "Zajko materiály"       → ceny MATERIÁLU ve 3 úrovních (low/middle/top)
 *
 * Mapování úrovní:  standard = low budget,  premium = middle,  vip = top quality.
 *
 * Tento soubor je JEDINÝ zdroj pravdy o cenách. Božáček (AI) dělá pouze
 * "výkaz výměr" (vybere položky a množství); ceny se berou odsud, takže
 * rozpočet vždy přesně odpovídá reálným sazbám firmy.
 *
 * Všechny ceny jsou v Kč bez DPH za měrnou jednotku (MJ).
 */

export type Tier = "standard" | "premium" | "vip";

export const TIERS: Tier[] = ["standard", "premium", "vip"];

export const TIER_LABELS: Record<Tier, string> = {
  standard: "Standard",
  premium: "Premium",
  vip: "VIP",
};

/** Materiál: buď jedna cena (stejná napříč úrovněmi), nebo trojice [standard, premium, vip]. */
type Material = number | [number, number, number] | null;

export type PriceItem = {
  key: string;
  dil: string; // díl / sekce rozpočtu
  code: string; // krátký kód položky (Dem, Zed, ...)
  name: string;
  unit: string; // MJ: m2, bm, ks, kpl
  work: number; // cena práce / MJ (bez DPH)
  material: Material; // cena materiálu / MJ (bez DPH)
  bundled?: boolean; // cena už zahrnuje materiál (turnkey položka) → material se nepřičítá
  note?: string;
};

/** Pořadí dílů pro řazení rozpočtu (jako v reálném položkovém rozpočtu). */
export const DILY_ORDER: string[] = [
  "Demontáže a bourací práce",
  "Zednické práce",
  "Sádrokartonářské práce",
  "Vzduchotechnické práce",
  "Obkladačské práce",
  "Podlahářské práce",
  "Malířské práce",
  "Elektrikářské práce",
  "TZB — voda, topení",
  "Stropy",
  "Montážní a dokončovací práce",
  "Kuchyně a nábytek",
  "Režie",
];

/* ──────────────────────────────────────────────────────────────────
 * CENÍK
 * ────────────────────────────────────────────────────────────────── */

export const PRICEBOOK: PriceItem[] = [
  /* ── Demontáže a bourací práce (jen práce) ── */
  { key: "dem_vana", dil: "Demontáže a bourací práce", code: "Dem", name: "Demontáž vany klasické", unit: "ks", work: 560, material: null },
  { key: "dem_wc", dil: "Demontáže a bourací práce", code: "Dem", name: "Demontáž WC kombi", unit: "ks", work: 420, material: null },
  { key: "dem_umyvadlo", dil: "Demontáže a bourací práce", code: "Dem", name: "Demontáž umyvadla", unit: "ks", work: 280, material: null },
  { key: "dem_baterie", dil: "Demontáže a bourací práce", code: "Dem", name: "Demontáž baterie nástěnné", unit: "ks", work: 195, material: null },
  { key: "dem_dvere", dil: "Demontáže a bourací práce", code: "Dem", name: "Demontáž interiérových dveří", unit: "ks", work: 47, material: null },
  { key: "dem_zarubne", dil: "Demontáže a bourací práce", code: "Dem", name: "Demontáž ocelové zárubně vč. výřezu příčky", unit: "ks", work: 833, material: null },
  { key: "dem_oskrabani_malby", dil: "Demontáže a bourací práce", code: "Dem", name: "Oškrábání staré malby na stěně", unit: "m2", work: 49, material: null },
  { key: "dem_elektro", dil: "Demontáže a bourací práce", code: "Dem", name: "Demontáž elektroinstalace bytu", unit: "kpl", work: 3280, material: null },
  { key: "dem_voda", dil: "Demontáže a bourací práce", code: "Dem", name: "Demontáž staré vodoinstalace a odpadů", unit: "kpl", work: 2300, material: null },
  { key: "dem_pvc", dil: "Demontáže a bourací práce", code: "Dem", name: "Demontáž PVC (1 vrstva)", unit: "m2", work: 65, material: null },
  { key: "dem_obklad", dil: "Demontáže a bourací práce", code: "Dem", name: "Odsekání keramického obkladu", unit: "m2", work: 156, material: null },
  { key: "dem_dlazba", dil: "Demontáže a bourací práce", code: "Dem", name: "Odsekání keramické dlažby", unit: "m2", work: 169, material: null },
  { key: "dem_jadro", dil: "Demontáže a bourací práce", code: "Dem", name: "Demontáž umakartového bytového jádra", unit: "ks", work: 5250, material: null },
  { key: "dem_vyrez_panel", dil: "Demontáže a bourací práce", code: "Dem", name: "Výřez panelu a jeho odstranění", unit: "m2", work: 865, material: null },
  { key: "dem_linka", dil: "Demontáže a bourací práce", code: "Dem", name: "Demontáž staré kuchyňské linky", unit: "bm", work: 495, material: null },
  { key: "dem_podlaha", dil: "Demontáže a bourací práce", code: "Dem", name: "Demontáž staré podlahy (škvára, parkety…)", unit: "m2", work: 237, material: null },
  { key: "dem_spize", dil: "Demontáže a bourací práce", code: "Dem", name: "Demontáž staré spíže", unit: "ks", work: 434, material: null },
  { key: "dem_skrin", dil: "Demontáže a bourací práce", code: "Dem", name: "Demontáž vestavěné skříně a nábytku", unit: "ks", work: 1960, material: null },
  { key: "dem_parapety", dil: "Demontáže a bourací práce", code: "Dem", name: "Demontáž starých parapetů", unit: "ks", work: 240, material: null },
  { key: "dem_vstup_dvere", dil: "Demontáže a bourací práce", code: "Dem", name: "Demontáž vstupních dveří a zárubně", unit: "ks", work: 1920, material: null },

  /* ── Zednické práce (práce + materiál) ── */
  { key: "zed_ytong125", dil: "Zednické práce", code: "Zed", name: "Zdění z tvárnic YTONG tl. 125 mm", unit: "m2", work: 545, material: 670 },
  { key: "zed_ytong100", dil: "Zednické práce", code: "Zed", name: "Zdění z tvárnic YTONG tl. 100 mm", unit: "m2", work: 535, material: 650 },
  { key: "zed_ytong50", dil: "Zednické práce", code: "Zed", name: "Zdění z tvárnic YTONG tl. 50 mm", unit: "m2", work: 525, material: 600 },
  { key: "zed_preklad", dil: "Zednické práce", code: "Zed", name: "Uložení YTONG překladu", unit: "ks", work: 350, material: 907 },
  { key: "zed_kotveni_stena", dil: "Zednické práce", code: "Zed", name: "Ukotvení YTONG příčky ke stěně", unit: "ks", work: 40, material: 29 },
  { key: "zed_kotveni_strop", dil: "Zednické práce", code: "Zed", name: "Ukotvení a dilatace příčky ke stropu pěnou", unit: "bm", work: 62, material: 31 },
  { key: "zed_drazky", dil: "Zednické práce", code: "Zed", name: "Hrubé zahození drážek maltou", unit: "bm", work: 145, material: 54 },
  { key: "zed_lepidlo_perlinka", dil: "Zednické práce", code: "Zed", name: "Lepidlo s perlinkou (2 vrstvy, vložená perlinka)", unit: "m2", work: 250, material: [86, 102, 115] },
  { key: "zed_penetrace_perlinka", dil: "Zednické práce", code: "Zed", name: "Penetrace podkladu pod lepidlo s perlinkou", unit: "m2", work: 26, material: 7 },
  { key: "zed_penetrace_omitka", dil: "Zednické práce", code: "Zed", name: "Penetrace podkladu pod sádrovou omítku", unit: "m2", work: 26, material: 7 },
  { key: "zed_sadrova_omitka", dil: "Zednické práce", code: "Zed", name: "Sádrová omítka ve 2 vrstvách", unit: "m2", work: 240, material: [92, 119, 130] },
  { key: "zed_vyrovnani_sten", dil: "Zednické práce", code: "Zed", name: "Hrubé vyrovnání stěn", unit: "ks", work: 0, material: 6300 },
  { key: "zed_sprch_zlab", dil: "Zednické práce", code: "Zed", name: "Vybetonování a usazení sprchového žlabu", unit: "ks", work: 3500, material: 2600 },

  /* ── Sádrokartonářské práce ── */
  { key: "sdk_podhled", dil: "Sádrokartonářské práce", code: "Sád", name: "Podhled rovný (deska 12,5 mm, křížový rastr)", unit: "m2", work: 650, material: 378 },
  { key: "sdk_podhled_impreg", dil: "Sádrokartonářské práce", code: "Sád", name: "Podhled rovný impregnovaný (vlhké provozy)", unit: "m2", work: 650, material: 398 },
  { key: "sdk_zastena_wc", dil: "Sádrokartonářské práce", code: "Sád", name: "SDK zástěna / předstěna WC", unit: "ks", work: 1300, material: 2800 },
  { key: "sdk_predstena_tv", dil: "Sádrokartonářské práce", code: "Sád", name: "Předstěna TV", unit: "ks", work: 1500, material: 6300 },
  { key: "sdk_revizni_dvirka", dil: "Sádrokartonářské práce", code: "Sád", name: "Montáž revizních dvířek / otvor ke stupačkám", unit: "ks", work: 1000, material: 1000 },

  /* ── Vzduchotechnické práce ── */
  { key: "vzt_napojeni", dil: "Vzduchotechnické práce", code: "VZT", name: "Napojení na stávající VZT stoupačku", unit: "ks", work: 649, material: 780 },
  { key: "vzt_rozvod_wc", dil: "Vzduchotechnické práce", code: "VZT", name: "Rozvody vzduchu kulatým potrubím (WC)", unit: "ks", work: 750, material: 1090 },
  { key: "vzt_rozvod_koupelna", dil: "Vzduchotechnické práce", code: "VZT", name: "Rozvody vzduchu kulatým potrubím (koupelna)", unit: "ks", work: 750, material: 980 },
  { key: "vzt_ventilator", dil: "Vzduchotechnické práce", code: "VZT", name: "Montáž ventilátoru", unit: "ks", work: 355, material: null },
  { key: "vzt_klapka", dil: "Vzduchotechnické práce", code: "VZT", name: "Montáž zpětné klapky", unit: "ks", work: 137, material: null },

  /* ── Obkladačské práce ──
     Pozn.: cena samotného obkladu/dlažby (795 Kč/m²) je orientační default —
     finální materiál si klient vybírá, položka je editovatelná. */
  { key: "obk_penetrace_sterka", dil: "Obkladačské práce", code: "Obk", name: "Penetrace podkladu pod samonivelační stěrku", unit: "m2", work: 26, material: 7 },
  { key: "obk_vyrovnani_sterka", dil: "Obkladačské práce", code: "Obk", name: "Vyrovnání podlahy samonivelační stěrkou", unit: "m2", work: 285, material: 530 },
  { key: "obk_hydroizolace", dil: "Obkladačské práce", code: "Obk", name: "Tekutá hydroizolace (2 vrstvy)", unit: "m2", work: 280, material: 198 },
  { key: "obk_hydro_paska", dil: "Obkladačské práce", code: "Obk", name: "Hydroizolační koutová páska", unit: "bm", work: 99, material: 99 },
  { key: "obk_penetrace_obklad", dil: "Obkladačské práce", code: "Obk", name: "Penetrace podkladu pod obklad", unit: "m2", work: 26, material: 7 },
  { key: "obk_obklad", dil: "Obkladačské práce", code: "Obk", name: "Montáž keramického obkladu (600×600 mm)", unit: "m2", work: 830, material: 795 },
  { key: "obk_penetrace_dlazba", dil: "Obkladačské práce", code: "Obk", name: "Penetrace podkladu pod dlažbu", unit: "m2", work: 26, material: 7 },
  { key: "obk_dlazba", dil: "Obkladačské práce", code: "Obk", name: "Montáž keramické dlažby (600×600 mm)", unit: "m2", work: 830, material: 795 },
  { key: "obk_vykrouzeni", dil: "Obkladačské práce", code: "Obk", name: "Vykroužení otvorů", unit: "ks", work: 110, material: null },
  { key: "obk_silikon", dil: "Obkladačské práce", code: "Obk", name: "Aplikace silikonu", unit: "bm", work: 34, material: 45 },
  { key: "obk_lista", dil: "Obkladačské práce", code: "Obk", name: "Montáž ukončovací hliníkové lišty", unit: "bm", work: 147, material: 147 },
  { key: "obk_spotrebni", dil: "Obkladačské práce", code: "Obk", name: "Lepidlo, spony, spárovačka, spotřební materiál", unit: "m2", work: 0, material: [345, 389, 389] },

  /* ── Podlahářské práce ── */
  { key: "podl_liapor", dil: "Podlahářské práce", code: "Podl", name: "Keramické kamenivo Liapor 1–4 mm", unit: "m2", work: 406, material: [200, 250, 442] },
  { key: "podl_desky", dil: "Podlahářské práce", code: "Podl", name: "Podlahové desky (OSB / Fermacell)", unit: "m2", work: 415, material: [520, 809, 809] },
  { key: "podl_textilie", dil: "Podlahářské práce", code: "Podl", name: "Montáž netkané textílie", unit: "m2", work: 44, material: 52 },
  { key: "podl_izolace", dil: "Podlahářské práce", code: "Podl", name: "Protihluková / kročejová izolace", unit: "m2", work: 92, material: [57, 157, 157] },
  { key: "podl_vinyl", dil: "Podlahářské práce", code: "Podl", name: "Montáž vinylové podlahy (systém click)", unit: "m2", work: 450, material: 960 },
  { key: "podl_obvod_lista", dil: "Podlahářské práce", code: "Podl", name: "Montáž obvodové krycí lišty", unit: "bm", work: 110, material: 207 },
  { key: "podl_prechod_lista", dil: "Podlahářské práce", code: "Podl", name: "Montáž přechodové lišty", unit: "bm", work: 120, material: 341 },
  { key: "podl_nivelace", dil: "Podlahářské práce", code: "Podl", name: "Nivelace podlahy", unit: "m2", work: 275, material: 530 },

  /* ── Malířské práce ── */
  { key: "mal_penetrace_stena", dil: "Malířské práce", code: "Mal", name: "Penetrace stěny válečkem", unit: "m2", work: 26, material: 7 },
  { key: "mal_penetrace_strop", dil: "Malířské práce", code: "Mal", name: "Penetrace stropu válečkem", unit: "m2", work: 26, material: 7 },
  { key: "mal_stena", dil: "Malířské práce", code: "Mal", name: "Malba stěny", unit: "m2", work: 34, material: [14, 18, 20] },
  { key: "mal_strop", dil: "Malířské práce", code: "Mal", name: "Malba stropu", unit: "m2", work: 34, material: [14, 18, 20] },

  /* ── Elektrikářské práce (vč. materiálu) ── */
  { key: "el_rozvody", dil: "Elektrikářské práce", code: "Ele", name: "Vysekání drážek + nové rozvody elektřiny vč. materiálu", unit: "m2", work: 1300, material: null, bundled: true },

  /* ── TZB — voda, topení (vč. materiálu) ── */
  { key: "tzb_voda", dil: "TZB — voda, topení", code: "TZB", name: "Nová vodoinstalace, rozvody odpadu, radiátory vč. materiálu", unit: "kpl", work: 19850, material: null, bundled: true },

  /* ── Stropy (vč. materiálu) ── */
  { key: "strop_napinany", dil: "Stropy", code: "Str", name: "Montáž napínaných stropů vč. materiálu", unit: "m2", work: 1100, material: null, bundled: true },

  /* ── Montážní a dokončovací práce + sanitární sestavy ── */
  { key: "mont_dokonc_koupelna", dil: "Montážní a dokončovací práce", code: "Mont", name: "Dokončovací práce koupelna (montáž sanity)", unit: "ks", work: 8130, material: null },
  { key: "mont_dokonc_wc", dil: "Montážní a dokončovací práce", code: "Mont", name: "Dokončovací práce WC (montáž sanity)", unit: "ks", work: 3500, material: null },
  { key: "mont_dvere", dil: "Montážní a dokončovací práce", code: "Mont", name: "Dveře vč. obložek a montáže", unit: "ks", work: 2000, material: [3500, 6800, 9800] },
  { key: "mont_sprchovy_kout", dil: "Montážní a dokončovací práce", code: "Mont", name: "Sprchový kout (zástěna, žlab, baterie)", unit: "ks", work: 0, material: 16990 },
  { key: "mont_umyvadlo", dil: "Montážní a dokončovací práce", code: "Mont", name: "Sestava umyvadlo (skříňka, umyvadlo, baterie, zrcadlo)", unit: "ks", work: 0, material: 16440 },
  { key: "mont_wc", dil: "Montážní a dokončovací práce", code: "Mont", name: "WC sestava (mísa, splachovací sestava, tlačítko)", unit: "ks", work: 0, material: 9800 },
  { key: "mont_vana", dil: "Montážní a dokončovací práce", code: "Mont", name: "Vana vč. baterie a obezdění", unit: "ks", work: 2500, material: 14000 },
  { key: "mont_vestavena_skrin", dil: "Kuchyně a nábytek", code: "Stol", name: "Vestavěná skříň", unit: "ks", work: 0, material: 35700 },
  { key: "mont_vstupni_dvere", dil: "Montážní a dokončovací práce", code: "Mont", name: "Vstupní bezpečnostní dveře vč. montáže", unit: "ks", work: 0, material: 35900 },

  /* ── Kuchyně a nábytek ── */
  { key: "kuch_linka", dil: "Kuchyně a nábytek", code: "Stol", name: "Kuchyňská linka vč. spotřebičů a montáže", unit: "kpl", work: 0, material: 132500 },

  /* ── Režie ── */
  { key: "rez_doprava", dil: "Režie", code: "Rež", name: "Doprava pracovníků a materiálu, výnos materiálu", unit: "kpl", work: 24250, material: null },
  { key: "rez_likvidace", dil: "Režie", code: "Rež", name: "Likvidace odpadu", unit: "kpl", work: 20000, material: null },
  { key: "rez_statika", dil: "Režie", code: "Rež", name: "Statický posudek + poplatky (družstvo/SVJ)", unit: "kpl", work: 16000, material: null },
];

export const PRICEBOOK_BY_KEY: Record<string, PriceItem> = Object.fromEntries(
  PRICEBOOK.map((i) => [i.key, i])
);

export const DPH_RATE = 0.21;

/* ──────────────────────────────────────────────────────────────────
 * Oceňovací engine
 * ────────────────────────────────────────────────────────────────── */

export function materialPrice(item: PriceItem, tier: Tier): number {
  if (item.material == null) return 0;
  if (Array.isArray(item.material)) {
    const idx = tier === "standard" ? 0 : tier === "premium" ? 1 : 2;
    return item.material[idx];
  }
  return item.material;
}

/** Vstup z AI výkazu výměr — odkaz do ceníku + množství, případně overrides / custom položka. */
export type TakeoffLine = {
  key?: string | null;
  quantity: number;
  // volitelné přepisy / vlastní položka mimo ceník:
  name?: string;
  dil?: string;
  unit?: string;
  work_price?: number;
  material_price?: number;
  bundled?: boolean;
};

/** Oceněná položka rozpočtu. */
export type PricedItem = {
  key: string | null;
  dil: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  work_price: number;
  material_price: number;
  work_total: number;
  material_total: number;
  total: number;
  bundled: boolean;
};

export type BudgetTotals = {
  work_net: number;
  material_net: number;
  subtotal_net: number; // work + material
  margin_percent: number;
  margin_amount: number;
  total_net: number; // subtotal + margin
  dph: number;
  total_gross: number;
};

export type PricedBudget = {
  tier: Tier;
  items: PricedItem[];
  totals: BudgetTotals;
};

/** Oceň jednu takeoff položku dle ceníku a úrovně. */
export function priceLine(line: TakeoffLine, tier: Tier): PricedItem {
  const ref = line.key ? PRICEBOOK_BY_KEY[line.key] : undefined;
  const bundled = line.bundled ?? ref?.bundled ?? false;
  const work_price = line.work_price ?? ref?.work ?? 0;
  const material_price = bundled
    ? 0
    : line.material_price ?? (ref ? materialPrice(ref, tier) : 0);
  const quantity = Number(line.quantity) || 0;
  const work_total = Math.round(work_price * quantity);
  const material_total = Math.round(material_price * quantity);

  return {
    key: line.key ?? null,
    dil: line.dil ?? ref?.dil ?? "Ostatní",
    code: ref?.code ?? "",
    name: line.name ?? ref?.name ?? "Položka",
    unit: line.unit ?? ref?.unit ?? "kpl",
    quantity,
    work_price,
    material_price,
    work_total,
    material_total,
    total: work_total + material_total,
    bundled,
  };
}

/** Spočítej celý rozpočet z výkazu výměr. */
export function priceBudget(
  lines: TakeoffLine[],
  tier: Tier,
  marginPercent = 0
): PricedBudget {
  const items = lines.map((l) => priceLine(l, tier));
  return { tier, items, totals: sumItems(items, marginPercent) };
}

/** Sečti už oceněné položky (po ruční editaci). */
export function sumItems(items: PricedItem[], marginPercent = 0): BudgetTotals {
  const work_net = items.reduce((s, i) => s + i.work_total, 0);
  const material_net = items.reduce((s, i) => s + i.material_total, 0);
  const subtotal_net = work_net + material_net;
  const margin_amount = Math.round((subtotal_net * marginPercent) / 100);
  const total_net = subtotal_net + margin_amount;
  const dph = Math.round(total_net * DPH_RATE);
  return {
    work_net,
    material_net,
    subtotal_net,
    margin_percent: marginPercent,
    margin_amount,
    total_net,
    dph,
    total_gross: total_net + dph,
  };
}

/** Seřaď položky dle pořadí dílů. */
export function sortByDil<T extends { dil: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ia = DILY_ORDER.indexOf(a.dil);
    const ib = DILY_ORDER.indexOf(b.dil);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
}

/** Kompaktní katalog pro AI prompt (klíč, díl, název, MJ, má-materiál). */
export function catalogForPrompt(): string {
  return DILY_ORDER.map((dil) => {
    const rows = PRICEBOOK.filter((i) => i.dil === dil);
    if (!rows.length) return "";
    const lines = rows
      .map((i) => `  ${i.key} | ${i.name} | MJ: ${i.unit}${i.bundled ? " | vč. materiálu" : ""}`)
      .join("\n");
    return `# ${dil}\n${lines}`;
  })
    .filter(Boolean)
    .join("\n");
}
