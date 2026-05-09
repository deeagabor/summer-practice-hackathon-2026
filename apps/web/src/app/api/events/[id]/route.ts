import { getEvent } from "@/server/events/service";
import { handleRouteError, jsonOk } from "@/server/http";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const event = getEvent(id);

    if (!event) {
      return Response.json({ error: "Event not found." }, { status: 404 });
    }

    return jsonOk({ event });
  } catch (error) {
    return handleRouteError(error);
  }
}
