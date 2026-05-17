import { createClient } from "@/lib/supabase/server";
import { calcBatchStrategy, calcPortfolioSummary } from "@/lib/strategy";
import { getSellSettings } from "@/lib/actions/sell-settings";
import { PortfolioSummaryCard } from "@/components/strategy/portfolio-summary-card";
import { BatchStrategyCard } from "@/components/strategy/batch-strategy-card";
import { SellPriceEditor } from "@/components/strategy/sell-price-editor";
import { TrendingUp } from "lucide-react";

const PRIORITY_ORDER = { jual: 0, transisi: 1, tunggu: 2, pertahankan: 3 };

export default async function StrategyPage() {
  const supabase = createClient();

  const [{ data: batches }, { data: sales }, sellOverrides] = await Promise.all([
    supabase.from("chicken_batches").select("*").neq("stage", "harvested").order("created_at", { ascending: false }),
    supabase.from("sales").select("price_per_unit").eq("sale_type", "chicken"),
    getSellSettings(),
  ]);

  const activeBatches = batches || [];

  const chickenSales = (sales || []).filter(s => s.price_per_unit > 0);
  const historicalAvg = chickenSales.length > 0
    ? chickenSales.reduce((s, sale) => s + sale.price_per_unit, 0) / chickenSales.length
    : null;

  const strategies = activeBatches
    .map(b => calcBatchStrategy(b, sellOverrides, historicalAvg))
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const summary = calcPortfolioSummary(strategies);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold">Strategi Profit Peternakan</h1>
      </div>

      <SellPriceEditor initialOverrides={sellOverrides} />

      <PortfolioSummaryCard summary={summary} />

      {strategies.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Belum ada batch ayam aktif.</p>
          <p className="text-sm mt-1">Tambah batch dari menu Ayam untuk melihat analisis strategi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {strategies.map(strategy => (
            <BatchStrategyCard key={strategy.batchId} strategy={strategy} />
          ))}
        </div>
      )}
    </div>
  );
}
