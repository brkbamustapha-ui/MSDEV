"use client";

import { ArrowUpRight } from "lucide-react";

import { site } from "@/data/site";
import { ContactForm } from "@/components/ContactForm";
import { ParticleField } from "@/components/ParticleField";
import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative scroll-mt-24 overflow-hidden border-t border-edge pt-24 pb-24 md:pt-32 md:pb-32"
    >
      <ParticleField className="opacity-60" density={36} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(70%_60%_at_50%_0%,rgba(200,162,122,0.12),transparent_70%)]"
      />

      <div className="shell relative">
        <p className="eyebrow mb-9">07 — Contact</p>

        <h2 id="contact-heading" className="font-display text-mega font-extrabold text-ivory">
          <TextReveal text={"Let's build\nsomething\nextraordinary."} />
        </h2>

        <div className="mt-16 grid gap-14 md:mt-24 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal className="flex flex-col gap-10" y={26} stagger={0.1}>
              <div>
                <p className="eyebrow mb-4">Start a project</p>
                {/*
                  Sized so a full-length address stays on one line in this
                  column instead of spilling into the form beside it. The
                  <wbr> lets it break after the "@" on a narrow screen rather
                  than mid-word.
                */}
                <a
                  href={`mailto:${site.email}?subject=Project%20enquiry%20—%20${site.name}`}
                  className="group inline-flex max-w-full items-baseline gap-2 font-display text-[clamp(0.85rem,1.4vw,1.15rem)] leading-tight font-extrabold tracking-[-0.01em] text-ivory"
                  data-cursor="link"
                >
                  <span className="min-w-0 break-words border-b border-edge-strong pb-1 transition-colors duration-500 group-hover:border-brass">
                    {site.email.split("@")[0]}@<wbr />
                    {site.email.split("@")[1]}
                  </span>
                  <ArrowUpRight
                    className="size-4 shrink-0 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                    aria-hidden="true"
                  />
                </a>

                <a
                  href={`tel:${site.phone.tel}`}
                  className="group mt-4 inline-flex items-baseline gap-3 font-display text-[clamp(1rem,1.7vw,1.35rem)] font-bold tracking-[-0.02em] text-mist transition-colors duration-500 hover:text-ivory"
                  data-cursor="link"
                >
                  <span className="font-mono text-[0.625rem] tracking-[0.2em] text-brass uppercase">
                    Call
                  </span>
                  <span className="border-b border-edge pb-0.5 transition-colors duration-500 group-hover:border-brass">
                    {site.phone.display}
                  </span>
                </a>
              </div>

              <div>
                <p className="eyebrow mb-5">Elsewhere</p>
                <ul className="flex flex-col border-t border-edge">
                  {site.socials.map((social) => (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between gap-6 border-b border-edge py-4"
                        data-cursor="link"
                      >
                        <span className="font-mono text-[0.6875rem] tracking-[0.18em] text-ivory uppercase">
                          {social.label}
                        </span>
                        <span className="flex items-center gap-3 text-sm text-steel transition-colors duration-500 group-hover:text-brass">
                          {social.handle}
                          <ArrowUpRight
                            className="size-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            aria-hidden="true"
                          />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="eyebrow mb-3">Studio</p>
                <p className="text-sm leading-relaxed text-steel">
                  {site.city}, {site.country}
                  <br />
                  Working with clients everywhere.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal y={30} self>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
