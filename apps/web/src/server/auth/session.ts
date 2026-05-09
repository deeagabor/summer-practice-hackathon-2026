import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { User, UserRole } from "@showup2move/shared";
import { getStore, type SessionRecord } from "../data/store";

export const sessionCookieName = "showup2move_session";

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7
};

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64).toString("hex");

  return `scrypt$${salt}$${key}`;
}

export function verifyPassword(password: string, storedHash: string | undefined): boolean {
  if (!storedHash) {
    return false;
  }

  const [algorithm, salt, key] = storedHash.split("$");

  if (algorithm !== "scrypt" || !salt || !key) {
    return false;
  }

  const candidate = Buffer.from(scryptSync(password, salt, 64).toString("hex"));
  const expected = Buffer.from(key);

  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function createSession(userId: string): SessionRecord {
  const store = getStore();
  const session: SessionRecord = {
    token: randomBytes(32).toString("base64url"),
    userId,
    expiresAt: new Date(Date.now() + sessionCookieOptions.maxAge * 1000).toISOString()
  };

  store.sessions = store.sessions.filter(
    (record) => new Date(record.expiresAt).getTime() > Date.now()
  );
  store.sessions.push(session);

  return session;
}

export function deleteSession(token: string | undefined): void {
  if (!token) {
    return;
  }

  const store = getStore();
  store.sessions = store.sessions.filter((session) => session.token !== token);
}

export function getUserBySessionToken(token: string | undefined): User | undefined {
  if (!token) {
    return undefined;
  }

  const store = getStore();
  const session = store.sessions.find(
    (record) => record.token === token && new Date(record.expiresAt).getTime() > Date.now()
  );

  return session ? store.users.find((user) => user.id === session.userId) : undefined;
}

export async function getCurrentUser(): Promise<User | undefined> {
  const cookieStore = await cookies();

  return getUserBySessionToken(cookieStore.get(sessionCookieName)?.value);
}

export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthError("Authentication required", 401);
  }

  return user;
}

export async function requireRole(role: UserRole): Promise<User> {
  const user = await requireCurrentUser();

  if (!user.roles.includes(role)) {
    throw new AuthError("Forbidden", 403);
  }

  return user;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}
