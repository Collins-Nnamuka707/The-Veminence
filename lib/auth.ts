/**
 * Only same-site paths are allowed as a redirect target after login or an email link,
 * so a crafted link cannot send people to another website.
 */
export function safeNextPath(next: unknown, fallback: string): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
