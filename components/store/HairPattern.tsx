type Variant = "straight" | "wavy" | "curly";

type Props = {
  variant: Variant;
  /** Strand colour, e.g. "#6B5E3F". */
  color: string;
  className?: string;
};

const WIDTH = 200;
const HEIGHT = 250;
const STRANDS = 15;

/** Decorative hair-strand illustration, used until real product photos are uploaded. */
export function HairPattern({ variant, color, className }: Props) {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {Array.from({ length: STRANDS }, (_, i) => (
        <path
          key={i}
          d={strandPath(variant, i)}
          fill="none"
          stroke={color}
          strokeWidth={variant === "curly" ? 1.4 : 1.2}
          strokeLinecap="round"
          opacity={0.35 + (i % 4) * 0.15}
        />
      ))}
    </svg>
  );
}

function strandPath(variant: Variant, i: number): string {
  const x0 = 12 + i * ((WIDTH - 24) / (STRANDS - 1));
  const points: Array<[number, number]> = [];

  if (variant === "straight") {
    for (let y = 0; y <= HEIGHT; y += 10) {
      points.push([x0 + Math.sin(y / 90 + i * 0.4) * 3, y]);
    }
  } else if (variant === "wavy") {
    for (let y = 0; y <= HEIGHT; y += 4) {
      points.push([x0 + Math.sin(y / 22 + i * 0.35) * 7, y]);
    }
  } else {
    // A prolate trochoid: a strand that loops back on itself like a coil.
    for (let t = 0; t <= 110; t += 0.25) {
      points.push([x0 + Math.cos(t + i) * 5, t * 2.3 + Math.sin(t + i) * 5]);
    }
  }

  return points
    .map(([x, y], n) => `${n === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join("");
}
