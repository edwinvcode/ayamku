"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recordHatch } from "@/lib/actions/eggs";

export function RecordHatchForm({ eggId, maxQuantity }: { eggId: string; maxQuantity: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const hatched = parseInt(fd.get("hatched_count") as string);
    const failed = maxQuantity - hatched;
    const hatch_date = fd.get("hatch_date") as string;
    const result = await recordHatch(eggId, hatched, failed, hatch_date);
    setLoading(false);
    if (!result.success) setError(result.error || "Gagal");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="hatched_count" className="text-xs">Jumlah Netas (max: {maxQuantity})</Label>
          <Input
            id="hatched_count"
            name="hatched_count"
            type="number"
            min="0"
            max={maxQuantity}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hatch_date" className="text-xs">Tanggal Netas</Label>
          <Input
            id="hatch_date"
            name="hatch_date"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            required
          />
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Menyimpan..." : "Catat Hasil Penetasan"}
      </Button>
    </form>
  );
}
