"use client";

import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/components/motion/gsap";
import { useIsTouch, usePrefersReducedMotion } from "@/hooks/use-media-query";

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** How far the element is allowed to travel toward the pointer, in px. */
  strength?: number;
};

/**
 * Pulls its child toward the pointer while hovered, then springs it back.
 * Inert on touch devices and under reduced motion.
 */
export function Magnetic({ children, className, strength = 18 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();
  const reducedMotion = usePrefersReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node || isTouch || reducedMotion) return;
    registerGsap();

    const xTo = gsap.quickTo(node, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(node, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });

    const onMove = (event: PointerEvent) => {
      const { left, top, width, height } = node.getBoundingClientRect();
      const relX = event.clientX - (left + width / 2);
      const relY = event.clientY - (top + height / 2);
      xTo((relX / (width / 2)) * strength);
      yTo((relY / (height / 2)) * strength);
    };

    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);

    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
      gsap.set(node, { x: 0, y: 0 });
    };
  }, [isTouch, reducedMotion, strength]);

  return (
    <div ref={ref} className={cn("inline-flex will-change-transform", className)}>
      {children}
    </div>
  );
}

export default Magnetic;
