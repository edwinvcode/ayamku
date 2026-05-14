"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createBatch } from "@/lib/actions/chickens";
import { Plus } from "lucide-react";

export function CreateBatchForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState("starter");
  const [gender, setGender] = useState("betina");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("stage", stage);
    if (stage === "indukan") fd.set("breeder_gender", gender);
    const result = await createBatch(fd);
    setLoading(false);
    if (result.success) setOpen(false);
    else setError(result.error || "Gagal");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Batch Manual
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Batch Ayam</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Stage Saat Ini</Label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="grower">Grower</SelectItem>
                <SelectItem value="layer">Layer</SelectItem>
                <SelectItem value="afkir">Afkir</SelectItem>
                <SelectItem value="indukan">Indukan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {stage === "indukan" && (
            <div className="space-y-2">
              <Label>Jenis Kelamin</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="betina">Betina</SelectItem>
                  <SelectItem value="jantan">Jantan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="quantity">Jumlah (ekor)</Label>
            <Input id="quantity" name="quantity" type="number" min="1" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hatch_date">Tanggal Netas / Masuk</Label>
            <Input id="hatch_date" name="hatch_date" type="date" required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={loading}>{loading ? "..." : "Simpan"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
