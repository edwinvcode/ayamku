"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CurrencyInput } from "@/components/ui/currency-input";
import { sellChickens } from "@/lib/actions/chickens";
import { ShoppingCart } from "lucide-react";

type SaleSource = "afkir" | "indukan" | "layer";

interface BatchOption {
  id: string;
  batch_code: string;
  quantity: number;
  stage: string;
  breeder_gender: string | null;
}

const sourceConfig: Record<SaleSource, { label: string; emoji: string; desc: string }> = {
  afkir:   { label: "Afkir",       emoji: "🪙", desc: "Ayam siap jual/potong" },
  indukan: { label: "Indukan",     emoji: "🐓", desc: "Jual breeding stock" },
  layer:   { label: "Siap Panen",  emoji: "🌾", desc: "Langsung dari Layer" },
};

export function SellChickenModal({ batches }: { batches: BatchOption[] }) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<SaleSource>("afkir");
  const [batchId, setBatchId] = useState("");
  const [qty, setQty] = useState(0);
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredBatches = batches.filter(b => b.stage === source);
  const selectedBatch = filteredBatches.find(b => b.id === batchId);

  function handleSourceChange(s: SaleSource) {
    setSource(s);
    setBatchId("");
    setQty(0);
  }

  function handleBatchChange(id: string) {
    setBatchId(id);
    const b = filteredBatches.find(b => b.id === id);
    if (b) setQty(b.quantity);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!batchId) { setError("Pilih batch terlebih dahulu"); return; }
    setLoading(true);
    setError("");
    const result = await sellChickens(batchId, new FormData(e.currentTarget));
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setBatchId("");
      setQty(0);
      setPrice(0);
    } else {
      setError(result.error || "Gagal");
    }
  }

  const totalStr = new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(qty * price);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Jual Ayam
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Jual Ayam</DialogTitle>
        </DialogHeader>

        {/* Pilih sumber */}
        <div className="grid grid-cols-3 gap-2">
          {(["afkir", "indukan", "layer"] as SaleSource[]).map(s => {
            const conf = sourceConfig[s];
            const count = batches.filter(b => b.stage === s).reduce((sum, b) => sum + b.quantity, 0);
            return (
              <button
                key={s}
                type="button"
                onClick={() => handleSourceChange(s)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  source === s
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-lg">{conf.emoji}</div>
                <div className="text-xs font-medium mt-0.5">{conf.label}</div>
                <div className="text-xs text-muted-foreground">{count} ekor</div>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pilih batch */}
          <div className="space-y-1.5">
            <Label>Pilih Batch</Label>
            {filteredBatches.length === 0 ? (
              <p className="text-sm text-muted-foreground border rounded-md px-3 py-2">
                Tidak ada batch {sourceConfig[source].label}
              </p>
            ) : (
              <Select value={batchId} onValueChange={handleBatchChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih batch..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredBatches.map(b => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.batch_code} — {b.quantity} ekor
                      {b.breeder_gender ? ` (${b.breeder_gender})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">
                Jumlah (maks {selectedBatch?.quantity ?? 0} ekor)
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                max={selectedBatch?.quantity}
                value={qty || ""}
                onChange={e => setQty(parseInt(e.target.value) || 0)}
                required
                disabled={!batchId}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Harga per Ekor</Label>
            <CurrencyInput name="price_per_unit" onValueChange={setPrice} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Catatan (opsional)</Label>
            <Input id="notes" name="notes" placeholder="Nama pembeli, tujuan, dll" />
          </div>

          <div className="rounded-md bg-muted px-3 py-2 text-sm">
            Total: <strong>{totalStr}</strong>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={loading || !batchId}>
              {loading ? "Memproses..." : "Catat Penjualan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
