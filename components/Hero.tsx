"use client";

import { ArrowDown } from "lucide-react";

import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { ActionButton } from "@/components/ui/action-button";
import { ParticleField } from "@/components/ParticleField";
import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { disciplines, site } from "@/data/site";

/**
 * The first screen. Scroll (or the keyboard) opens the frame onto the bay of
 * Oran with Santa Cruz on the ridge, and only then does the site begin.
 */
export function Hero() {
  return (
    <div id="top" className="relative">
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="/media/oran-santa-cruz.jpg"
        bgImageSrc="/media/oran-night.jpg"
        title={site.name}
        date="Oran · Santa Cruz · Algeria"
        scrollToExpand="Scroll to enter"
        textBlend
      >
        <HeroStatement />
      </ScrollExpandMedia>
    </div>
  );
}

function HeroStatement() {
  return (
    <section aria-label="Introduction" className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24">
      <ParticleField className="opacity-70" />

      <div className="shell relative">
        <div className="hairline" />

        <div className="grid gap-12 pt-12 md:pt-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-7 flex items-center gap-3">
              <span className="inline-block size-1.5 rounded-full bg-brass" aria-hidden="true" />
              Web studio — {site.city}, {site.country}
            </p>

            <h2 className="font-display text-display font-extrabold text-ivory">
              <TextReveal text={"Digital experiences\nbuilt to stand out."} />
            </h2>

            <Reveal className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center" y={22} stagger={0.1}>
              <ActionButton href="#work" variant="solid">
                View our work
              </ActionButton>
              <ActionButton href="#contact" variant="ghost">
                Let&apos;s work together
              </ActionButton>
            </Reveal>
          </div>

          <div className="lg:col-span-4 lg:pt-3">
            <Reveal className="flex flex-col gap-6" y={26} stagger={0.09}>
              <p className="max-w-sm text-lede text-mist">
                We design and build websites that make small brands look like the leaders of their
                market — and make leaders impossible to ignore.
              </p>

              <ul className="flex flex-col border-t border-edge">
                {disciplines.map((discipline) => (
                  <li
                    key={discipline}
                    className="group flex items-center justify-between border-b border-edge py-3.5"
                  >
                    <span className="font-mono text-[0.6875rem] tracking-[0.18em] text-ivory uppercase">
                      {discipline}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-px w-8 origin-right scale-x-50 bg-brass transition-transform duration-500 group-hover:scale-x-100"
                    />
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>

        <Reveal
          className="mt-14 flex items-center gap-3 text-steel md:mt-20"
          y={18}
          self
        >
          <span className="flex items-center gap-3">
            <ArrowDown className="size-4 animate-[drift_2.6s_ease-in-out_infinite]" aria-hidden="true" />
            <span className="eyebrow">Keep scrolling</span>
          </span>
        </Reveal>
      </div>
    </section>
  );
}

export default Hero;
