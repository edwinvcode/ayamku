"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatDateShort } from "@/lib/utils";

interface HatchRateChartProps {
  eggs: { date_received: string; quantity: number; hatched_count: number | null; status: string }[];
}

export function HatchRateChart({ eggs }: HatchRateChartProps) {
  const data = eggs
    .filter(e => e.status === "hatched" && e.hatched_count !== null)
    .map(e => ({
      date: formatDateShort(e.date_received),
      rate: Math.round((e.hatched_count! / e.quantity) * 100),
    }));

  if (data.length === 0) {
    return <p className="text-center text-muted-foreground py-8">Belum ada data penetasan.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => `${v}%`} />
        <Line type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="Hatch Rate" />
      </LineChart>
    </ResponsiveContainer>
  );
}
