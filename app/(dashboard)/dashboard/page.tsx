import { getDashboardKPIs, getDashboardAlerts } from "@/lib/queries/dashboard";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { AlertPanel } from "@/components/dashboard/alert-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Egg, Bird, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const [kpis, alerts] = await Promise.all([getDashboardKPIs(), getDashboardAlerts()]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Telur Stok"
          value={kpis.eggs_stock}
          unit="butir"
          icon={Egg}
          description={`${kpis.eggs_incubating} sedang inkubasi`}
          iconClassName="bg-yellow-50 dark:bg-yellow-400/15"
        />
        <KpiCard
          title="Kematian Bulan Ini"
          value={kpis.chickens_dead_this_month}
          unit="ekor"
          icon={Bird}
          description="Total mortalitas"
          iconClassName="bg-red-50 dark:bg-red-400/15"
          className={kpis.chickens_dead_this_month > 0 ? "border-red-200 dark:border-red-700/50" : ""}
        />
        <KpiCard
          title="Starter"
          value={kpis.chickens_starter}
          unit="ekor"
          icon={Bird}
          description="1–28 hari"
          iconClassName="bg-orange-50 dark:bg-orange-400/15"
        />
        <KpiCard
          title="Grower"
          value={kpis.chickens_grower}
          unit="ekor"
          icon={Bird}
          description="29–84 hari"
          iconClassName="bg-blue-50 dark:bg-blue-400/15"
        />
        <KpiCard
          title="Layer"
          value={kpis.chickens_layer}
          unit="ekor"
          icon={Bird}
          description="Fase siap panen"
          iconClassName="bg-purple-50 dark:bg-purple-400/15"
        />
        <KpiCard
          title="Afkir"
          value={kpis.chickens_afkir}
          unit="ekor"
          icon={Bird}
          description="Tidak produksi"
          iconClassName="bg-red-50 dark:bg-red-400/15"
        />
        <KpiCard
          title="Indukan Betina"
          value={kpis.chickens_indukan_betina}
          unit="ekor"
          icon={Bird}
          description="Stok betina"
          iconClassName="bg-pink-50 dark:bg-pink-400/15"
        />
        <KpiCard
          title="Indukan Jantan"
          value={kpis.chickens_indukan_jantan}
          unit="ekor"
          icon={Bird}
          description="Stok jantan"
          iconClassName="bg-blue-50 dark:bg-blue-400/15"
        />
        <KpiCard
          title="Pengeluaran Bulan Ini"
          value={formatCurrency(kpis.total_expense_this_month)}
          icon={DollarSign}
          iconClassName="bg-red-50 dark:bg-red-400/15"
        />
        <KpiCard
          title="Pemasukan Bulan Ini"
          value={formatCurrency(kpis.total_revenue_this_month)}
          icon={DollarSign}
          iconClassName="bg-green-50 dark:bg-green-400/15"
        />
        <KpiCard
          title="Profit Bulan Ini"
          value={formatCurrency(kpis.profit_this_month)}
          icon={kpis.profit_this_month >= 0 ? TrendingUp : TrendingDown}
          iconClassName={kpis.profit_this_month >= 0 ? "bg-green-50 dark:bg-green-400/15" : "bg-red-50 dark:bg-red-400/15"}
          className={kpis.profit_this_month >= 0 ? "" : "border-red-200 dark:border-red-700/50"}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Peringatan & Reminder</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertPanel alerts={alerts} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild className="flex-col h-16 gap-1">
              <Link href="/eggs">
                <Egg className="h-5 w-5" />
                <span className="text-xs">Tambah Telur</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-col h-16 gap-1">
              <Link href="/chickens">
                <Bird className="h-5 w-5" />
                <span className="text-xs">Catat Mortalitas</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-col h-16 gap-1">
              <Link href="/finances/expenses">
                <DollarSign className="h-5 w-5" />
                <span className="text-xs">Catat Biaya</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-col h-16 gap-1">
              <Link href="/finances/sales">
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs">Catat Penjualan</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
