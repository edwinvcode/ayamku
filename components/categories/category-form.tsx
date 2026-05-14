"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import { ExpenseCategoryItem } from "@/types/database";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6",
  "#ec4899", "#d97706", "#6b7280", "#f43f5e",
];

interface CategoryFormProps {
  category?: ExpenseCategoryItem;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(category?.color ?? "#3b82f6");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!category;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("color", color);

    const result = isEdit
      ? await updateCategory(category.id, formData)
      : await createCategory(formData);

    setLoading(false);
    if (result.success) {
      setOpen(false);
    } else {
      setError(result.error ?? "Terjadi kesalahan");
    }
  }

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) {
      setColor(category?.color ?? "#3b82f6");
      setError(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Tambah Kategori
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Kategori</Label>
            <Input
              id="name"
              name="name"
              defaultValue={category?.name}
              placeholder="contoh: Pakan, Obat-obatan..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Warna</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-7 w-7 rounded-full transition-all ring-offset-background",
                    color === c
                      ? "ring-2 ring-ring ring-offset-2 scale-110"
                      : "opacity-60 hover:opacity-100 hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <div className="h-5 w-5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs text-muted-foreground">Warna dipilih</span>
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
