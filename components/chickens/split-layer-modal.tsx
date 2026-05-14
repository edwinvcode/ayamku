"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { splitLayerBatch } from "@/lib/actions/chickens";
import { Scissors } from "lucide-react";

export function SplitLayerModal({ batchId, batchCode, totalQuantity }: {
  batchId: string;
  batchCode: string;
  totalQuantity: number;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [siapPanen, setSiapPanen] = useState(totalQuantity);
  const [indukanBetina, setIndukanBetina] = useState(0);
  const [indukanJantan, setIndukanJantan] = useState(0);

  const total = siapPanen + indukanBetina + indukanJantan;
  const sisa = totalQuantity - total;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (total !== totalQuantity) {
      setError(`Total harus ${totalQuantity} ekor (sekarang ${total})`);
      return;
    }
    setLoading(true);
    setError("");
    const result = await splitLayerBatch(batchId, siapPanen, indukanBetina, indukanJantan);
    setLoading(false);
    if (result.success) {
      setOpen(false);
    } else {
      setError(result.error || "Gagal");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="w-full">
          <Scissors className="h-3.5 w-3.5 mr-1" />
          Kategorikan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kategorikan Batch {batchCode}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Total: <strong>{totalQuantity} ekor</strong>. Atur jumlah untuk tiap kategori.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>🪙 Siap Panen (Afkir)</Label>
              <Input
                type="number"
                min="0"
                max={totalQuantity}
                value={siapPanen}
                onChange={e => setSiapPanen(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>🐓 Calon Indukan Betina</Label>
              <Input
                type="number"
                min="0"
                max={totalQuantity}
                value={indukanBetina}
                onChange={e => setIndukanBetina(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>🐓 Calon Indukan Jantan</Label>
              <Input
                type="number"
                min="0"
                max={totalQuantity}
                value={indukanJantan}
                onChange={e => setIndukanJantan(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>
          </div>

          <div className={`text-sm font-medium rounded-md px-3 py-2 ${
            sisa === 0 ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
          }`}>
            {sisa === 0
              ? `✓ Total pas: ${total} ekor`
              : sisa > 0
              ? `Sisa belum dikategorikan: ${sisa} ekor`
              : `Melebihi total: ${Math.abs(sisa)} ekor`}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={loading || sisa !== 0}>
              {loading ? "Memproses..." : "Konfirmasi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
