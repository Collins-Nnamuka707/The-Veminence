"use client";

import { useEffect } from "react";
import { clearCart } from "@/lib/cart-store";

/** Empties the cart once a payment is confirmed. */
export function ClearCart() {
  useEffect(() => clearCart(), []);
  return null;
}
