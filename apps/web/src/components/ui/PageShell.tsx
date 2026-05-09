import Link from "next/link";
import { AppNav } from "@/components/navigation/AppNav";

export function PageShell({
  title,
  action,
  children
}: Readonly<{
  title: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-dvh bg-field px-4 pb-36 pt-5 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link className="text-sm font-black uppercase tracking-[0.18em] text-slate-500" href="/">
            ShowUp2Move
          </Link>
          {action ? (
            <Link
              className="rounded-full bg-ink px-5 py-3 text-sm font-black text-white"
              href={action.href}
            >
              {action.label}
            </Link>
          ) : null}
        </header>
        <h1 className="text-balance text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>
      <AppNav />
    </main>
  );
}
