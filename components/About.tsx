"use client";

import { CoreWebGL } from "@/components/CoreWebGL";
import { Counter } from "@/components/motion/Counter";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { capabilities, stats } from "@/data/site";

export function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="relative scroll-mt-24 py-24 md:py-36">
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-8">01 — About MSDEV</p>

            <h2 id="about-heading" className="font-display text-display font-extrabold text-metal">
              <TextReveal text={"We build\ndigital experiences."} />
            </h2>

            <Reveal className="mt-10 flex max-w-xl flex-col gap-6" y={26} stagger={0.1}>
              <p className="text-lede text-mist">
                MSDEV is a web development studio. We take a brand, an idea or a business that
                deserves better than a template, and we build the site it should have had from the
                start — designed, engineered and shipped by the same people.
              </p>
              <p className="text-base leading-relaxed text-steel">
                Websites, web applications, storefronts, landing pages and immersive 3D experiences.
                Every project is custom: written in modern code, tuned for speed, and designed to
                look deliberate on a 360px phone and on a 34-inch display alike.
              </p>
            </Reveal>
          </div>

          {/* the core */}
          <div className="relative lg:col-span-5">
            <Parallax amount={16} className="lg:sticky lg:top-28">
              <div className="relative mx-auto aspect-square w-full max-w-[26rem]">
                <CoreWebGL className="h-full w-full" />
                <div className="pointer-events-none absolute inset-x-0 -bottom-2 text-center">
                  <span className="eyebrow text-steel/70">Real-time WebGL</span>
                </div>
              </div>
            </Parallax>
          </div>
        </div>

        {/* capabilities marquee */}
        <div className="relative mt-20 border-y border-edge py-5 md:mt-28">
          <div className="mask-edges-x flex overflow-hidden">
            <ul className="flex shrink-0 animate-marquee items-center gap-10 pr-10 motion-reduce:animate-none">
              {[...capabilities, ...capabilities].map((capability, index) => (
                <li
                  key={`${capability}-${index}`}
                  className="flex shrink-0 items-center gap-10 font-display text-lg font-bold tracking-tight whitespace-nowrap text-ivory/85"
                  aria-hidden={index >= capabilities.length}
                >
                  {capability}
                  <span className="size-1 rounded-full bg-brass" aria-hidden="true" />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* stats */}
        <Reveal
          className="mt-16 grid grid-cols-2 gap-px overflow-hidden border border-edge bg-edge md:mt-20 lg:grid-cols-4"
          y={28}
          stagger={0.1}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="bg-void px-5 py-8 sm:px-7 sm:py-10">
              <p className="font-display text-[clamp(2.4rem,6vw,4rem)] leading-none font-extrabold text-ivory">
                <Counter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-4 font-mono text-[0.6875rem] tracking-[0.18em] text-brass uppercase">
                {stat.label}
              </p>
              <p className="mt-1.5 text-sm text-steel">{stat.note}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export default About;
