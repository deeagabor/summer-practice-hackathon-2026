import { invitationCreateSchema } from "@showup2move/shared";
import { requireCurrentUser } from "@/server/auth/session";
import { handleRouteError, jsonOk, readJson } from "@/server/http";
import { sendInvitation } from "@/server/invitations/service";

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const input = await readJson(request, invitationCreateSchema);

    return jsonOk({ message: sendInvitation(user.id, input) }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
