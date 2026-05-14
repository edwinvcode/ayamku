import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EggStatusBadge } from "@/components/eggs/egg-status-badge";
import { formatDate } from "@/lib/utils";
import { StartIncubationForm } from "@/components/eggs/start-incubation-form";
import { RecordHatchForm } from "@/components/eggs/record-hatch-form";
import { markEggsFailed, deleteEggBatch } from "@/lib/actions/eggs";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EggDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: egg } = await supabase
    .from("eggs")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!egg) notFound();

  return (
    <div className="space-y-4 max-w-2xl">
      <Link href="/eggs">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      </Link>

      {/* Info Batch */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detail Batch Telur</CardTitle>
            <EggStatusBadge status={egg.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Tanggal Terima</p>
              <p className="font-medium">{formatDate(egg.date_received)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Jumlah</p>
              <p className="font-medium">{egg.quantity} butir</p>
            </div>
            {egg.source_notes && (
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs mb-0.5">Sumber</p>
                <p className="font-medium">{egg.source_notes}</p>
              </div>
            )}
            {egg.incubation_start && (
              <>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Mulai Inkubasi</p>
                  <p className="font-medium">{formatDate(egg.incubation_start)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Estimasi Netas</p>
                  <p className="font-medium">{formatDate(egg.expected_hatch_date)}</p>
                </div>
              </>
            )}
            {egg.hatch_date && (
              <>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Tanggal Netas</p>
                  <p className="font-medium">{formatDate(egg.hatch_date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Hasil</p>
                  <p className="font-medium">
                    <span className="text-green-400">{egg.hatched_count} netas</span>
                    {egg.failed_count && egg.failed_count > 0 && (
                      <span className="text-red-400 ml-2">· {egg.failed_count} gagal</span>
                    )}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Aksi: Stok */}
      {egg.status === "stock" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mulai Inkubasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StartIncubationForm eggId={egg.id} maxQuantity={egg.quantity} />
            <div className="pt-2 border-t">
              <ConfirmDeleteButton
                onConfirm={deleteEggBatch.bind(null, egg.id)}
                title="Hapus batch telur ini?"
                description="Semua data batch ini akan dihapus permanen."
                trigger="Hapus Batch Ini"
                triggerClassName="text-destructive border border-destructive/40 hover:bg-destructive/10 hover:border-destructive h-8 px-3 text-sm rounded-md"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aksi: Inkubasi */}
      {egg.status === "incubating" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Catat Hasil Penetasan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RecordHatchForm eggId={egg.id} maxQuantity={egg.quantity} />
            <div className="pt-2 border-t">
              <form action={async () => { await markEggsFailed(egg.id); }}>
                <Button type="submit" variant="outline" size="sm"
                  className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:border-destructive">
                  Tandai Semua Gagal
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
