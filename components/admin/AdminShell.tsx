import { LogOut } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { adminLogout } from "@/app/admin/actions";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminMobileNav, AdminSidebarNav } from "./AdminNav";

/** Sidebar, top bar and page area. Checks the admin role before rendering anything. */
export async function AdminShell({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-60 shrink-0 border-r bg-sidebar p-4 md:block">
        <Link href="/admin" className="mb-6 block px-3 text-lg font-semibold tracking-tight">
          The Veminence
        </Link>
        <AdminSidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <AdminMobileNav />
            <span className="font-semibold md:hidden">The Veminence</span>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <span className="hidden truncate text-sm text-muted-foreground sm:inline">{admin.email}</span>
            <Badge variant="secondary" className="capitalize">
              {admin.role}
            </Badge>
            <form action={adminLogout}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="size-4" aria-hidden="true" />
                Log out
              </Button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function AdminShellSkeleton() {
  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-60 shrink-0 border-r bg-sidebar md:block" />
      <div className="flex-1">
        <div className="h-14 border-b" />
      </div>
    </div>
  );
}
