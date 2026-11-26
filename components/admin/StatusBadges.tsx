import { Badge } from "@/components/admin/ui/badge";
import type { AdminProduct } from "@/lib/admin/catalog";

const productStatus: Record<AdminProduct["status"], { label: string; variant: "default" | "secondary" | "outline" }> = {
  published: { label: "Published", variant: "default" },
  coming_soon: { label: "Coming soon", variant: "secondary" },
  draft: { label: "Draft", variant: "outline" },
  archived: { label: "Archived", variant: "outline" },
};

export function ProductStatusBadge({ status }: { status: AdminProduct["status"] }) {
  const { label, variant } = productStatus[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function StockBadge({ onHand, lowAt }: { onHand: number; lowAt: number }) {
  if (onHand === 0) return <Badge variant="destructive">Sold out</Badge>;
  if (onHand <= lowAt) return <Badge variant="secondary">Low</Badge>;
  return <Badge variant="outline">In stock</Badge>;
}
