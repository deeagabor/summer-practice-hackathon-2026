import { describe, expect, it } from "vitest";
import { getStore } from "../data/store";
import { joinEvent, listEvents } from "./service";

describe("event service", () => {
  it("lists seeded events in chronological order", () => {
    const events = listEvents();

    expect(events.length).toBeGreaterThanOrEqual(3);
    expect(new Date(events[0]?.startsAt ?? 0).getTime()).toBeLessThanOrEqual(
      new Date(events[1]?.startsAt ?? 0).getTime()
    );
  });

  it("joins a user and updates the event conversation", () => {
    const participant = joinEvent("admin_irina", "event_football_kiseleff", "joined");
    const store = getStore();
    const conversation = store.conversations.find(
      (record) => record.eventId === "event_football_kiseleff"
    );

    expect(participant.status).toBe("joined");
    expect(conversation?.participantIds).toContain("admin_irina");
  });
});
