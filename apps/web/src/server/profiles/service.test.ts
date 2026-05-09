import { describe, expect, it } from "vitest";
import { getStore } from "../data/store";
import { getProfileBundle, replaceSportPreferences, updateProfile } from "./service";

describe("profiles service", () => {
  it("returns a profile bundle for a seeded user", () => {
    const bundle = getProfileBundle("user_mara");

    expect(bundle.profile).toBeTruthy();
    expect(bundle.profile?.displayName).toBe("Mara");
    expect(Array.isArray(bundle.preferences)).toBe(true);
  });

  it("updates a user profile", () => {
    const updated = updateProfile("user_mara", {
      displayName: "Mara I.",
      bio: "Updated bio",
      homeArea: "Piata Victoriei",
      preferredRadiusKm: 10,
      locationPrivacy: "approximate",
      allowsAiProfile: true,
      coordinates: { lat: 44.452, lng: 26.085 }
    });

    expect(updated.displayName).toBe("Mara I.");
    expect(updated.bio).toBe("Updated bio");
  });

  it("replaces sport preferences", () => {
    const newPrefs = replaceSportPreferences("user_mara", [
      {
        sportId: "tennis",
        skillLevel: "beginner",
        intensity: "social",
        preferredRoles: []
      }
    ]);

    expect(newPrefs.length).toBe(1);
    expect(newPrefs[0]!.sportId).toBe("tennis");

    const store = getStore();
    const maraPrefs = store.sportPreferences.filter((p) => p.userId === "user_mara");

    expect(maraPrefs.length).toBe(1);
  });
});
