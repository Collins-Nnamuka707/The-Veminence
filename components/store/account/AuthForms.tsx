"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import {
  login,
  register,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  type AuthState,
} from "@/app/[locale]/account/actions";
import { Link } from "@/i18n/navigation";
import {
  forgotPasswordSchema,
  loginSchema,
  MIN_PASSWORD_LENGTH,
  profileSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/schemas/auth";
import { FormAlert } from "../forms/FormAlert";
import { PasswordField } from "../forms/PasswordField";
import { TextField } from "../forms/TextField";
import { useValidatedForm } from "../forms/useValidatedForm";

const idle: AuthState = { status: "idle" };

/** Field errors (client check first, then the server's) and the form-level error, translated. */
function useErrors(state: AuthState, clientErrors: Record<string, string> | null) {
  const t = useTranslations("Account.errors");
  const errors = clientErrors ?? (state.status === "error" ? (state.fieldErrors ?? {}) : {});
  const formError = state.status === "error" && !clientErrors ? state.formError : undefined;
  return {
    field: (name: string) => (errors[name] ? t(errors[name]) : undefined),
    alert: formError ? t(formError) : Object.keys(errors).length > 0 ? t("fixErrors") : undefined,
  };
}

function Submit({ pending, label, busy }: { pending: boolean; label: string; busy: string }) {
  return (
    <button type="submit" disabled={pending} className="btn-ink w-full disabled:opacity-60">
      {pending ? busy : label}
    </button>
  );
}

export function RegisterForm() {
  const t = useTranslations("Account");
  const [state, action, pending] = useActionState(register, idle);
  const form = useValidatedForm(registerSchema, { fullName: "", email: "", password: "" });
  const errors = useErrors(state, form.clientErrors);

  if (state.status === "done") {
    return (
      <FormAlert tone="success">
        <p className="font-medium">{t("register.checkEmailTitle")}</p>
        <p className="mt-1">{t("register.checkEmail", { email: form.values.email })}</p>
      </FormAlert>
    );
  }

  return (
    <form action={action} onSubmit={form.onSubmit} noValidate className="space-y-5">
      <input type="hidden" name="locale" value={form.locale} />
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      {errors.alert && <FormAlert>{errors.alert}</FormAlert>}
      <TextField name="fullName" label={t("fullName")} autoComplete="name"
        value={form.values.fullName} onValue={form.set("fullName")} error={errors.field("fullName")} />
      <TextField name="email" type="email" label={t("email")} autoComplete="email"
        value={form.values.email} onValue={form.set("email")} error={errors.field("email")} />
      <PasswordField name="password" label={t("password")} autoComplete="new-password"
        hint={t("passwordHint", { min: MIN_PASSWORD_LENGTH })}
        value={form.values.password} onValue={form.set("password")} error={errors.field("password")} />
      <Submit pending={pending} label={t("register.submit")} busy={t("register.busy")} />
      <p className="text-center text-sm">
        {t("register.haveAccount")}{" "}
        <Link href="/account/login" className="font-medium underline underline-offset-4">
          {t("login.submit")}
        </Link>
      </p>
    </form>
  );
}

export function LoginForm() {
  const t = useTranslations("Account");
  const params = useSearchParams();
  const [state, action, pending] = useActionState(login, idle);
  const form = useValidatedForm(loginSchema, { email: "", password: "" });
  const errors = useErrors(state, form.clientErrors);
  const next = params.get("next") ?? "";
  const linkFailed = params.get("error") === "link" && state.status === "idle";

  return (
    <form action={action} onSubmit={form.onSubmit} noValidate className="space-y-5">
      <input type="hidden" name="locale" value={form.locale} />
      <input type="hidden" name="next" value={next} />
      {linkFailed && <FormAlert>{t("errors.linkExpired")}</FormAlert>}
      {errors.alert && <FormAlert>{errors.alert}</FormAlert>}
      <TextField name="email" type="email" label={t("email")} autoComplete="email"
        value={form.values.email} onValue={form.set("email")} error={errors.field("email")} />
      <PasswordField name="password" label={t("password")} autoComplete="current-password"
        value={form.values.password} onValue={form.set("password")} error={errors.field("password")} />
      <p className="-mt-2 text-right text-sm">
        <Link href="/account/forgot-password" className="underline underline-offset-4">
          {t("login.forgot")}
        </Link>
      </p>
      <Submit pending={pending} label={t("login.submit")} busy={t("login.busy")} />
      <p className="text-center text-sm">
        {t("login.noAccount")}{" "}
        <Link href="/account/register" className="font-medium underline underline-offset-4">
          {t("register.submit")}
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const t = useTranslations("Account");
  const [state, action, pending] = useActionState(requestPasswordReset, idle);
  const form = useValidatedForm(forgotPasswordSchema, { email: "" });
  const errors = useErrors(state, form.clientErrors);

  if (state.status === "done") {
    return <FormAlert tone="success">{t("forgot.sent", { email: form.values.email })}</FormAlert>;
  }

  return (
    <form action={action} onSubmit={form.onSubmit} noValidate className="space-y-5">
      <input type="hidden" name="locale" value={form.locale} />
      {errors.alert && <FormAlert>{errors.alert}</FormAlert>}
      <TextField name="email" type="email" label={t("email")} autoComplete="email"
        value={form.values.email} onValue={form.set("email")} error={errors.field("email")} />
      <Submit pending={pending} label={t("forgot.submit")} busy={t("forgot.busy")} />
      <p className="text-center text-sm">
        <Link href="/account/login" className="underline underline-offset-4">
          {t("forgot.back")}
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const t = useTranslations("Account");
  const [state, action, pending] = useActionState(resetPassword, idle);
  const form = useValidatedForm(resetPasswordSchema, { password: "" });
  const errors = useErrors(state, form.clientErrors);
  const expired = state.status === "error" && state.formError === "linkExpired";

  return (
    <form action={action} onSubmit={form.onSubmit} noValidate className="space-y-5">
      <input type="hidden" name="locale" value={form.locale} />
      {errors.alert && (
        <FormAlert>
          {errors.alert}
          {expired && (
            <>
              {" "}
              <Link href="/account/forgot-password" className="font-medium underline underline-offset-4">
                {t("forgot.submit")}
              </Link>
            </>
          )}
        </FormAlert>
      )}
      <PasswordField name="password" label={t("newPassword")} autoComplete="new-password"
        hint={t("passwordHint", { min: MIN_PASSWORD_LENGTH })}
        value={form.values.password} onValue={form.set("password")} error={errors.field("password")} />
      <Submit pending={pending} label={t("reset.submit")} busy={t("reset.busy")} />
    </form>
  );
}

export function ProfileForm({ fullName, phone }: { fullName: string; phone: string }) {
  const t = useTranslations("Account");
  const [state, action, pending] = useActionState(updateProfile, idle);
  const form = useValidatedForm(profileSchema, { fullName, phone });
  const errors = useErrors(state, form.clientErrors);

  return (
    <form action={action} onSubmit={form.onSubmit} noValidate className="space-y-5">
      <input type="hidden" name="locale" value={form.locale} />
      {errors.alert && <FormAlert>{errors.alert}</FormAlert>}
      {state.status === "done" && <FormAlert tone="success">{t("profile.saved")}</FormAlert>}
      <TextField name="fullName" label={t("fullName")} autoComplete="name"
        value={form.values.fullName} onValue={form.set("fullName")} error={errors.field("fullName")} />
      <TextField name="phone" type="tel" label={t("phone")} autoComplete="tel" hint={t("profile.phoneHint")}
        value={form.values.phone} onValue={form.set("phone")} error={errors.field("phone")} />
      <button type="submit" disabled={pending} className="btn-ink disabled:opacity-60">
        {pending ? t("profile.busy") : t("profile.submit")}
      </button>
    </form>
  );
}
