import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { DateFilter } from "@/components/finances/date-filter";
import { DeleteSaleButton } from "@/components/finances/delete-sale-button";
import Link from "next/link";
import { Bird, Egg, Info } from "lucide-react";

const saleTypeLabel: Record<string, { label: string; icon: React.ReactNode; badge: string }> = {
  egg:     { label: "Telur", icon: <Egg className="h-3.5 w-3.5" />,  badge: "bg-yellow-100 text-yellow-800" },
  chicken: { label: "Ayam",  icon: <Bird className="h-3.5 w-3.5" />, badge: "bg-orange-100 text-orange-800" },
};

function getSaleType(type: string) {
  return saleTypeLabel[type] ?? { label: type, icon: null, badge: "bg-gray-100 text-gray-800" };
}

function getDateRange(month?: string, year?: string) {
  const y = year  ? parseInt(year)  : null;
  const m = month ? parseInt(month) : null;
  if (y && m) {
    const from = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const to = `${y}-${String(m).padStart(2, "0")}-${lastDay}`;
    return { from, to };
  }
  if (y) return { from: `${y}-01-01`, to: `${y}-12-31` };
  return { from: null, to: null };
}

function calcRevenue(r: { total_revenue?: number | null; quantity?: number; price_per_unit?: number }) {
  return Number(r.total_revenue) || (Number(r.quantity) * Number(r.price_per_unit));
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  const supabase = createClient();
  const { month, year } = searchParams;
  const { from, to } = getDateRange(month, year);

  let query = supabase.from("sales").select("*").order("date", { ascending: false }).limit(200);
  if (from) query = query.gte("date", from);
  if (to)   query = query.lte("date", to);

  const { data: sales } = await query;
  const list = sales || [];

  const totalRevenue  = list.reduce((s, r) => s + calcRevenue(r), 0);
  const totalEgg      = list.filter(s => s.sale_type === "egg").reduce((s, r) => s + calcRevenue(r), 0);
  const totalChicken  = list.filter(s => s.sale_type === "chicken").reduce((s, r) => s + calcRevenue(r), 0);

  const filterLabel = month && year
    ? `${["","Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"][parseInt(month)]} ${year}`
    : year ? year : "Semua";

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40 px-4 py-3">
        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-700 dark:text-blue-300 flex-1">
          Halaman ini hanya menampilkan riwayat penjualan. Untuk mencatat penjualan baru:
          <span className="flex gap-2 mt-2">
            <Button asChild size="sm" variant="outline" className="h-7 text-xs border-blue-300 dark:border-blue-700">
              <Link href="/eggs"><Egg className="h-3 w-3 mr-1" />Jual Telur</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="h-7 text-xs border-blue-300 dark:border-blue-700">
              <Link href="/chickens"><Bird className="h-3 w-3 mr-1" />Jual Ayam</Link>
            </Button>
          </span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Penjualan</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{filterLabel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Egg className="h-3 w-3" /> Telur</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(totalEgg)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Bird className="h-3 w-3" /> Ayam</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(totalChicken)}</p>
          </CardContent>
        </Card>
      </div>

      {/* History table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base">Riwayat Penjualan</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {filterLabel}
                {list.length > 0 && <span className="ml-2">({list.length} transaksi)</span>}
              </p>
            </div>
            <Suspense>
              <DateFilter />
            </Suspense>
          </div>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Belum ada data penjualan.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Harga Satuan</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map(sale => {
                  const type = getSaleType(sale.sale_type);
                  return (
                    <TableRow key={sale.id}>
                      <TableCell className="whitespace-nowrap">{formatDateShort(sale.date)}</TableCell>
                      <TableCell>
                        <Badge className={`${type.badge} flex items-center gap-1 w-fit`}>
                          {type.icon}{type.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sale.quantity} {sale.sale_type === "egg" ? "butir" : "ekor"}
                      </TableCell>
                      <TableCell>{formatCurrency(Number(sale.price_per_unit))}</TableCell>
                      <TableCell className="text-muted-foreground text-xs max-w-[160px] truncate">
                        {sale.notes || "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600 whitespace-nowrap">
                        {formatCurrency(calcRevenue(sale))}
                      </TableCell>
                      <TableCell>
                        <DeleteSaleButton id={sale.id} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
