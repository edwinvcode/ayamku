"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CurrencyInput } from "@/components/ui/currency-input";
import { sellChickens } from "@/lib/actions/chickens";
import { ShoppingCart } from "lucide-react";

export function SellChickenButton({ batchId, batchCode, maxQuantity }: {
  batchId: string;
  batchCode: string;
  maxQuantity: number;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(maxQuantity);
  const [price, setPrice] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await sellChickens(batchId, new FormData(e.currentTarget));
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
        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">
          <ShoppingCart className="h-3.5 w-3.5 mr-1" />
          Jual Ayam
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Jual Ayam — {batchCode}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Stok tersedia: <strong>{maxQuantity} ekor</strong></p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Jumlah Dijual (ekor)</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                max={maxQuantity}
                value={qty}
                onChange={e => setQty(parseInt(e.target.value) || 0)}
                required
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
            <Input id="notes" name="notes" placeholder="Nama pembeli, dll" />
          </div>

          <div className="rounded-md bg-muted px-3 py-2 text-sm">
            Total: <strong>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(qty * price)}</strong>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={loading}>{loading ? "Memproses..." : "Catat Penjualan"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
