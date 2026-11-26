import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default function AdminLoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-ink p-4">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,106,0.22),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-lg font-bold tracking-[0.25em] text-white uppercase">The Veminence</p>
          <p className="mt-2 text-xs font-semibold tracking-[0.3em] text-gold uppercase">Admin</p>
        </div>
        <div className="rounded-xl bg-card p-6 shadow-2xl sm:p-8">
          <h1 className="text-xl font-bold tracking-tight">Log in</h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">Log in with your shop account. Only admin accounts can enter.</p>
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-white/60">
          <Link href="/en" className="underline-offset-4 hover:text-white hover:underline">
            ← Back to the shop
          </Link>
        </p>
      </div>
    </main>
  );
}
