import { eventCreateSchema } from "@showup2move/shared";
import { requireCurrentUser } from "@/server/auth/session";
import { createEvent, listEvents } from "@/server/events/service";
import { handleRouteError, jsonOk, readJson } from "@/server/http";

export function GET() {
  return jsonOk({ events: listEvents() });
}

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const input = await readJson(request, eventCreateSchema);

    return jsonOk({ event: createEvent(user.id, input) }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
