"use client";

import { useActionState } from "react";
import { adminLogin, type AdminLoginState } from "@/app/admin/actions";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";

export function LoginForm() {
  const [state, action, pending] = useActionState<AdminLoginState, FormData>(adminLogin, {});

  return (
    <form action={action} className="grid gap-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
