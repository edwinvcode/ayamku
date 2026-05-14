"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";
import { updateEggBatch, deleteEggBatch } from "@/lib/actions/eggs";
import { Egg } from "@/types/database";

export function EggEditButton({ egg }: { egg: Egg }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const result = await updateEggBatch(egg.id, fd);
    setLoading(false);
    if (result.success) setOpen(false);
    else setError(result.error || "Gagal");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Batch Telur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-quantity">Jumlah Telur</Label>
            <Input
              id="edit-quantity"
              name="quantity"
              type="number"
              min="1"
              defaultValue={egg.quantity}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-date">Tanggal Terima</Label>
            <Input
              id="edit-date"
              name="date_received"
              type="date"
              defaultValue={egg.date_received}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-source">Sumber (opsional)</Label>
            <Textarea
              id="edit-source"
              name="source_notes"
              defaultValue={egg.source_notes || ""}
              rows={2}
            />
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

export function EggDeleteButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await deleteEggBatch(id);
    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus batch telur ini?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Batal</Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
              {loading ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
