"use client";

import { useSyncExternalStore } from "react";
import { addToCart, parseCart, removeFromCart, setQuantity, type CartLine } from "./cart";

// The cart lives in localStorage so it survives reloads and is shared between tabs.
// useSyncExternalStore renders an empty cart on the server and swaps in the stored one
// after hydration, without hydration mismatches.

const STORAGE_KEY = "veminence-cart-v1";
const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedLines: CartLine[] = EMPTY;

function read(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): CartLine[] {
  const raw = read();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedLines = parseCart(raw);
  }
  return cachedLines;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function write(lines: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Storage unavailable (private mode, quota): keep the in-memory copy for this page.
    cachedRaw = null;
    cachedLines = lines;
  }
  listeners.forEach((listener) => listener());
}

/** Empties the cart (e.g. after a confirmed payment). */
export function clearCart() {
  write([]);
}

export function useCart() {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    lines,
    add: (id: string, quantity = 1) => write(addToCart(getSnapshot(), id, quantity)),
    setQuantity: (id: string, quantity: number) => write(setQuantity(getSnapshot(), id, quantity)),
    remove: (id: string) => write(removeFromCart(getSnapshot(), id)),
  };
}
