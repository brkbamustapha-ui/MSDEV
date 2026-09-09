"use client";

import { Fragment, useRef, type ElementType } from "react";

import { cn } from "@/lib/utils";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "./gsap";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

type TextRevealProps = {
  text: string;
  className?: string;
  as?: ElementType;
  /** Delay between words. */
  stagger?: number;
  delay?: number;
  start?: string;
};

/**
 * Word-by-word reveal: every word rises out of its own overflow mask.
 *
 * The mask is per word rather than per line on purpose — a line-level mask
 * clips any word too wide for its column instead of letting it wrap. The
 * padding/negative-margin pair gives descenders room inside the mask without
 * changing the layout.
 *
 * The readable text is a single `sr-only` string, so screen readers and
 * crawlers never see the split markup.
 */
export function TextReveal({
  text,
  className,
  as: Tag = "span",
  stagger = 0.045,
  delay = 0,
  start = "top 85%",
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const words = node.querySelectorAll<HTMLElement>("[data-word]");
      if (!words.length) return;

      gsap.fromTo(
        words,
        { yPercent: 118, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.15,
          delay,
          stagger,
          ease: "power4.out",
          scrollTrigger: { trigger: node, start, once: true },
        },
      );
    }, node);

    return () => ctx.revert();
  }, [reducedMotion, stagger, delay, start, text]);

  const rows = text.split("\n");

  return (
    <Tag ref={ref} className={cn("block", className)}>
      <span className="sr-only">{text.replace(/\n/g, " ")}</span>
      <span aria-hidden="true" className="block">
        {rows.map((row, rowIndex) => (
          <Fragment key={`${row}-${rowIndex}`}>
            {row.split(" ").map((word, wordIndex) => (
              <Fragment key={`${word}-${wordIndex}`}>
                <span className="inline-block overflow-hidden pb-[0.16em] align-bottom -mb-[0.16em]">
                  <span data-word className="inline-block will-change-transform">
                    {word}
                  </span>
                </span>
                {wordIndex < row.split(" ").length - 1 ? " " : null}
              </Fragment>
            ))}
            {rowIndex < rows.length - 1 ? <br /> : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

export default TextReveal;
