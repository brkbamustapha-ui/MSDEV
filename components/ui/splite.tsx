"use client";

import { Suspense, lazy, useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { ErrorBoundary } from "./error-boundary";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineSceneProps {
  scene: string;
  className?: string;
  /** Announced to assistive tech, which cannot see the canvas. */
  label?: string;
  /** Rendered if the scene fails to load (offline, blocked CDN, old GPU). */
  fallback?: ReactNode;
  onLoad?: () => void;
}

/**
 * The Spline runtime is around a megabyte, so it is code-split and only
 * mounted by the caller once the section is close to the viewport.
 *
 * Every failure path ends at `fallback`: a rejected chunk, a scene the CDN
 * will not serve, a WebGL context the device refuses, or a load that simply
 * never finishes.
 */
export function SplineScene({ scene, className, label, fallback, onLoad }: SplineSceneProps) {
  const [failed, setFailed] = useState(false);
  const loaded = useRef(false);

  /* If the scene has not painted after 15s, treat it as unavailable. */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loaded.current) setFailed(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  if (failed) return <>{fallback ?? null}</>;

  return (
    <div className={cn("relative h-full w-full", className)} role="img" aria-label={label}>
      <ErrorBoundary fallback={<>{fallback ?? null}</>}>
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center">
              <span className="loader" aria-hidden="true" />
              <span className="sr-only">Loading 3D scene…</span>
            </div>
          }
        >
          <Spline
            scene={scene}
            className="!h-full !w-full"
            onLoad={() => {
              loaded.current = true;
              onLoad?.();
            }}
            onError={() => setFailed(true)}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default SplineScene;
