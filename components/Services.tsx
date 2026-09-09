"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { services } from "@/data/site";
import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { useIsTouch, usePrefersReducedMotion } from "@/hooks/use-media-query";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Services as a set of large rows that open in place. Hovering opens one on a
 * fine pointer; tapping or pressing Enter opens it anywhere. A soft light
 * tracks the cursor inside the active row — CSS custom properties only, so no
 * layout work happens on pointer move.
 */
export function Services() {
  const [open, setOpen] = useState<number | null>(0);
  const isTouch = useIsTouch();
  const reducedMotion = usePrefersReducedMotion();

  const trackLight = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const row = event.currentTarget;
    const rect = row.getBoundingClientRect();
    row.style.setProperty("--x", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    row.style.setProperty("--y", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  }, []);

  return (
    <section id="services" aria-labelledby="services-heading" className="relative scroll-mt-24 py-24 md:py-36">
      <div className="shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-8">02 — Services</p>
            <h2 id="services-heading" className="font-display text-mega font-extrabold text-ivory">
              <TextReveal text="What we do" />
            </h2>
          </div>
          <Reveal className="max-w-sm md:pb-4" y={20} self>
            <p className="text-base leading-relaxed text-steel">
              Six ways we work. Most projects combine two or three — tell us the goal and we will
              tell you what it actually needs.
            </p>
          </Reveal>
        </div>

        <ul className="mt-14 border-t border-edge md:mt-20">
          {services.map((service, index) => {
            const isOpen = open === index;
            return (
              <li key={service.index} className="border-b border-edge">
                <div
                  onPointerMove={trackLight}
                  onPointerEnter={() => {
                    if (!isTouch) setOpen(index);
                  }}
                  className={cn(
                    "group relative overflow-hidden transition-colors duration-500",
                    "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500",
                    "before:bg-[radial-gradient(340px_circle_at_var(--x,50%)_var(--y,50%),rgba(200,162,122,0.12),transparent_70%)]",
                    isOpen && "before:opacity-100",
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      aria-controls={`service-panel-${service.index}`}
                      className="relative flex w-full items-center gap-5 py-7 text-left md:gap-10 md:py-9"
                      data-cursor="link"
                    >
                      <span
                        className={cn(
                          "font-mono text-[0.6875rem] tracking-[0.2em] transition-colors duration-500",
                          isOpen ? "text-brass" : "text-steel",
                        )}
                      >
                        {service.index}
                      </span>

                      <span
                        className={cn(
                          "flex-1 font-display text-[clamp(1.55rem,4.6vw,3.4rem)] leading-[1.02] font-extrabold tracking-[-0.035em] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                          isOpen ? "text-ivory md:translate-x-3" : "text-ivory/55",
                        )}
                      >
                        {service.title}
                      </span>

                      <Plus
                        className={cn(
                          "size-5 shrink-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                          isOpen ? "rotate-45 text-brass" : "text-steel",
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`service-panel-${service.index}`}
                        initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.55, ease: EASE }}
                        className="relative overflow-hidden"
                      >
                        <div className="grid gap-6 pb-9 md:grid-cols-12 md:gap-10 md:pl-[4.5rem]">
                          <p className="text-lede max-w-xl text-mist md:col-span-7">{service.excerpt}</p>
                          <ul className="flex flex-wrap gap-x-3 gap-y-2 md:col-span-5 md:justify-end">
                            {service.points.map((point) => (
                              <li
                                key={point}
                                className="rounded-full border border-edge px-3.5 py-1.5 font-mono text-[0.625rem] tracking-[0.14em] text-steel uppercase"
                              >
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default Services;
