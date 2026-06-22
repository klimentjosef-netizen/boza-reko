/** Sdílené dispozice bytů/domů — předvyplní místnosti a plochy. */

export type RoomPreset = { label: string; area_m2: number; wet?: boolean };

export type Disposition = {
  key: string;
  label: string;
  rooms: RoomPreset[];
};

export const DISPOSITIONS: Disposition[] = [
  { key: "1+kk", label: "1+kk", rooms: [
    { label: "Obývák s kk", area_m2: 22 }, { label: "Koupelna + WC", area_m2: 4, wet: true }, { label: "Chodba", area_m2: 4 },
  ] },
  { key: "1+1", label: "1+1", rooms: [
    { label: "Pokoj", area_m2: 18 }, { label: "Kuchyně", area_m2: 8 }, { label: "Koupelna", area_m2: 4, wet: true }, { label: "WC", area_m2: 1.5, wet: true }, { label: "Chodba", area_m2: 4 },
  ] },
  { key: "2+kk", label: "2+kk", rooms: [
    { label: "Obývák s kk", area_m2: 22 }, { label: "Ložnice", area_m2: 14 }, { label: "Koupelna", area_m2: 5, wet: true }, { label: "WC", area_m2: 1.5, wet: true }, { label: "Chodba", area_m2: 6 },
  ] },
  { key: "2+1", label: "2+1", rooms: [
    { label: "Obývák", area_m2: 20 }, { label: "Ložnice", area_m2: 14 }, { label: "Kuchyně", area_m2: 9 }, { label: "Koupelna", area_m2: 5, wet: true }, { label: "WC", area_m2: 1.5, wet: true }, { label: "Chodba", area_m2: 6 },
  ] },
  { key: "3+kk", label: "3+kk", rooms: [
    { label: "Obývák s kk", area_m2: 25 }, { label: "Ložnice", area_m2: 14 }, { label: "Dětský pokoj", area_m2: 12 }, { label: "Koupelna", area_m2: 6, wet: true }, { label: "WC", area_m2: 1.5, wet: true }, { label: "Chodba", area_m2: 7 },
  ] },
  { key: "3+1", label: "3+1", rooms: [
    { label: "Obývák", area_m2: 20 }, { label: "Ložnice", area_m2: 14 }, { label: "Dětský pokoj", area_m2: 12 }, { label: "Kuchyně", area_m2: 10 }, { label: "Koupelna", area_m2: 6, wet: true }, { label: "WC", area_m2: 1.5, wet: true }, { label: "Chodba", area_m2: 8 },
  ] },
  { key: "4+kk", label: "4+kk", rooms: [
    { label: "Obývák s kk", area_m2: 28 }, { label: "Ložnice", area_m2: 16 }, { label: "Dětský pokoj 1", area_m2: 12 }, { label: "Dětský pokoj 2", area_m2: 10 }, { label: "Koupelna", area_m2: 7, wet: true }, { label: "WC", area_m2: 2, wet: true }, { label: "Chodba", area_m2: 9 },
  ] },
  { key: "4+1", label: "4+1", rooms: [
    { label: "Obývák", area_m2: 22 }, { label: "Ložnice", area_m2: 16 }, { label: "Dětský pokoj 1", area_m2: 12 }, { label: "Dětský pokoj 2", area_m2: 10 }, { label: "Kuchyně", area_m2: 12 }, { label: "Koupelna", area_m2: 7, wet: true }, { label: "WC", area_m2: 2, wet: true }, { label: "Chodba", area_m2: 9 },
  ] },
  { key: "dum", label: "Rodinný dům", rooms: [
    { label: "Obývák", area_m2: 30 }, { label: "Kuchyně", area_m2: 16 }, { label: "Ložnice", area_m2: 18 }, { label: "Pokoj 2", area_m2: 14 }, { label: "Pokoj 3", area_m2: 12 }, { label: "Koupelna", area_m2: 8, wet: true }, { label: "Koupelna 2 / přízemí", area_m2: 5, wet: true }, { label: "WC", area_m2: 2, wet: true }, { label: "Chodba + schodiště", area_m2: 14 }, { label: "Technická místnost", area_m2: 6 },
  ] },
  { key: "koupelna", label: "Pouze koupelna", rooms: [ { label: "Koupelna", area_m2: 6, wet: true } ] },
  { key: "kuchyn", label: "Pouze kuchyně", rooms: [ { label: "Kuchyně", area_m2: 12 } ] },
];

export const ROOM_TYPES: RoomPreset[] = [
  { label: "Koupelna", area_m2: 6, wet: true },
  { label: "WC", area_m2: 2, wet: true },
  { label: "Kuchyně", area_m2: 12 },
  { label: "Pokoj / obývák", area_m2: 20 },
  { label: "Ložnice", area_m2: 16 },
  { label: "Chodba", area_m2: 6 },
];
