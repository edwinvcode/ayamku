"use client";

import { deleteVaccination } from "@/lib/actions/vaccinations";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";

export function DeleteVaccinationButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      onConfirm={() => deleteVaccination(id)}
      description="Data vaksinasi ini akan dihapus permanen."
    />
  );
}
