"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  cartCount,
  cartSubtotal,
  sameCartVariant,
  type AddToCartInput,
  type CartLine,
} from "@/lib/cart";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  addItem: (item: AddToCartInput) => void;
  removeItem: (productId: number, options?: Record<string, string>) => void;
  updateQuantity: (
    productId: number,
    quantity: number,
    options?: Record<string, string>
  ) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "woo-cart";
const EMPTY_LINES: CartLine[] = [];

let currentLines: CartLine[] | null = null;
const listeners = new Set<() => void>();

function readStoredLines(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as CartLine[];
    }
  } catch {
    // ignore corrupt or unavailable storage
  }
  return [];
}

function getSnapshot(): CartLine[] {
  if (currentLines === null) {
    currentLines = readStoredLines();
  }
  return currentLines;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY_LINES;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  for (const listener of listeners) listener();
}

function setLines(next: CartLine[]) {
  currentLines = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore write errors
  }
  emit();
}

export function CartProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback((item: AddToCartInput) => {
    const quantity = item.quantity ?? 1;
    const current = getSnapshot();
    const existing = current.find((line) => sameCartVariant(line, item));
    const next = existing
      ? current.map((line) =>
          sameCartVariant(line, item)
            ? { ...line, quantity: line.quantity + quantity }
            : line
        )
      : [...current, { ...item, quantity }];
    setLines(next);
  }, []);

  const removeItem = useCallback((productId: number, options?: Record<string, string>) => {
    setLines(
      getSnapshot().filter(
        (line) => !sameCartVariant(line, { productId, options })
      )
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: number, quantity: number, options?: Record<string, string>) => {
      setLines(
        getSnapshot().map((line) =>
          sameCartVariant(line, { productId, options })
            ? { ...line, quantity: Math.max(1, quantity) }
            : line
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setLines([]);
  }, []);

  const value: CartContextValue = {
    lines,
    count: cartCount(lines),
    subtotal: cartSubtotal(lines),
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
