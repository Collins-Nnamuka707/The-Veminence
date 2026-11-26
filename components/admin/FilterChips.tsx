"use client";

import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: string; count: number };

/** Row of pill buttons that filter a list; the active one is ink with a gold count. */
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              active ? "bg-ink text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {option.label}
            <span className={cn("text-xs tabular-nums", active ? "text-gold" : "text-muted-foreground")}>{option.count}</span>
          </button>
        );
      })}
    </div>
  );
}
