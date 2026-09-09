import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Clamp a number between a minimum and a maximum. */
export function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}
