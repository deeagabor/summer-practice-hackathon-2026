import type { OrganizerProfile, OrganizerProfileInput, SportsEvent } from "@showup2move/shared";
import { getStore } from "../data/store";

export function getOrganizerProfile(userId: string): OrganizerProfile | undefined {
  return getStore().organizerProfiles.find((p) => p.userId === userId);
}

export function updateOrganizerProfile(
  userId: string,
  input: OrganizerProfileInput
): OrganizerProfile {
  const store = getStore();
  const existing = store.organizerProfiles.find((p) => p.userId === userId);

  if (existing) {
    existing.organizationName = input.organizationName;
    existing.websiteUrl = input.websiteUrl || undefined;

    return existing;
  }

  const profile: OrganizerProfile = {
    userId,
    organizationName: input.organizationName,
    verificationStatus: "pending",
    websiteUrl: input.websiteUrl || undefined,
    createdAt: new Date().toISOString()
  };

  store.organizerProfiles.push(profile);

  return profile;
}

export function listOrganizerEvents(userId: string): SportsEvent[] {
  return getStore()
    .events.filter((e) => e.organizerId === userId)
    .toSorted((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}
