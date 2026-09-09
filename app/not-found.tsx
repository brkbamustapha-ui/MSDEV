import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow mb-6">404</p>
      <h1 className="font-display text-mega font-extrabold text-ivory">Page not found</h1>
      <p className="mt-5 max-w-md text-base text-steel">
        The page you were looking for has moved, or never existed.
      </p>
      <Link
        href="/"
        className="mt-10 rounded-full bg-ivory px-7 py-3.5 font-mono text-[0.6875rem] tracking-[0.18em] text-void uppercase transition-colors hover:bg-brass"
      >
        Back to MSDEV
      </Link>
    </div>
  );
}
