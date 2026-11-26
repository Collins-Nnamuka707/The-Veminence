import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/admin/ui/card";

export const metadata: Metadata = { title: "Orders" };

// Orders are stored once checkout writes them (docs/PLAN.md, step 4). Until then, paid orders and
// delivery details are visible in the Stripe dashboard.
export default function OrdersPage() {
  return (
    <>
      <PageHeader title="Orders" />
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No orders yet. Orders will be listed here with their status, items and delivery details.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
