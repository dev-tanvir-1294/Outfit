"use client";

import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import type { StoreProduct } from "@/lib/catalog";

export function AddToBag({ product }: { product: StoreProduct }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const options = product.options ?? [];
  const hasSelectedOptions = options.every((option) => selected[option.name]);

  function addSelectedItem() {
    addItem({
      productId: product.id,
      name: product.title,
      price: product.price,
      image: product.image,
      currency: product.currency,
      quantity,
      ...(options.length > 0 ? { options: selected } : {}),
    });
  }

  function handleAdd() {
    addSelectedItem();
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col">
      {options.map((option) => (
        <div
          key={option.name}
          className="flex min-h-[76px] w-full flex-wrap items-start justify-between gap-3 border-b border-current lg:min-h-[68px] lg:flex-nowrap lg:items-center"
        >
          <p className="shrink-0 text-xl leading-8 sm:text-2xl md:text-3xl">{option.name}</p>
          <div className="flex min-w-0 flex-wrap justify-end gap-2 lg:flex-nowrap">
            {option.values.map((value) => {
              const active = selected[option.name] === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setSelected((prev) => ({
                      ...prev,
                      [option.name]: value,
                    }))
                  }
                  aria-pressed={active}
                  className={`px-2 text-xl leading-8 transition-colors sm:text-2xl sm:leading-9 md:text-2xl ${
                    active
                      ? "bg-[var(--page-foreground)] text-[var(--page-background)]"
                      : "hover:bg-[var(--page-foreground)]/10"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-7 flex items-center lg:mt-[58.6px]">
        <button
          type="button"
          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          className="flex h-6 w-10 items-center justify-start pr-4 text-2xl leading-6 lg:h-9 lg:w-[52px] lg:text-4xl lg:leading-10"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="flex h-8 w-10 items-center justify-center text-2xl tabular-nums lg:h-9 lg:w-16" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((current) => current + 1)}
          className="flex h-6 w-10 items-center justify-end pl-4 text-2xl leading-6 lg:h-9 lg:w-[52px] lg:text-4xl lg:leading-10"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!product.available || !hasSelectedOptions}
        className="mt-[50px] flex w-fit max-w-full items-center gap-3 whitespace-normal text-left text-[clamp(1.5rem,8vw,2.25rem)] leading-tight transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50 md:mt-6 md:gap-4 md:text-[clamp(1.75rem,4vw,2.25rem)] md:leading-tight lg:mt-[58.6px] lg:whitespace-nowrap lg:text-4xl lg:leading-10"
      >
        <span aria-hidden="true">{added ? "✓" : "↗"}</span>
        <span>
          {!product.available
            ? "Sold out"
            : added
              ? "Added to Bag"
              : !hasSelectedOptions
                ? (
                    <>
                      <span className="lg:hidden">Please select an option</span>
                      <span className="hidden lg:inline">Add to Bag</span>
                    </>
                  )
                : "Add to Bag"}
        </span>
      </button>
    </div>
  );
}
