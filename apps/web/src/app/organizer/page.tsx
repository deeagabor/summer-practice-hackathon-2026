import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { OrganizerDashboard } from "@/features/organizer/OrganizerDashboard";
import { getCurrentUser } from "@/server/auth/session";
import { listEvents } from "@/server/events/service";

export const dynamic = "force-dynamic";

export default async function OrganizerPage() {
  const user = await getCurrentUser();
  const allowed = user?.roles.includes("organizer") || user?.roles.includes("admin");

  if (!allowed) {
    return (
      <PageShell title="Organizer">
        <div className="max-w-md rounded-lg border border-black/10 bg-white p-5 shadow-nav">
          <p className="text-sm font-semibold text-slate-700">Organizer access is protected.</p>
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

  return (
    <PageShell title="Organizer">
      <OrganizerDashboard events={listEvents()} />
    </PageShell>
  );
}
