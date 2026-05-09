import { describe, expect, it } from "vitest";
import {
  createNotification,
  getUnreadCount,
  listNotifications,
  markAsRead
} from "./service";

describe("notification service", () => {
  it("creates a notification", () => {
    const notif = createNotification("user_mara", "Test Title", "Test body");

    expect(notif.id).toBeTruthy();
    expect(notif.userId).toBe("user_mara");
    expect(notif.readAt).toBeUndefined();
  });

  it("lists notifications newest first", () => {
    createNotification("user_mara", "First", "Body 1");
    createNotification("user_mara", "Second", "Body 2");
    const list = listNotifications("user_mara");

    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(new Date(list[0]!.createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(list[1]!.createdAt).getTime()
    );
  });

  it("marks a notification as read", () => {
    const notif = createNotification("user_andrei", "Read me", "Body");
    const updated = markAsRead("user_andrei", notif.id);

    expect(updated.readAt).toBeTruthy();
  });

  it("counts unread notifications", () => {
    createNotification("user_bogdan", "Unread 1", "Body");
    createNotification("user_bogdan", "Unread 2", "Body");

    expect(getUnreadCount("user_bogdan")).toBe(2);

    const list = listNotifications("user_bogdan");
    markAsRead("user_bogdan", list[0]!.id);

    expect(getUnreadCount("user_bogdan")).toBe(1);
  });
});
