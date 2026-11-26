"use client";

import { CircleCheck, Eye, FileText, Scissors, Tag } from "lucide-react";
import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import { createProduct, updateProduct, type ProductFormState } from "@/app/admin/(panel)/products/actions";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { NativeSelect } from "@/components/admin/ui/native-select";
import { Textarea } from "@/components/admin/ui/textarea";
import { cn } from "@/lib/utils";
import { MoneyInput } from "./MoneyInput";
import { Panel } from "./Panel";

export type ProductFormValues = {
  nameEn: string;
  namePl: string;
  descriptionEn: string;
  descriptionPl: string;
  categoryId: string;
  productType: string;
  lengthInches: string;
  laceSize: string;
  density: string;
  colour: string;
  hairOrigin: string;
  status: string;
  isNew: boolean;
  allowPreorder: boolean;
  price: string;
  salePrice: string;
  sku: string;
  initialStock: string;
};

type Props = {
  mode: "create" | "edit";
  productId?: string;
  categories: { id: string; name: string }[];
  initial: ProductFormValues;
};

const STATUSES = [
  { value: "published", label: "Published", help: "In the shop and can be bought." },
  { value: "coming_soon", label: "Coming soon", help: "In the shop, but can't be bought yet." },
  { value: "draft", label: "Draft", help: "Hidden while you prepare it." },
  { value: "archived", label: "Archived", help: "Hidden; kept for your records." },
];

const TYPE_LABELS: Record<string, string> = {
  wig: "Wig",
  bundle: "Bundle / extensions",
  closure: "Closure",
  frontal: "Frontal",
};

// Suggestions only: any value can be typed.
const SUGGESTIONS = {
  laceSize: ["4x4", "5x5", "6x6", "13x4", "13x6", "360", "Full lace"],
  density: ["150%", "180%", "200%", "250%"],
  colour: ["Natural black", "1B", "Dark brown", "Honey blonde 27", "613 blonde"],
  hairOrigin: ["Brazilian", "Peruvian", "Malaysian", "Indian", "Vietnamese"],
};

export function ProductForm({ mode, productId, categories, initial }: Props) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(
    mode === "create" ? createProduct : updateProduct,
    {},
  );
  // Controlled fields keep what was typed when the server returns an error.
  const [values, setValues] = useState(initial);
  // What was last saved, so the bar can say whether there are unsaved changes.
  const [savedValues, setSavedValues] = useState(initial);
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state.saved) setSavedValues(values);
  }
  const dirty = JSON.stringify(values) !== JSON.stringify(savedValues);

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));
  const error = (name: keyof ProductFormValues) => state.fieldErrors?.[name];
  const needsLace = values.productType === "closure" || values.productType === "frontal";

  return (
    <form action={action} className="grid gap-6">
      {productId && <input type="hidden" name="productId" value={productId} />}
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state.fieldErrors && (
        <Alert variant="destructive">
          <AlertDescription>Please correct the highlighted fields.</AlertDescription>
        </Alert>
      )}

      <Panel title="Name and description" icon={FileText} description="Write in English. Polish is optional: Polish pages show the English text until you add it.">
        <div className="grid gap-5">
          <Field label="Name" name="nameEn" error={error("nameEn")} hint='For example "Amelia 24" Straight Lace Front".'>
            <Input id="nameEn" name="nameEn" value={values.nameEn} onChange={(e) => set("nameEn", e.target.value)} aria-invalid={!!error("nameEn")} required />
          </Field>
          <Field label="Description" name="descriptionEn" error={error("descriptionEn")} hint="How it looks and feels, cap and lace details, care tips.">
            <Textarea id="descriptionEn" name="descriptionEn" rows={5} value={values.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} aria-invalid={!!error("descriptionEn")} />
          </Field>
          <details className="group rounded-lg bg-muted/60 px-4 py-3 open:pb-4">
            <summary className="cursor-pointer text-sm font-medium">
              Polish text <span className="font-normal text-muted-foreground">(optional)</span>
            </summary>
            <div className="mt-4 grid gap-5">
              <Field label="Name in Polish" name="namePl" error={error("namePl")}>
                <Input id="namePl" name="namePl" lang="pl" value={values.namePl} onChange={(e) => set("namePl", e.target.value)} />
              </Field>
              <Field label="Description in Polish" name="descriptionPl" error={error("descriptionPl")}>
                <Textarea id="descriptionPl" name="descriptionPl" lang="pl" rows={4} value={values.descriptionPl} onChange={(e) => set("descriptionPl", e.target.value)} />
              </Field>
            </div>
          </details>
        </div>
      </Panel>

      <Panel title="Hair details" icon={Scissors} description='Shown on the product page. A 12" and a 16" version are separate products.'>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Type" name="productType" error={error("productType")}>
            <NativeSelect id="productType" name="productType" value={values.productType} onChange={(e) => set("productType", e.target.value)} aria-invalid={!!error("productType")}>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Texture" name="categoryId" error={error("categoryId")}>
            <NativeSelect id="categoryId" name="categoryId" value={values.categoryId} onChange={(e) => set("categoryId", e.target.value)} aria-invalid={!!error("categoryId")}>
              <option value="">Choose…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Length (inches)" name="lengthInches" error={error("lengthInches")} hint="For example 12, 16 or 24.">
            <Input id="lengthInches" name="lengthInches" type="number" min={4} max={40} step={1} inputMode="numeric" value={values.lengthInches} onChange={(e) => set("lengthInches", e.target.value)} aria-invalid={!!error("lengthInches")} required />
          </Field>
          <SuggestField label="Lace / closure size" optional={!needsLace} name="laceSize" value={values.laceSize} onValue={(v) => set("laceSize", v)} error={error("laceSize")} hint="For example 5x5, 13x4 or 360." suggestions={SUGGESTIONS.laceSize} />
          <SuggestField label="Density" optional name="density" value={values.density} onValue={(v) => set("density", v)} error={error("density")} suggestions={SUGGESTIONS.density} />
          <SuggestField label="Colour" optional name="colour" value={values.colour} onValue={(v) => set("colour", v)} error={error("colour")} suggestions={SUGGESTIONS.colour} />
          <SuggestField label="Hair origin" optional name="hairOrigin" value={values.hairOrigin} onValue={(v) => set("hairOrigin", v)} error={error("hairOrigin")} suggestions={SUGGESTIONS.hairOrigin} />
        </div>
      </Panel>

      <Panel title="Price" icon={Tag} description="Final prices in złoty (you are not VAT registered, so no VAT is added).">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Price (zł)" name="price" error={error("price")} hint="For example 1299 or 1299,00.">
            <MoneyInput id="price" name="price" value={values.price} onChange={(v) => set("price", v)} invalid={!!error("price")} required />
          </Field>
          <Field label="Sale price (zł)" name="salePrice" optional error={error("salePrice")} hint="Leave empty for no sale. The 30-day lowest price is tracked for you.">
            <MoneyInput id="salePrice" name="salePrice" value={values.salePrice} onChange={(v) => set("salePrice", v)} invalid={!!error("salePrice")} />
          </Field>
          <Field label="SKU" name="sku" optional error={error("sku")} hint="Your own product code.">
            <Input id="sku" name="sku" value={values.sku} onChange={(e) => set("sku", e.target.value)} aria-invalid={!!error("sku")} />
          </Field>
          {mode === "create" && (
            <Field label="Stock on hand" name="initialStock" error={error("initialStock")} hint="How many you have now. Later changes go through Stock.">
              <Input id="initialStock" name="initialStock" type="number" min={0} step={1} inputMode="numeric" value={values.initialStock} onChange={(e) => set("initialStock", e.target.value)} aria-invalid={!!error("initialStock")} />
            </Field>
          )}
        </div>
      </Panel>

      <Panel title="Visibility" icon={Eye} description="Who can see and buy this product.">
        <fieldset>
          <legend className="sr-only">Status</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {STATUSES.map((s) => (
              <label
                key={s.value}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-lg p-4 ring-1 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring",
                  values.status === s.value ? "bg-gold-tint/70 ring-gold-dark" : "ring-foreground/10 hover:bg-muted/50",
                )}
              >
                <input
                  type="radio"
                  name="status"
                  value={s.value}
                  checked={values.status === s.value}
                  onChange={() => set("status", s.value)}
                  className="mt-0.5 size-4 accent-ink"
                />
                <span>
                  <span className="block text-sm font-semibold">{s.label}</span>
                  <span className="block text-xs text-muted-foreground">{s.help}</span>
                </span>
              </label>
            ))}
          </div>
          {error("status") && <p className="mt-2 text-sm text-destructive">{error("status")}</p>}
        </fieldset>
        <div className="mt-5 grid gap-3 border-t pt-5">
          <Checkbox name="isNew" checked={values.isNew} onChange={(v) => set("isNew", v)} label="Show in New in" help="Listed on the New in page." />
          <Checkbox name="allowPreorder" checked={values.allowPreorder} onChange={(v) => set("allowPreorder", v)} label="Allow pre-orders when sold out" help="Customers can still order it with 0 in stock." />
        </div>
      </Panel>

      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ink py-3 pr-3 pl-5 text-white shadow-lg">
        <p className="flex items-center gap-2 text-sm" role="status">
          {pending ? (
            "Saving…"
          ) : state.saved && !dirty ? (
            <>
              <CircleCheck className="size-4 text-gold" aria-hidden="true" />
              Saved. The shop shows the changes straight away.
            </>
          ) : dirty || mode === "create" ? (
            mode === "create" ? "New product" : "You have unsaved changes"
          ) : (
            <span className="text-white/70">No changes</span>
          )}
        </p>
        <div className="flex gap-2">
          <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            <Link href="/admin/products">{mode === "create" ? "Cancel" : "Back"}</Link>
          </Button>
          <Button type="submit" disabled={pending || (mode === "edit" && !dirty)} className="bg-gold font-semibold text-ink hover:bg-gold/85">
            {pending ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  hint,
  optional,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid content-start gap-2">
      <Label htmlFor={name}>
        {label}
        {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function SuggestField({
  label,
  name,
  value,
  onValue,
  error,
  hint,
  optional,
  suggestions,
}: {
  label: string;
  name: string;
  value: string;
  onValue: (value: string) => void;
  error?: string;
  hint?: string;
  optional?: boolean;
  suggestions: string[];
}) {
  return (
    <Field label={label} name={name} error={error} hint={hint} optional={optional}>
      <Input id={name} name={name} list={`${name}-options`} value={value} onChange={(e) => onValue(e.target.value)} aria-invalid={!!error} />
      <datalist id={`${name}-options`}>
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </Field>
  );
}

function Checkbox({
  name,
  checked,
  onChange,
  label,
  help,
}: {
  name: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  help: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-4 accent-ink" />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{help}</span>
      </span>
    </label>
  );
}
