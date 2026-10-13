import type { ReactNode } from "react";

type Props = {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  align?: "center" | "left";
  tone?: "light" | "dark";
};

export function SectionHeading({ id, eyebrow, title, align = "center", tone = "light" }: Props) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <p className={`eyebrow ${tone === "dark" ? "text-gold" : "text-olive"}`}>{eyebrow}</p>
      <h2 id={id} className="mt-2 font-display text-3xl leading-tight font-medium sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}
