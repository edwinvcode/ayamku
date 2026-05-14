"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clear() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  // Intercept anchor/link clicks → start bar
  useEffect(() => {
    function onLinkClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto")) return;
      if (anchor.target === "_blank") return;

      clear();
      setVisible(true);
      setWidth(15);
      timers.current = [
        setTimeout(() => setWidth(40), 150),
        setTimeout(() => setWidth(65), 400),
        setTimeout(() => setWidth(82), 900),
        setTimeout(() => setWidth(91), 1800),
      ];
    }

    document.addEventListener("click", onLinkClick);
    return () => document.removeEventListener("click", onLinkClick);
  }, []);

  // Pathname changed → navigation done, complete the bar
  useEffect(() => {
    clear();
    setWidth(100);
    timers.current = [
      setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 350),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none" aria-hidden>
      <div
        className="h-full bg-accent transition-all ease-out"
        style={{
          width: `${width}%`,
          transitionDuration: width === 100 ? "150ms" : "400ms",
          boxShadow: "0 0 6px hsl(var(--accent) / 0.8)",
        }}
      />
    </div>
  );
}
