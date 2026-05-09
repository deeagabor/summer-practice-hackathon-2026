import type { Notification } from "@showup2move/shared";
import { getStore, newId } from "../data/store";

export function createNotification(
  userId: string,
  title: string,
  body: string
): Notification {
  const store = getStore();
  const notification: Notification = {
    id: newId("notif"),
    userId,
    title,
    body,
    createdAt: new Date().toISOString()
  };

  store.notifications.push(notification);

  return notification;
}

export function listNotifications(userId: string): Notification[] {
  return getStore()
    .notifications.filter((n) => n.userId === userId)
    .toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function markAsRead(userId: string, notificationId: string): Notification {
  const store = getStore();
  const notification = store.notifications.find(
    (n) => n.id === notificationId && n.userId === userId
  );

  if (!notification) {
    throw new Error("Notification not found.");
  }

  notification.readAt = new Date().toISOString();

  return notification;
}

export function getUnreadCount(userId: string): number {
  return getStore().notifications.filter((n) => n.userId === userId && !n.readAt).length;
}
