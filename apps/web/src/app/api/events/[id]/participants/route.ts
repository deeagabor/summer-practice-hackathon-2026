import { joinEventSchema } from "@showup2move/shared";
import { requireCurrentUser } from "@/server/auth/session";
import { joinEvent } from "@/server/events/service";
import { handleRouteError, jsonOk, readJson } from "@/server/http";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await context.params;
    const input = await readJson(request, joinEventSchema);

    return jsonOk({ participant: joinEvent(user.id, id, input.status ?? "joined") });
  } catch (error) {
    return handleRouteError(error);
  }
}
