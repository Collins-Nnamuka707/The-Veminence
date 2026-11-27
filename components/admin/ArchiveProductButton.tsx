"use client";

import { Archive, ArchiveRestore } from "lucide-react";
import { useState, useTransition } from "react";
import { setProductStatus } from "@/app/admin/(panel)/products/actions";
import type { AdminProduct } from "@/lib/admin/catalog";
import { Button } from "./ui/button";

type Status = AdminProduct["status"];

/** A message about an archive, restore or delete, with an optional Undo. */
export type ProductNotice = { text: string; tone?: "success" | "error"; undo?: () => Promise<{ error?: string }> };

type Props = {
  productId: string;
  productName: string;
  status: Status;
  /** "icon" for the product list, "button" (icon and word) for the product page. */
  look?: "icon" | "button";
  onNotice?: (notice: ProductNotice) => void;
};

/**
 * Archive hides a product from the shop and keeps everything (photos, stock, price history).
 * On an archived product the same button restores it as a draft, ready to publish again.
 */
export function useArchiveProduct({ productId, productName, status, onNotice }: Omit<Props, "look">) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const archived = status === "archived";

  function toggle(afterSuccess?: () => void) {
    setError(undefined);
    startTransition(async () => {
      const result = await setProductStatus(productId, archived ? "draft" : "archived");
      if (result.error) {
        setError(result.error);
        onNotice?.({ text: result.error, tone: "error" });
        return;
      }
      afterSuccess?.();
      onNotice?.(
        archived
          ? { text: `${productName} is back as a draft. Set it to Published when you want it in the shop again.`, tone: "success" }
          : {
              text: `${productName} is archived and hidden from the shop.`,
              tone: "success",
              undo: () => setProductStatus(productId, status),
            },
      );
    });
  }

  return { archived, pending, error, toggle };
}

export function ArchiveProductButton({ look = "icon", ...props }: Props) {
  const { archived, pending, error, toggle } = useArchiveProduct(props);
  const label = archived ? `Restore ${props.productName}` : `Archive ${props.productName}`;
  const Icon = archived ? ArchiveRestore : Archive;

  if (look === "icon") {
    return (
      <Button variant="ghost" size="icon" aria-label={label} title={archived ? "Restore" : "Archive"} disabled={pending} onClick={() => toggle()}>
        <Icon className={pending ? "animate-pulse" : undefined} aria-hidden="true" />
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" disabled={pending} onClick={() => toggle()}>
        <Icon aria-hidden="true" />
        {pending ? (archived ? "Restoring…" : "Archiving…") : archived ? "Restore" : "Archive"}
      </Button>
      {error && (
        <p className="basis-full text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
