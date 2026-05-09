import { requireRole } from "@/server/auth/session";
import { getAdminDashboard } from "@/server/admin/service";
import { handleRouteError, jsonOk } from "@/server/http";

export async function GET() {
  try {
    await requireRole("admin");

    return jsonOk(getAdminDashboard());
  } catch (error) {
    return handleRouteError(error);
  }
}
