"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";

import type { Project } from "@/data/site";
import { ActionButton } from "@/components/ui/action-button";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

const EASE = [0.16, 1, 0.3, 1] as const;

type ProjectShowcaseProps = {
  project: Project | null;
  /** Viewport point the overlay should open from — usually the click. */
  origin?: { x: number; y: number } | null;
  onClose: () => void;
};

/**
 * The immersive case study. Opens as a circular wipe from wherever the visitor
 * clicked, and behaves like a proper modal dialog: focus is moved in and
 * trapped, Escape closes, the page behind is locked and focus returns to the
 * card that opened it.
 */
export function ProjectShowcase({ project, origin, onClose }: ProjectShowcaseProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!project) return;

    restoreFocus.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const raf = requestAnimationFrame(() => closeRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocus.current?.focus?.();
    };
  }, [project, onClose]);

  const x = origin?.x ?? (typeof window !== "undefined" ? window.innerWidth / 2 : 0);
  const y = origin?.y ?? (typeof window !== "undefined" ? window.innerHeight / 2 : 0);

  const clipClosed = `circle(0px at ${x}px ${y}px)`;
  const clipOpen = `circle(${Math.hypot(
    Math.max(x, (typeof window !== "undefined" ? window.innerWidth : 0) - x),
    Math.max(y, (typeof window !== "undefined" ? window.innerHeight : 0) - y),
  )}px at ${x}px ${y}px)`;

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key={project.slug}
          role="dialog"
          aria-modal="true"
          aria-labelledby="showcase-title"
          className="fixed inset-0 z-[120] overflow-y-auto overscroll-contain bg-void"
          initial={reducedMotion ? { opacity: 0 } : { clipPath: clipClosed }}
          animate={reducedMotion ? { opacity: 1 } : { clipPath: clipOpen }}
          exit={reducedMotion ? { opacity: 0 } : { clipPath: clipClosed }}
          transition={{ duration: reducedMotion ? 0.2 : 0.85, ease: EASE }}
        >
          <div ref={panelRef} className="relative min-h-full pb-24">
            {/* cover */}
            <div className="relative h-[58vh] min-h-[22rem] w-full overflow-hidden md:h-[74vh]">
              <Image
                src={project.image}
                alt={`${project.title} — ${project.category}`}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void via-void/35 to-void/60" />

              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="group absolute top-5 right-5 z-10 flex items-center gap-2 rounded-full border border-edge-strong bg-void/60 px-4 py-2.5 font-mono text-[0.625rem] tracking-[0.18em] text-ivory uppercase backdrop-blur-md transition-colors hover:bg-ivory hover:text-void md:top-8 md:right-8"
              >
                Close
                <X className="size-3.5 transition-transform duration-500 group-hover:rotate-90" aria-hidden="true" />
              </button>

              <div className="shell absolute inset-x-0 bottom-0 pb-8 md:pb-12">
                <motion.div
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
                >
                  <p className="eyebrow mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-brass">Project {project.index}</span>
                    <span aria-hidden="true" className="text-steel/50">
                      /
                    </span>
                    <span>{project.category}</span>
                    <span aria-hidden="true" className="text-steel/50">
                      /
                    </span>
                    <span>{project.year}</span>
                  </p>
                  <h2
                    id="showcase-title"
                    className="font-display text-mega font-extrabold tracking-[-0.045em] text-ivory"
                  >
                    {project.title}
                  </h2>
                </motion.div>
              </div>
            </div>

            {/* body */}
            <motion.div
              className="shell pt-14 md:pt-20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
            >
              <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-7">
                  <p className="eyebrow mb-5">Overview</p>
                  <p className="text-lede text-mist">{project.overview}</p>

                  <div className="mt-14 grid gap-12 sm:grid-cols-2">
                    <div>
                      <p className="eyebrow mb-5">Objectives</p>
                      <ul className="flex flex-col gap-3">
                        {project.goals.map((goal) => (
                          <li key={goal} className="flex gap-3 text-sm leading-relaxed text-steel">
                            <span aria-hidden="true" className="mt-2 h-px w-4 shrink-0 bg-brass" />
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="eyebrow mb-5">Result</p>
                      <ul className="flex flex-col gap-3">
                        {project.result.map((item) => (
                          <li key={item} className="flex gap-3 text-sm leading-relaxed text-steel">
                            <span aria-hidden="true" className="mt-2 h-px w-4 shrink-0 bg-ivory/40" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <aside className="lg:col-span-5 lg:pl-10">
                  <dl className="flex flex-col divide-y divide-edge border-y border-edge">
                    <div className="flex items-baseline justify-between gap-6 py-4">
                      <dt className="eyebrow">Client</dt>
                      <dd className="font-display text-base font-bold text-ivory">{project.title}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-6 py-4">
                      <dt className="eyebrow">Sector</dt>
                      <dd className="text-sm text-mist">{project.category}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-6 py-4">
                      <dt className="eyebrow">Location</dt>
                      <dd className="text-sm text-mist">{project.location}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-6 py-4">
                      <dt className="eyebrow">Year</dt>
                      <dd className="text-sm text-mist">{project.year}</dd>
                    </div>
                  </dl>

                  <p className="eyebrow mt-10 mb-4">Technology</p>
                  <ul className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <li
                        key={tech}
                        className="rounded-full border border-edge px-3.5 py-1.5 font-mono text-[0.625rem] tracking-[0.14em] text-steel uppercase"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-10 flex flex-wrap items-center gap-4">
                    {project.href ? (
                      <ActionButton href={project.href} target="_blank" rel="noopener noreferrer">
                        Visit the site
                      </ActionButton>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full border border-edge px-5 py-3 font-mono text-[0.625rem] tracking-[0.16em] text-steel uppercase">
                        Live link coming soon
                      </span>
                    )}
                    <a
                      href="#contact"
                      onClick={onClose}
                      className="group inline-flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.16em] text-ivory uppercase"
                    >
                      Start something similar
                      <ArrowUpRight
                        className="size-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                </aside>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ProjectShowcase;
