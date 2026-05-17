import { ChickenBatch } from "@/types/database";
import { calcFeedNeeds, formatKg, formatRupiah, FeedRateOverrides } from "@/lib/feed-estimate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wheat } from "lucide-react";

export function FeedEstimateCard({ batches, overrides }: { batches: ChickenBatch[]; overrides?: FeedRateOverrides }) {
  const estimate = calcFeedNeeds(batches, overrides);
  const totalHeads = batches.reduce((s, b) => s + b.quantity, 0);

  if (estimate.totalDailyKg === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Wheat className="h-4 w-4 text-amber-500" />
            Estimasi Kebutuhan Pakan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-4 text-center">Belum ada ayam aktif untuk dihitung.</p>
        </CardContent>
      </Card>
    );
  }

  const transitionWarnings = estimate.rows.filter(
    r => r.daysUntilTransition !== null && r.daysUntilTransition <= 7
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Wheat className="h-4 w-4 text-amber-500" />
          Estimasi Kebutuhan Pakan
          <span className="text-sm font-normal text-muted-foreground">· {totalHeads} ekor aktif</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Summary boxes — kg */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Kebutuhan Pakan</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Hari Ini</p>
              <p className="text-lg font-bold">{formatKg(estimate.totalDailyKg)}</p>
              <p className="text-xs text-muted-foreground">
                {estimate.totalDailyKarung > 0 ? `≈${estimate.totalDailyKarung} karung` : "< 1 karung"}
              </p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Minggu Ini</p>
              <p className="text-lg font-bold">{formatKg(estimate.totalWeeklyKg)}</p>
              <p className="text-xs text-muted-foreground">≈{estimate.totalWeeklyKarung} karung</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Bulan Ini</p>
              <p className="text-lg font-bold">{formatKg(estimate.totalMonthlyKg)}</p>
              <p className="text-xs text-muted-foreground">≈{estimate.totalMonthlyKarung} karung</p>
            </div>
          </div>
        </div>

        {/* Summary boxes — cost */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Estimasi Biaya Pakan</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Hari Ini</p>
              <p className="text-base font-bold text-amber-700 dark:text-amber-400">{formatRupiah(estimate.totalDailyCost)}</p>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Minggu Ini</p>
              <p className="text-base font-bold text-amber-700 dark:text-amber-400">{formatRupiah(estimate.totalWeeklyCost)}</p>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Bulan Ini</p>
              <p className="text-base font-bold text-amber-700 dark:text-amber-400">{formatRupiah(estimate.totalMonthlyCost)}</p>
            </div>
          </div>
        </div>

        {/* Breakdown table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fase</TableHead>
                <TableHead>Merek Pakan</TableHead>
                <TableHead className="text-right">Ekor</TableHead>
                <TableHead className="text-right">g/ekor/hari</TableHead>
                <TableHead className="text-right">Rp/kg</TableHead>
                <TableHead className="text-right">kg/hari</TableHead>
                <TableHead className="text-right">Biaya/hari</TableHead>
                <TableHead className="text-right">Biaya/bulan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimate.rows.map(row => (
                <TableRow key={row.key}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.brand}</TableCell>
                  <TableCell className="text-right">{row.quantity}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{row.gramPerHead}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{row.pricePerKg.toLocaleString("id-ID")}</TableCell>
                  <TableCell className="text-right">{formatKg(row.dailyKg)}</TableCell>
                  <TableCell className="text-right">{formatRupiah(row.dailyCost)}</TableCell>
                  <TableCell className="text-right">{formatRupiah(row.monthlyCost)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold border-t-2">
                <TableCell>Total</TableCell>
                <TableCell />
                <TableCell className="text-right">{totalHeads}</TableCell>
                <TableCell />
                <TableCell />
                <TableCell className="text-right">{formatKg(estimate.totalDailyKg)}</TableCell>
                <TableCell className="text-right">{formatRupiah(estimate.totalDailyCost)}</TableCell>
                <TableCell className="text-right">{formatRupiah(estimate.totalMonthlyCost)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Transition warnings */}
        {transitionWarnings.length > 0 && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-3 space-y-1">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Persiapan Transisi Fase:</p>
            {transitionWarnings.map(row => (
              <p key={row.key} className="text-xs text-amber-700/80 dark:text-amber-400/80">
                {row.daysUntilTransition === 0
                  ? `${row.label} siap pindah ke ${row.nextStageName} sekarang — mulai siapkan pakan ${row.nextStageName}`
                  : `${row.label} pindah ke ${row.nextStageName} dalam ≤${row.daysUntilTransition} hari — mulai siapkan pakan ${row.nextStageName}`
                }
              </p>
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  );
}
