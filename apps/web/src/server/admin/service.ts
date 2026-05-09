import type { AdminUserUpdateInput, ModerationReport, ModerationReportInput } from "@showup2move/shared";
import { getStore, newId, type AuditRecord } from "../data/store";

export function getAdminDashboard() {
  const store = getStore();

  return {
    users: store.users.length,
    organizers: store.users.filter((user) => user.roles.includes("organizer")).length,
    admins: store.users.filter((user) => user.roles.includes("admin")).length,
    openEvents: store.events.filter((event) => event.status === "open").length,
    suggestedEvents: store.events.filter((event) => event.status === "suggested").length,
    conversations: store.conversations.length,
    openReports: store.moderationReports.filter((r) => r.status === "open").length,
    auditLogs: store.auditLogs.toSorted(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    )
  };
}

export function listUsers() {
  const store = getStore();

  return store.users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles,
    createdAt: user.createdAt
  }));
}

export function updateUser(actorId: string, userId: string, input: AdminUserUpdateInput) {
  const store = getStore();
  const user = store.users.find((u) => u.id === userId);

  if (!user) {
    throw new Error("User not found.");
  }

  if (input.addRole && !user.roles.includes(input.addRole)) {
    user.roles.push(input.addRole);
    createAuditLog(actorId, "add_role", "user", userId, { role: input.addRole });
  }

  if (input.removeRole) {
    user.roles = user.roles.filter((r) => r !== input.removeRole);
    createAuditLog(actorId, "remove_role", "user", userId, { role: input.removeRole });
  }

  if (input.status === "suspended") {
    createAuditLog(actorId, "suspend_user", "user", userId);
  }

  if (input.status === "active") {
    createAuditLog(actorId, "restore_user", "user", userId);
  }

  return { id: user.id, email: user.email, name: user.name, roles: user.roles };
}

export function createModerationReport(
  reporterId: string,
  input: ModerationReportInput
): ModerationReport {
  const store = getStore();
  const report: ModerationReport = {
    id: newId("report"),
    reporterId,
    subjectUserId: input.subjectUserId,
    eventId: input.eventId,
    postId: input.postId,
    reason: input.reason,
    status: "open",
    createdAt: new Date().toISOString()
  };

  store.moderationReports.push(report);

  return report;
}

export function listModerationReports(): ModerationReport[] {
  return getStore().moderationReports.toSorted(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function resolveReport(
  actorId: string,
  reportId: string,
  resolution: string
): ModerationReport {
  const store = getStore();
  const report = store.moderationReports.find((r) => r.id === reportId);

  if (!report) {
    throw new Error("Report not found.");
  }

  report.status = "resolved";
  report.resolution = resolution;
  createAuditLog(actorId, "resolve_report", "moderation_report", reportId, { resolution });

  return report;
}

export function createAuditLog(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown> = {}
): AuditRecord {
  const store = getStore();
  const record: AuditRecord = {
    id: newId("audit"),
    actorId,
    action,
    entityType,
    entityId,
    metadata,
    createdAt: new Date().toISOString()
  };

  store.auditLogs.push(record);

  return record;
}
