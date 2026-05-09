import type { MessageCreateInput, Message, User } from "@showup2move/shared";
import { getStore, newId } from "../data/store";

export function listMessageThreads(user: User) {
  const store = getStore();

  return store.conversations
    .filter(
      (conversation) =>
        conversation.participantIds.includes(user.id) || user.roles.includes("admin")
    )
    .map((conversation) => ({
      ...conversation,
      messages: store.messages.filter((message) => message.conversationId === conversation.id)
    }));
}

export function sendMessage(userId: string, input: MessageCreateInput): Message {
  const store = getStore();
  const conversation = store.conversations.find((record) => record.id === input.conversationId);

  if (!conversation || !conversation.participantIds.includes(userId)) {
    throw new Error("Conversation not found.");
  }

  const message: Message = {
    id: newId("message"),
    conversationId: input.conversationId,
    senderId: userId,
    kind: input.eventId ? "event_invitation" : "text",
    body: input.body,
    eventId: input.eventId,
    createdAt: new Date().toISOString()
  };

  store.messages.push(message);
  conversation.updatedAt = message.createdAt;

  return message;
}
