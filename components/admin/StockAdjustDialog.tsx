"use client";

import { Boxes } from "lucide-react";
import { useActionState, useState } from "react";
import { adjustStock, type StockFormState } from "@/app/admin/(panel)/stock/actions";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/admin/ui/dialog";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { NativeSelect } from "@/components/admin/ui/native-select";
import { STOCK_ACTIONS } from "@/lib/schemas/admin";

type Props = { variantId: string; productName: string; onHand: number; /** Full-width button. */ block?: boolean };

export function StockAdjustDialog({ variantId, productName, onHand, block }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={block ? "default" : "sm"} className={block ? "w-full" : undefined} aria-label={`Update stock: ${productName}`}>
          <Boxes aria-hidden="true" />
          {block ? "Update stock" : (
            <>
              <span className="sm:hidden">Update</span>
              <span className="hidden sm:inline">Update stock</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{productName}</DialogTitle>
          <DialogDescription>
            <span className="font-semibold text-foreground tabular-nums">{Math.max(0, onHand)}</span> in stock now. Every change is logged with a reason.
          </DialogDescription>
        </DialogHeader>
        {/* Remounted each time the dialog opens, so it starts empty. */}
        {open && <StockForm variantId={variantId} onHand={onHand} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function StockForm({ variantId, onHand, onDone }: { variantId: string; onHand: number; onDone: () => void }) {
  const [state, action, pending] = useActionState<StockFormState, FormData>(adjustStock, {});
  const [kind, setKind] = useState<keyof typeof STOCK_ACTIONS>("restock");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  if (state.newLevel !== undefined) {
    return (
      <>
        <Alert>
          <AlertDescription>Saved. Stock is now {state.newLevel}.</AlertDescription>
        </Alert>
        <DialogFooter>
          <Button onClick={onDone}>Close</Button>
        </DialogFooter>
      </>
    );
  }

  const isCount = STOCK_ACTIONS[kind].mode === "set";

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="variantId" value={variantId} />
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-2">
        <Label htmlFor="action">What happened?</Label>
        <NativeSelect id="action" name="action" value={kind} onChange={(e) => setKind(e.target.value as keyof typeof STOCK_ACTIONS)}>
          {Object.entries(STOCK_ACTIONS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="quantity">{isCount ? "How many do you have?" : "How many?"}</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          aria-invalid={!!state.fieldErrors?.quantity}
          required
        />
        {state.fieldErrors?.quantity ? (
          <p className="text-sm text-destructive">{state.fieldErrors.quantity}</p>
        ) : isCount && quantity !== "" ? (
          <p className="text-xs text-muted-foreground">
            Change: {Number(quantity) - onHand >= 0 ? "+" : ""}
            {Number(quantity) - onHand}
          </p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Input id="note" name="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Supplier, order number, what was damaged…" />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}
