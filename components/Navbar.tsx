"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { nav, site } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("top");

  /* Condense the bar once the page has moved. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Highlight whichever section owns the middle of the viewport. */
  useEffect(() => {
    const sections = nav
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  /* Lock the page behind the mobile overlay, and close it on Escape. */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /** Closes the mobile overlay, then scrolls to the section. */
  const goTo = useCallback((href: string) => {
    setOpen(false);

    const id = href.replace("#", "");
    // one tick, so the overlay has released the body scroll lock first
    window.setTimeout(() => {
      if (id === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[100] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          scrolled
            ? "border-b border-edge bg-void/70 py-3 backdrop-blur-xl supports-[backdrop-filter]:bg-void/55"
            : "border-b border-transparent py-6",
        )}
      >
        <nav aria-label="Primary" className="shell flex items-center justify-between gap-6">
          <a
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              goTo("#top");
            }}
            className="group relative font-display text-lg font-extrabold tracking-[-0.04em] text-ivory"
            data-cursor="link"
          >
            {site.name}
            <span className="absolute -right-2 -top-0.5 size-1 rounded-full bg-brass transition-transform duration-500 group-hover:scale-150" />
            <span className="sr-only"> — home</span>
          </a>

          {/* desktop */}
          <ul className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(event) => {
                    event.preventDefault();
                    goTo(item.href);
                  }}
                  aria-current={active === item.id ? "true" : undefined}
                  className={cn(
                    "group relative block px-3.5 py-2 font-mono text-[0.6875rem] tracking-[0.16em] uppercase transition-colors duration-300",
                    active === item.id ? "text-ivory" : "text-steel hover:text-ivory",
                  )}
                  data-cursor="link"
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute inset-x-3.5 -bottom-px h-px origin-left bg-brass transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      active === item.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden lg:block">
            <a
              href="#contact"
              onClick={(event) => {
                event.preventDefault();
                goTo("#contact");
              }}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-edge-strong px-5 py-2.5 font-mono text-[0.6875rem] tracking-[0.16em] whitespace-nowrap text-ivory uppercase transition-colors duration-500 hover:text-void"
              data-cursor="link"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 origin-bottom scale-y-0 bg-ivory transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
              />
              <span className="relative">Start a project</span>
            </a>
          </div>

          {/* mobile trigger */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="-mr-2 flex items-center gap-2 p-2 font-mono text-[0.6875rem] tracking-[0.16em] text-ivory uppercase lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            Menu
            <Menu className="size-4" aria-hidden="true" />
          </button>
        </nav>
      </header>

      {/* mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-[110] flex flex-col bg-void lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.66, ease: EASE }}
          >
            <div className="shell flex items-center justify-between py-6">
              <span className="font-display text-lg font-extrabold tracking-[-0.04em] text-ivory">
                {site.name}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                autoFocus
                className="-mr-2 flex items-center gap-2 p-2 font-mono text-[0.6875rem] tracking-[0.16em] text-ivory uppercase"
              >
                Close
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile" className="shell flex flex-1 flex-col justify-center">
              <ul className="flex flex-col gap-1">
                {nav.map((item, index) => (
                  <li key={item.href} className="overflow-hidden">
                    <motion.a
                      href={item.href}
                      onClick={(event) => {
                        event.preventDefault();
                        goTo(item.href);
                      }}
                      initial={{ y: "110%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      exit={{ y: "110%", opacity: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 + index * 0.055, ease: EASE }}
                      className="flex items-baseline gap-4 py-2 font-display text-[clamp(2.4rem,13vw,4.5rem)] leading-[0.95] font-extrabold tracking-[-0.04em] text-ivory"
                    >
                      <span className="font-mono text-[0.625rem] tracking-[0.2em] text-brass">
                        0{index + 1}
                      </span>
                      {item.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="shell border-t border-edge py-7"
            >
              <a
                href={`mailto:${site.email}`}
                className="block font-display text-lg font-bold tracking-tight break-all text-ivory"
              >
                {site.email}
              </a>
              <a
                href={`tel:${site.phone.tel}`}
                className="mt-1.5 block font-display text-lg font-bold tracking-tight text-brass"
              >
                {site.phone.display}
              </a>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {site.socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[0.6875rem] tracking-[0.16em] text-steel uppercase"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
