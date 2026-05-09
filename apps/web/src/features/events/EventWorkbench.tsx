"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import type { Sport, SportsEvent } from "@showup2move/shared";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatEventTime, formatPrice } from "@/lib/format";

export function EventWorkbench({
  initialEvents,
  sports,
  canCreate
}: Readonly<{
  initialEvents: SportsEvent[];
  sports: Sport[];
  canCreate: boolean;
}>) {
  const [events, setEvents] = useState(initialEvents);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function create(formData: FormData) {
    setMessage("");
    const startsAt = new Date(String(formData.get("startsAt") ?? "")).toISOString();
    const endsAt = new Date(new Date(startsAt).getTime() + 90 * 60 * 1000).toISOString();
    const payload = {
      title: String(formData.get("title") ?? ""),
      sportId: String(formData.get("sportId") ?? "football"),
      imageUrl: String(formData.get("imageUrl") ?? ""),
      startsAt,
      endsAt,
      visibility: String(formData.get("visibility") ?? "public"),
      location: {
        name: String(formData.get("locationName") ?? ""),
        address: String(formData.get("address") ?? ""),
        city: "Bucharest",
        coordinates: {
          lat: Number(formData.get("lat") ?? 44.459),
          lng: Number(formData.get("lng") ?? 26.082)
        },
        priceEstimateCents: Number(formData.get("price") ?? 0) * 100
      },
      skillRange: [
        String(formData.get("minSkill") ?? "casual"),
        String(formData.get("maxSkill") ?? "advanced")
      ],
      capacity: Number(formData.get("capacity") ?? 12),
      description: String(formData.get("description") ?? "")
    };

    startTransition(async () => {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const body = (await response.json()) as { event: SportsEvent };
        setEvents((current) => [body.event, ...current]);
        setMessage("Event created and event chat opened.");
      } else {
        setMessage(canCreate ? "Could not create event." : "Log in to create events.");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[24rem_1fr]">
      <form
        action={create}
        className="grid content-start gap-4 rounded-lg border border-black/10 bg-white p-5 shadow-nav"
      >
        <h2 className="text-xl font-black">Create event</h2>
        <input
          className="rounded-lg border border-black/10 bg-field px-4 py-3 text-sm font-bold"
          defaultValue="Friday football sprint"
          name="title"
          placeholder="title"
        />
        <select
          className="rounded-lg border border-black/10 bg-field px-4 py-3 text-sm font-bold"
          name="sportId"
        >
          {sports.map((sport) => (
            <option key={sport.id} value={sport.id}>
              {sport.name}
            </option>
          ))}
        </select>
        <input
          className="rounded-lg border border-black/10 bg-field px-4 py-3 text-sm font-bold"
          defaultValue="Parcul Kiseleff Mini Pitch"
          name="locationName"
          placeholder="venue"
        />
        <input
          className="rounded-lg border border-black/10 bg-field px-4 py-3 text-sm font-bold"
          defaultValue="Soseaua Pavel D. Kiseleff 32"
          name="address"
          placeholder="address"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            className="rounded-lg border border-black/10 bg-field px-4 py-3 text-sm font-bold"
            defaultValue="44.4596"
            name="lat"
            step="0.0001"
            type="number"
          />
          <input
            className="rounded-lg border border-black/10 bg-field px-4 py-3 text-sm font-bold"
            defaultValue="26.0823"
            name="lng"
            step="0.0001"
            type="number"
          />
        </div>
        <input
          className="rounded-lg border border-black/10 bg-field px-4 py-3 text-sm font-bold"
          defaultValue="2026-05-09T18:30"
          name="startsAt"
          type="datetime-local"
        />
        <div className="grid grid-cols-3 gap-3">
          <input
            className="rounded-lg border border-black/10 bg-field px-4 py-3 text-sm font-bold"
            defaultValue="12"
            min="2"
            name="capacity"
            type="number"
          />
          <input
            className="rounded-lg border border-black/10 bg-field px-4 py-3 text-sm font-bold"
            defaultValue="25"
            min="0"
            name="price"
            type="number"
          />
          <select
            className="rounded-lg border border-black/10 bg-field px-4 py-3 text-sm font-bold"
            name="visibility"
          >
            <option value="public">Public</option>
            <option value="friends">Friends</option>
            <option value="invite_only">Invite</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select
            className="rounded-lg border border-black/10 bg-field px-4 py-3 text-sm font-bold"
            name="minSkill"
          >
            <option value="beginner">Beginner</option>
            <option value="casual">Casual</option>
            <option value="intermediate">Intermediate</option>
          </select>
          <select
            className="rounded-lg border border-black/10 bg-field px-4 py-3 text-sm font-bold"
            name="maxSkill"
          >
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <textarea
          className="min-h-28 rounded-lg border border-black/10 bg-field px-4 py-3 text-sm font-bold"
          defaultValue="Fast but friendly session with captain tools and event chat."
          name="description"
        />
        <input
          className="rounded-lg border border-black/10 bg-field px-4 py-3 text-sm font-bold"
          name="imageUrl"
          placeholder="optional image URL"
        />
        <button
          className="rounded-full bg-ink px-5 py-3 text-sm font-black text-white disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Creating..." : "Create"}
        </button>
        {message ? <p className="text-sm font-black text-slate-700">{message}</p> : null}
      </form>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <article
            className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-nav"
            key={event.id}
          >
            <div className="relative aspect-[4/3] bg-slate-200">
              <Image
                alt=""
                fill
                sizes="(min-width: 1280px) 28vw, (min-width: 768px) 42vw, 92vw"
                src={event.imageUrl}
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-black leading-tight">{event.title}</h2>
                <StatusPill tone={event.status === "open" ? "good" : "neutral"}>
                  {event.status.replace("_", " ")}
                </StatusPill>
              </div>
              <p className="mt-2 text-sm font-bold text-slate-600">
                {formatEventTime(event.startsAt)} · {event.location.name}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">{event.description}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-black">
                <span className="rounded-lg bg-field px-2 py-3">
                  {event.participantCount}/{event.capacity}
                </span>
                <span className="rounded-lg bg-field px-2 py-3">
                  {event.distanceKm.toFixed(1)} km
                </span>
                <span className="rounded-lg bg-field px-2 py-3">
                  {formatPrice(event.location.priceEstimateCents)}
                </span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
