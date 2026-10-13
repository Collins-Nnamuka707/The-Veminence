import type { ReactNode } from "react";

/** Narrow, centred layout shared by the sign-in pages. */
export function AuthShell({ title, intro, children }: { title: ReactNode; intro?: string; children: ReactNode }) {
  return (
    <div className="container-page max-w-md pt-12 pb-24">
      <h1 className="font-display text-4xl font-medium sm:text-5xl">{title}</h1>
      {intro && <p className="mt-3 text-muted">{intro}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}
