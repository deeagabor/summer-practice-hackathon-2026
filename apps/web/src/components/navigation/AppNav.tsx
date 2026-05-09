import Link from "next/link";
import { CalendarDays, MapPinned, MessageCircle, Sparkles, UserRound } from "lucide-react";

const items = [
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/", label: "Map", icon: MapPinned, primary: true },
  { href: "/matching", label: "Match", icon: Sparkles },
  { href: "/profile", label: "Profile", icon: UserRound }
];

export function AppNav() {
  return (
    <nav
      aria-label="Primary"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-[34rem] items-end justify-center px-4"
    >
      <div className="flex w-full items-center justify-between gap-2 rounded-[2rem] bg-zinc-200/95 px-4 py-3 shadow-nav backdrop-blur md:max-w-[32rem]">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              aria-label={item.label}
              className={`grid aspect-square place-items-center rounded-full transition hover:-translate-y-0.5 hover:shadow-marker ${
                item.primary
                  ? "h-20 w-20 bg-cyan text-ink"
                  : "h-16 w-16 bg-cyan text-ink md:h-[4.5rem] md:w-[4.5rem]"
              }`}
              href={item.href}
              key={item.href}
              title={item.label}
            >
              <Icon
                aria-hidden="true"
                className={item.primary ? "h-10 w-10" : "h-8 w-8"}
                strokeWidth={2.8}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
