import { Ban, CircleCheck, Clock, CreditCard, PackageOpen, ShoppingBag, Truck } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState, Panel } from "@/components/admin/Panel";

export const metadata: Metadata = { title: "Orders" };

const FLOW = [
  { icon: Clock, label: "Awaiting payment", text: "The customer is paying. Stock is held for them." },
  { icon: CreditCard, label: "Paid", text: "Stripe confirmed the payment." },
  { icon: PackageOpen, label: "Processing", text: "You are packing the order." },
  { icon: Truck, label: "Shipped", text: "Handed to InPost or the courier." },
  { icon: CircleCheck, label: "Delivered", text: "The customer has it." },
];

// Orders are stored once checkout writes them (docs/PLAN.md, step 4). Until then, paid orders and
// delivery details are visible in the Stripe dashboard.
export default function OrdersPage() {
  return (
    <>
      <PageHeader title="Orders" description="Every order with its status, items and delivery details." />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Panel title="All orders" icon={ShoppingBag} flush>
          <EmptyState icon={ShoppingBag} title="No orders yet">
            When a customer checks out, the order appears here straight away with what they bought and where it goes.
          </EmptyState>
        </Panel>
        <Panel title="How an order moves" description="You move it along as you pack and send it.">
          <ol className="grid gap-4">
            {FLOW.map(({ icon: Icon, label, text }, i) => (
              <li key={label} className="relative flex gap-3">
                {i < FLOW.length - 1 && <span className="absolute top-9 bottom-[-0.75rem] left-4 w-px bg-border" aria-hidden="true" />}
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-tint text-[#6b5e3f]" aria-hidden="true">
                  <Icon className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-xs text-muted-foreground">{text}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-5 flex gap-2 border-t pt-4 text-xs text-muted-foreground">
            <Ban className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            Unpaid orders expire on their own and the held stock goes back on sale.
          </p>
        </Panel>
      </div>
    </>
  );
}
