import type { ReactNode } from "react";

/**
 * Tags for next-intl rich messages. Headings mark their one script word as
 * <script>word</script> in messages/*.json.
 */
export const rich = {
  script: (chunks: ReactNode) => (
    <span className="font-script px-[0.12em] text-[1.15em] font-normal leading-none">{chunks}</span>
  ),
};
