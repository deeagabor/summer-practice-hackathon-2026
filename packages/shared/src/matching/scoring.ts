import { getSportById } from "../constants/sports";
import type {
  AvailabilityWindow,
  CompatibilityScore,
  Coordinates,
  Profile,
  SportsEvent,
  TeammateRecommendation,
  UserSportPreference
} from "../types/domain";

const skillRank = {
  beginner: 1,
  casual: 2,
  intermediate: 3,
  advanced: 4
} as const;

export function distanceKm(origin: Coordinates, destination: Coordinates): number {
  const radiusKm = 6371;
  const deltaLat = toRadians(destination.lat - origin.lat);
  const deltaLng = toRadians(destination.lng - origin.lng);
  const lat1 = toRadians(origin.lat);
  const lat2 = toRadians(destination.lat);
  const a =
    Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((radiusKm * centralAngle).toFixed(2));
}

export function calculateEventCompatibility(input: {
  userId: string;
  profile: Profile;
  preferences: UserSportPreference[];
  availability?: AvailabilityWindow;
  event: SportsEvent;
  friendAttending?: boolean;
  reliabilityScore?: number;
}): CompatibilityScore {
  const preferredSport = input.preferences.find(
    (preference) => preference.sportId === input.event.sportId
  );
  const distance = distanceKm(input.profile.coordinates, input.event.location.coordinates);
  const distanceScore = Math.max(0, 1 - distance / Math.max(input.profile.preferredRadiusKm, 1));
  const availabilityScore = input.availability?.showUpToday ? 1 : 0.25;
  const sportScore = preferredSport ? 1 : 0;
  const skillScore = preferredSport ? skillFit(preferredSport, input.event) : 0.35;
  const socialScore = input.friendAttending ? 1 : 0.25;
  const reliabilityScore = input.reliabilityScore ?? 0.75;
  const aiSimilarity = input.profile.allowsAiProfile ? 0.7 : 0.3;
  const weighted =
    sportScore * 0.25 +
    availabilityScore * 0.2 +
    distanceScore * 0.2 +
    skillScore * 0.15 +
    socialScore * 0.1 +
    reliabilityScore * 0.05 +
    aiSimilarity * 0.05;

  return {
    userId: input.userId,
    targetId: input.event.id,
    score: Math.round(weighted * 100),
    reasonCodes: reasonCodes({
      sportScore,
      availabilityScore,
      distanceScore,
      skillScore,
      socialScore,
      aiSimilarity
    })
  };
}

export function isGroupSizeViable(sportId: string, participantCount: number): boolean {
  const sport = getSportById(sportId);

  return Boolean(
    sport && participantCount >= sport.minPlayers && participantCount <= sport.maxPlayers
  );
}

export function assignCaptain(
  candidates: Array<{ userId: string; reliabilityScore: number }>
): string | undefined {
  return candidates
    .toSorted(
      (left, right) =>
        right.reliabilityScore - left.reliabilityScore || left.userId.localeCompare(right.userId)
    )
    .at(0)?.userId;
}

export function rankTeammates(recommendations: TeammateRecommendation[]): TeammateRecommendation[] {
  return recommendations.toSorted(
    (left, right) => right.score - left.score || left.distanceKm - right.distanceKm
  );
}

function skillFit(preference: UserSportPreference, event: SportsEvent): number {
  const current = skillRank[preference.skillLevel];
  const min = skillRank[event.skillRange[0]];
  const max = skillRank[event.skillRange[1]];

  if (current >= min && current <= max) {
    return 1;
  }

  const nearest = current < min ? min : max;

  return Math.max(0.2, 1 - Math.abs(current - nearest) * 0.35);
}

function reasonCodes(scores: {
  sportScore: number;
  availabilityScore: number;
  distanceScore: number;
  skillScore: number;
  socialScore: number;
  aiSimilarity: number;
}): string[] {
  const reasons: string[] = [];

  if (scores.sportScore > 0) reasons.push("same_sport");
  if (scores.availabilityScore >= 1) reasons.push("available_now");
  if (scores.distanceScore >= 0.7) reasons.push("close_distance");
  if (scores.skillScore >= 0.8) reasons.push("similar_skill");
  if (scores.socialScore >= 1) reasons.push("friend_attending");
  if (scores.aiSimilarity >= 0.65) reasons.push("compatible_interests");

  return reasons;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
