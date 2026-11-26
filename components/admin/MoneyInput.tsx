import { Input } from "@/components/admin/ui/input";

/** Text field for an amount in złoty, with "zł" shown inside on the right. */
export function MoneyInput({
  id,
  name,
  value,
  onChange,
  invalid,
  required,
  describedBy,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  required?: boolean;
  /** Id of the hint or error text below the field. */
  describedBy?: string;
}) {
  return (
    <div className="relative">
      <Input id={id} name={name} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} required={required} className="pr-10" />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden="true">
        zł
      </span>
    </div>
  );
}
