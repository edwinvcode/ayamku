import { ChickenBatch, ChickenStage } from "@/types/database";
import { getBatchAgeDays } from "@/lib/lifecycle";
import { FEED_RATES } from "@/lib/feed-estimate";

export const MARKET_REFERENCE_PRICE: Record<ChickenStage, number> = {
  starter:   0,
  grower:    28000,
  layer:     40000,
  afkir:     33000,
  indukan:   55000,
  harvested: 0,
};

export type SellPriceOverrides = Partial<Record<ChickenStage, number>>;

export type PriceSource = "kustom" | "penjualan" | "referensi";

export interface BatchStrategy {
  batchId: string;
  batchCode: string;
  stage: ChickenStage;
  quantity: number;
  ageDays: number;
  currentStageDays: number;
  accumulatedFeedCost: number;
  dailyFeedCost: number;
  breakEvenPerHead: number;
  estimatedSellPrice: number;
  priceSource: PriceSource;
  estimatedRevenue: number;
  estimatedProfit: number;
  profitMarginPct: number;
  priority: "jual" | "transisi" | "tunggu" | "pertahankan";
  recommendation: string;
}

export interface PortfolioSummary {
  totalQuantity: number;
  totalAccumulatedCost: number;
  totalEstimatedRevenue: number;
  totalEstimatedProfit: number;
  avgProfitMarginPct: number;
  urgentCount: number;
}

function getCurrentStageRate(batch: ChickenBatch): { gramPerHead: number; pricePerKg: number } {
  if (batch.stage === "indukan") {
    const key = batch.breeder_gender === "jantan" ? "indukan_jantan" : "indukan_betina";
    return { gramPerHead: FEED_RATES[key].gramPerHead, pricePerKg: FEED_RATES[key].pricePerKg };
  }
  if (batch.stage === "harvested") return { gramPerHead: 0, pricePerKg: 0 };
  const rate = FEED_RATES[batch.stage as keyof typeof FEED_RATES];
  return { gramPerHead: rate.gramPerHead, pricePerKg: rate.pricePerKg };
}

export function calcAccumulatedFeedCost(batch: ChickenBatch): number {
  const ageDays = Math.max(0, getBatchAgeDays(batch.hatch_date));
  const currentStageDays = Math.max(0, getBatchAgeDays(batch.stage_since));
  const previousDays = Math.max(0, ageDays - currentStageDays);
  const qty = batch.quantity;

  const starterDays    = Math.min(previousDays, 28);
  const growerDays     = Math.min(Math.max(previousDays - 28, 0), 56);
  const layerPrevDays  = Math.max(previousDays - 84, 0);

  const starterCost   = starterDays   * FEED_RATES.starter.gramPerHead * FEED_RATES.starter.pricePerKg * qty / 1000;
  const growerCost    = growerDays    * FEED_RATES.grower.gramPerHead  * FEED_RATES.grower.pricePerKg  * qty / 1000;
  const layerPrevCost = layerPrevDays * FEED_RATES.layer.gramPerHead   * FEED_RATES.layer.pricePerKg   * qty / 1000;

  const { gramPerHead, pricePerKg } = getCurrentStageRate(batch);
  const currentCost = currentStageDays * gramPerHead * pricePerKg * qty / 1000;

  return starterCost + growerCost + layerPrevCost + currentCost;
}

function resolveSellPrice(
  stage: ChickenStage,
  sellOverrides: SellPriceOverrides,
  historicalAvg: number | null
): { price: number; source: PriceSource } {
  if (stage === "starter" || stage === "harvested") {
    return { price: 0, source: "referensi" };
  }
  if (sellOverrides[stage] !== undefined) {
    return { price: sellOverrides[stage]!, source: "kustom" };
  }
  if (historicalAvg !== null) {
    return { price: historicalAvg, source: "penjualan" };
  }
  return { price: MARKET_REFERENCE_PRICE[stage], source: "referensi" };
}

export function calcBatchStrategy(
  batch: ChickenBatch,
  sellOverrides: SellPriceOverrides,
  historicalAvg: number | null
): BatchStrategy {
  const ageDays = Math.max(0, getBatchAgeDays(batch.hatch_date));
  const currentStageDays = Math.max(0, getBatchAgeDays(batch.stage_since));
  const { gramPerHead, pricePerKg } = getCurrentStageRate(batch);

  const accumulatedFeedCost = calcAccumulatedFeedCost(batch);
  const dailyFeedCost = gramPerHead * pricePerKg * batch.quantity / 1000;
  const breakEvenPerHead = batch.quantity > 0 ? accumulatedFeedCost / batch.quantity : 0;

  const { price: estimatedSellPrice, source: priceSource } = resolveSellPrice(
    batch.stage as ChickenStage,
    sellOverrides,
    historicalAvg
  );

  const estimatedRevenue = batch.quantity * estimatedSellPrice;
  const estimatedProfit = estimatedRevenue - accumulatedFeedCost;
  const profitMarginPct = estimatedRevenue > 0 ? (estimatedProfit / estimatedRevenue) * 100 : 0;

  let priority: BatchStrategy["priority"];
  let recommendation: string;

  if (batch.stage === "afkir") {
    priority = "jual";
    recommendation = "Fase afkir — jual segera, tiap hari biaya pakan terus bertambah tanpa tambahan nilai";
  } else if (batch.stage === "layer" && ageDays > 400) {
    priority = "jual";
    recommendation = "Layer >400 hari — produksi telur mulai menurun, pertimbangkan jual sebagai afkir";
  } else if (batch.stage === "starter" && ageDays >= 28) {
    priority = "transisi";
    recommendation = "Siap naik ke Grower — transisi dulu agar nilai jual lebih tinggi";
  } else if (batch.stage === "grower" && ageDays >= 84) {
    priority = "transisi";
    recommendation = "Siap naik ke Layer — transisi dulu untuk maksimalkan potensi produksi";
  } else if (batch.stage === "indukan") {
    priority = "pertahankan";
    recommendation = "Indukan aktif — pertahankan untuk produksi telur tetas selama masih produktif";
  } else {
    const daysLeft = batch.stage === "starter" ? 28 - ageDays
      : batch.stage === "grower" ? 84 - ageDays
      : null;
    priority = "tunggu";
    recommendation = daysLeft !== null
      ? `Masih ${daysLeft} hari ke fase berikutnya — tunggu untuk nilai jual yang lebih tinggi`
      : "Pantau perkembangan sebelum memutuskan waktu jual";
  }

  return {
    batchId: batch.id,
    batchCode: batch.batch_code,
    stage: batch.stage as ChickenStage,
    quantity: batch.quantity,
    ageDays,
    currentStageDays,
    accumulatedFeedCost,
    dailyFeedCost,
    breakEvenPerHead,
    estimatedSellPrice,
    priceSource,
    estimatedRevenue,
    estimatedProfit,
    profitMarginPct,
    priority,
    recommendation,
  };
}

export function calcPortfolioSummary(strategies: BatchStrategy[]): PortfolioSummary {
  const totalQuantity = strategies.reduce((s, b) => s + b.quantity, 0);
  const totalAccumulatedCost = strategies.reduce((s, b) => s + b.accumulatedFeedCost, 0);
  const totalEstimatedRevenue = strategies.reduce((s, b) => s + b.estimatedRevenue, 0);
  const totalEstimatedProfit = totalEstimatedRevenue - totalAccumulatedCost;
  const avgProfitMarginPct = totalEstimatedRevenue > 0
    ? (totalEstimatedProfit / totalEstimatedRevenue) * 100
    : 0;
  const urgentCount = strategies.filter(b => b.priority === "jual").length;

  return { totalQuantity, totalAccumulatedCost, totalEstimatedRevenue, totalEstimatedProfit, avgProfitMarginPct, urgentCount };
}
