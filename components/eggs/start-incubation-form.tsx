"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { startIncubation } from "@/lib/actions/eggs";

export function StartIncubationForm({ eggId, maxQuantity }: { eggId: string; maxQuantity: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const qty = parseInt(fd.get("quantity") as string);
    if (isNaN(qty) || qty <= 0 || qty > maxQuantity) {
      setError(`Jumlah harus antara 1–${maxQuantity}`);
      setLoading(false);
      return;
    }
    const result = await startIncubation(eggId, fd.get("incubation_start") as string, qty, maxQuantity);
    setLoading(false);
    if (result.success) router.push("/eggs");
    else setError(result.error || "Gagal");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="quantity">Jumlah Diinkubasi</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            max={maxQuantity}
            defaultValue={maxQuantity}
            required
          />
          <p className="text-xs text-muted-foreground">Maks {maxQuantity} butir</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="incubation_start">Tanggal Mulai</Label>
          <Input
            id="incubation_start"
            name="incubation_start"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            required
          />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Memproses..." : "Mulai Inkubasi"}
      </Button>
    </form>
  );
}
