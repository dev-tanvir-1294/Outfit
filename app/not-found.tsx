import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[55vh] flex-col justify-between px-4 pb-24 pt-32 lg:px-6">
      <div>
        <p className="mb-4 text-xs font-bold uppercase tracking-wide">404</p>
        <h1 className="max-w-5xl text-[14vw] leading-[0.94] font-normal tracking-[-0.065em] md:text-[8vw]">
          Page not found
        </h1>
      </div>
      <div className="mt-16 border-t-2 border-current pt-5">
        <Link href="/" className="link-hover text-xl md:text-2xl">
          ← Return to Shop
        </Link>
      </div>
    </div>
  );
}
