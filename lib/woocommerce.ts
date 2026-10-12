import "server-only";

import type {
  WooCategory,
  WooCustomer,
  WooOrder,
  WooPaymentGateway,
  WooProduct,
  WooProductVariation,
} from "./types";
import { createDecipheriv } from "crypto";

const BASE_URL = (process.env.WOOCOMMERCE_URL ?? "").replace(/\/+$/, "");
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY ?? "";
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET ?? "";
const API_BASE = `${BASE_URL}/wp-json/wc/v3`;

function authHeaders(): Record<string, string> {
  const token = Buffer.from(
    `${CONSUMER_KEY}:${CONSUMER_SECRET}`
  ).toString("base64");

  return {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/json",
  };
}

let solvedCookie: string | null = null;

function solveChallenge(html: string): string | null {
  const match = html.match(
    /toNumbers\("([0-9a-f]{32})"\),b=toNumbers\("([0-9a-f]{32})"\),c=toNumbers\("([0-9a-f]{32})"\)/
  );
  if (!match) return null;

  const [, a, b, c] = match;
  const key = Buffer.from(a, "hex");
  const iv = Buffer.from(b, "hex");
  const cipher = Buffer.from(c, "hex");

  const decipher = createDecipheriv("aes-128-ecb", key, null);
  decipher.setAutoPadding(false);
  const decrypted = Buffer.concat([
    decipher.update(cipher),
    decipher.final(),
  ]);

  return Buffer.from(decrypted.map((byte, i) => byte ^ iv[i])).toString("hex");
}

async function fetchWoo(
  url: string,
  options: RequestInit
): Promise<Response> {
  const headers: Record<string, string> = {
    ...authHeaders(),
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (solvedCookie) headers["Cookie"] = `__test=${solvedCookie}`;

  let res = await fetch(url, { ...options, headers, cache: "no-store" });

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    const html = await res.text();
    const cookie = solveChallenge(html);
    if (cookie) {
      solvedCookie = cookie;
      headers["Cookie"] = `__test=${cookie}`;
      res = await fetch(url, { ...options, headers, cache: "no-store" });
    }
  }

  return res;
}

function isWooProductImageUrl(url: URL): boolean {
  if (!BASE_URL) return false;

  const baseUrl = new URL(BASE_URL);
  return (
    url.origin === baseUrl.origin &&
    !url.username &&
    !url.password &&
    url.pathname.includes("/wp-content/uploads/")
  );
}

export async function fetchWooProductImage(src: string): Promise<Response> {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    throw new Error("Invalid WooCommerce product image URL");
  }

  for (let redirects = 0; redirects <= 3; redirects += 1) {
    if (!isWooProductImageUrl(url)) {
      throw new Error("Product images must come from WooCommerce uploads");
    }

    const response = await fetchWoo(url.href, {
      method: "GET",
      redirect: "manual",
    });
    if (response.status < 300 || response.status >= 400) {
      if (!response.ok) {
        throw new Error(
          `WooCommerce product image request failed with status ${response.status}`
        );
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.toLowerCase().startsWith("image/")) {
        throw new Error(
          "WooCommerce returned non-image content for a product image"
        );
      }

      return response;
    }

    const location = response.headers.get("location");
    if (!location || redirects === 3) {
      throw new Error("WooCommerce product image redirected too many times");
    }
    url = new URL(location, url);
  }

  throw new Error("Unable to load WooCommerce product image");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T; headers: Headers }> {
  const res = await fetchWoo(`${API_BASE}${path}`, options);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `WooCommerce API error ${res.status} on ${path}: ${body}`
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    throw new Error(
      "WooCommerce API returned an HTML page instead of JSON. Your hosting is blocking the REST API with bot/anti-bot protection — disable that protection in your hosting panel."
    );
  }

  const data = res.status === 204 ? (null as T) : ((await res.json()) as T);
  return { data, headers: res.headers };
}

function buildQuery(
  params: Record<string, string | number | boolean | undefined>
): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      qs.set(key, String(value));
    }
  }
  return qs.toString();
}

export function isWooCommerceConfigured(): boolean {
  return Boolean(
    process.env.WOOCOMMERCE_URL &&
      process.env.WOOCOMMERCE_CONSUMER_KEY &&
      process.env.WOOCOMMERCE_CONSUMER_SECRET
  );
}

export function getStoreCurrency(): string {
  return process.env.WOOCOMMERCE_CURRENCY ?? "USD";
}

export interface ListProductsOptions {
  page?: number;
  perPage?: number;
  search?: string;
  category?: number;
  orderby?: "date" | "price" | "title" | "popularity" | "rating";
  order?: "asc" | "desc";
}

export interface ProductListResult {
  products: WooProduct[];
  total: number;
  totalPages: number;
}

export async function listProducts(
  options: ListProductsOptions = {}
): Promise<ProductListResult> {
  const query = buildQuery({
    page: options.page ?? 1,
    per_page: options.perPage ?? 12,
    search: options.search,
    category: options.category,
    orderby: options.orderby ?? "date",
    order: options.order ?? "desc",
    status: "publish",
  });

  const { data, headers } = await request<WooProduct[]>(
    `/products?${query}`
  );

  return {
    products: data,
    total: Number(headers.get("x-wp-total") ?? 0),
    totalPages: Number(headers.get("x-wp-totalpages") ?? 0),
  };
}

export async function listFeaturedProducts(
  perPage = 8
): Promise<WooProduct[]> {
  const query = buildQuery({
    per_page: perPage,
    featured: true,
    status: "publish",
  });
  const { data } = await request<WooProduct[]>(`/products?${query}`);
  return data;
}

export async function getProductBySlug(
  slug: string
): Promise<WooProduct | null> {
  const { data } = await request<WooProduct[]>(
    `/products?slug=${encodeURIComponent(slug)}&status=publish`
  );
  return data[0] ?? null;
}

export async function getProductById(id: number): Promise<WooProduct> {
  const { data } = await request<WooProduct>(`/products/${id}`);
  return data;
}

export async function listProductVariations(
  productId: number
): Promise<WooProductVariation[]> {
  const { data } = await request<WooProductVariation[]>(
    `/products/${productId}/variations?per_page=100`
  );
  return data;
}

export async function listCategories(): Promise<WooCategory[]> {
  const { data } = await request<WooCategory[]>(
    "/products/categories?per_page=100&hide_empty=true&orderby=name&order=asc"
  );
  return data;
}

export async function listPaymentGateways(): Promise<WooPaymentGateway[]> {
  const { data } = await request<WooPaymentGateway[]>("/payment_gateways");
  return data.filter((gateway) => gateway.enabled);
}

export interface CreateOrderInput {
  paymentMethod: string;
  paymentMethodTitle?: string;
  billing: Record<string, string>;
  shipping: Record<string, string>;
  lineItems: {
    productId: number;
    quantity: number;
    variationId?: number;
    options?: Record<string, string>;
  }[];
  customerNote?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<WooOrder> {
  const { data } = await request<WooOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({
      payment_method: input.paymentMethod,
      payment_method_title: input.paymentMethodTitle ?? input.paymentMethod,
      set_paid: false,
      billing: input.billing,
      shipping: input.shipping,
      customer_note: input.customerNote,
      line_items: input.lineItems.map((line) => ({
        product_id: line.productId,
        quantity: line.quantity,
        ...(line.variationId ? { variation_id: line.variationId } : {}),
        ...(line.options
          ? {
              meta_data: Object.entries(line.options).map(([key, value]) => ({
                key,
                value,
              })),
            }
          : {}),
      })),
    }),
  });
  return data;
}

export async function listOrdersByCustomer(
  customerId: number
): Promise<WooOrder[]> {
  const { data } = await request<WooOrder[]>(
    `/orders?customer=${customerId}&per_page=50&orderby=date&order=desc`
  );
  return data;
}

export async function getOrder(id: number): Promise<WooOrder> {
  const { data } = await request<WooOrder>(`/orders/${id}`);
  return data;
}

export interface RegisterCustomerInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export async function registerCustomer(
  input: RegisterCustomerInput
): Promise<WooCustomer> {
  const { data } = await request<WooCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      first_name: input.firstName ?? "",
      last_name: input.lastName ?? "",
      username: input.username ?? input.email,
      password: input.password,
    }),
  });
  return data;
}
