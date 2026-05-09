import { profileSchema, sportPreferenceSchema } from "@showup2move/shared";
import { z } from "zod";
import { requireCurrentUser } from "@/server/auth/session";
import { enqueueProfileEnrichment } from "@/server/ai/service";
import {
  getProfileBundle,
  replaceSportPreferences,
  updateProfile
} from "@/server/profiles/service";
import { handleRouteError, jsonOk, readJson } from "@/server/http";

const profileUpdateSchema = z.object({
  profile: profileSchema,
  sportPreferences: z.array(sportPreferenceSchema).max(8)
});

export async function GET() {
  try {
    const user = await requireCurrentUser();

    return jsonOk(getProfileBundle(user.id));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireCurrentUser();
    const input = await readJson(request, profileUpdateSchema);
    const profile = updateProfile(user.id, input.profile);
    const preferences = replaceSportPreferences(user.id, input.sportPreferences);
    enqueueProfileEnrichment(user.id);

    return jsonOk({ profile, preferences });
  } catch (error) {
    return handleRouteError(error);
  }
}
