"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminLoginState = { error?: string };

const loginSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }),
  password: z.string().min(1, { error: "Enter your password." }),
});

export async function adminLogin(_prev: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Admin login isn't available: Supabase is not configured." };

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    console.error(`Admin login: Supabase refused the request (code=${error?.code}).`);
    return { error: error?.code === "email_not_confirmed" ? "Please confirm your email first." : "Incorrect email or password." };
  }

  const { data: role } = await supabase.from("admin_users").select("role").eq("user_id", data.user.id).maybeSingle();
  if (!role) {
    // A customer account: don't leave it signed in on the admin.
    await supabase.auth.signOut();
    return { error: "This account doesn't have admin access." };
  }

  redirect("/admin");
}

export async function adminLogout() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}
