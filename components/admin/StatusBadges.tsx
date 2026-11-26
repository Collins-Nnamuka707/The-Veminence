import type { ReactNode } from "react";
import type { AdminProduct } from "@/lib/admin/catalog";
import { cn } from "@/lib/utils";

// Soft coloured labels with a dot, so the status reads at a glance (and not by colour alone).
const tones = {
  green: "bg-emerald-50 text-emerald-800 ring-emerald-700/20",
  amber: "bg-amber-50 text-amber-800 ring-amber-700/25",
  red: "bg-red-50 text-red-800 ring-red-700/20",
  grey: "bg-stone-100 text-stone-700 ring-stone-600/20",
  gold: "bg-gold-tint text-[#6b5e3f] ring-gold-dark/30",
} as const;

export type Tone = keyof typeof tones;

export function Pill({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

export const PRODUCT_STATUS: Record<AdminProduct["status"], { label: string; tone: Tone }> = {
  published: { label: "Published", tone: "green" },
  coming_soon: { label: "Coming soon", tone: "gold" },
  draft: { label: "Draft", tone: "grey" },
  archived: { label: "Archived", tone: "grey" },
};

export function ProductStatusBadge({ status }: { status: AdminProduct["status"] }) {
  const { label, tone } = PRODUCT_STATUS[status];
  return <Pill tone={tone}>{label}</Pill>;
}

export type StockLevel = "out" | "low" | "ok";

export function stockLevel(onHand: number, lowAt: number): StockLevel {
  if (onHand <= 0) return "out";
  if (onHand <= lowAt) return "low";
  return "ok";
}

export function StockBadge({ onHand, lowAt }: { onHand: number; lowAt: number }) {
  const level = stockLevel(onHand, lowAt);
  if (level === "out") return <Pill tone="red">Sold out</Pill>;
  if (level === "low") return <Pill tone="amber">Low</Pill>;
  return <Pill tone="green">In stock</Pill>;
}
