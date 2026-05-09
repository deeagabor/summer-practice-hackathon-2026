import { describe, expect, it } from "vitest";
import { getStore } from "../data/store";
import { generateMatchesForUser, getRecommendations } from "./service";

describe("matching service", () => {
  it("generates matches for a user with sorted scores", () => {
    const result = generateMatchesForUser("user_mara");

    expect(result.scores.length).toBeGreaterThanOrEqual(1);

    for (let i = 1; i < result.scores.length; i++) {
      expect(result.scores[i - 1]!.score).toBeGreaterThanOrEqual(result.scores[i]!.score);
    }
  });

  it("returns recommendations list", () => {
    const recommendations = getRecommendations();

    expect(Array.isArray(recommendations)).toBe(true);
  });

  it("stores compatibility scores in the store", () => {
    const store = getStore();
    generateMatchesForUser("user_mara");

    const scores = store.compatibilityScores.filter((s) => s.userId === "user_mara");

    expect(scores.length).toBeGreaterThanOrEqual(1);
  });
});
