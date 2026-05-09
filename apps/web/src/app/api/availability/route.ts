import { availabilitySchema } from "@showup2move/shared";
import { requireCurrentUser } from "@/server/auth/session";
import { getAvailability, saveAvailability } from "@/server/availability/service";
import { handleRouteError, jsonOk, readJson } from "@/server/http";

export async function GET() {
  try {
    const user = await requireCurrentUser();

    return jsonOk({ availability: getAvailability(user.id) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const input = await readJson(request, availabilitySchema);

    return jsonOk({ availability: saveAvailability(user.id, input) });
  } catch (error) {
    return handleRouteError(error);
  }
}
