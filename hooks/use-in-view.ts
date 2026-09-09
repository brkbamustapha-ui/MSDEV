"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type Options = {
  /** Distance (CSS margin syntax) to pre-trigger before the element is visible. */
  rootMargin?: string;
  threshold?: number;
  /** Stop observing after the first intersection. */
  once?: boolean;
};

/**
 * Lightweight IntersectionObserver hook. Used to defer expensive work — WebGL
 * loops, the Spline runtime — until the section is actually approaching.
 */
export function useInView<T extends HTMLElement>(
  { rootMargin = "0px", threshold = 0, once = false }: Options = {},
): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, threshold, once]);

  return [ref, inView];
}
