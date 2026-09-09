# MSDEV

Portfolio and studio site for **MSDEV** — a premium web development studio in
Oran, Algeria.

The site is the pitch: a scroll-driven intro that opens onto the bay of Oran
with the fort of Santa Cruz on the ridge, an interactive 3D robot that answers
to the cursor *and* to a finger, a pinned horizontal portfolio, real-time WebGL,
and a monochrome-plus-brass art direction carried by large display typography.

---

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first tokens), shadcn/ui structure |
| Motion | GSAP + ScrollTrigger, Framer Motion |
| 3D | Spline (robot scene) + a hand-written WebGL raymarcher |
| Icons | lucide-react |
| Deploy | Vercel (or any Node host) |

---

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm start          # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run assets     # regenerate every image in /public/media
```

---

## Making it yours

### 1. Content

**Everything you will want to edit lives in [`data/site.ts`](data/site.ts).**
Studio details, email, social handles, services, statistics, process steps,
technologies and the case studies are all defined there — no component needs to
be touched.

Placeholders to replace:

- `site.email`, `site.phone`, `site.socials` — currently `hello@msdev.dz` and
  `@msdev.dz` handles.
- `site.url` — your real domain (also set `NEXT_PUBLIC_SITE_URL`).
- `stats` — the `+40 projects` / `+25 clients` figures are deliberately round
  placeholders. Change the numbers; the counters animate to whatever you set.
- `projects` — four placeholder case studies. Swap `image` for a real
  screenshot, rewrite the copy, and add `href` to link the live site.

### 2. Images

Every image in `/public/media` is generated from vector art by
[`scripts/generate-assets.mjs`](scripts/generate-assets.mjs) — nothing is
fetched from a third-party image host at runtime, so the site works offline and
has no licensing questions attached.

Drop a real photograph or screenshot in at the same path and size and it just
works:

| File | Size | Used by |
|---|---|---|
| `oran-santa-cruz.jpg` | 1800×1012 | the frame the hero expands into |
| `oran-night.jpg` | 1920×1200 | hero backdrop |
| `work-0*.jpg` | 1400×1000 | project cards and case studies |
| `og.jpg` | 1200×630 | Open Graph / social preview |

To regenerate them after editing the script: `npm run assets`.

To use a remote image host instead, add it to `images.remotePatterns` in
[`next.config.ts`](next.config.ts).

### 3. The 3D robot

`components/RobotScene.tsx` loads a Spline scene from
`https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode`. Replace
`SCENE_URL` with your own Spline export to change it.

The runtime (~1 MB) is code-split and only mounted once the section is within
500px of the viewport. If the scene cannot load — offline visitor, blocked CDN,
no WebGL — an error boundary swaps in a CSS fallback rather than letting the
failure reach the page.

### 4. The contact form

`POST /api/contact` validates the submission, applies a small per-IP rate limit
and a honeypot, then forwards it to `CONTACT_WEBHOOK_URL`.

> **Set `CONTACT_WEBHOOK_URL` before going live.** Without it the route returns
> success and writes the submission to the server log — the visitor is told the
> message was received, but nothing reaches your inbox. The success panel always
> shows the studio email as a fallback, but you will still miss leads.

Any endpoint that accepts a JSON `POST` works (Slack/Discord webhook, Zapier,
Make, a Supabase edge function, your own mailer).

---

## How it is put together

```
app/
  layout.tsx          fonts, metadata, JSON-LD, cursor, grain, skip link
  page.tsx            the section order
  globals.css         design tokens, base styles, custom utilities
  api/contact/        the form endpoint
components/
  Navbar  Hero  RobotSection  About  Services  Portfolio  ProjectShowcase
  Technologies  Process  WhyMsdev  Contact  Footer
  CustomCursor  ParticleField  CoreWebGL  RobotScene
  motion/           GSAP setup + Reveal, TextReveal, Parallax, Counter
  ui/               shadcn-structured primitives
data/site.ts        all content
hooks/              media queries, intersection observer
scripts/            asset generation
```

### Design tokens

Defined once in `app/globals.css` under `@theme`:

- **Surfaces** — `void` `#050506`, `ink`, `carbon`, `graphite`, `slate`
- **Ink** — `ivory` `#EFEBE4`, `mist`, `steel`
- **Accent** — `brass` `#C8A27A` (used sparingly: numbers, hairlines, hovers)
- **Type** — Syne (display), Inter (body), JetBrains Mono (labels)

Fluid heading sizes (`text-hero`, `text-mega`, `text-display`, `text-title`)
are clamped so no single word can outrun its column at any viewport width.

---

## Motion, accessibility and performance

The scroll-driven intro takes over the first screen of scroll, so it is bounded
deliberately:

- `prefers-reduced-motion: reduce` skips it entirely — and disables the pinned
  portfolio, parallax, counters and reveals along with it.
- The keyboard drives it: <kbd>↓</kbd>/<kbd>Page Down</kbd>/<kbd>Space</kbd>
  advance, <kbd>Esc</kbd> skips.
- A visible **Skip intro** control is always focusable.
- Any component can release it by dispatching `msdev:unlock-hero` (the nav and
  footer links do this, so in-page navigation works during the intro).
- Content hidden during the intro is `inert`, so it never traps focus.

Elsewhere:

- Reveal animations are scoped to `html[data-anim="ready"]`, which is only set
  once JavaScript runs — with JS disabled the whole page renders visible.
- The Spline runtime and both canvases mount on intersection and pause
  off-screen; the WebGL raymarcher drops resolution and step count on phones and
  renders a single still frame under reduced motion.
- The custom cursor only exists on `(hover: hover) and (pointer: fine)`.
- Semantic landmarks, labelled sections, a skip link, visible focus rings, a
  modal case study with focus trapping and focus restoration, `aria-live` status
  on the form.

---

## Deploying

Push the repository and import it on [Vercel](https://vercel.com) — no
configuration needed. Set `NEXT_PUBLIC_SITE_URL` and `CONTACT_WEBHOOK_URL` in
the project's environment variables.

Any Node host works too:

```bash
npm run build && npm start
```

---

© 2026 MSDEV. All rights reserved.
