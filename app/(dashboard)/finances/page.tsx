import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MonthlyChart } from "@/components/finances/monthly-chart";
import { DateFilter } from "@/components/finances/date-filter";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart } from "lucide-react";

function getDateRange(month?: string, year?: string) {
  const now = new Date();
  const y = year  ? parseInt(year)  : now.getFullYear();
  const m = month ? parseInt(month) : now.getMonth() + 1;

  if (month && year) {
    const from = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const to = `${y}-${String(m).padStart(2, "0")}-${lastDay}`;
    return { from, to };
  }
  if (year && !month) return { from: `${y}-01-01`, to: `${y}-12-31` };
  // default: bulan ini
  const from = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  return { from, to: `${y}-${String(m).padStart(2, "0")}-${lastDay}` };
}

const MONTH_NAMES = ["","Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"];

function calcRevenue(r: { total_revenue?: number | null; quantity?: number; price_per_unit?: number }) {
  return Number(r.total_revenue) || (Number(r.quantity) * Number(r.price_per_unit));
}

export default async function FinancesPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  const supabase = createClient();
  const { month, year } = searchParams;
  const { from, to } = getDateRange(month, year);
  const now = new Date();

  // Chart: 6 months ending at the selected period
  const chartY = year  ? parseInt(year)  : now.getFullYear();
  const chartM = month ? parseInt(month) : now.getMonth() + 1;
  const chartEnd   = new Date(chartY, chartM, 0);       // last day of selected month
  const chartStart = new Date(chartY, chartM - 6, 1);   // 6 months prior (works across year boundary)
  const chartFrom = `${chartStart.getFullYear()}-${String(chartStart.getMonth() + 1).padStart(2, "0")}-01`;
  const chartTo   = `${chartEnd.getFullYear()}-${String(chartEnd.getMonth() + 1).padStart(2, "0")}-${String(chartEnd.getDate()).padStart(2, "0")}`;

  const [expenses, sales, allExpenses, allSales] = await Promise.all([
    supabase.from("expenses").select("amount, category").gte("date", from).lte("date", to),
    supabase.from("sales").select("total_revenue, quantity, price_per_unit").gte("date", from).lte("date", to),
    supabase.from("expenses").select("date, amount").gte("date", chartFrom).lte("date", chartTo).order("date", { ascending: true }),
    supabase.from("sales").select("date, total_revenue, quantity, price_per_unit").gte("date", chartFrom).lte("date", chartTo).order("date", { ascending: true }),
  ]);

  const totalExpense = (expenses.data || []).reduce((s, e) => s + Number(e.amount), 0);
  const feedExpense  = (expenses.data || []).filter(e => e.category === "feed").reduce((s, e) => s + Number(e.amount), 0);
  const opExpense    = totalExpense - feedExpense;
  const totalRevenue = (sales.data || []).reduce((s, r) => s + calcRevenue(r), 0);
  const profit       = totalRevenue - totalExpense;

  const periodLabel = month && year
    ? `${MONTH_NAMES[parseInt(month)]} ${year}`
    : year
    ? year
    : `${MONTH_NAMES[now.getMonth() + 1]} ${now.getFullYear()}`;

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Periode: <strong>{periodLabel}</strong></p>
        <Suspense>
          <DateFilter />
        </Suspense>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="h-4 w-4 text-red-500" />
              <p className="text-sm text-muted-foreground">Pengeluaran</p>
            </div>
            <p className="text-xl font-bold">{formatCurrency(totalExpense)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Pakan: {formatCurrency(feedExpense)} | Ops: {formatCurrency(opExpense)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">Pemasukan</p>
            </div>
            <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card className={profit >= 0 ? "border-green-300" : "border-red-300"}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              {profit >= 0
                ? <TrendingUp className="h-4 w-4 text-green-500" />
                : <TrendingDown className="h-4 w-4 text-red-500" />}
              <p className="text-sm text-muted-foreground">Profit</p>
            </div>
            <p className={`text-xl font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(profit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Margin</p>
            <p className="text-xl font-bold">
              {totalRevenue > 0 ? Math.round((profit / totalRevenue) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link href="/finances/expenses">+ Catat Pengeluaran</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/finances/sales">+ Catat Penjualan</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tren Pengeluaran vs Pemasukan (6 bulan)</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyChart
            expenses={allExpenses.data || []}
            sales={(allSales.data || []).map(r => ({ date: r.date, total_revenue: calcRevenue(r) }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
