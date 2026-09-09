"use client";

import { useEffect } from "react";

import { registerGsap, ScrollTrigger } from "./gsap";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { HERO_EXPANDED_EVENT } from "@/components/ui/scroll-expansion-hero";

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

    /* The hero locks the page at 0 while it plays; once it releases, every
       trigger below it needs to recompute its start/end positions. */
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener(HERO_EXPANDED_EVENT, refresh);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener(HERO_EXPANDED_EVENT, refresh);
      window.removeEventListener("load", onLoad);
      delete root.dataset.anim;
    };
  }, [reducedMotion]);

  return null;
}

export default AnimationProvider;
