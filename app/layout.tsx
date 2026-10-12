import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CartProvider } from "@/components/providers/CartProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Preloader } from "@/components/Preloader";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "+-Outfit",
  description:
    "The +-Outfit store and signature collection, carefully designed for everyday wear.",
};

const themeScript = `try{var t=localStorage.getItem('theme')||'red';document.documentElement.setAttribute('data-theme',t);}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="red"
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <SmoothScroll>
          <CartProvider>
            <Preloader />
            <Header />
            <main id="page">{children}</main>
            <Footer />
          </CartProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
