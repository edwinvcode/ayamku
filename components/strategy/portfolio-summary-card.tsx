import { PortfolioSummary } from "@/lib/strategy";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/feed-estimate";
import { AlertTriangle } from "lucide-react";

export function PortfolioSummaryCard({ summary }: { summary: PortfolioSummary }) {
  const isProfit = summary.totalEstimatedProfit >= 0;

  return (
    <div className="space-y-3">
      {summary.urgentCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">
            <span className="font-semibold">{summary.urgentCount} batch</span> siap dijual sekarang —
            menunda berarti biaya pakan harian terus bertambah.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Ekor Aktif</p>
            <p className="text-2xl font-bold">{summary.totalQuantity.toLocaleString("id-ID")}</p>
            <p className="text-xs text-muted-foreground">ekor</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Biaya Pakan s.d. Hari Ini</p>
            <p className="text-lg font-bold">{formatRupiah(summary.totalAccumulatedCost)}</p>
            <p className="text-xs text-muted-foreground">terakumulasi</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Estimasi Pendapatan</p>
            <p className="text-lg font-bold">{formatRupiah(summary.totalEstimatedRevenue)}</p>
            <p className="text-xs text-muted-foreground">jika jual semua sekarang</p>
          </CardContent>
        </Card>

        <Card className={isProfit ? "border-green-300 dark:border-green-800/50" : "border-red-300 dark:border-red-800/50"}>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Estimasi Profit Bersih</p>
            <p className={`text-lg font-bold ${isProfit ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
              {formatRupiah(summary.totalEstimatedProfit)}
            </p>
            <p className="text-xs text-muted-foreground">
              {isProfit ? "+" : ""}{summary.avgProfitMarginPct.toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground/60 text-right">
        * Kalkulasi berdasarkan biaya pakan saja. Biaya vaksin & operasional tidak termasuk.
      </p>
    </div>
  );
}
