import { describe, expect, it } from "vitest";
import type { Profile, SportsEvent, UserSportPreference } from "../types/domain";
import {
  assignCaptain,
  calculateEventCompatibility,
  distanceKm,
  isGroupSizeViable
} from "./scoring";

const profile: Profile = {
  userId: "user_1",
  displayName: "Mara Ionescu",
  bio: "Football and evening runs.",
  homeArea: "Piata Victoriei",
  preferredRadiusKm: 8,
  locationPrivacy: "approximate",
  allowsAiProfile: true,
  coordinates: { lat: 44.452, lng: 26.085 }
};

const preference: UserSportPreference = {
  userId: "user_1",
  sportId: "football",
  skillLevel: "intermediate",
  intensity: "balanced",
  preferredRoles: ["midfielder"]
};

const event: SportsEvent = {
  id: "event_1",
  title: "Evening five-a-side",
  sportId: "football",
  imageUrl: "/images/football.jpg",
  startsAt: "2026-05-09T17:00:00.000Z",
  endsAt: "2026-05-09T18:30:00.000Z",
  status: "open",
  visibility: "public",
  location: {
    name: "Parcul Kiseleff",
    address: "Soseaua Kiseleff",
    city: "Bucharest",
    coordinates: { lat: 44.4605, lng: 26.0814 }
  },
  distanceKm: 1.2,
  skillRange: ["casual", "advanced"],
  capacity: 12,
  participantCount: 9,
  description: "Fast but friendly game after work.",
  reasonCodes: ["same_sport"]
};

describe("matching scoring", () => {
  it("calculates geographic distance in kilometers", () => {
    expect(distanceKm(profile.coordinates, event.location.coordinates)).toBeLessThan(2);
  });

  it("scores a nearby preferred event highly with explainable reasons", () => {
    const result = calculateEventCompatibility({
      userId: "user_1",
      profile,
      preferences: [preference],
      availability: {
        userId: "user_1",
        showUpToday: true,
        startsAt: "2026-05-09T16:30:00.000Z",
        endsAt: "2026-05-09T21:00:00.000Z"
      },
      event,
      friendAttending: true
    });

    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.reasonCodes).toEqual(
      expect.arrayContaining(["same_sport", "available_now", "close_distance", "friend_attending"])
    );
  });

  it("checks sport group-size boundaries", () => {
    expect(isGroupSizeViable("tennis", 2)).toBe(true);
    expect(isGroupSizeViable("tennis", 5)).toBe(false);
  });

  it("assigns the most reliable captain deterministically", () => {
    expect(
      assignCaptain([
        { userId: "user_b", reliabilityScore: 0.8 },
        { userId: "user_a", reliabilityScore: 0.9 }
      ])
    ).toBe("user_a");
  });
});
