"use client";

import { useEffect } from "react";

import { registerGsap, ScrollTrigger } from "./gsap";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

/**
 * Boots GSAP and flips the document into "animations will run" mode.
 *
 * The reveal styles in globals.css are scoped to `html[data-anim="ready"]`, so
 * with JavaScript disabled — or with reduced motion requested — every section
 * renders fully visible instead of staying stuck at opacity 0.
 */
export function AnimationProvider() {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    registerGsap();

    const root = document.documentElement;
    if (!reducedMotion) root.dataset.anim = "ready";

    /* Late-loading fonts and images shift every trigger below them. */
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      delete root.dataset.anim;
    };
  }, [reducedMotion]);

  return null;
}

export default AnimationProvider;
