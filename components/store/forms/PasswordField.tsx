"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { TextField, type TextFieldProps } from "./TextField";

/** Password input with a show/hide toggle. */
export function PasswordField(props: Omit<TextFieldProps, "type">) {
  const t = useTranslations("Account");
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <TextField {...props} type={visible ? "text" : "password"} className="pr-20" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        className="absolute top-7 right-2 flex min-h-11 items-center rounded-full px-3 text-sm underline underline-offset-4"
      >
        {visible ? t("hidePassword") : t("showPassword")}
      </button>
    </div>
  );
}
