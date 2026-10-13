import type { ReactNode } from "react";

export function FormAlert({ tone = "error", children }: { tone?: "error" | "success"; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-2xl border p-4 text-sm ${
        tone === "error" ? "border-sale bg-cream text-sale" : "border-olive bg-stone text-ink"
      }`}
    >
      {children}
    </div>
  );
}
