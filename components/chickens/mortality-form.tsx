"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { recordMortality } from "@/lib/actions/chickens";

export function MortalityForm({ batchId, maxCount }: { batchId: string; maxCount: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    const fd = new FormData(e.currentTarget);
    const count = parseInt(fd.get("count") as string);
    const reason = fd.get("reason") as string;
    const result = await recordMortality(batchId, count, reason);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } else {
      setError(result.error || "Gagal");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="count" className="text-sm">Jumlah Mati (max: {maxCount})</Label>
          <Input id="count" name="count" type="number" min="1" max={maxCount} required />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="reason" className="text-sm">Alasan (opsional)</Label>
        <Textarea id="reason" name="reason" placeholder="Penyakit, kecelakaan, dll..." rows={2} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">Mortalitas berhasil dicatat.</p>}
      <Button type="submit" size="sm" variant="destructive" disabled={loading}>
        {loading ? "Menyimpan..." : "Catat Kematian"}
      </Button>
    </form>
  );
}
