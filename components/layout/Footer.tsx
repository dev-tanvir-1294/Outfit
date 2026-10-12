import Link from "next/link";
import { IconMark } from "@/components/brand/IconMark";

const SOCIALS = [
  { label: "Dribbble", href: "https://dribbble.com" },
  { label: "Instagram", href: "https://www.instagram.com" },
  { label: "LinkedIn", href: "https://www.linkedin.com" },
  { label: "Twitter (X)", href: "https://x.com" },
];

const PAGES = [
  "Work",
  "Services",
  "About",
  "Careers",
];

export function Footer() {
  return (
    <footer className="mx-auto mb-10 px-4 text-sm lg:px-6">
      <div className="mb-6 h-[5px] w-full bg-current" />

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:gap-8">
        <div className="flex-1 text-[2.75rem] leading-[1] font-[900] tracking-tighter text-balance md:text-[6vw]">
          <p>Made to be worn.</p>
          <p className="opacity-50">Or judged. Or both.</p>
        </div>
        <div>
          <p className="text-[45vw] leading-[1] font-[900] tracking-tighter md:text-[12.75vw]">
            ©26
          </p>
        </div>
      </div>

      <div className="mb-4 mt-[8rem] md:mt-[16rem]">
        <p className="max-w-[52ch] tracking-tight text-balance md:text-2xl">
          Created by the +- Outfit team, this store and signature collection
          celebrates our collective creativity and passion for apparel.
          Carefully designed.
        </p>
      </div>

      <hr className="mb-6 h-[2px] w-full bg-current" />

      <div className="grid grid-cols-2 gap-x-6 gap-y-20 font-bold md:grid-cols-16 md:gap-6">
        <div className="order-last col-span-2 md:order-first md:col-span-4">
          <div className="flex flex-col">
            <Link href="/" aria-label="+- Outfit home" className="mb-2 flex w-fit items-center gap-2">
              <IconMark className="h-[14px] w-[31.5px]" />
              <span>Outfit</span>
            </Link>
            <span>All rights reserved © {new Date().getFullYear()}</span>
          </div>
        </div>

        <div className="col-span-1 md:col-span-3">
          Mirpur-10 <br /> Office 102 <br /> Dhaka, Bangladesh
        </div>

        <div className="col-span-1 md:col-span-4">
          <span>Privacy Policy</span>
        </div>

        <div className="order-first col-span-2 flex justify-evenly md:order-last md:col-span-5">
          <div className="flex flex-1 flex-col gap-3">
            {SOCIALS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="link-hover max-w-fit"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-3">
            {PAGES.map((link) => (
              <span key={link} className="max-w-fit">
                {link}
              </span>
            ))}
          </div>
          <div className="flex-1">
            <span>Let&apos;s talk</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
