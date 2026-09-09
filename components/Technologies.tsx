"use client";

import { technologies } from "@/data/site";
import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";

/**
 * The stack, set typographically. Wordmarks rather than borrowed brand logos:
 * nothing extra to download, nothing anyone else's trademark guidelines have
 * an opinion about, and it holds the page's type-led art direction.
 */
export function Technologies() {
  return (
    <section aria-labelledby="tech-heading" className="relative py-24 md:py-32">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-8">04 — Stack</p>
            <h2 id="tech-heading" className="font-display text-display font-extrabold text-ivory">
              <TextReveal text="Powered by technology" />
            </h2>
          </div>
          <Reveal className="max-w-sm md:pb-3" y={18} self>
            <p className="text-sm leading-relaxed text-steel">
              The same tools the best products on the web are built with — chosen per project, never
              bolted on for show.
            </p>
          </Reveal>
        </div>
      </div>

      <Reveal
        className="mt-14 grid grid-cols-2 gap-px border-y border-edge bg-edge sm:grid-cols-3 md:mt-20 lg:grid-cols-5"
        y={24}
        stagger={0.045}
      >
        {technologies.map((tech) => (
          <div
            key={tech.name}
            className="group relative overflow-hidden bg-void px-5 py-9 text-center transition-colors duration-500 hover:bg-carbon sm:py-12"
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-brass transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
            />
            <p className="font-display text-lg font-bold tracking-tight text-ivory/80 transition-colors duration-500 group-hover:text-ivory sm:text-xl">
              {tech.name}
            </p>
            <p className="mt-2 font-mono text-[0.625rem] tracking-[0.16em] text-steel/70 uppercase">
              {tech.note}
            </p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

export default Technologies;
