import type { LoginInput, RegisterInput, User } from "@showup2move/shared";
import { getStore, newId, type SessionRecord } from "../data/store";
import { createSession, hashPassword, verifyPassword } from "./session";

export interface AuthResult {
  user: Omit<User, "passwordHash">;
  session: SessionRecord;
}

export function registerUser(input: RegisterInput): AuthResult {
  const store = getStore();
  const email = input.email.toLowerCase();

  if (store.users.some((user) => user.email.toLowerCase() === email)) {
    throw new Error("Email is already registered.");
  }

  const user: User = {
    id: newId("user"),
    email,
    passwordHash: hashPassword(input.password),
    name: input.name,
    roles: ["user"],
    createdAt: new Date().toISOString()
  };

  store.users.push(user);
  store.profiles.push({
    userId: user.id,
    displayName: input.name,
    bio: "",
    homeArea: "Bucharest",
    preferredRadiusKm: 8,
    locationPrivacy: "approximate",
    allowsAiProfile: true,
    coordinates: { lat: 44.437, lng: 26.097 }
  });

  const session = createSession(user.id);

  return { user: stripPassword(user), session };
}

export function loginUser(input: LoginInput): AuthResult {
  const store = getStore();
  const user = store.users.find(
    (record) => record.email.toLowerCase() === input.email.toLowerCase()
  );

  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    throw new Error("Invalid email or password.");
  }

  const session = createSession(user.id);

  return { user: stripPassword(user), session };
}

export function stripPassword(user: User): Omit<User, "passwordHash"> {
  const { passwordHash: _passwordHash, ...safeUser } = user;

  return safeUser;
}
