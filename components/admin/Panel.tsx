import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  /** Content runs to the panel's edges (lists and tables). */
  flush?: boolean;
  id?: string;
};

/** White section with a title row; the building block of every admin page. */
export function Panel({ title, description, action, icon: Icon, children, className, flush, id }: Props) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={cn("rounded-xl bg-card ring-1 ring-foreground/10", className)}>
      <header className="flex items-start justify-between gap-4 border-b px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-gold-tint text-[#6b5e3f]" aria-hidden="true">
              <Icon className="size-4" />
            </span>
          )}
          <div className="min-w-0">
            <h2 id={headingId} className="text-base font-semibold tracking-tight">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className={flush ? undefined : "p-5"}>{children}</div>
    </section>
  );
}

export function EmptyState({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-gold-tint text-[#6b5e3f]" aria-hidden="true">
        <Icon className="size-5" />
      </span>
      <p className="mt-4 font-semibold">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}
