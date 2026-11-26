"use client";

import { Boxes, CircleCheck, MessageCircle, Package, Store, Truck, type LucideIcon } from "lucide-react";
import { useActionState, useState, type ReactNode } from "react";
import { updateSettings, type SettingsFormState } from "@/app/admin/(panel)/settings/actions";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { MoneyInput } from "./MoneyInput";
import { Panel } from "./Panel";

export type SettingsFormValues = {
  feeInpostLocker: string;
  feeCourier: string;
  feePickup: string;
  whatsappNumber: string;
  lowStockThreshold: string;
};

const FEES: { name: "feeInpostLocker" | "feeCourier" | "feePickup"; icon: LucideIcon; label: string; help: string }[] = [
  { name: "feeInpostLocker", icon: Package, label: "InPost parcel locker", help: "Customer picks the parcel up from a locker." },
  { name: "feeCourier", icon: Truck, label: "Courier to the door", help: "Delivered to the customer's address." },
  { name: "feePickup", icon: Store, label: "Personal pickup", help: "Customer collects the order from you. 0 shows as Free." },
];

export function SettingsForm({ initial }: { initial: SettingsFormValues }) {
  const [state, action, pending] = useActionState<SettingsFormState, FormData>(updateSettings, {});
  const [values, setValues] = useState(initial);
  const [savedValues, setSavedValues] = useState(initial);
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state.saved) setSavedValues(values);
  }
  const dirty = JSON.stringify(values) !== JSON.stringify(savedValues);
  const set = (name: keyof SettingsFormValues, value: string) => setValues((v) => ({ ...v, [name]: value }));
  const error = (name: keyof SettingsFormValues) => state.fieldErrors?.[name];

  return (
    <form action={action} className="grid gap-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <Panel title="Delivery fees" description="Added to the order total at checkout. Use 0 for free delivery." icon={Truck} flush>
          <ul className="divide-y">
            {FEES.map(({ name, icon: Icon, label, help }) => (
              <li key={name} className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_9rem] sm:items-center">
                <div className="flex min-w-0 gap-3">
                  <Icon className="mt-0.5 size-4.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="min-w-0">
                    <Label htmlFor={name}>{label}</Label>
                    <p id={`${name}-help`} className="mt-0.5 text-xs text-muted-foreground">
                      {help}
                    </p>
                  </div>
                </div>
                <div className="grid gap-1.5 pl-7.5 sm:pl-0">
                  <MoneyInput
                    id={name}
                    name={name}
                    value={values[name]}
                    onChange={(v) => set(name, v)}
                    invalid={!!error(name)}
                    describedBy={error(name) ? `${name}-error` : `${name}-help`}
                    required
                  />
                  {error(name) && (
                    <p id={`${name}-error`} className="text-sm text-destructive">
                      {error(name)}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Shop details" icon={Store}>
          <div className="grid gap-5">
            <Field
              icon={MessageCircle}
              label="WhatsApp contact number"
              name="whatsappNumber"
              error={error("whatsappNumber")}
              hint="Shown as the WhatsApp link in the shop footer. International format, e.g. +48 600 100 200."
            >
              <Input
                id="whatsappNumber"
                name="whatsappNumber"
                type="tel"
                autoComplete="off"
                value={values.whatsappNumber}
                onChange={(e) => set("whatsappNumber", e.target.value)}
                aria-invalid={!!error("whatsappNumber")}
                aria-describedby="whatsappNumber-note"
                required
              />
            </Field>
            <Field
              icon={Boxes}
              label={'"Running low" warning at'}
              name="lowStockThreshold"
              error={error("lowStockThreshold")}
              hint="Products with this many or fewer in stock are marked Low on the Stock page."
            >
              <Input
                id="lowStockThreshold"
                name="lowStockThreshold"
                type="number"
                min={0}
                max={100}
                step={1}
                inputMode="numeric"
                className="w-28"
                value={values.lowStockThreshold}
                onChange={(e) => set("lowStockThreshold", e.target.value)}
                aria-invalid={!!error("lowStockThreshold")}
                aria-describedby="lowStockThreshold-note"
                required
              />
            </Field>
          </div>
        </Panel>
      </div>

      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ink py-3 pr-3 pl-5 text-white shadow-lg">
        <p className="flex items-center gap-2 text-sm" role="status">
          {pending ? (
            "Saving…"
          ) : state.saved && !dirty ? (
            <>
              <CircleCheck className="size-4 text-gold" aria-hidden="true" />
              Saved. Checkout uses the new fees straight away.
            </>
          ) : state.fieldErrors && dirty ? (
            "Please correct the highlighted fields"
          ) : dirty ? (
            "You have unsaved changes"
          ) : (
            <span className="text-white/70">No changes</span>
          )}
        </p>
        <div className="flex gap-2">
          {dirty && (
            <Button type="button" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => setValues(savedValues)}>
              Undo
            </Button>
          )}
          <Button type="submit" disabled={pending || !dirty} className="bg-gold font-semibold text-ink hover:bg-gold/85">
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({
  icon: Icon,
  label,
  name,
  error,
  hint,
  children,
}: {
  icon: LucideIcon;
  label: string;
  name: string;
  error?: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="grid content-start gap-2">
      <Label htmlFor={name} className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        {label}
      </Label>
      {children}
      <p id={`${name}-note`} className={error ? "text-sm text-destructive" : "text-xs text-muted-foreground"}>
        {error ?? hint}
      </p>
    </div>
  );
}
