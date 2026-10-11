"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";

const IMAGES = [
  "/preloader/image-01.jpg",
  "/preloader/image-02.jpg",
  "/preloader/image-03.jpg",
  "/preloader/image-04.jpg",
  "/preloader/image-05.jpg",
  "/preloader/image-06.jpg",
];

export function Preloader() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const routeTimeoutRef = useRef<number | null>(null);
  const finishTimeoutRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const pendingNavigationRef = useRef(false);
  const currentPathRef = useRef<string | null>(pathname);
  const finishLoadingRef = useRef<() => void>(() => {});

  useEffect(() => {
    const root = document.documentElement;
    let value = 0;

    function clearTimer(timer: number | null) {
      if (timer !== null) window.clearTimeout(timer);
    }

    function finishLoading() {
      pendingNavigationRef.current = false;
      if (routeTimeoutRef.current !== null) {
        window.clearTimeout(routeTimeoutRef.current);
        routeTimeoutRef.current = null;
      }
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setLeaving(true);
      root.classList.add("loaded");
      clearTimer(finishTimeoutRef.current);
      finishTimeoutRef.current = window.setTimeout(() => {
        root.classList.add("ready");
        finishTimeoutRef.current = null;
      }, 500);
    }
    finishLoadingRef.current = finishLoading;

    function startLoading(isNavigation: boolean) {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
      if (finishTimeoutRef.current !== null) {
        window.clearTimeout(finishTimeoutRef.current);
        finishTimeoutRef.current = null;
      }
      value = 0;
      startedAtRef.current = Date.now();
      pendingNavigationRef.current = isNavigation;
      setProgress(0);
      setLeaving(false);
      root.classList.remove("ready");
      intervalRef.current = window.setInterval(() => {
        value = Math.min(100, value + 1);
        setProgress(value);
        if (value === 100) {
          if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          if (!pendingNavigationRef.current) finishLoading();
        }
      }, 16);
    }

    function beginNavigation() {
      if (routeTimeoutRef.current !== null) {
        window.clearTimeout(routeTimeoutRef.current);
      }
      startLoading(true);
      routeTimeoutRef.current = window.setTimeout(finishLoading, 15000);
    }

    function onDocumentClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (
        !(anchor instanceof HTMLAnchorElement) ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        destination.pathname === window.location.pathname
      ) {
        return;
      }
      beginNavigation();
    }

    function onPopState() {
      beginNavigation();
    }

    startLoading(false);
    document.addEventListener("click", onDocumentClick, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      window.removeEventListener("popstate", onPopState);
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
      if (routeTimeoutRef.current !== null) {
        window.clearTimeout(routeTimeoutRef.current);
      }
      if (finishTimeoutRef.current !== null) {
        window.clearTimeout(finishTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentPathRef.current === null) {
      currentPathRef.current = pathname;
      return;
    }
    if (pathname === currentPathRef.current) return;

    currentPathRef.current = pathname;
    if (!pendingNavigationRef.current) return;
    const remaining = Math.max(0, 300 - (Date.now() - startedAtRef.current));
    finishTimeoutRef.current = window.setTimeout(() => {
      finishLoadingRef.current();
    }, remaining);
  }, [pathname]);

  const imageIndex =
    Math.floor(progress / (100 / IMAGES.length)) % IMAGES.length;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black text-cream transition-transform duration-1000 ease-[cubic-bezier(0.87,0,0.13,1)] ${
        leaving ? "-translate-y-full" : ""
      }`}
    >
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        {IMAGES.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            className={`absolute left-1/2 top-1/2 aspect-[9/12] w-[30vw] -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-500 md:w-[12vw] ${
              i === imageIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center">
        <div className="overflow-hidden px-6">
          <Wordmark className="mx-auto w-[85vw] max-w-[28rem] fill-cream mix-blend-difference" />
        </div>
        <span className="mt-8 text-2xl tabular-nums">
          {String(progress).padStart(3, "0")}
        </span>
      </div>
    </div>
  );
}
