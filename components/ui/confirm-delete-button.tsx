"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Props {
  onConfirm: () => unknown;
  title?: string;
  description?: string;
  trigger?: React.ReactNode;
  triggerClassName?: string;
}

export function ConfirmDeleteButton({
  onConfirm,
  title = "Hapus data ini?",
  description = "Tindakan ini tidak bisa dibatalkan.",
  trigger,
  triggerClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={triggerClassName ?? "text-destructive h-7 w-7 p-0 hover:bg-destructive/10"}
        onClick={() => setOpen(true)}
      >
        {trigger ?? <Trash2 className="h-3.5 w-3.5" />}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
              {loading ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
