"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { updateVaccination } from "@/lib/actions/vaccinations";

interface Batch { id: string; batch_code: string; stage: string; quantity: number; breeder_gender?: string | null; hatch_date?: string | null; }
interface Vaccination {
  id: string;
  vaccine_type: string;
  date: string;
  quantity: number;
  batch_id: string | null;
  dosage: string | null;
  notes: string | null;
  next_due_date: string | null;
}

export function EditVaccinationButton({
  vaccination,
  batches = [],
}: {
  vaccination: Vaccination;
  batches?: Batch[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [batchId, setBatchId] = useState(vaccination.batch_id ?? "none");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    if (batchId && batchId !== "none") fd.set("batch_id", batchId);
    else fd.delete("batch_id");
    const result = await updateVaccination(vaccination.id, fd);
    setLoading(false);
    if (result.success) setOpen(false);
    else setError(result.error || "Gagal");
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Vaksinasi</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ev-vaccine_type">Jenis Vaksin</Label>
              <Input
                id="ev-vaccine_type"
                name="vaccine_type"
                defaultValue={vaccination.vaccine_type}
                placeholder="ND, AI, Gumboro, IBD..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Batch Ayam (opsional)</Label>
              <Select value={batchId} onValueChange={setBatchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih batch..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Tanpa batch spesifik —</SelectItem>
                  {batches.map(b => {
                    const stageLabel = b.stage === "indukan" && b.breeder_gender
                      ? `indukan ${b.breeder_gender}`
                      : b.stage;
                    return (
                      <SelectItem key={b.id} value={b.id}>
                        {b.batch_code}
                        <span className="text-muted-foreground ml-2 text-xs">
                          ({stageLabel} · {b.quantity} ekor)
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ev-date">Tanggal Vaksin</Label>
                <Input id="ev-date" name="date" type="date" defaultValue={vaccination.date} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-quantity">Jumlah Ayam</Label>
                <Input id="ev-quantity" name="quantity" type="number" min="1" defaultValue={vaccination.quantity} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ev-dosage">Dosis (opsional)</Label>
                <Input id="ev-dosage" name="dosage" defaultValue={vaccination.dosage ?? ""} placeholder="1 mL/ekor" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-next_due_date">Jadwal Berikutnya</Label>
                <Input id="ev-next_due_date" name="next_due_date" type="date" defaultValue={vaccination.next_due_date ?? ""} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ev-notes">Catatan (opsional)</Label>
              <Textarea id="ev-notes" name="notes" rows={2} defaultValue={vaccination.notes ?? ""} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={loading}>{loading ? "..." : "Simpan"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
