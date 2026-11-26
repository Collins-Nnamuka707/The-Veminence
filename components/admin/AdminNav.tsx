"use client";

import { Boxes, ExternalLink, LayoutDashboard, LogOut, Menu, Package, Settings, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { adminLogout } from "@/app/admin/actions";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/admin/ui/sheet";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/stock", label: "Stock", icon: Boxes },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

type User = { email: string; role: string };

export function AdminBrand() {
  return (
    <Link href="/admin" className="block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
      <span className="block text-sm font-bold tracking-[0.22em] text-white uppercase">The Veminence</span>
      <span className="mt-1 block text-[0.65rem] font-semibold tracking-[0.25em] text-gold uppercase">Admin</span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="grid gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-gold",
              active ? "bg-sidebar-accent text-white" : "text-white/70 hover:bg-sidebar-accent hover:text-white",
            )}
          >
            {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-gold" aria-hidden="true" />}
            <Icon className={cn("size-4.5", active ? "text-gold" : "text-white/60")} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ user }: { user: User }) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 border-t border-sidebar-border pt-4">
      <a
        href="/en"
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-white/70 transition-colors hover:bg-sidebar-accent hover:text-white focus-visible:outline-2 focus-visible:outline-gold"
      >
        <ExternalLink className="size-4.5 text-white/60" aria-hidden="true" />
        View shop
      </a>
      <div className="flex min-w-0 items-center gap-3 rounded-md bg-sidebar-accent p-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-ink uppercase" aria-hidden="true">
          {user.email.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-white" title={user.email}>
            {user.email}
          </p>
          <p className="text-xs text-white/60 capitalize">{user.role}</p>
        </div>
        <form action={adminLogout}>
          <button
            type="submit"
            className="flex size-9 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-gold"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="size-4.5" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}

/** Fixed sidebar on wide screens. */
export function AdminSidebar({ user }: { user: User }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-8 bg-sidebar p-5 md:flex">
      <div className="px-3 pt-2">
        <AdminBrand />
      </div>
      <div className="flex-1 overflow-y-auto">
        <NavLinks />
      </div>
      <SidebarFooter user={user} />
    </aside>
  );
}

/** Dark top bar with a slide-in menu on phones. */
export function AdminMobileBar({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 bg-sidebar px-4 md:hidden">
      <AdminBrand />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-md text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-gold"
            aria-label="Open menu"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="flex w-72 flex-col gap-8 border-none bg-sidebar p-5 text-white [&>[data-slot=sheet-close]]:top-4 [&>[data-slot=sheet-close]]:text-white [&>[data-slot=sheet-close]]:hover:bg-white/10 [&>[data-slot=sheet-close]]:hover:text-white">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Admin pages</SheetDescription>
          <div className="px-3 pt-2">
            <AdminBrand />
          </div>
          <div className="flex-1 overflow-y-auto">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
          <SidebarFooter user={user} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
