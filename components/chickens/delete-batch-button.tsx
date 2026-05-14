"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { deleteBatch } from "@/lib/actions/chickens";

export function DeleteBatchButton({
  batchId,
  batchCode,
  redirect,
}: {
  batchId: string;
  batchCode: string;
  redirect?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleConfirm() {
    setLoading(true);
    await deleteBatch(batchId);
    setLoading(false);
    setOpen(false);
    if (redirect) router.push("/chickens");
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:border-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Hapus Batch
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Batch {batchCode}?</DialogTitle>
            <DialogDescription>
              Data mortalitas dan riwayat stage juga akan terhapus. Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
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
