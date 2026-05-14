"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addExpense } from "@/lib/actions/expenses";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Plus } from "lucide-react";

interface CustomCategory { id: string; name: string; color: string; }

export function ExpenseForm({ customCategories = [] }: { customCategories?: CustomCategory[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("feed");
  const [unit, setUnit] = useState<"gram" | "kg" | "ton" | "karung">("kg");

  const isCustom = !["feed", "operational"].includes(category);
  const selectedCustom = customCategories.find(c => c.id === category);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    if (isCustom && selectedCustom) {
      fd.set("category", "operational");
      fd.set("sub_category", selectedCustom.name);
    } else {
      fd.set("category", category);
    }
    const beratRaw = parseFloat(fd.get("berat") as string);
    if (!isNaN(beratRaw) && beratRaw > 0) {
      const factor = { gram: 0.001, kg: 1, ton: 1000, karung: 50 }[unit];
      fd.set("quantity_kg", (beratRaw * factor).toString());
    }
    fd.delete("berat");
    const result = await addExpense(fd);
    setLoading(false);
    if (result.success) setOpen(false);
    else setError(result.error || "Gagal");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Catat Pengeluaran
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Catat Pengeluaran</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="feed">Pakan</SelectItem>
                <SelectItem value="operational">Operasional</SelectItem>
                {customCategories.length > 0 && (
                  <>
                    <SelectSeparator />
                    {customCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          {category === "feed" && (
            <div className="space-y-2">
              <Label htmlFor="sub_category">Jenis Pakan</Label>
              <Input id="sub_category" name="sub_category" placeholder="Konsentrat, jagung, dll..." />
            </div>
          )}
          {category === "operational" && (
            <div className="space-y-2">
              <Label htmlFor="sub_category">Jenis Pengeluaran</Label>
              <Input id="sub_category" name="sub_category" placeholder="Listrik, air, obat, dll..." />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah (Rp)</Label>
              <CurrencyInput id="amount" name="amount" placeholder="0" required />
            </div>
            {!isCustom && category === "feed" && (
              <div className="space-y-2">
                <Label>Berat</Label>
                <div className="flex gap-2">
                  <Input
                    name="berat"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0"
                    className="flex-1"
                  />
                  <Select value={unit} onValueChange={(v) => setUnit(v as "gram" | "kg" | "ton" | "karung")}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gram">gram</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="ton">ton</SelectItem>
                      <SelectItem value="karung">karung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Keterangan (opsional)</Label>
            <Textarea id="description" name="description" rows={2} />
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
