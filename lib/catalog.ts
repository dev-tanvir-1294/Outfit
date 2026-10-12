import { products as mockProducts, type MockProduct } from "./mock-data";
import {
  getProductBySlug,
  getStoreCurrency,
  isWooCommerceConfigured,
  listProducts,
} from "./woocommerce";
import { stripHtml } from "./utils";
import type { WooProduct } from "./types";

export interface StoreProduct extends MockProduct {
  id: number;
}

function mockToStore(product: MockProduct, index: number): StoreProduct {
  return { ...product, id: index + 1 };
}

function mapWooProduct(product: WooProduct): StoreProduct {
  const currency = getStoreCurrency();
  const toImageUrl = (src: string | undefined): string =>
    src ? `/api/product-image?url=${encodeURIComponent(src)}` : "";
  const price =
    product.on_sale && product.sale_price
      ? product.sale_price
      : product.regular_price || product.price || "0";
  const image = toImageUrl(product.images?.[0]?.src);
  const imageHover =
    toImageUrl(product.images?.[1]?.src) || image;
  const options = (product.attributes ?? [])
    .filter((attr) => attr.name && (attr.options ?? []).length > 0)
    .map((attr) => ({
      name: attr.name,
      values: attr.options
        .flatMap((option) => option.split("|"))
        .map((option) => option.trim())
        .filter(Boolean),
    }));

  return {
    id: product.id,
    handle: product.slug,
    title: product.name,
    description: stripHtml(
      product.description || product.short_description || ""
    ),
    price,
    currency,
    category: product.categories?.[0]?.name ?? "Apparel",
    available: product.stock_status !== "outofstock",
    image,
    imageHover,
    options: options.length ? options : undefined,
    aspect: "large",
  };
}

export function getMockProducts(): StoreProduct[] {
  return mockProducts.map(mockToStore);
}

export async function getStoreProducts(): Promise<StoreProduct[]> {
  if (!isWooCommerceConfigured()) {
    return mockProducts.map(mockToStore);
  }

  const result = await listProducts({ perPage: 100 });
  return result.products.map(mapWooProduct);
}

export async function getStoreProduct(
  handle: string
): Promise<StoreProduct | null> {
  if (!isWooCommerceConfigured()) {
    const productHandle =
      handle.endsWith("-1") ? handle.slice(0, -2) : handle;
    const index = mockProducts.findIndex(
      (product) =>
        product.handle === handle || product.handle === productHandle
    );
    return index === -1 ? null : mockToStore(mockProducts[index], index);
  }

  const product = await getProductBySlug(handle);
  if (product) return mapWooProduct(product);
  if (!handle.endsWith("-1")) return null;

  const aliasedProduct = await getProductBySlug(handle.slice(0, -2));
  return aliasedProduct ? mapWooProduct(aliasedProduct) : null;
}
