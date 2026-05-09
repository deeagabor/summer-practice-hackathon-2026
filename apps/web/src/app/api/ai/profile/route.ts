import { requireCurrentUser } from "@/server/auth/session";
import { enrichProfileWithAI, generateCompatibilityReport, getAIProfile } from "@/server/ai/service";
import { handleRouteError, jsonOk } from "@/server/http";

export async function GET() {
  try {
    const user = await requireCurrentUser();

    return jsonOk({
      profile: getAIProfile(user.id),
      report: generateCompatibilityReport(user.id),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST() {
  try {
    const user = await requireCurrentUser();
    const result = await enrichProfileWithAI(user.id);

    return jsonOk({
      ...result,
      report: generateCompatibilityReport(user.id),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
