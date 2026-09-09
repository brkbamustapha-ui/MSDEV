import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Payload = {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  projectType?: unknown;
  message?: unknown;
  /** Hidden field — real people never fill this in. */
  website?: unknown;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const str = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

/**
 * Best-effort in-memory throttle: five submissions per IP per ten minutes.
 * It resets on redeploy and is per-instance, so put a real limiter in front
 * (Vercel WAF, Upstash, Cloudflare) if the form starts getting hammered.
 */
const HITS = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  HITS.set(ip, recent);
  if (HITS.size > 5000) HITS.clear();
  return recent.length > MAX_HITS;
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  /* Honeypot — silently accept so bots do not learn anything. */
  if (str(body.website, 200)) {
    return NextResponse.json({ ok: true, delivered: false });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
  }

  const name = str(body.name, 120);
  const email = str(body.email, 200);
  const company = str(body.company, 160);
  const projectType = str(body.projectType, 80);
  const message = str(body.message, 5000);

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please tell us your name.";
  if (!EMAIL.test(email)) errors.email = "That email address does not look right.";
  if (message.length < 10) errors.message = "A little more detail would help us reply properly.";

  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const submission = {
    name,
    email,
    company: company || null,
    projectType: projectType || null,
    message,
    receivedAt: new Date().toISOString(),
  };

  /**
   * Delivery. Set CONTACT_WEBHOOK_URL to anything that accepts JSON — a Slack
   * or Discord incoming webhook, a Make/Zapier hook, a Supabase edge function,
   * your own mailer. Without it the submission is only logged on the server.
   */
  const webhook = process.env.CONTACT_WEBHOOK_URL;

  if (!webhook) {
    console.warn(
      "[contact] CONTACT_WEBHOOK_URL is not set — this submission was logged only, not delivered:",
      submission,
    );
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `New project request from ${name} (${email})`,
        submission,
      }),
    });

    if (!response.ok) {
      console.error("[contact] webhook rejected the submission", response.status, submission);
      return NextResponse.json(
        { ok: false, error: "We could not deliver your message. Please email us directly." },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("[contact] webhook request failed", error, submission);
    return NextResponse.json(
      { ok: false, error: "We could not deliver your message. Please email us directly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, delivered: true });
}
