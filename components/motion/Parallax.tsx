"use client";

import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "./gsap";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /** How far the layer travels over the scroll range, as % of its own height. */
  amount?: number;
  /** Optional scale drift, e.g. 1.12 to grow slightly on the way through. */
  scaleTo?: number;
  /** Optional rotation drift, in degrees. */
  rotateTo?: number;
};

/** A scrubbed transform tied to the element's own passage through the viewport. */
export function Parallax({ children, className, amount = 14, scaleTo, rotateTo }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion) return;
    registerGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        node,
        { yPercent: -amount / 2, ...(scaleTo ? { scale: 1 } : {}), ...(rotateTo ? { rotate: 0 } : {}) },
        {
          yPercent: amount / 2,
          ...(scaleTo ? { scale: scaleTo } : {}),
          ...(rotateTo ? { rotate: rotateTo } : {}),
          ease: "none",
          scrollTrigger: {
            trigger: node,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        },
      );
    }, node);

    return () => ctx.revert();
  }, [reducedMotion, amount, scaleTo, rotateTo]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}

export default Parallax;
