"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { projectTypes, site } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1] as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Status = "idle" | "sending" | "sent" | "error";
type Errors = Partial<Record<"name" | "email" | "message" | "form", string>>;

/** A label that floats above the field once it has focus or content. */
function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="mb-2 block font-mono text-[0.625rem] tracking-[0.18em] text-steel uppercase"
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-xs text-brass">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "peer w-full border-0 border-b border-edge-strong bg-transparent px-0 py-3 text-base text-ivory " +
  "placeholder:text-steel/45 transition-colors duration-500 outline-none " +
  "focus:border-brass aria-[invalid=true]:border-brass";

export function ContactForm() {
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      company: String(data.get("company") ?? "").trim(),
      projectType: String(data.get("projectType") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      website: String(data.get("website") ?? ""),
    };

    /* Validate here too, so nobody waits on a round trip to be told a field is empty. */
    const next: Errors = {};
    if (payload.name.length < 2) next.name = "Please tell us your name.";
    if (!EMAIL.test(payload.email)) next.email = "That email address does not look right.";
    if (payload.message.length < 10) next.message = "A little more detail would help us reply properly.";

    if (Object.keys(next).length) {
      setErrors(next);
      setStatus("idle");
      const firstInvalid = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
      firstInvalid?.focus();
      return;
    }

    setErrors({});
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        errors?: Errors;
      };

      if (!response.ok || !result.ok) {
        setErrors(result.errors ?? { form: result.error ?? "Something went wrong. Please try again." });
        setStatus("error");
        return;
      }

      setStatus("sent");
      formRef.current?.reset();
    } catch {
      setErrors({ form: "We could not reach the server. Please check your connection." });
      setStatus("error");
    }
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.65, ease: EASE }}
            className="flex min-h-[26rem] flex-col justify-center rounded-xl border border-edge bg-carbon/60 p-10 text-center"
            role="status"
            aria-live="polite"
          >
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
              className="mx-auto flex size-14 items-center justify-center rounded-full border border-brass/50 bg-brass/10"
            >
              <Check className="size-6 text-brass" aria-hidden="true" />
            </motion.span>

            <h3 className="mt-7 font-display text-2xl font-extrabold tracking-tight text-ivory">
              Request received.
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-steel">
              Thank you — we read every brief personally and reply within one working day. If it is
              urgent, write to us directly at{" "}
              <a href={`mailto:${site.email}`} className="text-ivory underline underline-offset-4">
                {site.email}
              </a>
              .
            </p>

            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mx-auto mt-8 font-mono text-[0.625rem] tracking-[0.18em] text-steel uppercase transition-colors hover:text-ivory"
            >
              Send another request
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            initial={false}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex flex-col gap-7"
          >
            {/* honeypot */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor={`${uid}-website`}>Leave this field empty</label>
              <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="grid gap-7 sm:grid-cols-2">
              <Field id={`${uid}-name`} label="Name" error={errors.name}>
                <input
                  id={`${uid}-name`}
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Your full name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? `${uid}-name-error` : undefined}
                  className={inputClass}
                />
              </Field>

              <Field id={`${uid}-email`} label="Email" error={errors.email}>
                <input
                  id={`${uid}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? `${uid}-email-error` : undefined}
                  className={inputClass}
                />
              </Field>

              <Field id={`${uid}-company`} label="Company">
                <input
                  id={`${uid}-company`}
                  name="company"
                  type="text"
                  autoComplete="organization"
                  placeholder="Optional"
                  className={inputClass}
                />
              </Field>

              <Field id={`${uid}-project-type`} label="Project type">
                <select
                  id={`${uid}-project-type`}
                  name="projectType"
                  defaultValue={projectTypes[0]}
                  className={cn(inputClass, "cursor-pointer appearance-none")}
                >
                  {projectTypes.map((type) => (
                    <option key={type} value={type} className="bg-carbon text-ivory">
                      {type}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field id={`${uid}-message`} label="Message" error={errors.message}>
              <textarea
                id={`${uid}-message`}
                name="message"
                rows={4}
                required
                placeholder="What are you building, and what does success look like?"
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? `${uid}-message-error` : undefined}
                className={cn(inputClass, "resize-y")}
              />
            </Field>

            {errors.form && (
              <p role="alert" className="text-sm text-brass">
                {errors.form}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-5 pt-2">
              <button
                type="submit"
                disabled={status === "sending"}
                className={cn(
                  "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full",
                  "bg-ivory px-8 py-4 font-mono text-[0.6875rem] tracking-[0.18em] text-void uppercase",
                  "transition-colors duration-500 disabled:cursor-progress",
                )}
                data-cursor="link"
              >
                {/* the fill sweeps across while the request is in flight */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-0 origin-left bg-brass transition-transform ease-[cubic-bezier(0.16,1,0.3,1)]",
                    status === "sending"
                      ? "scale-x-100 duration-[1.6s]"
                      : "scale-x-0 duration-500 group-hover:scale-x-100",
                  )}
                />
                <span className="relative flex items-center gap-2.5">
                  {status === "sending" && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
                  {status === "sending" ? "Sending" : "Send project request"}
                </span>
              </button>

              <p className="max-w-[15rem] text-xs leading-relaxed text-steel">
                No obligation. We reply within one working day.
              </p>
            </div>

            <p aria-live="polite" className="sr-only">
              {status === "sending" ? "Sending your request" : ""}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ContactForm;
