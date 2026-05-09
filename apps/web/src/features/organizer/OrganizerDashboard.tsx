import { CalendarClock, ChartNoAxesColumn, ClipboardCheck, Megaphone } from "lucide-react";
import type { SportsEvent } from "@showup2move/shared";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatEventTime, formatPrice } from "@/lib/format";

export function OrganizerDashboard({ events }: Readonly<{ events: SportsEvent[] }>) {
  const organizerEvents = events.filter(
    (event) => event.organizerId || event.status !== "cancelled"
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <section className="grid gap-4">
        {organizerEvents.map((event) => (
          <article
            className="rounded-lg border border-black/10 bg-white p-5 shadow-nav"
            key={event.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">{event.title}</h2>
                <p className="mt-2 text-sm font-bold text-slate-600">
                  {formatEventTime(event.startsAt)} · {event.location.name} ·{" "}
                  {formatPrice(event.location.priceEstimateCents)}
                </p>
              </div>
              <StatusPill tone={event.status === "open" ? "good" : "neutral"}>
                {event.status.replace("_", " ")}
              </StatusPill>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <Metric
                icon={<ClipboardCheck className="h-5 w-5" />}
                label="Participants"
                value={`${event.participantCount}/${event.capacity}`}
              />
              <Metric
                icon={<CalendarClock className="h-5 w-5" />}
                label="Skill"
                value={`${event.skillRange[0]}-${event.skillRange[1]}`}
              />
              <Metric
                icon={<Megaphone className="h-5 w-5" />}
                label="Visibility"
                value={event.visibility}
              />
              <Metric
                icon={<ChartNoAxesColumn className="h-5 w-5" />}
                label="Signals"
                value={String(event.reasonCodes.length)}
              />
            </div>
          </article>
        ))}
      </section>
      <aside className="grid content-start gap-4">
        <section className="rounded-lg border border-black/10 bg-white p-5 shadow-nav">
          <h2 className="text-xl font-black">Poll Queue</h2>
          <div className="mt-4 grid gap-3 text-sm font-bold text-slate-700">
            <p className="rounded-lg bg-field p-3">Venue vote: Kiseleff vs Herastrau</p>
            <p className="rounded-lg bg-field p-3">Team split: balanced by skill</p>
          </div>
        </section>
        <section className="rounded-lg border border-black/10 bg-white p-5 shadow-nav">
          <h2 className="text-xl font-black">Announcements</h2>
          <textarea
            className="mt-4 min-h-32 w-full rounded-lg border border-black/10 bg-field px-4 py-3 text-sm font-semibold"
            defaultValue="Bring water and arrive 10 minutes early."
          />
          <button
            className="mt-4 rounded-full bg-ink px-5 py-3 text-sm font-black text-white"
            type="button"
          >
            Send
          </button>
        </section>
      </aside>
    </div>
  );
}

function Metric({
  icon,
  label,
  value
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: string;
}>) {
  return (
    <div className="rounded-lg bg-field p-3">
      <div className="flex items-center gap-2 text-slate-600">
        {icon}
        <span className="text-xs font-black uppercase">{label}</span>
      </div>
      <p className="mt-2 truncate text-sm font-black text-ink">{value}</p>
    </div>
  );
}
