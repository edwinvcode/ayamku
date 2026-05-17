import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { ExpenseForm } from "@/components/finances/expense-form";
import { DateFilter } from "@/components/finances/date-filter";
import { DeleteExpenseButton } from "@/components/finances/delete-expense-button";

function getDateRange(month?: string, year?: string) {
  const now = new Date();
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

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  const supabase = createClient();
  const { month, year } = searchParams;
  const { from, to } = getDateRange(month, year);

  let query = supabase.from("expenses").select("*").order("date", { ascending: false }).limit(200);
  if (from) query = query.gte("date", from);
  if (to)   query = query.lte("date", to);

  const [{ data: expenses }, { data: customCategories }] = await Promise.all([
    query,
    supabase.from("expense_categories").select("id, name, color").order("created_at", { ascending: true }),
  ]);
  const list = expenses || [];
  const total = list.reduce((s, e) => s + Number(e.amount), 0);
  const customCatMap = Object.fromEntries((customCategories || []).map(c => [c.name, c]));

  const filterLabel = month && year
    ? `${["","Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"][parseInt(month)]} ${year}`
    : year ? year : "Semua";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base">Pengeluaran</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {filterLabel} — Total: <span className="font-medium text-foreground">{formatCurrency(total)}</span>
                {list.length > 0 && <span className="ml-2">({list.length} transaksi)</span>}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Suspense>
                <DateFilter />
              </Suspense>
              <ExpenseForm customCategories={customCategories || []} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Belum ada data pengeluaran.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map(expense => (
                  <TableRow key={expense.id}>
                    <TableCell className="whitespace-nowrap">{formatDateShort(expense.date)}</TableCell>
                    <TableCell>
                      {expense.category === "feed" ? (
                        <Badge variant="info">Pakan</Badge>
                      ) : expense.sub_category && customCatMap[expense.sub_category] ? (
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
                          style={{ backgroundColor: customCatMap[expense.sub_category].color }}
                        >
                          {expense.sub_category}
                        </span>
                      ) : (
                        <Badge variant="secondary">Operasional</Badge>
                      )}
                      {expense.category === "feed" && expense.sub_category && (
                        <span className="text-xs text-muted-foreground ml-2">{expense.sub_category}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {expense.description || "-"}
                      {expense.quantity_kg && ` (${expense.quantity_kg} kg)`}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(expense.amount))}
                    </TableCell>
                    <TableCell>
                      <DeleteExpenseButton id={expense.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
