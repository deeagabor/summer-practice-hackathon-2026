import { requireRole } from "@/server/auth/session";
import { listEvents } from "@/server/events/service";
import { handleRouteError, jsonOk } from "@/server/http";

export async function GET() {
  try {
    const user = await requireRole("organizer");

    return jsonOk({
      events: listEvents().filter((event) => event.organizerId === user.id || event.organizerId)
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
