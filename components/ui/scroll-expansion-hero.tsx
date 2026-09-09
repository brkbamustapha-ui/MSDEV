"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import { cn, clamp } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

/** Fired by any component that needs the hero to release the scroll lock. */
export const UNLOCK_HERO_EVENT = "msdev:unlock-hero";
/** Fired by the hero once the media has fully expanded. */
export const HERO_EXPANDED_EVENT = "msdev:hero-expanded";

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
 * A hero that trades the first screen of scroll for an expansion: the frame in
 * the centre grows to fill the viewport while the backdrop dissolves, and only
 * then does the page release and scroll normally.
 *
 * Accessibility notes — the scroll lock is a hijack, so it is bounded:
 *  - `prefers-reduced-motion` skips it entirely and renders the expanded state,
 *  - the keyboard drives it (arrows / page keys / space) and Escape skips it,
 *  - a "skip intro" control is always focusable,
 *  - any component can dispatch `UNLOCK_HERO_EVENT` to release it (the nav does
 *    this so in-page links work before the intro has finished).
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

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false);
  const [isMobileState, setIsMobileState] = useState(false);

  const touchStartY = useRef(0);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const expand = useCallback(() => {
    setScrollProgress(1);
    setMediaFullyExpanded(true);
    setShowContent(true);
  }, []);

  /* Reset if the media source is swapped at runtime. */
  useEffect(() => {
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
  }, [mediaType, mediaSrc]);

  /* Visitors who asked for less motion get the finished state immediately. */
  useEffect(() => {
    if (reducedMotion) expand();
  }, [reducedMotion, expand]);

  /* Let the rest of the app release the lock (nav links, deep links, …). */
  useEffect(() => {
    const onUnlock = () => expand();
    window.addEventListener(UNLOCK_HERO_EVENT, onUnlock);
    if (window.location.hash && window.location.hash !== "#top") expand();
    return () => window.removeEventListener(UNLOCK_HERO_EVENT, onUnlock);
  }, [expand]);

  useEffect(() => {
    if (mediaFullyExpanded) {
      window.dispatchEvent(new CustomEvent(HERO_EXPANDED_EVENT));
    }
  }, [mediaFullyExpanded]);

  useEffect(() => {
    const checkIfMobile = () => setIsMobileState(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  /* ------------------------------------------------------------- the lock */
  useEffect(() => {
    if (reducedMotion) return;

    /** One place where progress is advanced, whatever the input device. */
    const advance = (delta: number) => {
      setScrollProgress((current) => {
        const next = clamp(current + delta);
        if (next >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (next < 0.75) {
          setShowContent(false);
        }
        return next;
      });
    };

    const collapse = () => {
      setMediaFullyExpanded(false);
      setShowContent(false);
      setScrollProgress(0.985);
    };

    const handleWheel = (e: WheelEvent) => {
      if (mediaFullyExpanded) {
        if (e.deltaY < 0 && window.scrollY <= 5) {
          collapse();
          e.preventDefault();
        }
        return;
      }
      e.preventDefault();
      advance(e.deltaY * 0.0009);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartY.current) return;
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY.current - touchY;

      if (mediaFullyExpanded) {
        if (deltaY < -20 && window.scrollY <= 5) {
          collapse();
          e.preventDefault();
        }
        return;
      }
      e.preventDefault();
      // Scrolling back up wants a little more sensitivity than going down.
      advance(deltaY * (deltaY < 0 ? 0.008 : 0.005));
      touchStartY.current = touchY;
    };

    const handleTouchEnd = () => {
      touchStartY.current = 0;
    };

    const handleKey = (e: KeyboardEvent) => {
      if (mediaFullyExpanded) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
        case " ":
        case "Enter":
          e.preventDefault();
          advance(e.key === "ArrowDown" ? 0.12 : 0.34);
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          advance(e.key === "ArrowUp" ? -0.12 : -0.34);
          break;
        case "Escape":
        case "End":
          e.preventDefault();
          expand();
          break;
        default:
          break;
      }
    };

    /* While the intro is running the page must not move. */
    const handleScroll = () => {
      if (!mediaFullyExpanded) window.scrollTo(0, 0);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKey);
    };
  }, [mediaFullyExpanded, reducedMotion, expand]);

  /* ---------------------------------------------------------- derived geometry */
  const mediaWidth = 300 + scrollProgress * (isMobileState ? 650 : 1400);
  const mediaHeight = 400 + scrollProgress * (isMobileState ? 220 : 400);
  const textTranslateX = scrollProgress * (isMobileState ? 24 : 34);

  const words = title ? title.trim().split(/\s+/) : [];
  const firstWord = words[0] ?? "";
  const restOfTitle = words.slice(1).join(" ");
  const singleWord = Boolean(firstWord) && !restOfTitle;

  return (
    <div ref={sectionRef} className="overflow-x-clip transition-colors duration-700 ease-in-out">
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-start">
        <div className="relative flex min-h-[100dvh] w-full flex-col items-center">
          {/* backdrop — dissolves as the frame takes over */}
          <motion.div
            className="absolute inset-0 z-0 h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.1 }}
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
          </motion.div>

          <div className="relative z-10 mx-auto flex w-full flex-col items-center justify-start">
            <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center">
              {/* the expanding frame */}
              <div
                className="absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 rounded-[1.25rem] transition-none"
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
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
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-void/40"
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                        transition={{ duration: 0.2 }}
                      />
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
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-void/40"
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                        transition={{ duration: 0.2 }}
                      />
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
                    <motion.div
                      className="absolute inset-0 bg-void"
                      initial={{ opacity: 0.65 }}
                      animate={{ opacity: 0.6 - scrollProgress * 0.32 }}
                      transition={{ duration: 0.2 }}
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-ivory/10" />
                  </div>
                )}

                {/* meta lines drift apart as the frame opens */}
                <div className="relative z-10 mt-5 flex flex-col items-center gap-2 text-center transition-none">
                  {date && (
                    <p
                      className="eyebrow text-brass"
                      style={{ transform: `translateX(-${textTranslateX}vw)` }}
                    >
                      {date}
                    </p>
                  )}
                  {scrollToExpand && !mediaFullyExpanded && (
                    <p
                      className="eyebrow text-ivory/70"
                      style={{ transform: `translateX(${textTranslateX}vw)` }}
                    >
                      {scrollToExpand}
                    </p>
                  )}
                </div>
              </div>

              {/* the wordmark */}
              <div
                className={cn(
                  "relative z-10 flex w-full flex-col items-center justify-center gap-2 text-center transition-none",
                  textBlend ? "mix-blend-difference" : "mix-blend-normal",
                )}
              >
                {singleWord ? (
                  <h1
                    className="font-display text-hero font-extrabold text-ivory transition-none"
                    style={{
                      letterSpacing: `${-0.05 + scrollProgress * 0.1}em`,
                      transform: `scale(${1 - scrollProgress * 0.1})`,
                      // the tracking pushes the last letter's side bearing out
                      textIndent: `${scrollProgress * 0.1}em`,
                    }}
                  >
                    {firstWord}
                  </h1>
                ) : (
                  <h1 className="flex flex-col items-center gap-1 font-display text-mega font-extrabold text-ivory transition-none">
                    <span style={{ transform: `translateX(-${textTranslateX}vw)` }}>{firstWord}</span>
                    <span style={{ transform: `translateX(${textTranslateX}vw)` }}>{restOfTitle}</span>
                  </h1>
                )}
              </div>

              {/* progress + skip */}
              {!mediaFullyExpanded && (
                <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3">
                  <div
                    className="h-px w-40 overflow-hidden bg-ivory/15"
                    role="progressbar"
                    aria-label="Intro progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(scrollProgress * 100)}
                  >
                    <div
                      className="h-full bg-brass transition-none"
                      style={{ width: `${scrollProgress * 100}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={expand}
                    className="eyebrow rounded-full px-3 py-1 text-ivory/45 transition-colors duration-300 hover:text-ivory"
                  >
                    Skip intro
                  </button>
                </div>
              )}
            </div>

            {/* content revealed once the frame is open */}
            <motion.div
              className="flex w-full flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              // keeps hidden content out of the tab order during the intro
              inert={!showContent}
            >
              {children}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollExpandMedia;
export { ScrollExpandMedia };
