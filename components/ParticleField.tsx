"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

type ParticleFieldProps = {
  className?: string;
  /** Particle count at 1440px wide; scaled down on smaller screens. */
  density?: number;
  color?: string;
};

/**
 * A drift of dust in 2D canvas — a few dozen additive dots that parallax with
 * the pointer. Deliberately not WebGL: it costs a fraction of a millisecond a
 * frame, and it pauses the moment it leaves the viewport.
 */
export function ParticleField({ className, density = 46, color = "200, 162, 122" }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hostRef, inView] = useInView<HTMLDivElement>({ rootMargin: "160px" });
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion || !inView) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    type Particle = { x: number; y: number; z: number; vx: number; vy: number; r: number };
    let particles: Particle[] = [];

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    const seed = () => {
      const count = Math.round(density * Math.min(1, width / 1440 + 0.35));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: 0.3 + Math.random() * 0.7,
        vx: (Math.random() - 0.5) * 0.14,
        vy: -0.05 - Math.random() * 0.16,
        r: 0.5 + Math.random() * 1.6,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = (event.clientX - rect.left) / rect.width;
      pointer.ty = (event.clientY - rect.top) / rect.height;
    };

    const render = () => {
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const px = p.x + (pointer.x - 0.5) * 46 * p.z;
        const py = p.y + (pointer.y - 0.5) * 30 * p.z;

        ctx.beginPath();
        ctx.arc(px, py, p.r * p.z, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${0.1 + p.z * 0.38})`;
        ctx.fill();
      }

      frame = requestAnimationFrame(render);
    };

    resize();
    frame = requestAnimationFrame(render);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [inView, reducedMotion, density, color]);

  return (
    <div ref={hostRef} className={cn("pointer-events-none absolute inset-0", className)} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

export default ParticleField;
