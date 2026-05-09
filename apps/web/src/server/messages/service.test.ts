import { describe, expect, it } from "vitest";
import { getStore } from "../data/store";
import { listMessageThreads, sendMessage } from "./service";

describe("messages service", () => {
  it("sends a message to a conversation", () => {
    const store = getStore();
    const conversation = store.conversations[0]!;
    const user = store.users.find((u) => conversation.participantIds.includes(u.id))!;

    const message = sendMessage(user.id, {
      conversationId: conversation.id,
      body: "Hello from test!"
    });

    expect(message.id).toBeTruthy();
    expect(message.body).toBe("Hello from test!");
    expect(message.senderId).toBe(user.id);
  });

  it("lists message threads for a participant", () => {
    const store = getStore();
    const user = store.users[0]!;
    const threads = listMessageThreads(user);

    expect(Array.isArray(threads)).toBe(true);
  });

  it("rejects messages to conversations user is not in", () => {
    const store = getStore();
    const conversation = store.conversations[0]!;
    const outsider = store.users.find(
      (u) => !conversation.participantIds.includes(u.id)
    );

    if (outsider) {
      expect(() =>
        sendMessage(outsider.id, {
          conversationId: conversation.id,
          body: "Should fail"
        })
      ).toThrow();
    }
  });
});
