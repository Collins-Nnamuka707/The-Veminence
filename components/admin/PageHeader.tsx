import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="grid animate-pulse gap-4" aria-hidden="true">
      <div className="h-8 w-48 rounded-md bg-muted" />
      <div className="h-40 rounded-xl bg-muted" />
    </div>
  );
}
