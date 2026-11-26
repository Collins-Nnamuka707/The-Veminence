import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminMobileBar, AdminSidebar } from "./AdminNav";

/** Dark sidebar (top bar on phones) and the page area. Checks the admin role before rendering anything. */
export async function AdminShell({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const user = { email: admin.email, role: admin.role };

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileBar user={user} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}

export function AdminShellSkeleton() {
  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-64 shrink-0 bg-sidebar md:block" />
      <div className="flex-1">
        <div className="h-14 bg-sidebar md:hidden" />
      </div>
    </div>
  );
}
