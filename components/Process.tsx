"use client";

import { useRef } from "react";

import { processSteps } from "@/data/site";
import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/components/motion/gsap";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

/**
 * How a project actually runs, as a timeline whose spine fills with the
 * scroll. Each step rises in as it reaches the line.
 */
export function Process() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const line = lineRef.current;
    if (!section || !line || reducedMotion) return;
    registerGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top center",
          scrollTrigger: {
            trigger: section,
            start: "top 65%",
            end: "bottom 85%",
            scrub: 0.5,
          },
        },
      );

      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step) => {
        gsap.fromTo(
          step,
          { opacity: 0, y: 46 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: step, start: "top 82%", once: true },
          },
        );
      });
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id="process"
      ref={sectionRef}
      aria-labelledby="process-heading"
      className="relative scroll-mt-24 py-24 md:py-36"
    >
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-8">05 — Process</p>
            <h2 id="process-heading" className="font-display text-mega font-extrabold text-ivory">
              <TextReveal text="How we build" />
            </h2>
          </div>
          <Reveal className="max-w-sm md:pb-4" y={18} self>
            <p className="text-sm leading-relaxed text-steel">
              Four stages, fixed scope, and a date you can plan around. You always know what is
              happening and what comes next.
            </p>
          </Reveal>
        </div>

        <ol className="relative mt-16 md:mt-24 md:pl-[max(0px,calc(12%-1rem))]">
          {/* the spine */}
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[7px] w-px bg-edge md:left-[calc(12%-1rem)]"
          />
          <span
            ref={lineRef}
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[7px] w-px origin-top scale-y-0 bg-brass md:left-[calc(12%-1rem)]"
          />

          {processSteps.map((step) => (
            <li
              key={step.index}
              data-step
              className="relative grid gap-4 pb-16 pl-9 last:pb-0 md:grid-cols-12 md:gap-10 md:pl-16"
            >
              <span
                aria-hidden="true"
                className="absolute top-[7px] left-0 size-[15px] rounded-full border border-brass bg-void md:left-[-1rem]"
              >
                <span className="absolute inset-[3px] rounded-full bg-brass/70" />
              </span>

              <div className="md:col-span-4">
                <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brass">{step.index}</p>
                <h3 className="mt-3 font-display text-title font-extrabold tracking-[-0.03em] text-ivory">
                  {step.title}
                </h3>
              </div>

              <div className="md:col-span-8 md:pt-8">
                <p className="max-w-xl text-lede text-mist">{step.body}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {step.deliverables.map((deliverable) => (
                    <li
                      key={deliverable}
                      className="rounded-full border border-edge px-3.5 py-1.5 font-mono text-[0.625rem] tracking-[0.14em] text-steel uppercase"
                    >
                      {deliverable}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Process;
