import type { ReactNode } from "react";

/**
 * Tags for next-intl rich messages. The script accent font was dropped in the 2026-11-26
 * redesign; `<script>` markers, if any remain in a message, now render as plain text.
 */
export const rich = {
  script: (chunks: ReactNode) => chunks,
};
