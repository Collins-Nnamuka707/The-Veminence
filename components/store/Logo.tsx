type Props = { tone?: "light" | "dark" };

/** Text wordmark until the owner supplies a logo file. */
export function Logo({ tone = "light" }: Props) {
  return (
    <span className={`text-sm font-bold tracking-[0.18em] whitespace-nowrap uppercase sm:text-lg sm:tracking-[0.25em] ${tone === "dark" ? "text-white" : ""}`}>
      The Veminence
    </span>
  );
}
