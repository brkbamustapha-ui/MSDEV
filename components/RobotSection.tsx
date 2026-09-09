"use client";

import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { ActionButton } from "@/components/ui/action-button";
import { RobotScene } from "@/components/RobotScene";
import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";

const REASONS = [
  {
    title: "Built from a blank page",
    body: "No theme, no builder, no template anyone else can buy. Your site is designed and coded for your business alone.",
  },
  {
    title: "Fast enough to feel instant",
    body: "Sub-second loads on a phone on 4G. Speed is the first thing a visitor judges you on, so we treat it as design work.",
  },
  {
    title: "Made to convert",
    body: "Every section earns its place: a clear path from the first scroll to the message that lands in your inbox.",
  },
];

/**
 * The invitation. An interactive robot answers to the pointer — and to a
 * finger on a phone — next to the case for hiring MSDEV.
 */
export function RobotSection() {
  return (
    <section aria-labelledby="why-msdev-heading" className="relative py-20 md:py-28">
      <div className="shell">
        <Card className="relative overflow-hidden rounded-[1.75rem] border-edge bg-ink/90 shadow-[0_60px_140px_-60px_rgba(0,0,0,1)]">
          <Spotlight className="-top-32 left-0 md:-top-16 md:left-1/3" size={340} />

          {/* faint technical grid */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#EFEBE4_1px,transparent_1px),linear-gradient(to_bottom,#EFEBE4_1px,transparent_1px)] [background-size:64px_64px]"
          />

          <div className="relative grid lg:grid-cols-2">
            <div className="flex flex-col justify-center px-6 py-12 sm:px-10 md:px-14 md:py-16">
              <p className="eyebrow mb-6">Why brands choose us</p>

              <h2 id="why-msdev-heading" className="font-display text-[clamp(1.9rem,3.6vw,3.4rem)] leading-[0.98] font-extrabold tracking-[-0.035em] text-ivory">
                <TextReveal text={"A website people\nremember."} />
              </h2>

              <Reveal className="mt-6 max-w-lg" y={22} stagger={0.1}>
                <p className="text-lede text-mist">
                  Most sites are forgotten in under ten seconds. Yours will not be. MSDEV builds the
                  kind of digital presence that makes a visitor stop, scroll, and get in touch —
                  because the site itself proves you take your work seriously.
                </p>
              </Reveal>

              <Reveal className="mt-10 flex flex-col divide-y divide-edge border-y border-edge" y={20} stagger={0.08}>
                {REASONS.map((reason) => (
                  <div key={reason.title} className="group py-5">
                    <div className="flex items-start gap-4">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-px w-6 shrink-0 origin-left bg-brass transition-transform duration-500 group-hover:scale-x-150"
                      />
                      <div>
                        <h3 className="font-display text-lg font-bold tracking-tight text-ivory">
                          {reason.title}
                        </h3>
                        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-steel">{reason.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </Reveal>

              <Reveal className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center" y={20} stagger={0.1}>
                <ActionButton href="#contact" variant="solid">
                  Start your project
                </ActionButton>
                <ActionButton href="#work" variant="ghost">
                  See what we build
                </ActionButton>
              </Reveal>
            </div>

            {/* the robot */}
            <div className="relative min-h-[22rem] sm:min-h-[26rem] lg:min-h-[38rem]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(200,162,122,0.1),transparent_62%)]" />
              <RobotScene />
              <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center font-mono text-[0.625rem] tracking-[0.2em] text-steel/70 uppercase">
                Move your cursor — or drag on the screen
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

export default RobotSection;
