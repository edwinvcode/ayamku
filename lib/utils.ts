import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount == null) amount = 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function getDaysDiff(from: string | Date, to: string | Date = new Date()): number {
  // Date-only strings (YYYY-MM-DD) must be parsed as LOCAL midnight, not UTC midnight.
  // Without "T00:00:00", JS parses them as UTC → shifts by -7h in WIB → returns -1 on same day.
  const parseDate = (d: string | Date) =>
    typeof d === "string" && d.length === 10 ? new Date(d + "T00:00:00") : new Date(d);
  return Math.floor((parseDate(to).getTime() - parseDate(from).getTime()) / 86400000);
}

// Returns today's date as "YYYY-MM-DD" in the server's local timezone (WIB by default).
// Avoids the UTC offset bug from toISOString() which can shift the date by -1 day.
export function localDateStr(date: Date = new Date()): string {
  const tz = process.env.APP_TIMEZONE || "Asia/Jakarta";
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(date);
}

export function generateBatchCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900) + 100;
  return `BATCH-${year}${month}-${rand}`;
}
