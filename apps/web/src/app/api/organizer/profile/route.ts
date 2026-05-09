import { organizerProfileSchema } from "@showup2move/shared";
import { requireRole } from "@/server/auth/session";
import { getOrganizerProfile, updateOrganizerProfile } from "@/server/organizer/service";
import { handleRouteError, jsonOk, readJson } from "@/server/http";

export async function GET() {
  try {
    const user = await requireRole("organizer");

    return jsonOk({ profile: getOrganizerProfile(user.id) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireRole("organizer");
    const input = await readJson(request, organizerProfileSchema);

    return jsonOk({ profile: updateOrganizerProfile(user.id, input) });
  } catch (error) {
    return handleRouteError(error);
  }
}
