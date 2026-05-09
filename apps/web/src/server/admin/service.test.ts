import { describe, expect, it } from "vitest";
import { getStore } from "../data/store";

describe("admin service", () => {
  // Dynamic import to avoid circular init issues
  const getService = async () => import("./service");

  it("returns dashboard counts matching seed data", async () => {
    const { getAdminDashboard } = await getService();
    const dash = getAdminDashboard();

    expect(dash.users).toBeGreaterThanOrEqual(4);
    expect(dash.openEvents).toBeGreaterThanOrEqual(1);
    expect(typeof dash.conversations).toBe("number");
  });

  it("lists users with roles", async () => {
    const { listUsers } = await getService();
    const users = listUsers();

    expect(users.length).toBeGreaterThanOrEqual(4);
    expect(users[0]).toHaveProperty("email");
    expect(users[0]).toHaveProperty("roles");
    expect(users[0]).not.toHaveProperty("passwordHash");
  });

  it("adds a role to a user", async () => {
    const { updateUser } = await getService();
    const result = updateUser("admin_irina", "user_mara", { addRole: "organizer" });

    expect(result.roles).toContain("organizer");
  });

  it("removes a role from a user", async () => {
    const { updateUser } = await getService();
    updateUser("admin_irina", "user_mara", { addRole: "organizer" });
    const result = updateUser("admin_irina", "user_mara", { removeRole: "organizer" });

    expect(result.roles).not.toContain("organizer");
  });

  it("creates audit log on admin action", async () => {
    const { updateUser } = await getService();
    const store = getStore();
    const before = store.auditLogs.length;

    updateUser("admin_irina", "user_andrei", { addRole: "admin" });

    expect(store.auditLogs.length).toBeGreaterThan(before);
  });

  it("creates and resolves a moderation report", async () => {
    const { createModerationReport, resolveReport } = await getService();
    const report = createModerationReport("user_mara", {
      reason: "Inappropriate behavior during event"
    });

    expect(report.status).toBe("open");

    const resolved = resolveReport("admin_irina", report.id, "Warning issued");

    expect(resolved.status).toBe("resolved");
    expect(resolved.resolution).toBe("Warning issued");
  });
});
