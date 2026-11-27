"use client";

import { Archive, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteProduct } from "@/app/admin/(panel)/products/actions";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/admin/ui/dialog";
import type { AdminProduct } from "@/lib/admin/catalog";
import { type ProductNotice, useArchiveProduct } from "./ArchiveProductButton";

type Props = {
  productId: string;
  productName: string;
  photoCount: number;
  status: AdminProduct["status"];
  /** "icon" for the product list, "button" (icon and word) for the product page. */
  look?: "icon" | "button";
  onNotice?: (notice: ProductNotice) => void;
};

/** "Delete product" button with a confirmation; deleting cannot be undone, so it offers Archive. */
export function DeleteProductDialog({ productId, productName, photoCount, status, look = "button", onNotice }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const archive = useArchiveProduct({ productId, productName, status, onNotice });
  const busy = pending || archive.pending;

  function confirmDelete() {
    setError(undefined);
    startTransition(async () => {
      // On success the action redirects to the product list.
      const result = await deleteProduct(productId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        setOpen(next);
        if (!next) setError(undefined);
      }}
    >
      <DialogTrigger asChild>
        {look === "icon" ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${productName}`}
            title="Delete"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 aria-hidden="true" />
          </Button>
        ) : (
          <Button variant="destructive">
            <Trash2 aria-hidden="true" />
            Delete
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {productName}?</DialogTitle>
          <DialogDescription>
            This removes the product from the shop and the admin for good
            {photoCount > 0 ? `, with its ${photoCount === 1 ? "photo" : `${photoCount} photos`}` : ""}, stock history and price
            history. It can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        {!archive.archived && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
            <p className="min-w-0 flex-1 basis-48">
              Only want to hide it for now? <strong className="font-medium text-foreground">Archive</strong> it instead. You can
              restore it later.
            </p>
            <Button variant="outline" size="sm" disabled={busy} onClick={() => archive.toggle(() => setOpen(false))}>
              <Archive aria-hidden="true" />
              {archive.pending ? "Archiving…" : "Archive instead"}
            </Button>
          </div>
        )}
        {(error || archive.error) && (
          <Alert variant="destructive">
            <AlertDescription>{error ?? archive.error}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={busy}>
              Keep product
            </Button>
          </DialogClose>
          <Button onClick={confirmDelete} disabled={busy} className="bg-destructive text-white hover:bg-destructive/90">
            <Trash2 aria-hidden="true" />
            {pending ? "Deleting…" : "Delete for good"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
