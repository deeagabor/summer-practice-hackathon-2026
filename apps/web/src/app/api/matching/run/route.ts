import { requireCurrentUser } from "@/server/auth/session";
import { generateMatchesForUser } from "@/server/matching/service";
import { handleRouteError, jsonOk } from "@/server/http";

export async function POST() {
  try {
    const user = await requireCurrentUser();

    return jsonOk(generateMatchesForUser(user.id));
  } catch (error) {
    return handleRouteError(error);
  }
}
