"use client";

import { useActionState, useState, type ReactNode } from "react";
import { createProduct, updateProduct, type ProductFormState } from "@/app/admin/(panel)/products/actions";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Textarea } from "@/components/admin/ui/textarea";

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

const STATUS_HELP: Record<string, string> = {
  draft: "Hidden from the shop while you prepare it.",
  published: "Visible in the shop and can be bought.",
  coming_soon: "Visible in the shop, but can't be bought yet.",
  archived: "Hidden from the shop; kept for your records.",
};

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

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

export function ProductForm({ mode, productId, categories, initial }: Props) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(
    mode === "create" ? createProduct : updateProduct,
    {},
  );
  // Controlled fields keep what was typed when the server returns an error.
  const [values, setValues] = useState(initial);
  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));
  const error = (name: keyof ProductFormValues) => state.fieldErrors?.[name];

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
      {state.saved && (
        <Alert>
          <AlertDescription>Saved. The shop shows the changes straight away.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Product</CardTitle>
          <CardDescription>Write in English. Polish is optional: Polish pages show the English text until you add it.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field label="Name" name="nameEn" error={error("nameEn")}>
            <Input id="nameEn" name="nameEn" value={values.nameEn} onChange={(e) => set("nameEn", e.target.value)} aria-invalid={!!error("nameEn")} required />
          </Field>
          <Field label="Description" name="descriptionEn" error={error("descriptionEn")} hint="Hair type, length, cap and lace details, care tips.">
            <Textarea id="descriptionEn" name="descriptionEn" rows={5} value={values.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} aria-invalid={!!error("descriptionEn")} />
          </Field>
          <details className="rounded-md border p-3">
            <summary className="cursor-pointer text-sm font-medium">Polish text (optional)</summary>
            <div className="mt-4 grid gap-4">
              <Field label="Name in Polish" name="namePl" error={error("namePl")}>
                <Input id="namePl" name="namePl" value={values.namePl} onChange={(e) => set("namePl", e.target.value)} />
              </Field>
              <Field label="Description in Polish" name="descriptionPl" error={error("descriptionPl")}>
                <Textarea id="descriptionPl" name="descriptionPl" rows={4} value={values.descriptionPl} onChange={(e) => set("descriptionPl", e.target.value)} />
              </Field>
            </div>
          </details>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status" name="status" error={error("status")} hint={STATUS_HELP[values.status]}>
              <select id="status" name="status" className={selectClass} value={values.status} onChange={(e) => set("status", e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="coming_soon">Coming soon</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </div>
          <div className="grid gap-2">
            <Checkbox name="isNew" checked={values.isNew} onChange={(v) => set("isNew", v)} label="Show in New in" />
            <Checkbox name="allowPreorder" checked={values.allowPreorder} onChange={(v) => set("allowPreorder", v)} label="Allow pre-orders when sold out" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hair details</CardTitle>
          <CardDescription>Shown on the product page. A 12&quot; and a 16&quot; version are separate products.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Type" name="productType" error={error("productType")}>
            <select id="productType" name="productType" className={selectClass} value={values.productType} onChange={(e) => set("productType", e.target.value)} aria-invalid={!!error("productType")}>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Texture" name="categoryId" error={error("categoryId")}>
            <select id="categoryId" name="categoryId" className={selectClass} value={values.categoryId} onChange={(e) => set("categoryId", e.target.value)} aria-invalid={!!error("categoryId")}>
              <option value="">Choose…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Length (inches)" name="lengthInches" error={error("lengthInches")} hint='For example 12, 16 or 24.'>
            <Input id="lengthInches" name="lengthInches" type="number" min={4} max={40} step={1} inputMode="numeric" value={values.lengthInches} onChange={(e) => set("lengthInches", e.target.value)} aria-invalid={!!error("lengthInches")} required />
          </Field>
          <SuggestField label={values.productType === "closure" || values.productType === "frontal" ? "Lace size" : "Lace / closure size (optional)"} name="laceSize" value={values.laceSize} onValue={(v) => set("laceSize", v)} error={error("laceSize")} hint="For example 5x5, 13x4 or 360." suggestions={SUGGESTIONS.laceSize} />
          <SuggestField label="Density (optional)" name="density" value={values.density} onValue={(v) => set("density", v)} error={error("density")} suggestions={SUGGESTIONS.density} />
          <SuggestField label="Colour (optional)" name="colour" value={values.colour} onValue={(v) => set("colour", v)} error={error("colour")} suggestions={SUGGESTIONS.colour} />
          <SuggestField label="Hair origin (optional)" name="hairOrigin" value={values.hairOrigin} onValue={(v) => set("hairOrigin", v)} error={error("hairOrigin")} suggestions={SUGGESTIONS.hairOrigin} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Price and stock</CardTitle>
          <CardDescription>Final prices in złoty (you are not VAT registered, so no VAT is added).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Price (zł)" name="price" error={error("price")} hint="For example 1299 or 1299,00.">
            <Input id="price" name="price" inputMode="decimal" value={values.price} onChange={(e) => set("price", e.target.value)} aria-invalid={!!error("price")} required />
          </Field>
          <Field label="Sale price (zł)" name="salePrice" error={error("salePrice")} hint="Leave empty for no sale. The 30-day lowest price is tracked for you.">
            <Input id="salePrice" name="salePrice" inputMode="decimal" value={values.salePrice} onChange={(e) => set("salePrice", e.target.value)} aria-invalid={!!error("salePrice")} />
          </Field>
          <Field label="SKU (optional)" name="sku" error={error("sku")} hint="Your own product code.">
            <Input id="sku" name="sku" value={values.sku} onChange={(e) => set("sku", e.target.value)} aria-invalid={!!error("sku")} />
          </Field>
          {mode === "create" && (
            <Field label="Stock on hand" name="initialStock" error={error("initialStock")} hint="How many you have now. Later changes go through Stock.">
              <Input id="initialStock" name="initialStock" type="number" min={0} step={1} value={values.initialStock} onChange={(e) => set("initialStock", e.target.value)} aria-invalid={!!error("initialStock")} />
            </Field>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, name, error, hint, children }: { label: string; name: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
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
  suggestions,
}: {
  label: string;
  name: string;
  value: string;
  onValue: (value: string) => void;
  error?: string;
  hint?: string;
  suggestions: string[];
}) {
  return (
    <Field label={label} name={name} error={error} hint={hint}>
      <Input id={name} name={name} list={`${name}-options`} value={value} onChange={(e) => onValue(e.target.value)} aria-invalid={!!error} />
      <datalist id={`${name}-options`}>
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </Field>
  );
}

function Checkbox({ name, checked, onChange, label }: { name: string; checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-primary" />
      {label}
    </label>
  );
}
