"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";

export default function BagPage() {
  const { lines, count, subtotal, removeItem, updateQuantity } = useCart();

  if (count === 0) {
    return (
      <div className="flex min-h-[55vh] flex-col justify-between px-4 pb-24 pt-32 lg:px-6">
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-wide">Your bag</p>
          <h1 className="max-w-5xl text-[14vw] leading-[0.94] font-normal tracking-[-0.065em] md:text-[8vw]">
            Your bag is empty
          </h1>
        </div>
        <div className="mt-16 flex flex-col gap-5 border-t-2 border-current pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">Find something made to be worn.</p>
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

  return (
    <div className="px-4 pb-24 pt-32 lg:px-6">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide">Your selection</p>
          <h1 className="text-[14vw] leading-[0.94] font-normal tracking-[-0.065em] md:text-[8vw]">
            Your Bag<span className="ml-3 text-[5vw] tracking-normal md:text-[2.5vw]">({count})</span>
          </h1>
        </div>
        <Link href="/" className="link-hover mb-2 hidden text-sm sm:inline-block">
          Return to Shop
        </Link>
      </div>

      <div className="mb-3 hidden grid-cols-[minmax(0,1fr)_8rem_8rem_8rem] border-y-2 border-current py-3 text-xs font-bold uppercase tracking-wide md:grid">
        <span>Item</span>
        <span>Price</span>
        <span>Quantity</span>
        <span className="text-right">Total</span>
      </div>

      <div className="divide-y divide-current/30 border-b-2 border-current">
        {lines.map((line) => (
          <div
            key={`${line.productId}-${Object.entries(line.options ?? {})
              .sort(([a], [b]) => a.localeCompare(b))
              .map((entry) => entry.join(":"))
              .join("-")}`}
            className="grid gap-4 py-5 md:grid-cols-[minmax(0,1fr)_8rem_8rem_8rem] md:items-center"
          >
            <div className="flex min-w-0 items-center gap-4 md:gap-6">
              <div className="aspect-[4/5] w-24 shrink-0 overflow-hidden bg-[#d2cac3] md:w-32">
              {line.image && (
                <img
                  src={line.image}
                  alt={line.name}
                  className="h-full w-full object-cover"
                />
              )}
              </div>
              <div className="min-w-0">
                <p className="text-lg uppercase leading-tight md:text-2xl">{line.name}</p>
                {line.options && (
                  <p className="mt-2 text-sm">
                    {Object.entries(line.options)
                      .map(([name, value]) => `${name}: ${value}`)
                      .join(" · ")}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => removeItem(line.productId, line.options)}
                  aria-label={`Remove ${line.name} from bag`}
                  className="mt-3 inline-flex items-center border border-current px-3 py-1.5 text-xs uppercase tracking-wide transition-colors hover:bg-[var(--page-foreground)] hover:text-[var(--page-background)]"
                >
                  Remove item
                </button>
              </div>
            </div>
            <p className="text-sm md:text-base">
              <span className="mr-2 text-xs uppercase tracking-wide opacity-60 md:hidden">Price</span>
                {formatPrice(line.price, line.currency)}
            </p>
            <div className="flex items-center gap-2">
              <span className="mr-2 text-xs uppercase tracking-wide opacity-60 md:hidden">Quantity</span>
              <div className="flex items-center border border-current/40">
                <button
                  type="button"
                  onClick={() => updateQuantity(line.productId, line.quantity - 1, line.options)}
                  className="h-9 w-9 transition-colors hover:bg-[var(--page-foreground)] hover:text-[var(--page-background)]"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-9 text-center text-sm tabular-nums">{line.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(line.productId, line.quantity + 1, line.options)}
                  className="h-9 w-9 transition-colors hover:bg-[var(--page-foreground)] hover:text-[var(--page-background)]"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
            <p className="text-right text-sm font-bold md:text-base">
              <span className="mr-2 text-xs font-normal uppercase tracking-wide opacity-60 md:hidden">Total</span>
              {formatPrice(parseFloat(line.price || "0") * line.quantity, line.currency)}
            </p>
          </div>
        ))}
      </div>

      <div className="ml-auto mt-8 max-w-lg">
        <div className="flex items-center justify-between border-b border-current/30 pb-4">
          <p className="text-xs font-bold uppercase tracking-wide">Subtotal</p>
          <p className="text-xl font-bold">
            {formatPrice(subtotal, lines[0]?.currency ?? "USD")}
          </p>
        </div>
        <p className="mt-4 text-xs leading-relaxed opacity-60">
          Shipping and taxes are calculated at checkout.
        </p>
        <Link
          href="/checkout"
          className="mt-6 flex w-full items-center justify-center border border-current px-6 py-4 text-xl transition-colors hover:bg-[var(--page-foreground)] hover:text-[var(--page-background)] md:text-2xl"
        >
          Continue to Checkout ↗
        </Link>
      </div>
    </div>
  );
}
