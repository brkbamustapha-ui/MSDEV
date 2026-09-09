import { site } from "@/data/site";

/**
 * The origin this deployment is actually served from.
 *
 * Resolved in order:
 *  1. `NEXT_PUBLIC_SITE_URL` — set this once a real domain is attached.
 *  2. `VERCEL_PROJECT_PRODUCTION_URL` — Vercel sets it automatically, so a
 *     fresh deployment already has correct canonical URLs, a correct sitemap
 *     and working social previews before anything is configured.
 *  3. The placeholder domain in `data/site.ts`.
 *
 * Server-only: `VERCEL_PROJECT_PRODUCTION_URL` is never exposed to the browser,
 * so call this from metadata, `sitemap.ts` and `robots.ts` — not from a client
 * component.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return site.url;
}
