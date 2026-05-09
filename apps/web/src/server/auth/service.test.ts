import { describe, expect, it } from "vitest";
import { getStore } from "../data/store";
import { loginUser, registerUser } from "./service";

describe("auth service", () => {
  it("registers a new user and creates session", () => {
    const store = getStore();
    const beforeCount = store.users.length;
    const email = `new_${crypto.randomUUID()}@example.com`;

    const result = registerUser({
      email,
      password: "password123",
      name: "New Tester",
    });

    expect(result.user.id).toBeTruthy();
    expect(result.user.email).toBe(email);
    expect(result.session.token).toBeTruthy();
    expect(result.session.userId).toBe(result.user.id);
    expect(store.users.length).toBe(beforeCount + 1);
  });

  it("fails to register duplicate email", () => {
    expect(() =>
      registerUser({
        email: "mara@example.com",
        password: "password123",
        name: "Mara Clone",
      }),
    ).toThrow("Email is already registered.");
  });

  it("logs in with correct credentials", () => {
    const result = loginUser({ email: "mara@example.com", password: "Showup2026!" });
    expect(result.user.email).toBe("mara@example.com");
    expect(result.session.token).toBeTruthy();
  });

  it("fails to login with bad password", () => {
    expect(() => loginUser({ email: "mara@example.com", password: "wrong" })).toThrow("Invalid email or password.");
  });

  it("fails to login with unknown email", () => {
    expect(() => loginUser({ email: "nobody@example.com", password: "wrong" })).toThrow("Invalid email or password.");
  });
});
