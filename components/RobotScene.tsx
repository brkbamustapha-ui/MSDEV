"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { SplineScene } from "@/components/ui/splite";
import { useInView } from "@/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

/** The interactive robot scene. Swap this URL for your own Spline export. */
const SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

type RobotSceneProps = {
  className?: string;
};

/**
 * Wraps the Spline robot with the two things it needs to feel alive
 * everywhere:
 *
 *  1. **Touch.** Spline's scene tracks `mousemove`, which phones never fire.
 *     Touch and pen input are translated into synthetic mouse moves on the
 *     canvas, so the robot follows a finger exactly as it follows a cursor.
 *  2. **Idle life.** With no input for a few seconds it is walked slowly along
 *     a Lissajous path, so it is never a frozen mannequin — paused off-screen
 *     and disabled under `prefers-reduced-motion`.
 *
 * The 3D runtime itself is only mounted once the section is near the viewport.
 */
export function RobotScene({ className }: RobotSceneProps) {
  const [hostRef, near] = useInView<HTMLDivElement>({ rootMargin: "500px", once: true });
  const [visibleRef, visible] = useInView<HTMLDivElement>({ rootMargin: "0px", threshold: 0.15 });
  const reducedMotion = usePrefersReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastInput = useRef(0);
  const [loaded, setLoaded] = useState(false);

  const findCanvas = useCallback(() => {
    if (!canvasRef.current) {
      canvasRef.current = containerRef.current?.querySelector("canvas") ?? null;
    }
    return canvasRef.current;
  }, []);

  /** Send the scene a mouse move it will actually listen to. */
  const emitMove = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = findCanvas();
      if (!canvas) return;
      canvas.dispatchEvent(
        new MouseEvent("mousemove", { clientX, clientY, bubbles: true, cancelable: true }),
      );
    },
    [findCanvas],
  );

  /* Touch / pen → mouse. */
  useEffect(() => {
    const node = containerRef.current;
    if (!node || !loaded) return;

    const onTouch = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      lastInput.current = performance.now();
      emitMove(touch.clientX, touch.clientY);
    };

    const onPointer = (event: PointerEvent) => {
      lastInput.current = performance.now();
      if (event.pointerType === "mouse") return; // already handled natively
      emitMove(event.clientX, event.clientY);
    };

    node.addEventListener("touchstart", onTouch, { passive: true });
    node.addEventListener("touchmove", onTouch, { passive: true });
    node.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      node.removeEventListener("touchstart", onTouch);
      node.removeEventListener("touchmove", onTouch);
      node.removeEventListener("pointermove", onPointer);
    };
  }, [loaded, emitMove]);

  /* Idle drift. */
  useEffect(() => {
    if (!loaded || reducedMotion || !visible) return;

    let frame = 0;
    let last = 0;

    const tick = (time: number) => {
      frame = requestAnimationFrame(tick);
      // ~24fps is plenty for a slow drift and keeps the main thread free
      if (time - last < 42) return;
      last = time;
      if (time - lastInput.current < 2600) return;

      const node = containerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const t = time / 4200;
      const x = rect.left + rect.width * (0.5 + Math.sin(t) * 0.34);
      const y = rect.top + rect.height * (0.5 + Math.sin(t * 1.618) * 0.26);
      emitMove(x, y);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [loaded, reducedMotion, visible, emitMove]);

  return (
    <div ref={hostRef} className={cn("relative h-full w-full", className)}>
      <div ref={visibleRef} className="absolute inset-0" aria-hidden="true" />
      <div ref={containerRef} className="h-full w-full touch-pan-y">
        {near ? (
          <SplineScene
            scene={SCENE_URL}
            label="An interactive 3D robot that follows your cursor or your finger"
            onLoad={() => setLoaded(true)}
            fallback={<RobotFallback />}
          />
        ) : (
          <RobotFallback quiet />
        )}
      </div>
    </div>
  );
}

/**
 * Shown while the scene streams in, and permanently if WebGL or the Spline CDN
 * is unavailable. Pure CSS, so it costs nothing and never fails.
 */
function RobotFallback({ quiet = false }: { quiet?: boolean }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="absolute size-[min(70%,26rem)] rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(200,162,122,0.28),transparent_68%)] blur-2xl" />
      {[0, 1, 2].map((ring) => (
        <div
          key={ring}
          className="absolute rounded-full border border-ivory/10"
          style={{
            width: `${34 + ring * 15}%`,
            aspectRatio: "1",
            animation: `spin ${16 + ring * 9}s linear infinite${ring % 2 ? " reverse" : ""}`,
            borderTopColor: "rgba(200,162,122,0.55)",
          }}
        />
      ))}
      <div className="relative size-16 rounded-full bg-[conic-gradient(from_180deg,rgba(239,235,228,0.9),rgba(200,162,122,0.5),rgba(10,11,13,1),rgba(239,235,228,0.9))] shadow-[0_0_60px_-10px_rgba(200,162,122,0.7)]" />
      {!quiet && <span className="sr-only">3D scene unavailable — showing a static visual instead.</span>}
    </div>
  );
}

export default RobotScene;
