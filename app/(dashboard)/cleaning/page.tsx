import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";
import { CleaningForm } from "@/components/cleaning/cleaning-form";
import { MarkDoneButton } from "@/components/cleaning/mark-done-button";
import { DeleteCleaningLogButton } from "@/components/cleaning/delete-cleaning-log-button";

export default async function CleaningPage() {
  const supabase = createAdminClient();
  const { data: logs } = await supabase
    .from("cleaning_logs")
    .select("*")
    .order("scheduled_date", { ascending: false });

  const pendingCount = (logs || []).filter(l => l.status === "pending").length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Jadwal Kebersihan Kandang</CardTitle>
            {pendingCount > 0 && (
              <p className="text-sm text-yellow-600 mt-1">{pendingCount} jadwal belum selesai</p>
            )}
          </div>
          <CleaningForm />
        </CardHeader>
        <CardContent>
          {(logs || []).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Belum ada jadwal kebersihan.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kandang</TableHead>
                  <TableHead>Jadwal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Selesai</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(logs || []).map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.cage_area || "Semua kandang"}</TableCell>
                    <TableCell>{formatDateShort(log.scheduled_date)}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === "done" ? "success" : "warning"}>
                        {log.status === "done" ? "Selesai" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.completed_date ? formatDateShort(log.completed_date) : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{log.notes || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {log.status === "pending" && (
                          <MarkDoneButton id={log.id} cageArea={log.cage_area} />
                        )}
                        <DeleteCleaningLogButton id={log.id} />
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
