import { Badge } from "@/components/ui/badge";
import { EggStatus } from "@/types/database";

const statusConfig: Record<EggStatus, { label: string; variant: "success" | "info" | "warning" | "destructive" | "secondary" }> = {
  stock: { label: "Stok", variant: "secondary" },
  incubating: { label: "Inkubasi", variant: "info" },
  hatched: { label: "Menetas", variant: "success" },
  failed: { label: "Gagal", variant: "destructive" },
};

export function EggStatusBadge({ status }: { status: EggStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant as "success"}>{config.label}</Badge>;
}
