import { describe, expect, it, vi } from "vitest";
import { getStore } from "../data/store";
import { createSession, requireCurrentUser, requireRole } from "./session";
import * as nextHeaders from "next/headers";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

type CookieStoreMock = Awaited<ReturnType<typeof nextHeaders.cookies>>;

describe("session service", () => {
  it("rejects when no session cookie exists", async () => {
    vi.mocked(nextHeaders.cookies).mockResolvedValue({
      get: () => undefined,
    } as unknown as CookieStoreMock);

    await expect(requireCurrentUser()).rejects.toThrow("Authentication required");
  });

  it("resolves when valid session exists", async () => {
    const store = getStore();
    const user = store.users.find((record) => record.email === "mara@example.com")!;
    const session = createSession(user.id);

    vi.mocked(nextHeaders.cookies).mockResolvedValue({
      get: () => ({ value: session.token }),
    } as unknown as CookieStoreMock);

    const currentUser = await requireCurrentUser();
    expect(currentUser.id).toBe(session.userId);
  });

  it("enforces roles correctly", async () => {
    const store = getStore();
    const admin = store.users.find((user) => user.roles.includes("admin"))!;
    const regularUser = store.users.find((user) => !user.roles.includes("admin"))!;
    const adminSession = createSession(admin.id);
    const userSession = createSession(regularUser.id);

    vi.mocked(nextHeaders.cookies).mockResolvedValue({
      get: () => ({ value: adminSession.token }),
    } as unknown as CookieStoreMock);

    const adminUser = await requireRole("admin");
    expect(adminUser.roles).toContain("admin");

    vi.mocked(nextHeaders.cookies).mockResolvedValue({
      get: () => ({ value: userSession.token }),
    } as unknown as CookieStoreMock);

    await expect(requireRole("admin")).rejects.toThrow("Forbidden");
  });
});
