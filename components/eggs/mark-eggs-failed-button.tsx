"use client";

import { useTransition } from "react";
import { markEggsFailed } from "@/lib/actions/eggs";
import { Button } from "@/components/ui/button";

export function MarkEggsFailedButton({ eggId }: { eggId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:border-destructive"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await markEggsFailed(eggId);
        })
      }
    >
      {isPending ? "Memproses..." : "Tandai Semua Gagal"}
    </Button>
  );
}
