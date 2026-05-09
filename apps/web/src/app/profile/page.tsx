import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { ProfileEditor } from "@/features/profile/ProfileEditor";
import { getCurrentUser } from "@/server/auth/session";
import { getProfileBundle } from "@/server/profiles/service";
import { listSports } from "@/server/sports/service";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <PageShell title="Profile">
        <div className="max-w-md rounded-lg border border-black/10 bg-white p-5 shadow-nav">
          <p className="text-sm font-semibold text-slate-700">
            Log in to edit your sports profile.
          </p>
          <Link
            className="mt-5 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-black text-white"
            href="/login"
          >
            Log in
          </Link>
        </div>
      </PageShell>
    );
  }

  const bundle = getProfileBundle(user.id);
  const profile =
    bundle.profile ??
    ({
      userId: user.id,
      displayName: user.name,
      bio: "",
      homeArea: "Bucharest",
      preferredRadiusKm: 8,
      locationPrivacy: "approximate",
      allowsAiProfile: true,
      coordinates: { lat: 44.437, lng: 26.097 }
    } as const);

  return (
    <PageShell title="Profile">
      <ProfileEditor preferences={bundle.preferences} profile={profile} sports={listSports()} />
    </PageShell>
  );
}
