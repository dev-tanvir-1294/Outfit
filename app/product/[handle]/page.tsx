/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToBag } from "@/components/products/AddToBag";
import { getStoreProduct } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getStoreProduct(handle).catch(() => null);
  return {
    title: product ? `${product.title} | OUTFIT®` : "OUTFIT®",
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getStoreProduct(handle).catch(() => null);
  if (!product) notFound();

  return (
    <div className="px-4 pb-24 pt-28 lg:px-4">
      <div className="mb-5 lg:hidden">
        <nav className="mb-4 h-6">
          <Link
            href="/"
            className="link-hover inline-flex h-6 items-center gap-3 text-base leading-[24px]"
          >
            <span aria-hidden="true" className="text-2xl leading-none">←</span>
            Return to Shop
          </Link>
        </nav>

        <h1 className="mb-5 text-[clamp(2.5rem,10.56vw,6rem)] leading-[1] font-medium tracking-tight break-words md:leading-[.9]">
          {product.title}
        </h1>
        <p className="mb-5 text-3xl leading-[1.5] md:text-5xl md:leading-none">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: product.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(Number(product.price))}
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-16 lg:gap-6">
        <div className="-mr-4 flex snap-x snap-mandatory gap-6 overflow-x-auto pr-4 scrollbar-hidden lg:col-span-9 lg:mr-0 lg:flex-col lg:overflow-visible lg:pr-0">
          {[product.image, product.imageHover]
            .filter((image, index, images) => image && images.indexOf(image) === index)
            .map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="group relative aspect-square w-[85vw] shrink-0 snap-start overflow-hidden bg-[#d2cac3] lg:aspect-[3/4] lg:w-full"
              >
                <img
                  alt={`${product.title}${index === 0 ? "" : " — alternate view"}`}
                  draggable={false}
                  src={image}
                  className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.87,0,0.13,1)] group-hover:scale-[1.02]"
                />
              </div>
            ))}
        </div>

        <div className="mt-2 grid gap-8 md:grid-cols-2 md:gap-12 lg:sticky lg:top-28 lg:col-span-7 lg:mt-0 lg:block lg:self-start lg:pt-10">
          <div className="hidden lg:block">
            <h1 className="mb-5 text-[clamp(3rem,6vw,6rem)] leading-[.9] font-medium tracking-tight break-words">
              {product.title}
            </h1>
            <p className="mb-10 text-5xl leading-none">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: product.currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }).format(Number(product.price))}
            </p>
          </div>
          <p className="max-w-[50ch] text-base leading-5 lg:max-w-none lg:text-2xl lg:leading-[30px]">
            {product.description}
          </p>
          <div className="md:pt-1 lg:mt-4 lg:pt-0">
            <AddToBag product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
