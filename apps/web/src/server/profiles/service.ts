import type {
  Profile,
  ProfileInput,
  SportPreferenceInput,
  UserSportPreference
} from "@showup2move/shared";
import { getStore } from "../data/store";

export function getProfileBundle(userId: string): {
  profile: Profile | undefined;
  preferences: UserSportPreference[];
} {
  const store = getStore();

  return {
    profile: store.profiles.find((profile) => profile.userId === userId),
    preferences: store.sportPreferences.filter((preference) => preference.userId === userId)
  };
}

export function updateProfile(userId: string, input: ProfileInput): Profile {
  const store = getStore();
  const profile: Profile = {
    ...input,
    avatarUrl: input.avatarUrl || undefined,
    userId
  };
  const index = store.profiles.findIndex((record) => record.userId === userId);

  if (index >= 0) {
    store.profiles[index] = profile;
  } else {
    store.profiles.push(profile);
  }

  return profile;
}

export function replaceSportPreferences(
  userId: string,
  preferences: SportPreferenceInput[]
): UserSportPreference[] {
  const store = getStore();
  const nextPreferences = preferences.map((preference) => ({
    ...preference,
    userId
  }));

  store.sportPreferences = [
    ...store.sportPreferences.filter((preference) => preference.userId !== userId),
    ...nextPreferences
  ];

  return nextPreferences;
}
