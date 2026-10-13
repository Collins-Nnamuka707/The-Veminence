import { notFound } from "next/navigation";

// Unknown storefront URLs render the localized not-found page.
export default function CatchAll() {
  notFound();
}
