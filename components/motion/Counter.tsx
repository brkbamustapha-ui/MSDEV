"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "./gsap";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

type CounterProps = {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  duration?: number;
};

/** Counts up to `value` the first time it scrolls into view. */
export function Counter({ value, suffix = "", prefix = "", className, duration = 1.8 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(reducedMotion ? value : 0);

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reducedMotion) {
      setDisplay(value);
      return;
    }
    registerGsap();

    const ctx = gsap.context(() => {
      const counter = { n: 0 };
      gsap.to(counter, {
        n: value,
        duration,
        ease: "power2.out",
        onUpdate: () => setDisplay(Math.round(counter.n)),
        scrollTrigger: { trigger: node, start: "top 88%", once: true },
      });
    }, node);

    return () => ctx.revert();
  }, [value, duration, reducedMotion]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      <span className="sr-only">{`${prefix}${value}${suffix}`}</span>
      <span aria-hidden="true">
        {prefix}
        {display}
        {suffix}
      </span>
    </span>
  );
}

export default Counter;
