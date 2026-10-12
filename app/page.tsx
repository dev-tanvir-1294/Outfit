import { Wordmark } from "@/components/brand/Wordmark";
import { ProductCard } from "@/components/products/ProductCard";
import { Reveal } from "@/components/Reveal";
import {
  getMockProducts,
  getStoreProducts,
  type StoreProduct,
} from "@/lib/catalog";

const REST_LAYOUT = [
  [
    "col-span-3",
    "col-span-3",
    "col-start-3 col-end-9 md:col-start-9 md:-col-end-1",
  ],
  [
    "col-span-4 md:col-span-3",
    "col-start-3 col-end-6 md:col-start-6 md:col-end-9",
    "col-start-6 col-end-9 md:col-start-9 md:col-end-12",
  ],
  [
    "col-span-5",
    "col-start-2 col-end-5 md:col-start-11 md:col-end-[14]",
    "col-start-5 col-end-9 md:col-start-[14] md:col-end-[17]",
  ],
];

export default async function Home() {
  let products: StoreProduct[] = [];
  let errorMessage: string | null = null;
  try {
    products = await getStoreProducts();
  } catch (err) {
    errorMessage =
      err instanceof Error ? err.message : "Couldn't load products.";
    products = getMockProducts();
  }

  const featured = products.slice(0, 4);
  const rest = products.slice(4);

  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="mb-6 mt-26">
          <Wordmark className="mb-6 w-full" />
          <div
            id="hero-line"
            className="mb-6 h-[5px] w-full origin-left bg-current"
          />
          <div className="mb-10 grid grid-cols-8 gap-x-6 gap-y-10 text-xs font-bold md:grid-cols-16 md:gap-6">
            <div
              className="col-span-3 md:col-span-4"
              data-reveal
              style={{ transitionDelay: "0s" }}
            >
              <h1 className="uppercase">+-Outfit</h1>
            </div>
            <div
              className="col-span-5 md:col-span-8"
              data-reveal
              style={{ transitionDelay: "0.1s" }}
            >
              <h2 className="mb-4 uppercase">Why</h2>
              <p className="text-sm leading-4 tracking-tight md:max-w-[60%]">
                Created by the +-Outfit team, this store and signature
                collection celebrates our collective creativity and passion for
                apparel. Carefully designed.
              </p>
            </div>
            <div
              className="col-span-3 flex h-full flex-col justify-between md:col-span-3"
              data-reveal
              style={{ transitionDelay: "0.2s" }}
            >
              <a
                href="https://www.hellohello.is"
                target="_blank"
                rel="noopener noreferrer"
                className="link-hover max-w-fit uppercase"
              >
                Visit our studio
              </a>
              <a
                href="#"
                className="link-hover hidden max-w-fit uppercase md:inline-block"
              >
                Shipping &amp; Returns
              </a>
            </div>
            <div
              className="col-span-5 flex justify-end md:col-span-1"
              data-reveal
              style={{ transitionDelay: "0.3s" }}
            >
              © {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="px-4 lg:px-6">
          <p className="mb-6 max-w-[60ch] border-l-2 border-current pl-3 text-sm">
            {errorMessage}
          </p>
        </div>
      )}

      <div className="px-4 lg:px-6">
        <section className="mb-34 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {featured.map((product, i) => (
            <Reveal key={product.handle} delay={i * 0.12}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </section>
      </div>

      {REST_LAYOUT.map((row, rowIndex) => {
        const items = rest.slice(rowIndex * 3, rowIndex * 3 + 3);
        if (items.length === 0) return null;
        return (
          <div className="px-4 lg:px-6" key={rowIndex}>
            <div className="mb-34 grid grid-cols-8 gap-6 md:grid-cols-16">
              {items.map((product, i) => (
                <Reveal
                  key={product.handle}
                  delay={i * 0.2}
                  className={row[i]}
                >
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
