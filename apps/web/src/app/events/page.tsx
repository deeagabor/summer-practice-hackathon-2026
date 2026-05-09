import { PageShell } from "@/components/ui/PageShell";
import { EventWorkbench } from "@/features/events/EventWorkbench";
import { getCurrentUser } from "@/server/auth/session";
import { listEvents } from "@/server/events/service";
import { listSports } from "@/server/sports/service";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const user = await getCurrentUser();

  return (
    <PageShell title="Events">
      <EventWorkbench
        canCreate={Boolean(user)}
        initialEvents={listEvents()}
        sports={listSports()}
      />
    </PageShell>
  );
}
