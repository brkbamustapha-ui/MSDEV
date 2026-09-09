"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { projects, type Project } from "@/data/site";
import { ProjectShowcase } from "@/components/ProjectShowcase";
import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/components/motion/gsap";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

/**
 * Selected work.
 *
 * On a wide screen the section pins and the projects travel sideways as the
 * page scrolls — one continuous move rather than a grid of thumbnails. Below
 * `lg`, and whenever reduced motion is requested, the same cards stack
 * vertically: no pinning, no hijack, nothing to get stuck in on a phone.
 */
export function Portfolio() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const [active, setActive] = useState<Project | null>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || reducedMotion) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 96);

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.55,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        /* Each card's image drifts inside its frame as the track moves. */
        const images = gsap.utils.toArray<HTMLElement>("[data-card-image]");
        images.forEach((image) => {
          gsap.fromTo(
            image,
            { xPercent: -6 },
            {
              xPercent: 6,
              ease: "none",
              scrollTrigger: {
                trigger: image,
                containerAnimation: tween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });

        return () => {
          gsap.set(track, { clearProps: "transform" });
        };
      });
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  const openProject = (project: Project, event: React.MouseEvent) => {
    setOrigin({ x: event.clientX, y: event.clientY });
    setActive(project);
  };

  return (
    <>
      <section
        id="work"
        ref={sectionRef}
        aria-labelledby="work-heading"
        className="relative scroll-mt-24 overflow-hidden py-24 lg:h-screen lg:py-0"
      >
        <div className="flex h-full flex-col lg:justify-start lg:pt-28">
          <div className="shell shrink-0">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow mb-8">03 — Portfolio</p>
                <h2 id="work-heading" className="font-display text-mega font-extrabold text-ivory lg:text-display">
                  <TextReveal text="Selected work" />
                </h2>
              </div>
              <Reveal className="md:pb-4" y={18} self>
                <p className="max-w-xs text-sm leading-relaxed text-steel">
                  <span className="hidden lg:inline">Scroll to move through the work. </span>
                  Open any project for the full story.
                </p>
              </Reveal>
            </div>
          </div>

          <ul
            ref={trackRef}
            className={cn(
              "mt-12 flex flex-col gap-6",
              "lg:mt-10 lg:w-max lg:flex-row lg:gap-8 lg:pr-24 lg:pl-[clamp(1.25rem,5vw,5rem)]",
            )}
          >
            {projects.map((project) => (
              <li
                key={project.slug}
                className="group px-[clamp(1.25rem,5vw,5rem)] lg:w-[min(68vw,42rem)] lg:px-0"
              >
                <button
                  type="button"
                  onClick={(event) => openProject(project, event)}
                  className="block w-full text-left"
                  data-cursor="media"
                  data-cursor-label="View project"
                  aria-label={`Open case study: ${project.title}, ${project.category}`}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-edge sm:aspect-[16/10]">
                    <div data-card-image className="absolute inset-0 scale-[1.14]">
                      <Image
                        src={project.image}
                        alt={`${project.title} — ${project.category}`}
                        fill
                        sizes="(max-width: 1024px) 92vw, 42rem"
                        className="object-cover object-center transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-void/85 via-void/10 to-transparent" />
                    <div className="absolute inset-0 opacity-0 ring-1 ring-inset ring-brass/40 transition-opacity duration-500 group-hover:opacity-100" />

                    <span
                      aria-hidden="true"
                      className="absolute top-5 left-5 font-mono text-[0.625rem] tracking-[0.2em] text-ivory/70 uppercase"
                    >
                      Project {project.index}
                    </span>

                    <span
                      aria-hidden="true"
                      className="absolute right-5 bottom-5 flex size-11 translate-y-2 items-center justify-center rounded-full bg-ivory text-void opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      <ArrowUpRight className="size-5" />
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <h3 className="font-display text-title font-extrabold text-ivory">
                      {project.title}
                    </h3>
                    <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brass uppercase">
                      {project.category}
                    </p>
                  </div>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-steel">{project.summary}</p>

                  <span className="mt-5 inline-flex items-center gap-2 border-b border-edge-strong pb-1 font-mono text-[0.625rem] tracking-[0.18em] text-ivory uppercase transition-colors duration-500 group-hover:border-brass">
                    View project
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </span>
                </button>
              </li>
            ))}

            {/* end card — the next project could be yours */}
            <li className="px-[clamp(1.25rem,5vw,5rem)] lg:flex lg:w-[min(46vw,26rem)] lg:items-start lg:px-0">
              <a
                href="#contact"
                className="group flex h-full w-full flex-col justify-center rounded-xl border border-dashed border-edge-strong p-10 transition-colors duration-500 hover:border-brass lg:aspect-[16/10]"
                data-cursor="link"
              >
                <p className="eyebrow mb-5 text-brass">Next</p>
                <p className="font-display text-[clamp(1.8rem,3.4vw,2.8rem)] leading-[1.05] font-extrabold tracking-[-0.035em] text-ivory">
                  Your project,
                  <br />
                  built properly.
                </p>
                <span className="mt-7 inline-flex items-center gap-2 font-mono text-[0.625rem] tracking-[0.18em] text-steel uppercase transition-colors group-hover:text-ivory">
                  Start a project
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </span>
              </a>
            </li>
          </ul>
        </div>
      </section>

      <ProjectShowcase project={active} origin={origin} onClose={() => setActive(null)} />
    </>
  );
}

export default Portfolio;
