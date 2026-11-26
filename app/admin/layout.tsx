import type { Metadata } from "next";
import type { ReactNode } from "react";
import { sans } from "@/lib/fonts";
import "./admin.css";

// The admin is its own root layout: English only, no next-intl, never indexed.
export const metadata: Metadata = {
  title: { default: "Admin · The Veminence", template: "%s · Admin · The Veminence" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
