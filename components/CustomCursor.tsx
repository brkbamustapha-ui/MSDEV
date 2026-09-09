"use client";

import { useEffect, useRef, useState } from "react";

import { gsap, registerGsap } from "@/components/motion/gsap";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/use-media-query";

/**
 * A bespoke cursor: an instant dot with a trailing ring that reacts to
 * interactive elements. Desktop-only — the whole thing is skipped on coarse
 * pointers and when reduced motion is requested, and the native cursor is only
 * hidden once this component is actually mounted and tracking.
 */
export function CustomCursor() {
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reducedMotion = usePrefersReducedMotion();
  const enabled = fine && !reducedMotion;

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [variant, setVariant] = useState<"default" | "link" | "media">("default");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    registerGsap();

    document.body.dataset.cursor = "on";

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3.out" });

    const onMove = (event: PointerEvent) => {
      setVisible(true);
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
    };

    const onOver = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor], a, button, input, textarea, select, [role='button']",
      );
      if (!target) {
        setVariant("default");
        setLabel(null);
        return;
      }
      const declared = target.dataset.cursor;
      setLabel(target.dataset.cursorLabel ?? null);
      setVariant(declared === "media" ? "media" : "link");
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      delete document.body.dataset.cursor;
    };
  }, [enabled]);

  if (!enabled) return null;

  const ringSize = variant === "media" ? 96 : variant === "link" ? 52 : 30;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999]">
      <div
        ref={ringRef}
        className="absolute top-0 left-0 flex items-center justify-center rounded-full border border-ivory/45 backdrop-invert-[0.06] transition-[width,height,opacity,background-color] duration-300 ease-out"
        style={{
          width: ringSize,
          height: ringSize,
          marginLeft: -ringSize / 2,
          marginTop: -ringSize / 2,
          opacity: visible ? 1 : 0,
          backgroundColor: variant === "media" ? "rgb(239 235 228 / 0.94)" : "transparent",
          borderColor: variant === "media" ? "transparent" : undefined,
        }}
      >
        {variant === "media" && label && (
          <span className="font-mono text-[9px] tracking-[0.18em] text-void uppercase">{label}</span>
        )}
      </div>
      <div
        ref={dotRef}
        className="absolute top-0 left-0 -mt-[3px] -ml-[3px] h-1.5 w-1.5 rounded-full bg-brass transition-opacity duration-200"
        style={{ opacity: visible && variant !== "media" ? 1 : 0 }}
      />
    </div>
  );
}

export default CustomCursor;
