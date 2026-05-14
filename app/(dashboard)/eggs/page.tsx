import { createClient } from "@/lib/supabase/server";
import { EggForm } from "@/components/eggs/egg-form";
import { EggStatusBadge } from "@/components/eggs/egg-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDateShort, getDaysDiff } from "@/lib/utils";
import { Egg } from "@/types/database";
import { EggEditButton, EggDeleteButton } from "@/components/eggs/egg-row-actions";
import { SellEggForm } from "@/components/eggs/sell-egg-form";
import Link from "next/link";

export default async function EggsPage() {
  const supabase = createClient();
  const { data: eggs } = await supabase
    .from("eggs")
    .select("*")
    .order("created_at", { ascending: false });

  const stockCount = (eggs || []).filter(e => e.status === "stock").reduce((s, e) => s + e.quantity, 0);
  const incubatingCount = (eggs || []).filter(e => e.status === "incubating").reduce((s, e) => s + e.quantity, 0);
  const hatchedCount = (eggs || []).filter(e => e.status === "hatched").reduce((s, e) => s + (e.hatched_count || 0), 0);
  const totalBatches = (eggs || []).filter(e => e.status === "hatched").length;
  const successRate = totalBatches > 0
    ? Math.round((hatchedCount / (eggs || []).filter(e => e.status === "hatched").reduce((s, e) => s + e.quantity, 0)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Stok</p>
            <p className="text-2xl font-bold">{stockCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Inkubasi</p>
            <p className="text-2xl font-bold">{incubatingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Menetas</p>
            <p className="text-2xl font-bold">{hatchedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Hatch Rate</p>
            <p className="text-2xl font-bold">{successRate}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Daftar Batch Telur</CardTitle>
          <EggForm />
        </CardHeader>
        <CardContent>
          {(eggs || []).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Belum ada data telur. Klik "Tambah Telur" untuk mulai.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Info Inkubasi</TableHead>
                  <TableHead>Sumber</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(eggs as Egg[]).map((egg) => (
                  <TableRow key={egg.id}>
                    <TableCell>{formatDateShort(egg.date_received)}</TableCell>
                    <TableCell className="font-medium">{egg.quantity}</TableCell>
                    <TableCell>
                      <EggStatusBadge status={egg.status} />
                    </TableCell>
                    <TableCell>
                      {egg.status === "incubating" && egg.expected_hatch_date && (
                        <IncubationInfo
                          incubationStart={egg.incubation_start!}
                          expectedDate={egg.expected_hatch_date}
                        />
                      )}
                      {egg.status === "hatched" && (
                        <span className="text-sm text-muted-foreground">
                          {egg.hatched_count} netas, {egg.failed_count} gagal
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-32 truncate">
                      {egg.source_notes || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link href={`/eggs/${egg.id}`}>
                          <Button variant="ghost" size="sm">Detail</Button>
                        </Link>
                        {egg.status === "stock" && (
                          <SellEggForm eggId={egg.id} maxQuantity={egg.quantity} />
                        )}
                        <EggEditButton egg={egg} />
                        <EggDeleteButton id={egg.id} />
                      </div>
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

function IncubationInfo({ incubationStart, expectedDate }: { incubationStart: string; expectedDate: string }) {
  const daysSinceStart = getDaysDiff(new Date(incubationStart));
  const daysLeft = getDaysDiff(new Date(), new Date(expectedDate));
  const hatchStr = formatDateShort(expectedDate);

  if (daysLeft > 0) {
    return (
      <div className="text-sm">
        <span className="text-blue-400 font-medium">{daysLeft} hari lagi</span>
        <span className="text-muted-foreground"> · Hari ke-{daysSinceStart + 1}/21</span>
        <div className="text-xs text-muted-foreground">Netas: {hatchStr}</div>
      </div>
    );
  }
  if (daysLeft === 0) {
    return (
      <div className="text-sm">
        <span className="text-green-400 font-semibold">Siap netas hari ini!</span>
        <div className="text-xs text-muted-foreground">{hatchStr}</div>
      </div>
    );
  }
  return (
    <div className="text-sm">
      <span className="text-red-400 font-medium">Telat {Math.abs(daysLeft)} hari</span>
      <div className="text-xs text-muted-foreground">Est. netas: {hatchStr}</div>
    </div>
  );
}
