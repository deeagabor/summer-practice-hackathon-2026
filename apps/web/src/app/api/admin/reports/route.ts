import { requireRole } from "@/server/auth/session";
import { listModerationReports, resolveReport } from "@/server/admin/service";
import { handleRouteError, jsonOk } from "@/server/http";

export async function GET() {
  try {
    await requireRole("admin");

    return jsonOk({ reports: listModerationReports() });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireRole("admin");
    const body = (await request.json()) as { reportId?: string; resolution?: string };

    if (!body.reportId || !body.resolution) {
      return Response.json(
        { error: "reportId and resolution are required." },
        { status: 400 }
      );
    }

    return jsonOk({ report: resolveReport(admin.id, body.reportId, body.resolution) });
  } catch (error) {
    return handleRouteError(error);
  }
}
