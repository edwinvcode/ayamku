import { ChickenBatch, ChickenStage } from "@/types/database";
import { getBatchAgeDays } from "@/lib/lifecycle";

export const FEED_RATES = {
  starter:        { label: "Starter",       gramPerHead: 25,  brand: "BR-1 Comfeed (Japfa)",     pricePerKg: 4800 },
  grower:         { label: "Grower",         gramPerHead: 60,  brand: "Comfeed PAR G (Japfa)",    pricePerKg: 6500 },
  layer:          { label: "Layer",          gramPerHead: 110, brand: "Comfeed PAR L-I (Japfa)",  pricePerKg: 6800 },
  afkir:          { label: "Afkir",          gramPerHead: 90,  brand: "Comfeed PAR G (Japfa)",    pricePerKg: 6500 },
  indukan_betina: { label: "Indukan Betina", gramPerHead: 125, brand: "Comfeed PAR L-I (Japfa)",  pricePerKg: 6800 },
  indukan_jantan: { label: "Indukan Jantan", gramPerHead: 105, brand: "Comfeed PAR L-I (Japfa)",  pricePerKg: 6800 },
} as const;

export interface StageRow {
  key: string;
  label: string;
  brand: string;
  pricePerKg: number;
  quantity: number;
  gramPerHead: number;
  dailyKg: number;
  weeklyKg: number;
  monthlyKg: number;
  dailyCost: number;
  weeklyCost: number;
  monthlyCost: number;
  daysUntilTransition: number | null;
  nextStageName: string | null;
}

export interface FeedEstimate {
  rows: StageRow[];
  totalDailyKg: number;
  totalWeeklyKg: number;
  totalMonthlyKg: number;
  totalDailyKarung: number;
  totalWeeklyKarung: number;
  totalMonthlyKarung: number;
  totalDailyCost: number;
  totalWeeklyCost: number;
  totalMonthlyCost: number;
}

export type FeedRateKey = keyof typeof FEED_RATES;

export interface FeedRateOverride {
  brand: string;
  pricePerKg: number;
}

export type FeedRateOverrides = Partial<Record<FeedRateKey, FeedRateOverride>>;

function resolveRate(key: FeedRateKey, overrides?: FeedRateOverrides) {
  const base = FEED_RATES[key];
  const ov = overrides?.[key];
  return {
    label: base.label,
    gramPerHead: base.gramPerHead,
    brand: ov?.brand || base.brand,
    pricePerKg: ov?.pricePerKg || base.pricePerKg,
  };
}

export function getFeedRateGram(
  stage: ChickenStage,
  breederGender?: "jantan" | "betina" | null
): number {
  if (stage === "harvested") return 0;
  if (stage === "indukan") {
    return breederGender === "jantan"
      ? FEED_RATES.indukan_jantan.gramPerHead
      : FEED_RATES.indukan_betina.gramPerHead; // null defaults to betina
  }
  return FEED_RATES[stage as keyof typeof FEED_RATES].gramPerHead;
}

function makeRow(
  key: string,
  label: string,
  brand: string,
  pricePerKg: number,
  gramPerHead: number,
  quantity: number,
  daysUntilTransition: number | null,
  nextStageName: string | null
): StageRow {
  const dailyKg = (quantity * gramPerHead) / 1000;
  return {
    key, label, brand, pricePerKg, quantity, gramPerHead,
    dailyKg,
    weeklyKg: dailyKg * 7,
    monthlyKg: dailyKg * 30,
    dailyCost: dailyKg * pricePerKg,
    weeklyCost: dailyKg * 7 * pricePerKg,
    monthlyCost: dailyKg * 30 * pricePerKg,
    daysUntilTransition,
    nextStageName,
  };
}

export function calcFeedNeeds(batches: ChickenBatch[], overrides?: FeedRateOverrides): FeedEstimate {
  const active = batches.filter(b => b.stage !== "harvested");

  const groups: Record<string, ChickenBatch[]> = {
    starter: [], grower: [], layer: [], afkir: [],
    indukan_betina: [], indukan_jantan: [],
  };

  for (const b of active) {
    if (b.stage === "indukan") {
      if (b.breeder_gender === "jantan") groups.indukan_jantan.push(b);
      else groups.indukan_betina.push(b);
    } else if (b.stage in groups) {
      groups[b.stage].push(b);
    }
  }

  const rows: StageRow[] = [];

  const simpleStages: { key: string; nextStage: string | null; threshold: number | null }[] = [
    { key: "starter", nextStage: "Grower", threshold: 28 },
    { key: "grower",  nextStage: "Layer",  threshold: 84 },
    { key: "layer",   nextStage: null,      threshold: null },
    { key: "afkir",   nextStage: null,      threshold: null },
  ];

  for (const { key, nextStage, threshold } of simpleStages) {
    const batchGroup = groups[key];
    if (batchGroup.length === 0) continue;
    const qty = batchGroup.reduce((s, b) => s + b.quantity, 0);
    const rate = resolveRate(key as FeedRateKey, overrides);
    let daysUntil: number | null = null;
    if (threshold !== null) {
      const minAge = Math.min(...batchGroup.map(b => getBatchAgeDays(b.hatch_date)));
      daysUntil = Math.max(0, threshold - minAge);
    }
    rows.push(makeRow(key, rate.label, rate.brand, rate.pricePerKg, rate.gramPerHead, qty, daysUntil, nextStage));
  }

  const indukanGroups = ["indukan_betina", "indukan_jantan"] as FeedRateKey[];
  for (const key of indukanGroups) {
    const batchGroup = groups[key];
    if (batchGroup.length === 0) continue;
    const qty = batchGroup.reduce((s, b) => s + b.quantity, 0);
    const rate = resolveRate(key, overrides);
    rows.push(makeRow(key, rate.label, rate.brand, rate.pricePerKg, rate.gramPerHead, qty, null, null));
  }

  const totalDailyKg = rows.reduce((s, r) => s + r.dailyKg, 0);
  const totalWeeklyKg = totalDailyKg * 7;
  const totalMonthlyKg = totalDailyKg * 30;
  const totalDailyCost = rows.reduce((s, r) => s + r.dailyCost, 0);
  const totalWeeklyCost = rows.reduce((s, r) => s + r.weeklyCost, 0);
  const totalMonthlyCost = rows.reduce((s, r) => s + r.monthlyCost, 0);

  return {
    rows,
    totalDailyKg,
    totalWeeklyKg,
    totalMonthlyKg,
    totalDailyKarung: Math.ceil(totalDailyKg / 50),
    totalWeeklyKarung: Math.ceil(totalWeeklyKg / 50),
    totalMonthlyKarung: Math.ceil(totalMonthlyKg / 50),
    totalDailyCost,
    totalWeeklyCost,
    totalMonthlyCost,
  };
}

export const FEED_SCHEDULE = {
  starter: {
    ageRange: "Hari 1–28",
    frequency: 5,
    times: ["06:00", "09:00", "12:00", "15:00", "18:00"],
    notes: "Habiskan sisa pakan lama sebelum mengisi yang baru untuk menjaga kesegaran.",
  },
  grower: {
    ageRange: "Hari 29–84",
    frequency: 3,
    times: ["06:00", "12:00", "17:00"],
    notes: "Pantau sisa pakan tiap sesi. Jika selalu habis cepat, naikkan porsi sedikit; jika sering sisa, kurangi.",
  },
  layer: {
    ageRange: "> Hari 84",
    frequency: 2,
    times: ["06:00", "15:00"],
    notes: "Pagi sebelum puncak produksi telur. Sore untuk pengisian energi kembali. Tambahkan sumber kalsium untuk kualitas kerabang.",
  },
  afkir: {
    ageRange: "Fase penggemukan",
    frequency: 2,
    times: ["06:00", "15:00"],
    notes: "Beri pakan sesuai porsi, hindari sisa yang menumpuk dan berjamur.",
  },
  indukan_betina: {
    ageRange: "Fase produksi",
    frequency: 3,
    times: ["06:00", "12:00", "16:00"],
    notes: "Jadwal teratur mendukung siklus produksi telur tetas yang stabil.",
  },
  indukan_jantan: {
    ageRange: "Fase produksi",
    frequency: 3,
    times: ["06:00", "12:00", "16:00"],
    notes: "Pisahkan tempat makan dari betina jika rasio jantan:betina tidak seimbang.",
  },
} as const;

export function formatKg(kg: number): string {
  return kg.toFixed(1) + " kg";
}

export function formatRupiah(amount: number): string {
  return "Rp " + Math.round(amount).toLocaleString("id-ID");
}
