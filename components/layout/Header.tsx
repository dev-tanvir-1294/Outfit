"use client";

import Link from "next/link";
import { useState } from "react";
import { IconMark } from "@/components/brand/IconMark";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useCart } from "@/components/providers/CartProvider";

export function Header() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav
        id="header"
        className="fixed left-0 top-0 z-30 flex w-full items-center justify-between"
      >
        <div className="mx-auto flex w-full items-center justify-between px-4 py-8 lg:px-6">
          <Link href="/" aria-label="+-Outfit" className="mr-2 lg:mr-6">
            <IconMark className="h-[1.5em] w-[3.375em]" />
          </Link>

          <div className="flex items-center gap-3 md:gap-16">
            <ul className="flex gap-8 tracking-tight md:items-center md:gap-16 md:text-2xl">
              <li>
                <Link href="/bag" className="link-hover">
                  Bag ({count})
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="link-hover hidden md:inline-block"
                >
                  Menu
                </button>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="md:hidden"
              aria-label="Open menu"
            >
              <span className="text-lg">Menu</span>
            </button>
          </div>
        </div>
      </nav>

      <div
        id="theme-switcher"
        className="fixed right-6 top-[5.2rem] z-30 hidden md:block"
      >
        <ThemeSwitcher />
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-40 flex h-dvh flex-col justify-between bg-[var(--page-background)] px-4 py-6 text-[var(--page-foreground)]">
          <div className="flex items-center justify-between">
            <IconMark className="h-[1.5em] w-[3.375em]" />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="text-2xl"
            >
              Close
            </button>
          </div>

          <ul className="mt-20 flex w-full flex-col text-6xl font-normal tracking-tight">
            <li className="overflow-hidden">
              <Link
                href="/bag"
                onClick={() => setMenuOpen(false)}
                className="link-hover block w-fit py-2"
              >
                Bag ({count})
              </Link>
            </li>
            <li className="overflow-hidden">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="link-hover block w-fit py-2"
              >
                Shop
              </Link>
            </li>
          </ul>

          <div className="mt-8 flex gap-5">
            <ThemeSwitcher large />
          </div>
        </div>
      )}
    </>
  );
}
