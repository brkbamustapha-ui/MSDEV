"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion, useSpring, useTransform, type SpringOptions } from "framer-motion";

import { cn } from "@/lib/utils";

type SpotlightProps = {
  className?: string;
  size?: number;
  springOptions?: SpringOptions;
};

/**
 * A light that follows the pointer inside its parent element.
 * Touch is supported too, so the effect is not desktop-only.
 */
export function Spotlight({ className, size = 260, springOptions = { bounce: 0 } }: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);

  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);

  const spotlightLeft = useTransform(mouseX, (x) => `${x - size / 2}px`);
  const spotlightTop = useTransform(mouseY, (y) => `${y - size / 2}px`);

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;
    parent.style.position = "relative";
    parent.style.overflow = "hidden";
    setParentElement(parent);
  }, []);

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!parentElement) return;
      const { left, top } = parentElement.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    },
    [mouseX, mouseY, parentElement],
  );

  useEffect(() => {
    if (!parentElement) return;

    const onPointerMove = (event: PointerEvent) => handleMove(event.clientX, event.clientY);
    const onEnter = () => setIsHovered(true);
    const onLeave = () => setIsHovered(false);
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      setIsHovered(true);
      handleMove(touch.clientX, touch.clientY);
    };

    parentElement.addEventListener("pointermove", onPointerMove);
    parentElement.addEventListener("pointerenter", onEnter);
    parentElement.addEventListener("pointerleave", onLeave);
    parentElement.addEventListener("touchmove", onTouchMove, { passive: true });
    parentElement.addEventListener("touchend", onLeave);

    return () => {
      parentElement.removeEventListener("pointermove", onPointerMove);
      parentElement.removeEventListener("pointerenter", onEnter);
      parentElement.removeEventListener("pointerleave", onLeave);
      parentElement.removeEventListener("touchmove", onTouchMove);
      parentElement.removeEventListener("touchend", onLeave);
    };
  }, [parentElement, handleMove]);

  return (
    <motion.div
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute rounded-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops),transparent_78%)] blur-2xl transition-opacity duration-300",
        "from-ivory/70 via-brass/25 to-transparent",
        isHovered ? "opacity-100" : "opacity-0",
        className,
      )}
      style={{ width: size, height: size, left: spotlightLeft, top: spotlightTop }}
    />
  );
}

export default Spotlight;
