import { pollVoteSchema } from "@showup2move/shared";
import { requireCurrentUser } from "@/server/auth/session";
import { handleRouteError, jsonOk, readJson } from "@/server/http";
import { votePoll } from "@/server/polls/service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; pollId: string }> }
) {
  try {
    const user = await requireCurrentUser();
    const { pollId } = await context.params;
    const input = await readJson(request, pollVoteSchema);

    return jsonOk({ vote: votePoll(user.id, pollId, input.optionId) });
  } catch (error) {
    return handleRouteError(error);
  }
}
