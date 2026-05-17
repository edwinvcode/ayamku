"use client";

import { deleteEggBatch } from "@/lib/actions/eggs";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";

export function DeleteEggBatchButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      onConfirm={() => deleteEggBatch(id)}
      title="Hapus batch telur ini?"
      description="Semua data batch ini akan dihapus permanen."
      trigger="Hapus Batch Ini"
      triggerClassName="text-destructive border border-destructive/40 hover:bg-destructive/10 hover:border-destructive h-8 px-3 text-sm rounded-md"
    />
  );
}
