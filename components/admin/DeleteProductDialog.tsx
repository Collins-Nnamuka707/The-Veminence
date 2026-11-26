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

type Props = { productId: string; productName: string; photoCount: number };

/** "Delete product" button with a confirmation; deleting cannot be undone. */
export function DeleteProductDialog({ productId, productName, photoCount }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

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
        if (pending) return;
        setOpen(next);
        if (!next) setError(undefined);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 aria-hidden="true" />
          Delete product
        </Button>
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
        <p className="flex gap-2 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
          <Archive className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Only want to hide it for now? Close this and set its status to <strong className="font-medium text-foreground">Archived</strong>{" "}
            instead. You can bring it back later.
          </span>
        </p>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={pending}>
              Keep product
            </Button>
          </DialogClose>
          <Button onClick={confirmDelete} disabled={pending} className="bg-destructive text-white hover:bg-destructive/90">
            <Trash2 aria-hidden="true" />
            {pending ? "Deleting…" : "Delete for good"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
