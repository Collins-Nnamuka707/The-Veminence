type Props = { items: string[] };

/** Scrolling band (stops when the visitor prefers reduced motion). */
export function Marquee({ items }: Props) {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <li key={i} className="flex items-center">
          <span className="px-6 font-display text-xl whitespace-nowrap sm:text-2xl">{item}</span>
          <span aria-hidden="true">✦</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="overflow-hidden bg-gold py-4 text-ink">
      <div className="animate-marquee flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
