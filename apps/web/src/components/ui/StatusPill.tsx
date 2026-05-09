export function StatusPill({
  children,
  tone = "neutral"
}: Readonly<{ children: React.ReactNode; tone?: string }>) {
  const className =
    tone === "good"
      ? "border-court/30 bg-court/15 text-green-900"
      : tone === "alert"
        ? "border-coral/30 bg-coral/15 text-red-900"
        : "border-black/10 bg-white/80 text-slate-700";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${className}`}
    >
      {children}
    </span>
  );
}
