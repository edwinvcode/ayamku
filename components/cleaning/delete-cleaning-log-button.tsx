"use client";

import { deleteCleaningLog } from "@/lib/actions/cleaning";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";

export function DeleteCleaningLogButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      onConfirm={() => deleteCleaningLog(id)}
      description="Log kebersihan ini akan dihapus permanen."
    />
  );
}
