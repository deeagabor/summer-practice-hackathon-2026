import type { AvailabilityInput, AvailabilityWindow } from "@showup2move/shared";
import { getStore } from "../data/store";

export function saveAvailability(userId: string, input: AvailabilityInput): AvailabilityWindow {
  const store = getStore();
  const record: AvailabilityWindow = {
    ...input,
    userId
  };

  store.availability = [
    ...store.availability.filter((availability) => availability.userId !== userId),
    record
  ];

  return record;
}

export function getAvailability(userId: string): AvailabilityWindow | undefined {
  return getStore().availability.find((availability) => availability.userId === userId);
}
