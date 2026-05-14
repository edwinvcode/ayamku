"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const ALL_MONTHS = [
  { value: "1",  label: "Januari" },
  { value: "2",  label: "Februari" },
  { value: "3",  label: "Maret" },
  { value: "4",  label: "April" },
  { value: "5",  label: "Mei" },
  { value: "6",  label: "Juni" },
  { value: "7",  label: "Juli" },
  { value: "8",  label: "Agustus" },
  { value: "9",  label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

function getYears() {
  const current = new Date().getFullYear();
  return Array.from({ length: 4 }, (_, i) => String(current - i));
}

function getAvailableMonths(selectedYear: string) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const isPastYear = selectedYear && parseInt(selectedYear) < currentYear;
  const maxMonth = isPastYear ? 12 : currentMonth;
  // descending: Dec → Jan, hanya sampai bulan saat ini
  return ALL_MONTHS.filter(m => parseInt(m.value) <= maxMonth).reverse();
}

export function DateFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const month = searchParams.get("month") ?? "";
  const year  = searchParams.get("year")  ?? "";

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  function reset() {
    router.push(pathname);
  }

  const hasFilter = month || year;

  return (
    <div className="flex items-center gap-2">
      <Select value={month} onValueChange={v => update("month", v === "all" ? "" : v)}>
        <SelectTrigger className="w-36 h-8 text-xs">
          <SelectValue placeholder="Semua Bulan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Bulan</SelectItem>
          {getAvailableMonths(year).map(m => (
            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={year} onValueChange={v => update("year", v === "all" ? "" : v)}>
        <SelectTrigger className="w-28 h-8 text-xs">
          <SelectValue placeholder="Semua Tahun" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Tahun</SelectItem>
          {getYears().map(y => (
            <SelectItem key={y} value={y}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilter && (
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={reset}>
          <X className="h-3.5 w-3.5 mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
}
