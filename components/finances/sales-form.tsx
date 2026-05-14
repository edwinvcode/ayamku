"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { recordSale } from "@/lib/actions/sales";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Plus } from "lucide-react";

export function SalesForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saleType, setSaleType] = useState("chicken");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("sale_type", saleType);
    const result = await recordSale(fd);
    setLoading(false);
    if (result.success) setOpen(false);
    else setError(result.error || "Gagal");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Catat Penjualan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Catat Penjualan</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Jenis Penjualan</Label>
            <Select value={saleType} onValueChange={setSaleType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="chicken">Ayam</SelectItem>
                <SelectItem value="egg">Telur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Jumlah ({saleType === "chicken" ? "ekor" : "butir"})</Label>
              <Input id="quantity" name="quantity" type="number" min="1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_per_unit">Harga / {saleType === "chicken" ? "Ekor" : "Butir"}</Label>
              <CurrencyInput id="price_per_unit" name="price_per_unit" placeholder="0" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (opsional)</Label>
            <Textarea id="notes" name="notes" rows={2} />
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
