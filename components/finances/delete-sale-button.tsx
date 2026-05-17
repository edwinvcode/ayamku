"use client";

import { deleteSale } from "@/lib/actions/sales";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";

export function DeleteSaleButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      onConfirm={() => deleteSale(id)}
      description="Data penjualan ini akan dihapus permanen."
    />
  );
}
