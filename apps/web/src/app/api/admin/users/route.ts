import { requireRole } from "@/server/auth/session";
import { listUsers } from "@/server/admin/service";
import { handleRouteError, jsonOk } from "@/server/http";

export async function GET() {
  try {
    await requireRole("admin");

    return jsonOk({ users: listUsers() });
  } catch (error) {
    return handleRouteError(error);
  }
}
