"use client";

import { deleteUser } from "@/lib/actions/users";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";

export function DeleteUserButton({ userId }: { userId: string }) {
  return (
    <ConfirmDeleteButton
      onConfirm={() => deleteUser(userId)}
      title="Hapus pengguna ini?"
      description="Pengguna tidak bisa login lagi setelah dihapus."
    />
  );
}
