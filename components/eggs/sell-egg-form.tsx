"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingCart } from "lucide-react";
import { sellEggs } from "@/lib/actions/eggs";
import { CurrencyInput } from "@/components/ui/currency-input";

export function SellEggForm({ eggId, maxQuantity }: { eggId: string; maxQuantity: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(maxQuantity);
  const [price, setPrice] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const result = await sellEggs(eggId, fd);
    setLoading(false);
    if (result.success) setOpen(false);
    else setError(result.error || "Gagal");
  }

  const total = (qty || 0) * (price || 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <ShoppingCart className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Jual Telur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sell-qty">Jumlah (butir)</Label>
              <Input
                id="sell-qty"
                name="quantity"
                type="number"
                min="1"
                max={maxQuantity}
                value={qty}
                onChange={e => setQty(parseInt(e.target.value) || 0)}
                required
              />
              <p className="text-xs text-muted-foreground">Stok: {maxQuantity} butir</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sell-price">Harga / Butir</Label>
              <CurrencyInput
                id="sell-price"
                name="price_per_unit"
                placeholder="0"
                onValueChange={setPrice}
                required
              />
            </div>
          </div>

          {total > 0 && (
            <div className="bg-muted/50 rounded-md px-3 py-2 text-sm">
              <span className="text-muted-foreground">Total: </span>
              <span className="font-semibold text-green-400">
                Rp{total.toLocaleString("id-ID")}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="sell-date">Tanggal</Label>
            <Input
              id="sell-date"
              name="date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sell-notes">Pembeli / Catatan (opsional)</Label>
            <Textarea id="sell-notes" name="notes" rows={2} placeholder="Nama pembeli, dll..." />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={loading}>{loading ? "..." : "Simpan Penjualan"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
