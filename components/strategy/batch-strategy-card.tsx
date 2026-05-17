import { BatchStrategy } from "@/lib/strategy";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/feed-estimate";
import { getStageName, getStageColor } from "@/lib/lifecycle";
import { cn } from "@/lib/utils";

const PRIORITY_CONFIG = {
  jual: {
    label: "Jual Sekarang",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50",
  },
  transisi: {
    label: "Transisi Dulu",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50",
  },
  tunggu: {
    label: "Tunggu",
    className: "bg-muted text-muted-foreground border border-border",
  },
  pertahankan: {
    label: "Pertahankan",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50",
  },
};

export function BatchStrategyCard({ strategy }: { strategy: BatchStrategy }) {
  const config = PRIORITY_CONFIG[strategy.priority];
  const isProfit = strategy.estimatedProfit >= 0;
  const margin = strategy.estimatedSellPrice - strategy.breakEvenPerHead;
  const pct = strategy.estimatedSellPrice > 0
    ? Math.min(100, Math.round((strategy.breakEvenPerHead / strategy.estimatedSellPrice) * 100))
    : 100;

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-semibold">{strategy.batchCode}</span>
            <Badge className={getStageColor(strategy.stage)}>
              {getStageName(strategy.stage)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {strategy.quantity} ekor · {strategy.ageDays} hari
            </span>
          </div>
          <span className={cn("inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold", config.className)}>
            {config.label}
          </span>
        </div>

        {/* Metric boxes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Biaya Pakan</p>
            <p className="font-semibold text-sm">{formatRupiah(strategy.accumulatedFeedCost)}</p>
            <p className="text-xs text-muted-foreground">+{formatRupiah(strategy.dailyFeedCost)}/hari</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Break-even</p>
            <p className="font-semibold text-sm">{formatRupiah(strategy.breakEvenPerHead)}</p>
            <p className="text-xs text-muted-foreground">per ekor</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Harga Jual Est.</p>
            <p className="font-semibold text-sm">
              {strategy.estimatedSellPrice > 0 ? formatRupiah(strategy.estimatedSellPrice) : "—"}
            </p>
            <p className="text-xs text-muted-foreground">per ekor</p>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            isProfit ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
          )}>
            <p className="text-xs text-muted-foreground mb-0.5">Estimasi Profit</p>
            <p className={cn("font-semibold text-sm", isProfit ? "text-green-600 dark:text-green-400" : "text-red-500")}>
              {formatRupiah(strategy.estimatedProfit)}
            </p>
            <p className="text-xs text-muted-foreground">
              {isProfit ? "+" : ""}{strategy.profitMarginPct.toFixed(1)}% margin
            </p>
          </div>
        </div>

        {/* Break-even vs sell price bar */}
        {strategy.estimatedSellPrice > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Modal: {formatRupiah(strategy.breakEvenPerHead)}/ekor</span>
              <span className={isProfit ? "text-green-600 dark:text-green-400 font-medium" : "text-red-500 font-medium"}>
                {isProfit
                  ? `+${formatRupiah(margin)}/ekor keuntungan`
                  : `Rugi ${formatRupiah(Math.abs(margin))}/ekor`}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", isProfit ? "bg-green-500" : "bg-red-400")}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground/60">
              <span>Rp 0</span>
              <span>{formatRupiah(strategy.estimatedSellPrice)}</span>
            </div>
          </div>
        )}

        {/* Recommendation + price source */}
        <div className="flex items-start justify-between gap-3 pt-1 border-t flex-wrap">
          <p className="text-xs text-muted-foreground">{strategy.recommendation}</p>
          <p className="text-xs text-muted-foreground/50 shrink-0">
            {strategy.priceSource === "kustom" ? "* Harga jual kustom"
              : strategy.priceSource === "penjualan" ? "* Rata-rata penjualanmu"
              : "* Referensi pasar KUB"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
