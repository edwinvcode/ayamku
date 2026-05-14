"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addEggBatch } from "@/lib/actions/eggs";
import { Plus } from "lucide-react";

export function EggForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await addEggBatch(formData);
    setLoading(false);
    if (result.success) {
      setOpen(false);
    } else {
      setError(result.error || "Terjadi kesalahan");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Telur
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Batch Telur</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Jumlah Telur</Label>
            <Input id="quantity" name="quantity" type="number" min="1" required placeholder="100" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_received">Tanggal Terima</Label>
            <Input
              id="date_received"
              name="date_received"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source_notes">Sumber (opsional)</Label>
            <Textarea
              id="source_notes"
              name="source_notes"
              placeholder="Kandang A, indukan batch-001, dll..."
              rows={2}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
