import { ChickenBatch, ChickenStage, DashboardAlert } from "@/types/database";
import { getDaysDiff } from "./utils";

export function getBatchAgeDays(hatchDate: string): number {
  return getDaysDiff(hatchDate);
}

export function getStageSinceDays(stageSince: string): number {
  return getDaysDiff(stageSince);
}

export function getTransitionAlert(batch: ChickenBatch): DashboardAlert | null {
  const ageDays = getBatchAgeDays(batch.hatch_date as string);

  if (batch.stage === "starter" && ageDays >= 28) {
    return {
      type: "starter_ready",
      message: `Batch ${batch.batch_code}: Siap pindah ke Grower (${ageDays} hari)`,
      severity: ageDays >= 30 ? "urgent" : "warning",
      data: { batchId: batch.id, batchCode: batch.batch_code },
    };
  }

  if (batch.stage === "grower" && ageDays >= 84) {
    return {
      type: "grower_ready",
      message: `Batch ${batch.batch_code}: Siap pindah ke Layer (${ageDays} hari)`,
      severity: ageDays >= 90 ? "urgent" : "warning",
      data: { batchId: batch.id, batchCode: batch.batch_code },
    };
  }

  return null;
}

export function getStageName(stage: ChickenStage): string {
  const names: Record<ChickenStage, string> = {
    starter: "Starter",
    grower: "Grower",
    layer: "Layer",
    afkir: "Afkir",
    indukan: "Indukan",
    harvested: "Sudah Panen",
  };
  return names[stage];
}

export function getStageColor(stage: ChickenStage): string {
  const colors: Record<ChickenStage, string> = {
    starter: "bg-orange-100 text-orange-800",
    grower: "bg-blue-100 text-blue-800",
    layer: "bg-purple-100 text-purple-800",
    afkir: "bg-red-100 text-red-800",
    indukan: "bg-green-100 text-green-800",
    harvested: "bg-gray-100 text-gray-800",
  };
  return colors[stage];
}

export interface PhaseInfo {
  label: string;
  range: string;
  nextStage: string | null;
  thresholdDays: number | null;
}

export function getPhaseInfo(stage: ChickenStage): PhaseInfo {
  const map: Record<ChickenStage, PhaseInfo> = {
    starter: { label: "Starter", range: "0–28 hari", nextStage: "Grower", thresholdDays: 28 },
    grower:  { label: "Grower",  range: "29–84 hari", nextStage: "Layer", thresholdDays: 84 },
    layer:   { label: "Layer",   range: ">84 hari",   nextStage: null,    thresholdDays: null },
    afkir:   { label: "Afkir",   range: "—",          nextStage: null,    thresholdDays: null },
    indukan: { label: "Indukan", range: "—",          nextStage: null,    thresholdDays: null },
    harvested: { label: "Panen", range: "—",          nextStage: null,    thresholdDays: null },
  };
  return map[stage];
}

export function getIncubationStatus(expectedHatchDate: string | null): {
  label: string;
  daysLeft: number;
  urgent: boolean;
} {
  if (!expectedHatchDate) return { label: "Belum diinkubasi", daysLeft: 0, urgent: false };
  const daysLeft = getDaysDiff(new Date(), new Date(expectedHatchDate)) * -1;
  if (daysLeft > 0) return { label: `${daysLeft} hari lagi`, daysLeft, urgent: daysLeft <= 3 };
  if (daysLeft === 0) return { label: "Hari ini!", daysLeft: 0, urgent: true };
  return { label: `Telat ${Math.abs(daysLeft)} hari`, daysLeft, urgent: true };
}
