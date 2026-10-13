import type { InputHTMLAttributes, ReactNode } from "react";

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  name: string;
  label: string;
  value: string;
  onValue: (value: string) => void;
  error?: string;
  hint?: ReactNode;
};

export function TextField({
  name,
  label,
  value,
  onValue,
  error,
  hint,
  type = "text",
  className = "",
  ...rest
}: TextFieldProps) {
  const id = `field-${name}`;
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onValue(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`mt-1 block min-h-11 w-full rounded-full border bg-cream px-4 ${
          error ? "border-sale" : "border-muted"
        } ${className}`}
        {...rest}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-sale">
          {error}
        </p>
      )}
    </div>
  );
}
