import { adminUserUpdateSchema } from "@showup2move/shared";
import { requireRole } from "@/server/auth/session";
import { updateUser } from "@/server/admin/service";
import { handleRouteError, jsonOk, readJson } from "@/server/http";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole("admin");
    const { id } = await context.params;
    const input = await readJson(request, adminUserUpdateSchema);

    return jsonOk({ user: updateUser(admin.id, id, input) });
  } catch (error) {
    return handleRouteError(error);
  }
}
