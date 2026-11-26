import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, PageSkeleton } from "@/components/admin/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { requireAdmin } from "@/lib/admin/auth";
import { getStoreSettings } from "@/lib/data/settings";
import { formatPrice } from "@/lib/money";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  await requireAdmin();
  const settings = await getStoreSettings();
  const rows = [
    ["InPost parcel locker", formatPrice(settings.deliveryFees.inpost_locker)],
    ["Courier", formatPrice(settings.deliveryFees.courier)],
    ["Personal pickup", formatPrice(settings.deliveryFees.pickup)],
  ];

  return (
    <>
      <PageHeader title="Settings" description="Delivery fees and shop details used by the storefront." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Delivery fees</CardTitle>
            <CardDescription>Added to the order total at checkout.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="divide-y text-sm">
              {rows.map(([label, value]) => (
                <div key={label} className="flex justify-between py-2">
                  <dt>{label}</dt>
                  <dd className="tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Shop</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y text-sm">
              <div className="flex justify-between gap-4 py-2">
                <dt>WhatsApp contact number</dt>
                <dd>{settings.whatsappNumber}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2">
                <dt>&quot;Low stock&quot; at</dt>
                <dd>{settings.lowStockThreshold} or fewer</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
