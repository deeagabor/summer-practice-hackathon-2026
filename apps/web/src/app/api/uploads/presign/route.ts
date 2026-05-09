import { uploadRequestSchema } from "@showup2move/shared";
import { requireCurrentUser } from "@/server/auth/session";
import { handleRouteError, jsonOk, readJson } from "@/server/http";
import { createUploadIntent } from "@/server/uploads/service";

export async function POST(request: Request) {
  try {
    await requireCurrentUser();
    const input = await readJson(request, uploadRequestSchema);

    return jsonOk(createUploadIntent(input));
  } catch (error) {
    return handleRouteError(error);
  }
}
