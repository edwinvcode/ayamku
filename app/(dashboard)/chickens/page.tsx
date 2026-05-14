import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStageName, getStageColor, getBatchAgeDays, getPhaseInfo } from "@/lib/lifecycle";
import { ChickenBatch, ChickenStage } from "@/types/database";
import { CreateBatchForm } from "@/components/chickens/create-batch-form";
import { StageTransitionModal } from "@/components/chickens/stage-transition-modal";
import { DeleteBatchButton } from "@/components/chickens/delete-batch-button";
import { SplitLayerModal } from "@/components/chickens/split-layer-modal";
import { SellChickenButton } from "@/components/chickens/sell-chicken-button";
import { SellChickenModal } from "@/components/chickens/sell-chicken-modal";
import Link from "next/link";
import { Bird } from "lucide-react";

const stageOrder: ChickenStage[] = ["starter", "grower", "layer", "afkir", "indukan", "harvested"];

export default async function ChickensPage() {
  const supabase = createClient();
  const now = new Date();
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const [{ data: batches }, { data: mortalityLogs }] = await Promise.all([
    supabase.from("chicken_batches").select("*").order("created_at", { ascending: false }),
    supabase.from("mortality_logs").select("count").gte("date", firstOfMonth),
  ]);

  const mortalityThisMonth = (mortalityLogs || []).reduce((s, m) => s + m.count, 0);

  const activeBatches = (batches || []).filter(b => b.stage !== "harvested");
  const byStage = stageOrder.reduce((acc, stage) => {
    acc[stage] = activeBatches.filter(b => b.stage === stage);
    return acc;
  }, {} as Record<ChickenStage, ChickenBatch[]>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 lg:grid-cols-7 gap-3">
        <Card className={mortalityThisMonth > 0 ? "border-red-300 dark:border-red-800/50" : ""}>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Mati Bulan Ini</p>
            <p className={`text-xl font-bold mt-1 ${mortalityThisMonth > 0 ? "text-red-500" : ""}`}>
              {mortalityThisMonth}
            </p>
          </CardContent>
        </Card>
        {(["starter", "grower", "layer", "afkir"] as ChickenStage[]).map(stage => (
          <Card key={stage}>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{getStageName(stage)}</p>
              <p className="text-xl font-bold mt-1">
                {byStage[stage].reduce((s, b) => s + b.quantity, 0)}
              </p>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Indukan Betina</p>
            <p className="text-xl font-bold mt-1">
              {byStage["indukan"].filter(b => b.breeder_gender === "betina").reduce((s, b) => s + b.quantity, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Indukan Jantan</p>
            <p className="text-xl font-bold mt-1">
              {byStage["indukan"].filter(b => b.breeder_gender === "jantan").reduce((s, b) => s + b.quantity, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <SellChickenModal batches={activeBatches.filter(b => ["afkir", "indukan", "layer"].includes(b.stage)).map(b => ({
          id: b.id,
          batch_code: b.batch_code,
          quantity: b.quantity,
          stage: b.stage,
          breeder_gender: b.breeder_gender ?? null,
        }))} />
        <CreateBatchForm />
      </div>

      <div className="space-y-4">
        {(["starter", "grower", "layer", "afkir", "indukan"] as ChickenStage[]).map(stage => {
          const stageBatches = byStage[stage];
          if (stageBatches.length === 0) return null;
          return (
            <div key={stage}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                {getStageName(stage)} ({stageBatches.length} batch)
              </h3>
              <div className="grid gap-3 lg:grid-cols-2">
                {stageBatches.map(batch => (
                  <BatchCard key={batch.id} batch={batch} />
                ))}
              </div>
            </div>
          );
        })}

        {activeBatches.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Bird className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Belum ada batch ayam aktif.</p>
            <p className="text-sm mt-1">Tambah batch manual atau hatch telur dari menu Telur.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BatchCard({ batch }: { batch: ChickenBatch }) {
  const ageDays = getBatchAgeDays(batch.hatch_date);
  const phase = getPhaseInfo(batch.stage as ChickenStage);
  const needsTransition = (batch.stage === "starter" && ageDays >= 28) || (batch.stage === "grower" && ageDays >= 84);

  let phaseProgress: React.ReactNode = null;
  if (phase.thresholdDays) {
    const pct = Math.min(100, Math.round((ageDays / phase.thresholdDays) * 100));
    const sisaHari = phase.thresholdDays - ageDays;
    phaseProgress = (
      <div className="mt-2 space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Hari ke-{ageDays} dari {phase.thresholdDays} ({phase.range})</span>
          <span className={sisaHari <= 0 ? "text-yellow-500 font-medium" : ""}>
            {sisaHari <= 0 ? `Siap → ${phase.nextStage}` : `Sisa ${sisaHari} hari ke ${phase.nextStage}`}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-yellow-400" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  } else {
    phaseProgress = (
      <p className="text-xs text-muted-foreground mt-1">
        Umur: {ageDays} hari &bull; Di fase {phase.label} sejak {getBatchAgeDays(batch.stage_since)} hari
      </p>
    );
  }

  return (
    <Card className={needsTransition ? "border-yellow-400" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-sm font-medium">{batch.batch_code}</span>
              <Badge className={getStageColor(batch.stage as ChickenStage)}>
                {batch.stage === "indukan" && batch.breeder_gender
                  ? `Indukan ${batch.breeder_gender.charAt(0).toUpperCase() + batch.breeder_gender.slice(1)}`
                  : getStageName(batch.stage as ChickenStage)}
              </Badge>
              {needsTransition && (
                <Badge variant="warning">Perlu Aksi</Badge>
              )}
            </div>
            <p className="text-2xl font-bold">{batch.quantity} ekor</p>
            {phaseProgress}
          </div>
          <div className="flex flex-col gap-1 ml-3 shrink-0">
            <Link href={`/chickens/${batch.id}`}>
              <Button variant="outline" size="sm" className="w-full">Detail</Button>
            </Link>
            {needsTransition && (
              <StageTransitionModal batchId={batch.id} batchCode={batch.batch_code} currentStage={batch.stage as ChickenStage} currentQuantity={batch.quantity} />
            )}
            {batch.stage === "layer" && (
              <StageTransitionModal batchId={batch.id} batchCode={batch.batch_code} currentStage="layer" currentQuantity={batch.quantity} />
            )}
            {batch.stage === "afkir" && (
              <SellChickenButton batchId={batch.id} batchCode={batch.batch_code} maxQuantity={batch.quantity} />
            )}
            <DeleteBatchButton batchId={batch.id} batchCode={batch.batch_code} />
          </div>
        </div>
        {batch.notes && (
          <p className="text-xs text-muted-foreground mt-2 border-t pt-2">{batch.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}
