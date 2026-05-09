import type { EventCreateInput, EventParticipant, SportsEvent } from "@showup2move/shared";
import { distanceKm } from "@showup2move/shared";
import { getStore, newId } from "../data/store";

const defaultCoordinates = { lat: 44.437, lng: 26.097 };

export function listEvents(): SportsEvent[] {
  return getStore().events.toSorted(
    (left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()
  );
}

export function getEvent(eventId: string): SportsEvent | undefined {
  return getStore().events.find((event) => event.id === eventId);
}

export function createEvent(userId: string, input: EventCreateInput): SportsEvent {
  const store = getStore();
  const profile = store.profiles.find((record) => record.userId === userId);
  const event: SportsEvent = {
    id: newId("event"),
    title: input.title,
    sportId: input.sportId,
    imageUrl:
      input.imageUrl ||
      "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=640&q=80",
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    status: "open",
    visibility: input.visibility,
    location: input.location,
    distanceKm: distanceKm(profile?.coordinates ?? defaultCoordinates, input.location.coordinates),
    skillRange: input.skillRange,
    capacity: input.capacity,
    participantCount: 1,
    organizerId: undefined,
    captainId: userId,
    description: input.description,
    reasonCodes: ["manual_event", "captain_assigned"]
  };

  store.events.push(event);
  store.participants.push({
    eventId: event.id,
    userId,
    status: "confirmed",
    joinedAt: new Date().toISOString()
  });
  store.conversations.push({
    id: newId("conversation"),
    kind: "event",
    title: event.title,
    eventId: event.id,
    participantIds: [userId],
    unreadCount: 0,
    updatedAt: new Date().toISOString()
  });

  return event;
}

export function joinEvent(
  userId: string,
  eventId: string,
  status: EventParticipant["status"]
): EventParticipant {
  const store = getStore();
  const event = getEvent(eventId);

  if (!event) {
    throw new Error("Event not found.");
  }

  const existing = store.participants.find(
    (participant) => participant.eventId === eventId && participant.userId === userId
  );

  if (existing) {
    existing.status = status;
    return existing;
  }

  if (event.participantCount >= event.capacity) {
    status = "waitlisted";
  }

  const participant: EventParticipant = {
    eventId,
    userId,
    status,
    joinedAt: new Date().toISOString()
  };

  store.participants.push(participant);
  event.participantCount += status === "waitlisted" ? 0 : 1;

  const conversation = store.conversations.find((record) => record.eventId === eventId);
  if (conversation && !conversation.participantIds.includes(userId)) {
    conversation.participantIds.push(userId);
    conversation.updatedAt = new Date().toISOString();
  }

  return participant;
}

export function updateEventStatus(
  eventId: string,
  status: SportsEvent["status"]
): SportsEvent {
  const event = getEvent(eventId);

  if (!event) {
    throw new Error("Event not found.");
  }

  event.status = status;

  return event;
}

export function getEventParticipants(eventId: string): EventParticipant[] {
  return getStore().participants.filter((p) => p.eventId === eventId);
}

export function leaveEvent(userId: string, eventId: string): void {
  const store = getStore();
  const event = getEvent(eventId);

  if (!event) {
    throw new Error("Event not found.");
  }

  const index = store.participants.findIndex(
    (p) => p.eventId === eventId && p.userId === userId
  );

  if (index < 0) {
    throw new Error("Not a participant.");
  }

  const participant = store.participants[index];

  if (participant && participant.status !== "waitlisted") {
    event.participantCount = Math.max(0, event.participantCount - 1);
  }

  store.participants.splice(index, 1);

  const conversation = store.conversations.find((c) => c.eventId === eventId);

  if (conversation) {
    conversation.participantIds = conversation.participantIds.filter((id) => id !== userId);
  }
}
