import type { ReactNode } from "react";

type Props = {
  id?: string;
  title: string;
  text?: string;
  action?: ReactNode;
  tone?: "light" | "dark";
};

/** Bold uppercase section title with an optional line of text and a button on the right. */
export function SectionHeading({ id, title, text, action, tone = "light" }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 id={id} className="heading">
          {title}
        </h2>
        {text && <p className={`mt-2 text-sm ${tone === "dark" ? "text-white/75" : "text-muted"}`}>{text}</p>}
      </div>
      {action}
    </div>
  );
}
