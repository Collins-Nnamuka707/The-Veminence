import { Boxes, MessageCircle, Package, Store, Truck } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, PageSkeleton } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/admin/auth";
import { formatPriceInput } from "@/lib/admin/price-input";
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
  const admin = await requireAdmin();
  const settings = await getStoreSettings();

  if (admin.role === "owner") {
    return (
      <>
        <PageHeader title="Settings" description="Delivery fees and shop details used by the storefront." />
        <SettingsForm
          initial={{
            feeInpostLocker: formatPriceInput(settings.deliveryFees.inpost_locker),
            feeCourier: formatPriceInput(settings.deliveryFees.courier),
            feePickup: formatPriceInput(settings.deliveryFees.pickup),
            whatsappNumber: settings.whatsappNumber,
            lowStockThreshold: String(settings.lowStockThreshold),
          }}
        />
      </>
    );
  }

  // Staff see the settings but cannot change them (only the owner can, in the database too).
  const fees = [
    { icon: Package, label: "InPost parcel locker", value: settings.deliveryFees.inpost_locker },
    { icon: Truck, label: "Courier to the door", value: settings.deliveryFees.courier },
    { icon: Store, label: "Personal pickup", value: settings.deliveryFees.pickup },
  ];

  return (
    <>
      <PageHeader title="Settings" description="Delivery fees and shop details. Only the shop owner can change them." />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Panel title="Delivery fees" description="Added to the order total at checkout." icon={Truck} flush>
          <ul className="divide-y">
            {fees.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-center gap-3 px-5 py-4">
                <Icon className="size-4.5 text-muted-foreground" aria-hidden="true" />
                <span className="flex-1 text-sm">{label}</span>
                <span className="text-sm font-semibold tabular-nums">{value === 0 ? "Free" : formatPrice(value)}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Shop" icon={Store} flush>
          <ul className="divide-y">
            <li className="flex items-center gap-3 px-5 py-4">
              <MessageCircle className="size-4.5 text-muted-foreground" aria-hidden="true" />
              <span className="flex-1 text-sm">WhatsApp contact number</span>
              <span className="text-sm font-semibold tabular-nums">{settings.whatsappNumber || "Not set"}</span>
            </li>
            <li className="flex items-center gap-3 px-5 py-4">
              <Boxes className="size-4.5 text-muted-foreground" aria-hidden="true" />
              <span className="flex-1 text-sm">&quot;Running low&quot; warning at</span>
              <span className="text-sm font-semibold tabular-nums">{settings.lowStockThreshold} or fewer</span>
            </li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
