"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ClientChartProps = {
  height: number;
  children: ReactNode | ((width: number) => ReactNode);
  className?: string;
};

/**
 * Recharts necesita un contenedor con tamaño real en el DOM.
 * En Chrome/Next el primer render SSR/hidratación suele medir -1×-1.
 * ResizeObserver fuerza recálculo al rotar o redimensionar en móvil.
 */
export function ClientChart({ height, children, className }: ClientChartProps) {
  const [mounted, setMounted] = useState(false);
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || ref.current == null) return;

    const node = ref.current;
    const sync = () => {
      const next = Math.floor(node.getBoundingClientRect().width);
      if (next > 0) setWidth(next);
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(node);
    window.addEventListener("orientationchange", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", sync);
    };
  }, [mounted]);

  const boxClass = className ?? "w-full min-w-0";

  if (!mounted) {
    return (
      <div
        className={boxClass}
        style={{ height, minHeight: height }}
        aria-hidden
      />
    );
  }

  const content = typeof children === "function" ? children(width) : children;

  return (
    <div
      ref={ref}
      className={boxClass}
      style={{ height, minHeight: height }}
    >
      {content}
    </div>
  );
}
