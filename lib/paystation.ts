import "server-only";

import { getOrder, markOrderPaid } from "@/lib/woocommerce";
import type { WooOrder } from "@/lib/types";

interface PayStationConfig {
  merchantId: string;
  password: string;
  appUrl?: URL;
  apiUrl: string;
}

interface PayStationPaymentStatus {
  status: "success" | "pending" | "failed";
  order: WooOrder;
  transactionId: string;
}

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function getField(objects: JsonObject[], ...keys: string[]): unknown {
  for (const object of objects) {
    for (const key of keys) {
      if (object[key] !== undefined && object[key] !== null) {
        return object[key];
      }
    }
  }
  return undefined;
}

function getString(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function getPayStationConfig(): PayStationConfig {
  const merchantId = process.env.PAYSTATION_MERCHANT_ID?.trim();
  const password = process.env.PAYSTATION_PASSWORD?.trim();
  const mode = process.env.PAYSTATION_MODE?.trim().toLowerCase() || "sandbox";
  const appUrlValue = process.env.APP_URL?.trim();

  if (!merchantId || !password) {
    throw new Error("PayStation server credentials are not configured");
  }
  if (mode !== "sandbox" && mode !== "live") {
    throw new Error("PAYSTATION_MODE must be either sandbox or live");
  }
  let appUrl: URL | undefined;
  if (appUrlValue) {
    try {
      appUrl = new URL(appUrlValue);
    } catch {
      throw new Error("APP_URL must be a valid absolute URL");
    }
    const isLocalSandbox =
      mode === "sandbox" &&
      appUrl.protocol === "http:" &&
      appUrl.hostname === "localhost";
    if (appUrl.protocol !== "https:" && !isLocalSandbox) {
      throw new Error(
        "APP_URL must use HTTPS, except for localhost sandbox testing"
      );
    }
  }

  return {
    merchantId,
    password,
    appUrl,
    apiUrl:
      mode === "sandbox"
        ? "https://sandbox.paystation.com.bd"
        : "https://api.paystation.com.bd",
  };
}

function orderIdFromInvoice(invoiceNumber: string): number {
  const match = /^OUTFIT-([1-9]\d*)$/.exec(invoiceNumber);
  if (!match) throw new Error("Invalid PayStation invoice number");

  const orderId = Number(match[1]);
  if (!Number.isSafeInteger(orderId)) {
    throw new Error("Invalid PayStation invoice number");
  }
  return orderId;
}

function toAmount(value: unknown): number | null {
  const amount =
    typeof value === "number" || typeof value === "string"
      ? Number(value)
      : Number.NaN;
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function amountsMatch(first: number, second: number): boolean {
  return Math.round(first * 100) === Math.round(second * 100);
}

export async function initiatePayStationPayment(
  order: WooOrder,
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
  }
): Promise<{ invoiceNumber: string; paymentUrl: string }> {
  const config = getPayStationConfig();
  if (!config.appUrl) {
    throw new Error("APP_URL must be configured for PayStation callbacks");
  }
  const amount = toAmount(order.total);
  if (order.currency !== "BDT" || amount === null || amount <= 0) {
    throw new Error("PayStation requires a positive BDT order total");
  }
  if (!customer.phone || !customer.email || !customer.name) {
    throw new Error("A name, phone number, and email are required for PayStation");
  }

  const invoiceNumber = `OUTFIT-${order.id}`;
  const callbackUrl = new URL("/checkout/payment-return", config.appUrl);
  callbackUrl.searchParams.set("invoice_number", invoiceNumber);
  const form = new URLSearchParams({
    merchantId: config.merchantId,
    password: config.password,
    invoice_number: invoiceNumber,
    currency: "BDT",
    payment_amount: order.total,
    reference: `WooCommerce order ${order.number}`,
    cust_name: customer.name,
    cust_phone: customer.phone,
    cust_email: customer.email,
    cust_address: customer.address,
    callback_url: callbackUrl.toString(),
    checkout_items: order.line_items
      .map((line) => `${line.name} x ${line.quantity}`)
      .join(", "),
  });

  const response = await fetch(`${config.apiUrl}/initiate-payment`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    throw new Error(`PayStation payment initiation failed (${response.status})`);
  }

  const payload = asObject(await response.json());
  if (
    !payload ||
    getString(payload.status_code) !== "200" ||
    getString(payload.status).toLowerCase() !== "success"
  ) {
    throw new Error("PayStation could not create a payment link");
  }

  const paymentUrlValue = getString(payload.payment_url);
  let paymentUrl: URL;
  try {
    paymentUrl = new URL(paymentUrlValue);
  } catch {
    throw new Error("PayStation returned an invalid payment link");
  }
  if (
    paymentUrl.protocol !== "https:" ||
    (paymentUrl.hostname !== "paystation.com.bd" &&
      !paymentUrl.hostname.endsWith(".paystation.com.bd"))
  ) {
    throw new Error("PayStation returned an untrusted payment link");
  }

  return { invoiceNumber, paymentUrl: paymentUrl.toString() };
}

export async function verifyPayStationPayment(
  invoiceNumber: string
): Promise<PayStationPaymentStatus> {
  const config = getPayStationConfig();
  const order = await getOrder(orderIdFromInvoice(invoiceNumber));
  if (
    !`${order.payment_method} ${order.payment_method_title}`
      .toLowerCase()
      .includes("paystation")
  ) {
    throw new Error("The order does not use the PayStation payment method");
  }

  const form = new URLSearchParams({ invoice_number: invoiceNumber });
  const response = await fetch(`${config.apiUrl}/transaction-status`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      merchantId: config.merchantId,
    },
    body: form,
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    throw new Error(`PayStation status verification failed (${response.status})`);
  }

  const payload = asObject(await response.json());
  const data = payload ? asObject(payload.data) : null;
  const objects = [payload, data].filter(
    (value): value is JsonObject => value !== null
  );
  if (!payload || getString(payload.status_code) !== "200") {
    throw new Error("PayStation returned an invalid transaction-status response");
  }

  const returnedInvoice = getString(
    getField(objects, "invoice_number", "invoiceNumber")
  );
  if (returnedInvoice !== invoiceNumber) {
    throw new Error("PayStation transaction invoice does not match the order");
  }

  const transactionStatus = getString(
    getField(objects, "trx_status", "transaction_status", "payment_status")
  ).toLowerCase();
  const transactionId = getString(
    getField(objects, "trx_id", "trxId", "transaction_id")
  );
  if (transactionStatus !== "success") {
    return {
      status:
        transactionStatus === "failed" || transactionStatus === "cancelled"
          ? "failed"
          : "pending",
      order,
      transactionId,
    };
  }

  const reportedAmount = toAmount(
    getField(objects, "trx_amount", "payment_amount", "amount")
  );
  const orderAmount = toAmount(order.total);
  if (
    reportedAmount === null ||
    orderAmount === null ||
    !amountsMatch(reportedAmount, orderAmount)
  ) {
    throw new Error("PayStation transaction amount does not match the order");
  }
  if (!transactionId) {
    throw new Error("PayStation did not return a transaction ID");
  }

  return { status: "success", order, transactionId };
}

export async function completePayStationOrder(
  order: WooOrder,
  transactionId: string
): Promise<WooOrder> {
  if (order.status === "processing" || order.status === "completed") {
    return order;
  }
  if (order.status === "cancelled" || order.status === "refunded") {
    throw new Error(`Cannot complete a ${order.status} order`);
  }
  return markOrderPaid(order.id, transactionId);
}
