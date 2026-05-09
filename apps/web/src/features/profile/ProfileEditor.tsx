"use client";

import Image from "next/image";
import Link from "next/link";
import { Camera, MapPin, Settings, Sparkles, UserRoundCog } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import type { Profile, Sport, UserSportPreference } from "@showup2move/shared";

export function ProfileEditor({
  profile,
  preferences,
  sports,
}: Readonly<{
  profile: Profile;
  preferences: UserSportPreference[];
  sports: Sport[];
}>) {
  const [selectedSports, setSelectedSports] = useState(
    new Set(preferences.length ? preferences.map((preference) => preference.sportId) : ["football"]),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedSportRecords = useMemo(
    () => sports.filter((sport) => selectedSports.has(sport.id)),
    [selectedSports, sports],
  );

  function submit(formData: FormData) {
    const sportPreferences = [...selectedSports].map((sportId) => ({
      sportId,
      skillLevel: String(formData.get(`skill-${sportId}`) ?? "casual"),
      intensity: String(formData.get(`intensity-${sportId}`) ?? "balanced"),
      preferredRoles: String(formData.get(`roles-${sportId}`) ?? "")
        .split(",")
        .map((role) => role.trim())
        .filter(Boolean),
    }));

    const payload = {
      profile: {
        displayName: String(formData.get("displayName") ?? ""),
        bio: String(formData.get("bio") ?? ""),
        avatarUrl: String(formData.get("avatarUrl") ?? ""),
        homeArea: String(formData.get("homeArea") ?? ""),
        preferredRadiusKm: Number(formData.get("preferredRadiusKm") ?? 8),
        locationPrivacy: String(formData.get("locationPrivacy") ?? "approximate"),
        allowsAiProfile: formData.get("allowsAiProfile") === "on",
        coordinates: {
          lat: Number(formData.get("lat") ?? profile.coordinates.lat),
          lng: Number(formData.get("lng") ?? profile.coordinates.lng),
        },
      },
      sportPreferences,
    };

    startTransition(async () => {
      const [profileResponse, availabilityResponse] = await Promise.all([
        fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        fetch("/api/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            showUpToday: formData.get("showUpToday") === "on",
            startsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            endsAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
            note: String(formData.get("availabilityNote") ?? ""),
          }),
        }),
      ]);

      setMessage(profileResponse.ok && availabilityResponse.ok ? "Profile saved." : "Could not save every change.");
    });
  }

  return (
    <form action={submit} className="grid gap-5">
      <section className="rounded-lg border border-black/10 bg-white shadow-nav">
        <div className="grid gap-5 p-5 md:grid-cols-[9rem_1fr]">
          <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-field shadow-nav md:mx-0">
            {profile.avatarUrl ? (
              <Image
                alt={`${profile.displayName} profile photo`}
                className="object-cover"
                fill
                sizes="128px"
                src={profile.avatarUrl}
                unoptimized
              />
            ) : (
              <div className="grid h-full place-items-center text-4xl font-black text-slate-500">
                {profile.displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-ink text-white">
              <Camera size={15} aria-hidden="true" />
            </span>
          </div>

          <div className="grid gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-3xl font-black tracking-normal">{profile.displayName}</h1>
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-600">
                  <MapPin size={16} aria-hidden="true" />
                  {profile.homeArea} - {profile.preferredRadiusKm} km radius
                </p>
              </div>

              <button
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-field px-4 py-2 text-sm font-black"
                onClick={() => setSettingsOpen((current) => !current)}
                type="button"
              >
                <Settings size={16} aria-hidden="true" />
                Settings
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center sm:max-w-md">
              <ProfileStat label="sports" value={selectedSportRecords.length} />
              <ProfileStat label="radius" value={`${profile.preferredRadiusKm}km`} />
              <ProfileStat label="privacy" value={profile.locationPrivacy} />
            </div>

            <p className="max-w-2xl text-sm font-semibold leading-6 text-slate-700">{profile.bio}</p>

            <div className="flex flex-wrap gap-2">
              {selectedSportRecords.map((sport) => (
                <span className="rounded-full bg-cyan px-3 py-1 text-xs font-black text-ink" key={sport.id}>
                  {sport.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid border-t border-black/10 sm:grid-cols-3">
          <Link className="profile-action-link" href="/matching">
            <Sparkles size={16} aria-hidden="true" />
            AI matching
          </Link>
          <Link className="profile-action-link" href="/organizer">
            <UserRoundCog size={16} aria-hidden="true" />
            Organizer profile
          </Link>
          <Link className="profile-action-link" href="/admin">
            <UserRoundCog size={16} aria-hidden="true" />
            Admin profile
          </Link>
        </div>
      </section>

      {settingsOpen ? (
        <section className="grid gap-5 lg:grid-cols-[1fr_24rem]">
          <div className="grid gap-4 rounded-lg border border-black/10 bg-white p-5 shadow-nav">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-black">
                Display name
                <input className="profile-input" defaultValue={profile.displayName} name="displayName" />
              </label>
              <label className="grid gap-2 text-sm font-black">
                Profile photo URL
                <input className="profile-input" defaultValue={profile.avatarUrl ?? ""} name="avatarUrl" />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-black">
              Bio
              <textarea className="profile-input min-h-28" defaultValue={profile.bio} name="bio" />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-black">
                Home area
                <input className="profile-input" defaultValue={profile.homeArea} name="homeArea" />
              </label>
              <label className="grid gap-2 text-sm font-black">
                Radius
                <input
                  className="profile-input"
                  defaultValue={profile.preferredRadiusKm}
                  min={1}
                  max={80}
                  name="preferredRadiusKm"
                  type="number"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid gap-2 text-sm font-black">
                Privacy
                <select className="profile-input" defaultValue={profile.locationPrivacy} name="locationPrivacy">
                  <option value="approximate">Approximate</option>
                  <option value="precise">Precise</option>
                  <option value="hidden">Hidden</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-black">
                Latitude
                <input
                  className="profile-input"
                  defaultValue={profile.coordinates.lat}
                  name="lat"
                  step="0.0001"
                  type="number"
                />
              </label>
              <label className="grid gap-2 text-sm font-black">
                Longitude
                <input
                  className="profile-input"
                  defaultValue={profile.coordinates.lng}
                  name="lng"
                  step="0.0001"
                  type="number"
                />
              </label>
            </div>
          </div>

          <aside className="grid content-start gap-4">
            <section className="rounded-lg border border-black/10 bg-white p-5 shadow-nav">
              <h2 className="text-lg font-black">Sports</h2>
              <div className="mt-4 grid gap-3">
                {sports.map((sport) => {
                  const preference = preferences.find((record) => record.sportId === sport.id);
                  const checked = selectedSports.has(sport.id);

                  return (
                    <div className="rounded-lg border border-black/10 bg-field p-3" key={sport.id}>
                      <label className="flex items-center gap-3 text-sm font-black">
                        <input
                          checked={checked}
                          onChange={() =>
                            setSelectedSports((current) => {
                              const next = new Set(current);
                              if (next.has(sport.id)) next.delete(sport.id);
                              else next.add(sport.id);
                              return next;
                            })
                          }
                          type="checkbox"
                        />
                        {sport.name}
                      </label>
                      {checked ? (
                        <div className="mt-3 grid gap-2">
                          <select className="profile-input py-2 text-sm" defaultValue={preference?.skillLevel ?? "casual"} name={`skill-${sport.id}`}>
                            <option value="beginner">Beginner</option>
                            <option value="casual">Casual</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                          <select className="profile-input py-2 text-sm" defaultValue={preference?.intensity ?? "balanced"} name={`intensity-${sport.id}`}>
                            <option value="social">Social</option>
                            <option value="balanced">Balanced</option>
                            <option value="competitive">Competitive</option>
                          </select>
                          <input
                            className="profile-input py-2 text-sm"
                            defaultValue={preference?.preferredRoles.join(", ") ?? ""}
                            name={`roles-${sport.id}`}
                            placeholder="roles"
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-lg border border-black/10 bg-white p-5 shadow-nav">
              <h2 className="text-lg font-black">Availability and AI</h2>
              <label className="mt-4 flex items-center gap-3 text-sm font-black">
                <input defaultChecked name="showUpToday" type="checkbox" />
                ShowUpToday
              </label>
              <label className="mt-4 grid gap-2 text-sm font-black">
                Note
                <input className="profile-input" defaultValue="After work works best." name="availabilityNote" />
              </label>
              <label className="mt-4 flex items-center gap-3 text-sm font-black">
                <input defaultChecked={profile.allowsAiProfile} name="allowsAiProfile" type="checkbox" />
                AI recommendations
              </label>
            </section>

            <button
              className="rounded-full bg-ink px-5 py-3 text-sm font-black text-white disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Saving..." : "Save profile"}
            </button>
            {message ? <p className="text-sm font-black text-slate-700">{message}</p> : null}
          </aside>
        </section>
      ) : null}
    </form>
  );
}

function ProfileStat({ label, value }: Readonly<{ label: string; value: number | string }>) {
  return (
    <div className="rounded-lg bg-field px-3 py-2">
      <strong className="block text-lg font-black">{value}</strong>
      <span className="text-xs font-bold text-slate-600">{label}</span>
    </div>
  );
}
