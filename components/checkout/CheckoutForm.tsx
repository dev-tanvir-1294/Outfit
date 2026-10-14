"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import type { WooPaymentGateway } from "@/lib/types";

const inputClass =
  "w-full rounded-none border-0 border-b border-current/30 bg-transparent px-0 py-3 text-base text-current outline-none transition-colors placeholder:text-current/40 focus:border-current focus:ring-0";
const labelClass =
  "mb-1 block text-[11px] font-bold uppercase tracking-wide opacity-60";

interface ConfirmedOrder {
  number: string;
  total: string;
  currency: string;
}

export function CheckoutForm({
  gateways,
  currency,
}: {
  gateways: WooPaymentGateway[];
  currency: string;
}) {
  const { lines, subtotal, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<ConfirmedOrder | null>(null);
  const [shipDifferent, setShipDifferent] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(
    gateways[0]?.id ?? "cod"
  );
  const payStationSelected = `${paymentMethod} ${
    gateways.find((gateway) => gateway.id === paymentMethod)?.title ?? ""
  }`
    .toLowerCase()
    .includes("paystation");

  if (lines.length === 0 && !order) {
    return (
      <div className="flex min-h-[55vh] flex-col justify-between px-4 pb-24 pt-32 lg:px-6">
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-wide">Checkout</p>
          <h1 className="max-w-5xl text-[14vw] leading-[0.94] font-normal tracking-[-0.065em] md:text-[8vw]">
            Your bag is empty.
          </h1>
        </div>
        <div className="mt-16 flex flex-col gap-5 border-t-2 border-current pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">There&apos;s nothing to check out just yet.</p>
          <Link
            href="/"
            className="link-hover w-fit text-xl md:text-2xl"
          >
            ← Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  if (order) {
    return (
      <div className="flex min-h-[55vh] flex-col justify-between px-4 pb-24 pt-32 lg:px-6">
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-wide">Thank you</p>
          <h1 className="max-w-5xl text-[14vw] leading-[0.94] font-normal tracking-[-0.065em] md:text-[8vw]">
            Order confirmed.
          </h1>
        </div>
        <div className="mt-16 border-t-2 border-current pt-5">
          <p className="text-sm">Order number: <span className="font-bold">{order.number}</span></p>
          <p className="mt-2 text-sm">
            Total:{" "}
            <span className="font-bold">
              {formatPrice(order.total, order.currency)}
            </span>
          </p>
          <Link
            href="/"
            className="link-hover mt-6 inline-flex text-xl md:text-2xl"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const billing = {
      first_name: String(fd.get("billing_first_name") ?? ""),
      last_name: String(fd.get("billing_last_name") ?? ""),
      address_1: String(fd.get("billing_address_1") ?? ""),
      city: String(fd.get("billing_city") ?? ""),
      postcode: String(fd.get("billing_postcode") ?? ""),
      country: String(fd.get("billing_country") ?? ""),
      email: String(fd.get("billing_email") ?? ""),
      phone: String(fd.get("billing_phone") ?? ""),
    };

    const shipping = shipDifferent
      ? {
          first_name: String(fd.get("shipping_first_name") ?? ""),
          last_name: String(fd.get("shipping_last_name") ?? ""),
          address_1: String(fd.get("shipping_address_1") ?? ""),
          city: String(fd.get("shipping_city") ?? ""),
          postcode: String(fd.get("shipping_postcode") ?? ""),
          country: String(fd.get("shipping_country") ?? ""),
        }
      : billing;

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems: lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            options: line.options,
          })),
          billing,
          shipping,
          paymentMethod,
          paymentMethodTitle:
            gateways.find((g) => g.id === paymentMethod)?.title ??
            paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to place order");

      clearCart();
      if (data.paymentUrl) {
        window.location.assign(data.paymentUrl);
        return;
      }
      setOrder(data.order);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4 pb-24 pt-32 lg:px-6">
      <div className="mb-10 flex flex-col justify-between gap-5 border-b-2 border-current pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide">Almost yours</p>
          <h1 className="text-[14vw] leading-[0.94] font-normal tracking-[-0.065em] md:text-[8vw]">Checkout</h1>
        </div>
        <Link href="/bag" className="link-hover mb-2 w-fit text-sm">
          Back to bag ({lines.length})
        </Link>
      </div>

      <form onSubmit={onSubmit} className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] lg:gap-20">
        <div className="space-y-12">
          <section className="border-b border-current/30 pb-10">
            <h2 className="mb-6 text-xl font-normal uppercase tracking-tight md:text-3xl">01 / Billing details</h2>
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>First name</label>
                <input name="billing_first_name" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Last name</label>
                <input name="billing_last_name" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input name="billing_email" type="email" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  name="billing_phone"
                  required={payStationSelected}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Address</label>
                <input name="billing_address_1" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input name="billing_city" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Postcode</label>
                <input name="billing_postcode" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input name="billing_country" defaultValue="BD" required className={inputClass} />
              </div>
            </div>
          </section>

          <section className="border-b border-current/30 pb-10">
            <label className="flex w-fit cursor-pointer items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={shipDifferent}
                onChange={(e) => setShipDifferent(e.target.checked)}
                className="h-4 w-4 accent-[var(--page-foreground)]"
              />
              Ship to a different address
            </label>

            {shipDifferent && (
              <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>First name</label>
                  <input name="shipping_first_name" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Last name</label>
                  <input name="shipping_last_name" required className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Address</label>
                  <input name="shipping_address_1" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input name="shipping_city" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Postcode</label>
                  <input name="shipping_postcode" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input name="shipping_country" defaultValue="BD" required className={inputClass} />
                </div>
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-6 text-xl font-normal uppercase tracking-tight md:text-3xl">02 / Payment method</h2>
            <div className="divide-y divide-current/20 border-y border-current/20">
              {gateways.map((gateway) => (
                <label
                  key={gateway.id}
                  className="flex cursor-pointer items-center gap-3 py-4 text-sm"
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={gateway.id}
                    checked={paymentMethod === gateway.id}
                    onChange={() => setPaymentMethod(gateway.id)}
                    className="h-4 w-4 accent-[var(--page-foreground)]"
                  />
                  {gateway.title}
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit border-t-2 border-current pt-5 lg:sticky lg:top-28">
          <h2 className="mb-6 text-xl font-normal uppercase tracking-tight md:text-3xl">03 / Order summary</h2>
          <div className="divide-y divide-current/20 border-y border-current/20">
            {lines.map((line) => (
              <div
                key={`${line.productId}-${JSON.stringify(
                  Object.entries(line.options ?? {}).sort(([a], [b]) =>
                    a.localeCompare(b)
                  )
                )}`}
                className="flex justify-between gap-4 py-4 text-sm"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{line.name}</span>
                  <span className="mt-1 block text-xs opacity-60">Qty {line.quantity}</span>
                  {line.options && (
                    <span className="mt-1 block text-xs opacity-60">
                      {Object.entries(line.options)
                        .map(([name, value]) => `${name}: ${value}`)
                        .join(" · ")}
                    </span>
                  )}
                </span>
                <span className="shrink-0">
                  {formatPrice(parseFloat(line.price || "0") * line.quantity, line.currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between border-b border-current/20 py-4">
            <span className="text-xs font-bold uppercase tracking-wide">Subtotal</span>
            <span className="font-bold">
              {formatPrice(subtotal, currency)}
            </span>
          </div>

          <p className="mt-4 text-xs leading-relaxed opacity-60">
            Shipping and taxes are calculated based on your delivery address.
          </p>

          {error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full border border-current px-6 py-4 text-xl transition-colors hover:bg-[var(--page-foreground)] hover:text-[var(--page-background)] disabled:opacity-40 md:text-2xl"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
        </aside>
      </form>
    </div>
  );
}
