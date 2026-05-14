"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addVaccination } from "@/lib/actions/vaccinations";
import { VACC_STEPS, calcVaccDate, getNextStep } from "@/lib/vaccination-schedule";
import { Plus, Sparkles } from "lucide-react";

interface Batch {
  id: string;
  batch_code: string;
  stage: string;
  quantity: number;
  breeder_gender?: string | null;
  hatch_date?: string | null;
}

export function VaccinationForm({ batches = [] }: { batches?: Batch[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [batchId, setBatchId] = useState("");
  const [selectedStep, setSelectedStep] = useState("");   // "1".."6" atau "" = custom
  const [vaccineType, setVaccineType] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [dosage, setDosage] = useState("");

  const selectedBatch = batches.find(b => b.id === batchId);
  const stepObj = VACC_STEPS.find(s => String(s.step) === selectedStep);
  const nextStepObj = stepObj ? getNextStep(stepObj) : null;

  // Auto-fill dari step + batch hatch_date
  useEffect(() => {
    if (!stepObj) return;
    setVaccineType(stepObj.vaccine);
    if (selectedBatch?.hatch_date && nextStepObj) {
      setNextDueDate(calcVaccDate(selectedBatch.hatch_date, nextStepObj.ageDays));
    } else {
      setNextDueDate("");
    }
  }, [selectedStep, batchId]);

  function handleReset() {
    setBatchId("");
    setSelectedStep("");
    setVaccineType("");
    setNextDueDate("");
    setDosage("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("vaccine_type", vaccineType);
    if (batchId && batchId !== "none") fd.set("batch_id", batchId);
    else fd.delete("batch_id");
    if (nextDueDate) fd.set("next_due_date", nextDueDate);
    if (dosage) fd.set("dosage", dosage);
    const result = await addVaccination(fd);
    setLoading(false);
    if (result.success) { setOpen(false); handleReset(); }
    else setError(result.error || "Gagal");
  }

  // Preview tanggal vaksin ini (untuk referensi)
  const thisStepDate = selectedBatch?.hatch_date && stepObj
    ? calcVaccDate(selectedBatch.hatch_date, stepObj.ageDays)
    : null;

  return (
    <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) handleReset(); }}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" />Catat Vaksinasi</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Catat Vaksinasi</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Batch */}
          <div className="space-y-1.5">
            <Label>Batch Ayam (opsional)</Label>
            <Select value={batchId} onValueChange={v => { setBatchId(v === "none" ? "" : v); setSelectedStep(""); }}>
              <SelectTrigger><SelectValue placeholder="Pilih batch..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Tanpa batch spesifik —</SelectItem>
                {batches.map(b => {
                  const sl = b.stage === "indukan" && b.breeder_gender ? `indukan ${b.breeder_gender}` : b.stage;
                  return (
                    <SelectItem key={b.id} value={b.id}>
                      {b.batch_code}
                      <span className="text-muted-foreground ml-2 text-xs">({sl} · {b.quantity} ekor)</span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Step selector (muncul kalau batch dipilih dan punya hatch_date) */}
          {selectedBatch?.hatch_date && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Pilih Tahap Vaksinasi KUB
              </div>
              <Select value={selectedStep} onValueChange={setSelectedStep}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Pilih tahap..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">— Vaksin kustom / manual —</SelectItem>
                  <SelectSeparator />
                  {VACC_STEPS.map(s => (
                    <SelectItem key={s.step} value={String(s.step)}>
                      <span className="font-medium">Tahap {s.step}</span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        {s.vaccine} · {s.ageLabel}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Info tahap yang dipilih */}
              {stepObj && (
                <div className="text-xs space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Cara pemberian</span>
                    <span className="font-medium text-foreground">{stepObj.method}</span>
                  </div>
                  {thisStepDate && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Estimasi tgl vaksin ini</span>
                      <span className="font-medium text-foreground">{thisStepDate}</span>
                    </div>
                  )}
                  {nextStepObj ? (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Jadwal berikutnya</span>
                      <span className="font-medium text-green-600">
                        {nextStepObj.vaccine}
                        {selectedBatch?.hatch_date && ` · ${nextDueDate}`}
                      </span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">Tahap terakhir — tidak ada jadwal berikutnya</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Jenis Vaksin */}
          <div className="space-y-1.5">
            <Label htmlFor="vf-vaccine">Jenis Vaksin</Label>
            <Input
              id="vf-vaccine"
              placeholder="ND, AI, Gumboro, IBD..."
              value={vaccineType}
              onChange={e => setVaccineType(e.target.value)}
              required
            />
          </div>

          {/* Tanggal + Jumlah */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="vf-date">Tanggal Vaksin</Label>
              <Input id="vf-date" name="date" type="date"
                defaultValue={new Date().toISOString().split("T")[0]} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vf-qty">Jumlah Ayam</Label>
              <Input id="vf-qty" name="quantity" type="number" min="1" required />
            </div>
          </div>

          {/* Dosis + Jadwal Berikutnya */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="vf-dosage">Dosis (opsional)</Label>
              <Input id="vf-dosage" placeholder="1 mL/ekor"
                value={dosage} onChange={e => setDosage(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vf-next">Jadwal Berikutnya</Label>
              <Input id="vf-next" type="date"
                value={nextDueDate} onChange={e => setNextDueDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vf-notes">Catatan (opsional)</Label>
            <Textarea id="vf-notes" name="notes" rows={2} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={loading || !vaccineType}>
              {loading ? "..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
