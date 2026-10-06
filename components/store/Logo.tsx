type Props = { tone?: "light" | "dark" };

/** Text wordmark until the owner supplies a logo file. */
export function Logo({ tone = "light" }: Props) {
  return (
    <span className="flex flex-col leading-none">
      <span
        className={`text-[0.6rem] tracking-[0.45em] uppercase ${tone === "dark" ? "text-gold" : "text-olive"}`}
      >
        The
      </span>
      <span className="font-display text-2xl font-medium tracking-wide">Veminence</span>
    </span>
  );
}
