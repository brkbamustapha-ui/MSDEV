"use client";

import { useRef, type ElementType, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "./gsap";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Vertical offset, in px, the children travel from. */
  y?: number;
  /** Delay between children. */
  stagger?: number;
  delay?: number;
  duration?: number;
  /** Scroll position that triggers the reveal — ScrollTrigger `start` syntax. */
  start?: string;
  /** Animate the element itself rather than its direct children. */
  self?: boolean;
};

/**
 * Reveals its direct children on scroll: a short rise out of a soft blur.
 * Uses `gsap.context` so React's double-invoked effects clean up properly.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  y = 34,
  stagger = 0.09,
  delay = 0,
  duration = 1.1,
  start = "top 82%",
  self = false,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const targets = self ? node : (Array.from(node.children) as HTMLElement[]);
      if (!self && (targets as HTMLElement[]).length === 0) return;

      gsap.fromTo(
        targets,
        { opacity: 0, y, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration,
          delay,
          stagger,
          ease: "power3.out",
          scrollTrigger: { trigger: node, start, once: true },
        },
      );
    }, node);

    return () => ctx.revert();
  }, [reducedMotion, y, stagger, delay, duration, start, self]);

  return (
    <Tag
      ref={ref}
      className={cn(className)}
      {...(self ? { "data-reveal-self": "" } : { "data-reveal": "" })}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
