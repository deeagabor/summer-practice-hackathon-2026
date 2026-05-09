import { pollCreateSchema } from "@showup2move/shared";
import { requireCurrentUser } from "@/server/auth/session";
import { handleRouteError, jsonOk, readJson } from "@/server/http";
import { createPoll, listEventPolls } from "@/server/polls/service";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    return jsonOk({ polls: listEventPolls(id) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await context.params;
    const input = await readJson(request, pollCreateSchema);

    return jsonOk(createPoll(user.id, id, input), { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
