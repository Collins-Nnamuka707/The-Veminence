const POLISH: Record<string, string> = { ł: "l", Ł: "l" };

/** Web address part from a product name: "Łucja – Długa 60 cm" → "lucja-dluga-60-cm". */
export function slugify(name: string): string {
  return name
    .replace(/[łŁ]/g, (c) => POLISH[c])
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/** First free slug: "amelia", then "amelia-2", "amelia-3"... */
export function uniqueSlug(base: string, taken: Set<string>): string {
  const root = base || "product";
  if (!taken.has(root)) return root;
  for (let n = 2; ; n++) {
    const candidate = `${root}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}
