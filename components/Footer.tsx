"use client";

import { nav, site } from "@/data/site";

export function Footer() {
  const year = 2026;

  const goTo = (href: string) => {
    const id = href.replace("#", "");
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="relative border-t border-edge">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-display text-[clamp(2.6rem,7vw,4.5rem)] leading-none font-extrabold tracking-[-0.05em] text-ivory">
              {site.name}
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-steel">
              Digital experiences that make businesses stand out. Designed and built in {site.city},{" "}
              {site.country}.
            </p>
          </div>

          <nav aria-label="Footer" className="lg:col-span-3">
            <p className="eyebrow mb-5">Navigate</p>
            <ul className="flex flex-col gap-2.5">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(event) => {
                      event.preventDefault();
                      goTo(item.href);
                    }}
                    className="text-sm text-steel transition-colors duration-300 hover:text-ivory"
                    data-cursor="link"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-4">
            <p className="eyebrow mb-5">Follow</p>
            <ul className="flex flex-col gap-2.5">
              {site.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-steel transition-colors duration-300 hover:text-ivory"
                    data-cursor="link"
                  >
                    {social.label}
                    <span className="text-steel/50"> — {social.handle}</span>
                  </a>
                </li>
              ))}
              <li className="mt-3">
                <a
                  href={`mailto:${site.email}`}
                  className="text-sm text-ivory underline underline-offset-4 transition-colors hover:text-brass"
                  data-cursor="link"
                >
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.phone.tel}`}
                  className="text-sm text-ivory underline underline-offset-4 transition-colors hover:text-brass"
                  data-cursor="link"
                >
                  {site.phone.display}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-edge pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[0.625rem] tracking-[0.16em] text-steel uppercase">
            © {year} {site.name}. All rights reserved.
          </p>
          <p className="font-mono text-[0.625rem] tracking-[0.16em] text-steel/70 uppercase">
            Designed &amp; built by {site.name}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
