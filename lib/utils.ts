export function cn(
  ...classes: (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(
  price: string | number | undefined | null,
  currency = "USD"
): string {
  const amount =
    typeof price === "string" ? parseFloat(price) : (price ?? 0);

  if (Number.isNaN(amount)) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function displayPrice(product: {
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
}): string {
  if (product.on_sale && product.sale_price) return product.sale_price;
  if (product.regular_price) return product.regular_price;
  return product.price;
}
