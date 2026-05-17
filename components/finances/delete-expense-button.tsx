"use client";

import { deleteExpense } from "@/lib/actions/expenses";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";

export function DeleteExpenseButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      onConfirm={() => deleteExpense(id)}
      description="Pengeluaran ini akan dihapus permanen."
    />
  );
}
