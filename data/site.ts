/**
 * Every piece of copy, contact detail and project record on the site lives
 * here. Edit this file to make MSDEV's content your own — no component needs
 * to be touched.
 */

export const site = {
  name: "MSDEV",
  legalName: "MSDEV",
  tagline: "Digital experiences built to stand out.",
  description:
    "MSDEV is a web development studio building premium, custom-built websites, web apps and immersive digital experiences for brands that refuse to look like everyone else.",
  city: "Oran",
  country: "Algeria",
  /** Used for canonical URLs, sitemap and Open Graph. Set this to your domain. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://msdev.dz",
  /** ——— replace with your real handles ——— */
  email: "hello@msdev.dz",
  phone: "+213 00 00 00 00",
  socials: [
    { label: "Instagram", handle: "@msdev.dz", href: "https://instagram.com/msdev.dz" },
    { label: "TikTok", handle: "@msdev.dz", href: "https://tiktok.com/@msdev.dz" },
    { label: "Facebook", handle: "MSDEV", href: "https://facebook.com/msdev.dz" },
    { label: "LinkedIn", handle: "MSDEV", href: "https://linkedin.com/company/msdev" },
  ],
} as const;

export const nav = [
  { label: "Home", href: "#top", id: "top" },
  { label: "About", href: "#about", id: "about" },
  { label: "Services", href: "#services", id: "services" },
  { label: "Work", href: "#work", id: "work" },
  { label: "Process", href: "#process", id: "process" },
  { label: "Contact", href: "#contact", id: "contact" },
] as const;

/** Hero keyword ticker. */
export const disciplines = ["Web Development", "Digital Experiences", "Creative Technology"] as const;

/** Placeholders — swap the numbers for real ones as the studio grows. */
export const stats = [
  { value: 40, suffix: "+", label: "Projects", note: "Shipped end to end" },
  { value: 25, suffix: "+", label: "Clients", note: "Across 6 industries" },
  { value: 100, suffix: "%", label: "Responsive", note: "Phone to ultrawide" },
  { value: 24, suffix: "/7", label: "Digital presence", note: "Always online" },
] as const;

export const capabilities = [
  "Websites",
  "Web applications",
  "E-commerce",
  "Landing pages",
  "Business websites",
  "3D websites",
  "UI / UX design",
  "Performance",
  "Responsive design",
] as const;

export const services = [
  {
    index: "01",
    title: "Web Development",
    excerpt:
      "Hand-written front-ends and APIs. No page builders, no bloated themes — architecture built for the next five years.",
    points: ["Next.js & React", "Headless CMS", "APIs & integrations", "Core Web Vitals"],
  },
  {
    index: "02",
    title: "3D Websites",
    excerpt:
      "WebGL, real-time light and depth used with intent — motion that carries meaning instead of stealing attention.",
    points: ["WebGL & shaders", "Spline scenes", "Scroll choreography", "60fps budgets"],
  },
  {
    index: "03",
    title: "E-Commerce",
    excerpt:
      "Storefronts engineered around the checkout. Faster pages, cleaner flows, measurably better conversion.",
    points: ["Custom storefronts", "Payments", "Inventory sync", "Analytics"],
  },
  {
    index: "04",
    title: "Business Websites",
    excerpt:
      "The site that makes a serious company look serious — credibility, clarity and the inbound leads that follow.",
    points: ["Brand-led design", "Multilingual", "SEO foundations", "Lead capture"],
  },
  {
    index: "05",
    title: "Landing Pages",
    excerpt:
      "One page, one decision. Built to load instantly and to turn traffic from a campaign into signed clients.",
    points: ["Conversion copy", "A/B ready", "Sub-second loads", "Tracking"],
  },
  {
    index: "06",
    title: "UI / UX Design",
    excerpt:
      "Interface design grounded in typography, hierarchy and rhythm — then handed over as a system, not a picture.",
    points: ["Design systems", "Prototyping", "Accessibility", "Handoff"],
  },
] as const;

export type Project = {
  slug: string;
  index: string;
  title: string;
  category: string;
  year: string;
  location: string;
  summary: string;
  overview: string;
  goals: readonly string[];
  result: readonly string[];
  tech: readonly string[];
  image: string;
  accent: string;
  href?: string;
};

/**
 * Placeholder case studies. Replace `image` with a real screenshot
 * (1400×1000 works best) and fill in the copy for each live project.
 */
export const projects: readonly Project[] = [
  {
    slug: "maison-noire",
    index: "01",
    title: "Maison Noire",
    category: "Luxury Restaurant",
    year: "2026",
    location: "Oran, DZ",
    summary: "A fine-dining house given a menu, a table and a reputation online.",
    overview:
      "A reservation-first experience for a fine-dining house. The menu is typeset like a printed carte, the room is introduced through slow full-bleed imagery, and every path on the site ends at a booked table.",
    goals: [
      "Turn walk-in demand into booked covers",
      "Present the menu as an experience, not a PDF",
      "Look impeccable on the phone, where 80% of bookings start",
    ],
    result: [
      "Reservations handled directly on the site",
      "0.9s largest contentful paint on 4G",
      "A brand that finally matches the room",
    ],
    tech: ["Next.js", "TypeScript", "GSAP", "Tailwind CSS", "Supabase"],
    image: "/media/work-01-restaurant.jpg",
    accent: "#C08A4E",
  },
  {
    slug: "quai-cafe",
    index: "02",
    title: "Quai Café",
    category: "Premium Coffee Shop",
    year: "2026",
    location: "Santa Cruz, Oran",
    summary: "A roastery storefront where the coffee sells itself before the cart opens.",
    overview:
      "A roastery and coffee bar with a shop attached. Origin stories lead, the store follows: each bean has a page, a roast profile and a one-tap subscription, all running on a storefront the owners update themselves.",
    goals: [
      "Sell beans online without losing the counter's warmth",
      "Give staff a store they can run without a developer",
      "Make subscriptions feel effortless",
    ],
    result: [
      "Self-serve product management",
      "Recurring subscription revenue from month one",
      "Checkout completed in three taps",
    ],
    tech: ["Next.js", "React", "Tailwind CSS", "Supabase", "Vercel"],
    image: "/media/work-02-coffee.jpg",
    accent: "#B4794C",
  },
  {
    slug: "atelier-index",
    index: "03",
    title: "Atelier Index",
    category: "Creative Agency",
    year: "2025",
    location: "Remote",
    summary: "A studio portfolio built as a proof of the studio's own craft.",
    overview:
      "A portfolio for a design studio that had outgrown a template. Work is presented at full bleed with scroll-driven transitions between cases, and the whole site is typeset on a single editorial grid.",
    goals: [
      "Replace a template with an identity",
      "Let the work be seen at full scale",
      "Load fast enough to keep art directors reading",
    ],
    result: [
      "Inbound briefs doubled in a quarter",
      "98 Lighthouse performance on mobile",
      "A site quoted back in pitch meetings",
    ],
    tech: ["Next.js", "Three.js", "GSAP", "TypeScript", "Vercel"],
    image: "/media/work-03-agency.jpg",
    accent: "#EFEBE4",
  },
  {
    slug: "meridian-group",
    index: "04",
    title: "Meridian Group",
    category: "Business Website",
    year: "2025",
    location: "Algiers, DZ",
    summary: "A corporate presence engineered for trust and inbound leads.",
    overview:
      "A multi-service company with nothing online but a phone number. We built a trilingual corporate site with a service architecture, a careers section and a lead pipeline that lands straight in the sales inbox.",
    goals: [
      "Establish credibility with enterprise buyers",
      "Serve three languages from one codebase",
      "Route every enquiry to the right desk",
    ],
    result: [
      "Qualified leads captured on the site",
      "Arabic, French and English from day one",
      "Content editable by the marketing team",
    ],
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Vercel"],
    image: "/media/work-04-business.jpg",
    accent: "#7E93B4",
  },
];

export const technologies = [
  { name: "HTML", note: "Semantics" },
  { name: "CSS", note: "Layout" },
  { name: "JavaScript", note: "Behaviour" },
  { name: "React", note: "Interfaces" },
  { name: "Next.js", note: "Framework" },
  { name: "Three.js", note: "3D & WebGL" },
  { name: "GSAP", note: "Motion" },
  { name: "Tailwind CSS", note: "Design system" },
  { name: "Supabase", note: "Data & auth" },
  { name: "Vercel", note: "Delivery" },
] as const;

export const processSteps = [
  {
    index: "01",
    title: "Discover",
    body: "We start with your business, not your website. Goals, audience, competitors and the one thing a visitor must do — written down before a pixel is drawn.",
    deliverables: ["Discovery call", "Scope & timeline", "Success metrics"],
  },
  {
    index: "02",
    title: "Design",
    body: "A visual identity built for your market: typography, colour, motion and layout, designed at real breakpoints so nothing breaks on the way to code.",
    deliverables: ["Art direction", "Responsive design", "Interactive prototype"],
  },
  {
    index: "03",
    title: "Develop",
    body: "Clean, typed, reviewable code. Modern tooling, real accessibility, a performance budget enforced from the first commit rather than patched at the end.",
    deliverables: ["Custom build", "CMS & integrations", "QA on real devices"],
  },
  {
    index: "04",
    title: "Launch",
    body: "Deployed on a global edge network, measured, then tuned. We stay after launch to watch the numbers and keep the site fast as it grows.",
    deliverables: ["Deployment", "Analytics & SEO", "Post-launch support"],
  },
] as const;

export const whyMsdev = [
  {
    index: "01",
    title: "Premium design",
    body: "Art direction first. Every project gets its own visual language instead of a recycled template.",
  },
  {
    index: "02",
    title: "Custom development",
    body: "Written from scratch for your case. No page builders, no plugin sprawl, no ceiling you hit in year two.",
  },
  {
    index: "03",
    title: "Responsive everywhere",
    body: "Designed on the phone first, then scaled up. It looks deliberate at 360px and at 2560px.",
  },
  {
    index: "04",
    title: "Fast performance",
    body: "Performance budgets, lazy loading and GPU-friendly motion. Speed is a design decision here.",
  },
  {
    index: "05",
    title: "Modern technology",
    body: "Next.js, TypeScript, WebGL, edge delivery. The stack the best products on the web are built on.",
  },
  {
    index: "06",
    title: "Client-focused approach",
    body: "Direct contact with the people building your site, clear milestones, and support that outlasts launch day.",
  },
] as const;

export const projectTypes = [
  "Business website",
  "E-commerce",
  "Landing page",
  "Web application",
  "3D / immersive site",
  "Redesign",
  "Something else",
] as const;
