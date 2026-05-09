"use client";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-dvh place-items-center bg-field px-6">
      <section className="max-w-md rounded-lg border border-black/10 bg-white p-6 shadow-nav">
        <h1 className="text-2xl font-black text-ink">Something needs a quick reset</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{error.message}</p>
        <button
          className="mt-6 rounded-full bg-cyan px-5 py-3 text-sm font-black text-ink"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
