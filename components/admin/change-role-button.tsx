"use client";

import { useTransition } from "react";
import { updateUserRole } from "@/lib/actions/users";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ChangeRoleButton({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    startTransition(async () => {
      await updateUserRole(userId, value as "superadmin" | "admin");
    });
  }

  return (
    <Select value={currentRole} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="h-7 text-xs w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="superadmin">Superadmin</SelectItem>
      </SelectContent>
    </Select>
  );
}
