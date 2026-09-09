"use client";

import { ArrowUpRight } from "lucide-react";
import type { MouseEventHandler, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Magnetic } from "./magnetic";

type ActionButtonProps = {
  children: ReactNode;
  variant?: "solid" | "ghost";
  className?: string;
  /** Show the trailing arrow. */
  icon?: boolean;
  /** Pull the control toward the pointer on hover (desktop only). */
  magnetic?: boolean;
  /** Render a real `<button>` instead of an anchor. */
  as?: "a" | "button";
  href?: string;
  target?: string;
  rel?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  "aria-label"?: string;
};

/**
 * The one call-to-action in the system. Hover swaps the label for a copy of
 * itself sliding up behind a wipe — all CSS, so it costs nothing at runtime,
 * and the same states fire on `:focus-visible` for keyboard users.
 */
export function ActionButton({
  children,
  variant = "solid",
  className,
  icon = true,
  magnetic = true,
  as = "a",
  href,
  target,
  rel,
  type = "button",
  disabled,
  onClick,
  "aria-label": ariaLabel,
}: ActionButtonProps) {
  const content = (
    <>
      {/* the wipe */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 origin-bottom scale-y-0 rounded-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "group-hover:scale-y-100 group-focus-visible:scale-y-100",
          variant === "solid" ? "bg-brass" : "bg-ivory",
        )}
      />
      <span className="relative flex items-center gap-2.5">
        <span className="relative block overflow-hidden">
          {/* the label, and its double waiting underneath */}
          <span className="block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full">
            {children}
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-0 block translate-y-full text-void transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0"
          >
            {children}
          </span>
        </span>
        {icon && (
          <ArrowUpRight
            className={cn(
              "size-4 shrink-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
              "group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-void",
              "group-focus-visible:text-void",
            )}
            aria-hidden="true"
          />
        )}
      </span>
    </>
  );

  const classes = cn(
    "group relative inline-flex items-center justify-center overflow-hidden rounded-full",
    "px-7 py-3.5 font-mono text-[0.6875rem] tracking-[0.18em] uppercase",
    "transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
    variant === "solid"
      ? "bg-ivory text-void"
      : "border border-edge-strong text-ivory hover:text-void focus-visible:text-void",
    className,
  );

  const element =
    as === "button" ? (
      <button
        type={type}
        className={classes}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        data-cursor="link"
      >
        {content}
      </button>
    ) : (
      <a
        className={classes}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        aria-label={ariaLabel}
        data-cursor="link"
      >
        {content}
      </a>
    );

  if (!magnetic) return element;
  return <Magnetic strength={12}>{element}</Magnetic>;
}

export default ActionButton;
