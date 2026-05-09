import {
  assignCaptain,
  calculateEventCompatibility,
  rankTeammates,
  type CompatibilityScore,
  type TeammateRecommendation
} from "@showup2move/shared";
import { getStore } from "../data/store";

export function generateMatchesForUser(userId: string): {
  scores: CompatibilityScore[];
  recommendations: TeammateRecommendation[];
  captainId?: string;
} {
  const store = getStore();
  const profile = store.profiles.find((record) => record.userId === userId);
  const preferences = store.sportPreferences.filter((preference) => preference.userId === userId);
  const availability = store.availability.find((record) => record.userId === userId);

  if (!profile) {
    return { scores: [], recommendations: [], captainId: undefined };
  }

  const scores = store.events.map((event) =>
    calculateEventCompatibility({
      userId,
      profile,
      preferences,
      availability,
      event,
      friendAttending: event.id === "event_basketball_victoriei",
      reliabilityScore: 0.82
    })
  );

  store.compatibilityScores = [
    ...store.compatibilityScores.filter((score) => score.userId !== userId),
    ...scores
  ];

  return {
    scores: scores.toSorted((left, right) => right.score - left.score),
    recommendations: rankTeammates(store.recommendations),
    captainId: assignCaptain([
      { userId, reliabilityScore: 0.82 },
      { userId: "user_andrei", reliabilityScore: 0.76 }
    ])
  };
}

export function getRecommendations(): TeammateRecommendation[] {
  return rankTeammates(getStore().recommendations);
}
