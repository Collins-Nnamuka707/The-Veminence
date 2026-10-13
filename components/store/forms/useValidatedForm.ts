"use client";

import { useLocale } from "next-intl";
import { useState, type FormEvent } from "react";
import type { z } from "zod";
import { fieldErrors } from "@/lib/schemas/errors";

/**
 * Controlled form values plus the same Zod check the server runs, so mistakes show up before
 * the round trip and typed values survive a server-side error.
 */
export function useValidatedForm<T extends Record<string, string>>(schema: z.ZodType, initial: T) {
  const locale = useLocale();
  const [values, setValues] = useState<T>(initial);
  const [clientErrors, setClientErrors] = useState<Record<string, string> | null>(null);

  const set = (name: keyof T) => (value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (clientErrors?.[name as string]) {
      setClientErrors(Object.fromEntries(Object.entries(clientErrors).filter(([key]) => key !== name)));
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const parsed = schema.safeParse({ ...values, locale });
    if (parsed.success) {
      setClientErrors(null);
      return;
    }
    event.preventDefault();
    const found = fieldErrors(parsed.error);
    setClientErrors(found);
    event.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)?.focus();
  };

  return { values, set, clientErrors, onSubmit, locale };
}
