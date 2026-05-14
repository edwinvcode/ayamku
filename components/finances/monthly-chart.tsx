"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { id } from "date-fns/locale";

interface MonthlyChartProps {
  expenses: { date: string; amount: number }[];
  sales: { date: string; total_revenue: number }[];
}

export function MonthlyChart({ expenses, sales }: MonthlyChartProps) {
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const label = format(date, "MMM yy", { locale: id });

    const totalExpense = expenses
      .filter(e => new Date(e.date) >= start && new Date(e.date) <= end)
      .reduce((s, e) => s + Number(e.amount), 0);

    const totalRevenue = sales
      .filter(s => new Date(s.date) >= start && new Date(s.date) <= end)
      .reduce((s, r) => s + Number(r.total_revenue), 0);

    return { month: label, Pengeluaran: Math.round(totalExpense / 1000), Pemasukan: Math.round(totalRevenue / 1000) };
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={months} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}k`} />
        <Tooltip formatter={(val) => `Rp ${Number(val)}k`} />
        <Legend />
        <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Pemasukan" fill="#22c55e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
