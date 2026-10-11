/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { StoreProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";

function aspectClass(product: StoreProduct): string {
  if (product.aspect === "square") return "aspect-square";
  if (product.aspect === "small") return "aspect-[242/240]";
  if (product.aspect === "large") return "aspect-[9/12]";
  return "";
}

export function ProductCard({ product }: { product: StoreProduct }) {
  const aspect = aspectClass(product);
  const hasAspect = aspect !== "";

  return (
    <Link
      href={`/product/${product.handle}`}
      className="group block"
      data-product="true"
    >
      <div className={`relative overflow-hidden bg-[#d2cac3] ${aspect}`}>
        <img
          alt={product.title}
          draggable={false}
          src={product.image}
          className={hasAspect ? "h-full w-full object-cover" : "h-auto w-full"}
        />
        <img
          alt={product.title}
          draggable={false}
          src={product.imageHover}
          className="absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] scale-[1.2] group-hover:scale-100 [clip-path:polygon(0%_0%,0%_0%,0%_100%,0%_100%)] group-hover:[clip-path:polygon(0%_0%,100%_0%,100%_100%,0%_100%)] filter-[brightness(400%)_contrast(150%)] group-hover:filter-[brightness(100%)_contrast(100%)]"
        />
      </div>

      <div className="mt-3 flex flex-col justify-between gap-2 text-lg leading-5 md:flex-row">
        <p>{product.title}</p>
        <p>
          <span>{formatPrice(product.price, product.currency)}</span>
        </p>
      </div>

      <div className="mt-[6px] flex items-center gap-1 text-[11px] uppercase">
        <div className="h-2 w-2 rounded-full bg-current" />
        <span>{product.category}</span>
      </div>
    </Link>
  );
}
