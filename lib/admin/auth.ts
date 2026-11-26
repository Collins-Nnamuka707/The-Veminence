import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminRole = "owner" | "staff";
export type AdminUser = { id: string; email: string; role: AdminRole };

/**
 * The signed-in admin, or null. Roles live in public.admin_users and are granted in the database
 * only; any Supabase account without a row there is a customer.
 */
export async function getAdmin(): Promise<AdminUser | null> {
  // Per-request only: the Supabase client reads the clock (session expiry), which Next.js does
  // not allow while prerendering.
  await connection();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("admin_users").select("role").eq("user_id", user.id).maybeSingle();
  if (!data) return null;

  return { id: user.id, email: user.email ?? "", role: data.role as AdminRole };
}

/**
 * Guard for every admin page and every admin server action (proxy.ts checks too; CLAUDE.md asks
 * for both). Sends people who are not admins to the admin login.
 */
export async function requireAdmin(options: { ownerOnly?: boolean } = {}): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  if (options.ownerOnly && admin.role !== "owner") redirect("/admin?error=owner-only");
  return admin;
}
