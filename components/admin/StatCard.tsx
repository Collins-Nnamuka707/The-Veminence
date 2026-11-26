import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  href?: string;
  /** Highlights the card when something needs attention. */
  attention?: boolean;
  /** Three in a row on phones: hide the icon and the note there. */
  compact?: boolean;
};

export function StatCard({ label, value, note, icon: Icon, href, attention, compact }: Props) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className={cn("font-medium text-muted-foreground", compact ? "text-xs sm:text-sm" : "text-sm")}>{label}</p>
        <span
          className={cn(
            "size-9 shrink-0 items-center justify-center rounded-lg",
            compact ? "hidden sm:flex" : "hidden min-[400px]:flex",
            attention ? "bg-red-50 text-red-700" : "bg-gold-tint text-[#6b5e3f]",
          )}
          aria-hidden="true"
        >
          <Icon className="size-4.5" />
        </span>
      </div>
      <p className={cn("mt-2 text-xl font-bold tracking-tight tabular-nums sm:text-2xl md:text-[1.75rem]", attention && "text-red-800")}>{value}</p>
      <p className={cn("mt-1 text-xs", compact && "hidden sm:block", attention ? "font-medium text-red-800" : "text-muted-foreground")}>{note}</p>
    </>
  );
  const className = "block min-w-0 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-shadow sm:p-5";
  return href ? (
    <Link href={href} className={cn(className, "hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring")}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
