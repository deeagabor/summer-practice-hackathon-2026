import type { InvitationCreateInput, Message } from "@showup2move/shared";
import { getStore, newId } from "../data/store";
import { createNotification } from "../notifications/service";

export function sendInvitation(
  senderId: string,
  input: Omit<InvitationCreateInput, "message"> & { message?: string }
): Message {
  const store = getStore();
  const event = store.events.find((e) => e.id === input.eventId);

  if (!event) {
    throw new Error("Event not found.");
  }

  const targetUser = store.users.find((u) => u.id === input.targetUserId);

  if (!targetUser) {
    throw new Error("Target user not found.");
  }

  let conversation = store.conversations.find(
    (c) =>
      c.kind === "direct" &&
      c.participantIds.includes(senderId) &&
      c.participantIds.includes(input.targetUserId)
  );

  if (!conversation) {
    conversation = {
      id: newId("conversation"),
      kind: "direct",
      title: "Direct Message",
      participantIds: [senderId, input.targetUserId],
      unreadCount: 0,
      updatedAt: new Date().toISOString()
    };
    store.conversations.push(conversation);
  }

  const message: Message = {
    id: newId("message"),
    conversationId: conversation.id,
    senderId,
    kind: "event_invitation",
    body: input.message ?? "You're invited!",
    eventId: input.eventId,
    createdAt: new Date().toISOString()
  };

  store.messages.push(message);
  conversation.updatedAt = message.createdAt;
  conversation.unreadCount += 1;

  const sender = store.users.find((u) => u.id === senderId);
  createNotification(
    input.targetUserId,
    "Event Invitation",
    `${sender?.name ?? "Someone"} invited you to ${event.title}`
  );

  return message;
}
