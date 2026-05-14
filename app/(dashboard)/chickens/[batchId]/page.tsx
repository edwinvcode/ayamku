import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getStageName, getStageColor, getBatchAgeDays } from "@/lib/lifecycle";
import { formatDate } from "@/lib/utils";
import { ChickenStage } from "@/types/database";
import { MortalityForm } from "@/components/chickens/mortality-form";
import { StageTransitionModal } from "@/components/chickens/stage-transition-modal";
import { DeleteBatchButton } from "@/components/chickens/delete-batch-button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function BatchDetailPage({ params }: { params: { batchId: string } }) {
  const supabase = createClient();
  const [{ data: batch }, { data: mortalityLogs }, { data: transitions }] = await Promise.all([
    supabase.from("chicken_batches").select("*").eq("id", params.batchId).single(),
    supabase.from("mortality_logs").select("*").eq("batch_id", params.batchId).order("date", { ascending: false }),
    supabase.from("lifecycle_transitions").select("*").eq("batch_id", params.batchId).order("transitioned_at", { ascending: false }),
  ]);

  if (!batch) notFound();

  const ageDays = getBatchAgeDays(batch.hatch_date);
  const totalMortality = (mortalityLogs || []).reduce((s, l) => s + l.count, 0);

  return (
    <div className="space-y-4 max-w-3xl">
      <Link href="/chickens">
        <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Kembali</Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm text-muted-foreground font-mono">{batch.batch_code}</p>
              <CardTitle className="text-2xl">{batch.quantity} ekor</CardTitle>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge className={getStageColor(batch.stage as ChickenStage)}>
                {getStageName(batch.stage as ChickenStage)}
              </Badge>
              {batch.stage !== "harvested" && (
                <StageTransitionModal
                  batchId={batch.id}
                  batchCode={batch.batch_code}
                  currentStage={batch.stage as ChickenStage}
                  currentQuantity={batch.quantity}
                />
              )}
              <DeleteBatchButton batchId={batch.id} batchCode={batch.batch_code} redirect />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Umur</p>
              <p className="font-medium">{ageDays} hari</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tanggal Netas</p>
              <p className="font-medium">{formatDate(batch.hatch_date)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Di Stage Ini</p>
              <p className="font-medium">{getBatchAgeDays(batch.stage_since)} hari</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Mortalitas</p>
              <p className="font-medium text-red-600">{totalMortality} ekor</p>
            </div>
          </div>
          {batch.notes && <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">{batch.notes}</p>}
        </CardContent>
      </Card>

      {batch.stage !== "harvested" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Catat Mortalitas</CardTitle></CardHeader>
          <CardContent>
            <MortalityForm batchId={batch.id} maxCount={batch.quantity - 1} />
          </CardContent>
        </Card>
      )}

      {(mortalityLogs || []).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Riwayat Mortalitas</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Alasan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(mortalityLogs || []).map(log => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDate(log.date)}</TableCell>
                    <TableCell className="font-medium text-red-600">{log.count} ekor</TableCell>
                    <TableCell className="text-muted-foreground">{log.reason || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {(transitions || []).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Riwayat Stage</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(transitions || []).map(t => (
                <div key={t.id} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{getStageName(t.from_stage as ChickenStage)}</Badge>
                  <span>→</span>
                  <Badge>{getStageName(t.to_stage as ChickenStage)}</Badge>
                  <span className="text-muted-foreground ml-auto">
                    {formatDate(t.transitioned_at)} · {t.triggered_by}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
