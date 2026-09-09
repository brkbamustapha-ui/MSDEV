"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";

import { cn, clamp } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

interface ScrollExpandMediaProps {
  mediaType?: "video" | "image";
  mediaSrc: string;
  /**
   * Optional second encoding, offered only to browsers that cannot play
   * `mediaSrc`. A Chromium built without proprietary codecs, for instance,
   * refuses H.264 with DEMUXER_ERROR_NO_SUPPORTED_STREAMS.
   */
  mediaSrcFallback?: string;
  /**
   * Intrinsic width / height of the media. When given, the frame takes the
   * media's own shape as it expands, so nothing is ever cropped and the
   * rounded corners hug the picture instead of framing empty space. The real
   * value is read back off the element once its metadata arrives.
   */
  mediaAspect?: number;
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
  mediaSrcFallback,
  mediaAspect,
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

  /** Live aspect (width / height); 0 means "not known, use the plain box". */
  const aspectRef = useRef(mediaAspect ?? 0);

  const videoRef = useRef<HTMLVideoElement>(null);
  /** Mirrors the element's real state, so a stalled video can never look broken. */
  const [playing, setPlaying] = useState(false);

  const startPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true; // some engines only honour the property, not the attribute
    void video.play().catch(() => setPlaying(false));
  }, []);

  /**
   * Autoplay is a request, not a guarantee. Firefox's "Block Audio and Video"
   * setting, enterprise policy, an extension or battery saver can all refuse
   * it, and the element then sits on its poster looking like a frozen frame.
   *
   * So: ask to play, ask again once the data is there, and ask once more on
   * the visitor's first interaction — a single gesture lifts every autoplay
   * policy there is. Whatever happens, `playing` tracks the truth and the
   * overlay control appears when the footage is not actually running.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (mediaType !== "video" || !video) return;

    const onPlaying = () => setPlaying(true);
    const onStopped = () => setPlaying(false);
    const onMeta = () => {
      if (video.videoWidth && video.videoHeight) {
        aspectRef.current = video.videoWidth / video.videoHeight;
        window.dispatchEvent(new Event("resize")); // re-measure the frame
      }
    };
    video.addEventListener("loadedmetadata", onMeta);
    onMeta();

    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onStopped);
    video.addEventListener("stalled", onStopped);
    video.addEventListener("error", onStopped);

    if (reducedMotion) {
      /*
        The preference is only known on the client, so the server already sent
        `autoplay` and the browser has very likely started the loop by now.
        Stop it and rewind — the control below is then the only way in.
      */
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        // seeking before metadata arrives throws on some engines; harmless
      }
      setPlaying(false);

      return () => {
        video.removeEventListener("loadedmetadata", onMeta);
        video.removeEventListener("playing", onPlaying);
        video.removeEventListener("pause", onStopped);
        video.removeEventListener("stalled", onStopped);
        video.removeEventListener("error", onStopped);
      };
    }

    const attempt = () => startPlayback();
    attempt();
    video.addEventListener("canplay", attempt);
    window.addEventListener("pointerdown", attempt, { once: true });
    window.addEventListener("keydown", attempt, { once: true });

    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onStopped);
      video.removeEventListener("stalled", onStopped);
      video.removeEventListener("error", onStopped);
      video.removeEventListener("canplay", attempt);
      window.removeEventListener("pointerdown", attempt);
      window.removeEventListener("keydown", attempt);
    };
  }, [mediaType, reducedMotion, startPlayback]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;
    let lastOpened = false;

    const paint = (progress: number) => {
      const mobile = window.innerWidth < 768;

      const frame = frameRef.current;
      if (frame) {
        const aspect = aspectRef.current;
        if (aspect > 0) {
          /*
            The frame keeps the media's own shape, so the picture is never
            cropped and the rounded corners hug it rather than framing empty
            space. Whatever is left over is simply the page's black.
          */
          const endHeight = Math.min(
            window.innerHeight * 0.86,
            (window.innerWidth * 0.94) / aspect,
          );
          const height = 400 + progress * (endHeight - 400);
          frame.style.height = `${height}px`;
          frame.style.width = `${height * aspect}px`;
        } else {
          frame.style.width = `${300 + progress * (mobile ? 650 : 1400)}px`;
          frame.style.height = `${400 + progress * (mobile ? 220 : 400)}px`;
        }
      }

      const backdrop = backdropRef.current;
      if (backdrop) backdrop.style.opacity = `${1 - progress}`;

      const word = wordRef.current;
      if (word) {
        word.style.letterSpacing = `${-0.05 + progress * 0.1}em`;
        word.style.textIndent = `${progress * 0.1}em`;
        word.style.transform = `scale(${1 - progress * 0.1})`;
      }

      // The meta lines drift apart as the frame opens. Kept small on a phone,
      // where a wider drift walks the caption straight off the screen.
      const drift = progress * (mobile ? 7 : 34);
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
              // paint() takes over on the first frame; these are the values
              // the server renders, kept in the media's shape when it is known
              width: mediaAspect ? `${400 * mediaAspect}px` : "300px",
              height: "400px",
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
                <div className="relative h-full w-full overflow-hidden rounded-2xl">
                  <video
                    ref={videoRef}
                    key={mediaSrc}
                    poster={posterSrc}
                    // Under reduced motion nothing starts by itself, and the
                    // footage is not even fetched until it is asked for.
                    autoPlay={!reducedMotion}
                    muted
                    loop
                    playsInline
                    preload={reducedMotion ? "none" : "auto"}
                    className="pointer-events-none relative h-full w-full object-cover object-center"
                    controls={false}
                    disablePictureInPicture
                    disableRemotePlayback
                    // decorative: the heading carries the meaning
                    aria-hidden="true"
                  >
                    {/* H.264 first: it is the one every device decodes in
                        hardware. The fallback is picked up by builds that
                        cannot play it at all. */}
                    <source src={mediaSrc} type="video/mp4" />
                    {mediaSrcFallback && <source src={mediaSrcFallback} type="video/webm" />}
                  </video>
                  <div className="pointer-events-none absolute inset-0 bg-void/35" />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ivory/10" />

                  {/*
                    Whenever the footage is not actually running — autoplay
                    refused, playback stalled, or reduced motion asked for —
                    this turns a frozen-looking frame into something the
                    visitor can obviously start.
                  */}
                  {!playing && (
                    <button
                      type="button"
                      onClick={startPlayback}
                      // sits below the wordmark rather than behind it
                      className="group absolute inset-0 z-10 flex items-end justify-center pb-[10%]"
                      aria-label="Play the background footage"
                    >
                      <span className="flex size-16 items-center justify-center rounded-full border border-ivory/40 bg-void/50 backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:border-brass group-hover:bg-void/70">
                        <svg viewBox="0 0 24 24" className="ml-0.5 size-5 fill-ivory" aria-hidden="true">
                          <path d="M8 5.5v13l11-6.5z" />
                        </svg>
                      </span>
                    </button>
                  )}
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
            /*
              Decorative type, and it covers the whole stage — without
              `pointer-events-none` it swallows clicks meant for the frame
              underneath (the play control, in particular).
            */
            className={cn(
              "pointer-events-none relative z-10 flex w-full flex-col items-center justify-center gap-2 text-center",
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
