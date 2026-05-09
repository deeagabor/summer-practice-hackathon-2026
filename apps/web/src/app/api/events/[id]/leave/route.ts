import { requireCurrentUser } from "@/server/auth/session";
import { leaveEvent } from "@/server/events/service";
import { handleRouteError, jsonOk } from "@/server/http";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await context.params;
    leaveEvent(user.id, id);

    return jsonOk({ left: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
