import { requireCurrentUser } from "@/server/auth/session";
import { handleRouteError, jsonOk } from "@/server/http";
import {
  getUnreadCount,
  listNotifications,
  markAsRead
} from "@/server/notifications/service";

export async function GET() {
  try {
    const user = await requireCurrentUser();

    return jsonOk({
      notifications: listNotifications(user.id),
      unreadCount: getUnreadCount(user.id)
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireCurrentUser();
    const body = (await request.json()) as { notificationId?: string };

    if (!body.notificationId) {
      return Response.json({ error: "notificationId is required." }, { status: 400 });
    }

    return jsonOk({ notification: markAsRead(user.id, body.notificationId) });
  } catch (error) {
    return handleRouteError(error);
  }
}
