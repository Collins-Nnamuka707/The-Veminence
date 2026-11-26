import { Suspense, type ReactNode } from "react";
import { AdminShell, AdminShellSkeleton } from "@/components/admin/AdminShell";

// The shell reads the signed-in admin (cookies), so it renders per request inside Suspense.
export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
