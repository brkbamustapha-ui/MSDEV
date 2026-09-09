"use client";

import { whyMsdev } from "@/data/site";
import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { Parallax } from "@/components/motion/Parallax";

/**
 * Six reasons, set on a hairline grid. Deliberately quiet after the pinned
 * portfolio — the page needs somewhere to breathe before the contact section.
 */
export function WhyMsdev() {
  return (
    <section aria-labelledby="why-heading" className="relative overflow-hidden py-24 md:py-36">
      {/* a slow-moving wash of light behind the grid */}
      <Parallax amount={26} className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[140%]">
        <div className="mx-auto h-full w-[70vw] max-w-4xl rounded-full bg-[radial-gradient(circle_at_50%_30%,rgba(200,162,122,0.10),transparent_62%)] blur-3xl" />
      </Parallax>

      <div className="shell">
        <div className="max-w-3xl">
          <p className="eyebrow mb-8">06 — Why us</p>
          <h2 id="why-heading" className="font-display text-mega font-extrabold text-metal">
            <TextReveal text="Why MSDEV?" />
          </h2>
        </div>

        <Reveal
          className="mt-16 grid gap-px border border-edge bg-edge sm:grid-cols-2 md:mt-20 lg:grid-cols-3"
          y={30}
          stagger={0.07}
        >
          {whyMsdev.map((reason) => (
            <article
              key={reason.index}
              className="group relative overflow-hidden bg-void p-8 transition-colors duration-500 hover:bg-carbon md:p-10"
            >
              <span
                aria-hidden="true"
                className="absolute -top-16 -right-16 size-40 rounded-full bg-brass/10 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
              />
              <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-steel transition-colors duration-500 group-hover:text-brass">
                {reason.index}
              </p>
              <h3 className="mt-7 font-display text-xl font-extrabold tracking-[-0.02em] text-ivory md:text-2xl">
                {reason.title}
              </h3>
              <p className="mt-3.5 text-sm leading-relaxed text-steel">{reason.body}</p>
              <span
                aria-hidden="true"
                className="mt-8 block h-px w-10 origin-left bg-edge-strong transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-20 group-hover:bg-brass"
              />
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export default WhyMsdev;
