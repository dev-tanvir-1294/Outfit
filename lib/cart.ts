export interface CartLine {
  productId: number;
  name: string;
  price: string;
  quantity: number;
  image?: string;
  currency: string;
  options?: Record<string, string>;
}

export type AddToCartInput = Omit<CartLine, "quantity"> & {
  quantity?: number;
};

export function sameCartVariant(
  left: CartLine,
  right: Pick<CartLine, "productId" | "options">
): boolean {
  if (left.productId !== right.productId) return false;

  const leftOptions = Object.entries(left.options ?? {}).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const rightOptions = Object.entries(right.options ?? {}).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return JSON.stringify(leftOptions) === JSON.stringify(rightOptions);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce(
    (sum, line) => sum + parseFloat(line.price || "0") * line.quantity,
    0
  );
}
