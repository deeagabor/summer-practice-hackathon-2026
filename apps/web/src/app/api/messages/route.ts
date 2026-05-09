import { messageCreateSchema } from "@showup2move/shared";
import { requireCurrentUser } from "@/server/auth/session";
import { handleRouteError, jsonOk, readJson } from "@/server/http";
import { listMessageThreads, sendMessage } from "@/server/messages/service";

export async function GET() {
  try {
    const user = await requireCurrentUser();

    return jsonOk({ threads: listMessageThreads(user) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const input = await readJson(request, messageCreateSchema);

    return jsonOk({ message: sendMessage(user.id, input) }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
