"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";

import { cn, clamp } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

interface ScrollExpandMediaProps {
  mediaType?: "video" | "image";
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

/**
 * A hero whose centre frame expands to fill the screen as the page scrolls,
 * while the backdrop dissolves behind it.
 *
 * The expansion is driven by the page's own scroll position — the section is a
 * tall spacer with a sticky stage inside it. Nothing is hijacked: no wheel or
 * touch handler calls `preventDefault`, and the page is never pinned to the
 * top. That matters for more than purity; a hijacking version of this hero
 * froze the page outright when a visitor reloaded halfway down, and re-armed
 * itself every time anyone scrolled back to the top.
 *
 * Progress is written straight to the DOM inside one rAF, so a scroll costs no
 * React renders.
 */
const ScrollExpandMedia = ({
  mediaType = "video",
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const reducedMotion = usePrefersReducedMotion();

  const sectionRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);
  const dateRef = useRef<HTMLParagraphElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;
    let lastOpened = false;

    const paint = (progress: number) => {
      const mobile = window.innerWidth < 768;

      const frame = frameRef.current;
      if (frame) {
        frame.style.width = `${300 + progress * (mobile ? 650 : 1400)}px`;
        frame.style.height = `${400 + progress * (mobile ? 220 : 400)}px`;
      }

      const backdrop = backdropRef.current;
      if (backdrop) backdrop.style.opacity = `${1 - progress}`;

      const word = wordRef.current;
      if (word) {
        word.style.letterSpacing = `${-0.05 + progress * 0.1}em`;
        word.style.textIndent = `${progress * 0.1}em`;
        word.style.transform = `scale(${1 - progress * 0.1})`;
      }

      // the meta lines drift apart as the frame opens
      const drift = progress * (mobile ? 24 : 34);
      if (dateRef.current) dateRef.current.style.transform = `translateX(-${drift}vw)`;
      if (cueRef.current) {
        cueRef.current.style.transform = `translateX(${drift}vw)`;
        cueRef.current.style.opacity = `${1 - progress * 1.4}`;
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;

      const isOpen = progress > 0.75;
      if (isOpen !== lastOpened) {
        lastOpened = isOpen;
        setOpened(isOpen);
      }
    };

    if (reducedMotion) {
      paint(1);
      return;
    }

    const measure = () => {
      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - window.innerHeight;
      paint(travel > 0 ? clamp(-rect.top / travel) : rect.top <= 0 ? 1 : 0);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        measure();
      });
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reducedMotion, mediaSrc, mediaType]);

  const words = title ? title.trim().split(/\s+/) : [];
  const firstWord = words[0] ?? "";
  const restOfTitle = words.slice(1).join(" ");
  const singleWord = Boolean(firstWord) && !restOfTitle;

  return (
    <div className="overflow-x-clip">
      {/* The tall spacer: its scroll range is the expansion. */}
      <section
        ref={sectionRef}
        aria-label={title ? `${title} — introduction` : "Introduction"}
        className={cn("relative", reducedMotion ? "h-[100svh]" : "h-[220svh]")}
      >
        <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden">
          {/* backdrop — dissolves as the frame takes over */}
          <div
            ref={backdropRef}
            className="absolute inset-0 z-0"
            style={{ opacity: reducedMotion ? 0 : 1 }}
            aria-hidden="true"
          >
            <Image
              src={bgImageSrc}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-void/45" />
            <div className="absolute inset-0 bg-gradient-to-b from-void/80 via-transparent to-void" />
          </div>

          {/* the expanding frame */}
          <div
            ref={frameRef}
            className="absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 rounded-[1.25rem]"
            style={{
              width: reducedMotion ? "94vw" : "300px",
              height: reducedMotion ? "86vh" : "400px",
              maxWidth: "94vw",
              maxHeight: "86vh",
              boxShadow: "0 40px 120px -20px rgba(0,0,0,0.85)",
            }}
          >
            {mediaType === "video" ? (
              mediaSrc.includes("youtube.com") ? (
                <div className="pointer-events-none relative h-full w-full">
                  <iframe
                    title={title ? `${title} — showreel` : "Showreel"}
                    width="100%"
                    height="100%"
                    src={
                      mediaSrc.includes("embed")
                        ? `${mediaSrc}${mediaSrc.includes("?") ? "&" : "?"}autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1`
                        : `${mediaSrc.replace("watch?v=", "embed/")}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playlist=${mediaSrc.split("v=")[1]}`
                    }
                    className="h-full w-full rounded-2xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <div className="absolute inset-0 rounded-2xl bg-void/40" />
                </div>
              ) : (
                <div className="pointer-events-none relative h-full w-full">
                  <video
                    src={mediaSrc}
                    poster={posterSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="h-full w-full rounded-2xl object-cover"
                    controls={false}
                    disablePictureInPicture
                    disableRemotePlayback
                  />
                  <div className="absolute inset-0 rounded-2xl bg-void/40" />
                </div>
              )
            ) : (
              <div className="relative h-full w-full overflow-hidden rounded-2xl">
                <Image
                  src={mediaSrc}
                  alt={title ? `${title} — ${date ?? "cover"}` : "Cover image"}
                  fill
                  priority
                  sizes="(max-width: 768px) 94vw, 1400px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-void/40" />
                <div className="absolute inset-0 ring-1 ring-inset ring-ivory/10" />
              </div>
            )}

            {date && (
              <p ref={dateRef} className="eyebrow relative z-10 mt-5 text-center text-brass">
                {date}
              </p>
            )}
          </div>

          {/* the wordmark */}
          <div
            className={cn(
              "relative z-10 flex w-full flex-col items-center justify-center gap-2 text-center",
              textBlend ? "mix-blend-difference" : "mix-blend-normal",
            )}
          >
            {singleWord ? (
              <h1
                ref={wordRef}
                className="font-display text-hero font-extrabold text-ivory"
                style={reducedMotion ? { letterSpacing: "0.05em" } : undefined}
              >
                {firstWord}
              </h1>
            ) : (
              <h1 className="flex flex-col items-center gap-1 font-display text-mega font-extrabold text-ivory">
                <span>{firstWord}</span>
                <span>{restOfTitle}</span>
              </h1>
            )}
          </div>

          {/* scroll cue */}
          {!reducedMotion && (
            <div
              ref={cueRef}
              className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3"
              aria-hidden={opened}
            >
              {scrollToExpand && <p className="eyebrow text-ivory/70">{scrollToExpand}</p>}
              <span className="block h-px w-40 overflow-hidden bg-ivory/15">
                <span ref={barRef} className="block h-full origin-left scale-x-0 bg-brass" />
              </span>
            </div>
          )}
        </div>
      </section>

      {children}
    </div>
  );
};

export default ScrollExpandMedia;
export { ScrollExpandMedia };
