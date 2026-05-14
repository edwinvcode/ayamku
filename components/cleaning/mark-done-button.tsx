"use client";

import { useState } from "react";
import { CheckCircle2, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { markCleaningDoneAndSchedule } from "@/lib/actions/cleaning";

export function MarkDoneButton({
  id,
  cageArea,
}: {
  id: string;
  cageArea: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scheduleNext, setScheduleNext] = useState(true);
  const [nextDate, setNextDate] = useState("");
  const [nextNotes, setNextNotes] = useState("");

  async function handleConfirm() {
    setLoading(true);
    setError("");
    const result = await markCleaningDoneAndSchedule(
      id,
      scheduleNext && nextDate ? nextDate : null,
      cageArea,
      nextNotes || null,
    );
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setNextDate("");
      setNextNotes("");
    } else {
      setError(result.error || "Gagal");
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs"
        onClick={() => setOpen(true)}
      >
        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
        Selesai
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tandai Selesai</DialogTitle>
            <DialogDescription>
              {cageArea ? `Kandang: ${cageArea}` : "Semua kandang"} · Selesai hari ini
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Toggle jadwal berikutnya */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="schedule-next"
                checked={scheduleNext}
                onChange={e => setScheduleNext(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <Label htmlFor="schedule-next" className="cursor-pointer flex items-center gap-1.5">
                <CalendarPlus className="h-3.5 w-3.5" />
                Buat jadwal berikutnya
              </Label>
            </div>

            {scheduleNext && (
              <div className="space-y-3 pl-6 border-l-2 border-muted">
                <div className="space-y-1.5">
                  <Label htmlFor="next-date">Tanggal Jadwal Berikutnya</Label>
                  <Input
                    id="next-date"
                    type="date"
                    value={nextDate}
                    onChange={e => setNextDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="next-notes">Catatan (opsional)</Label>
                  <Input
                    id="next-notes"
                    placeholder="Misal: pakai desinfektan..."
                    value={nextNotes}
                    onChange={e => setNextNotes(e.target.value)}
                  />
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Batal
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={loading || (scheduleNext && !nextDate)}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
