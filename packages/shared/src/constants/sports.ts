import type { Sport } from "../types/domain";

export const sports: Sport[] = [
  {
    id: "football",
    name: "Football",
    icon: "Goal",
    minPlayers: 10,
    idealPlayers: 12,
    maxPlayers: 14,
    defaultDurationMinutes: 90
  },
  {
    id: "basketball",
    name: "Basketball",
    icon: "CircleDot",
    minPlayers: 6,
    idealPlayers: 8,
    maxPlayers: 10,
    defaultDurationMinutes: 60
  },
  {
    id: "tennis",
    name: "Tennis",
    icon: "Circle",
    minPlayers: 2,
    idealPlayers: 2,
    maxPlayers: 4,
    defaultDurationMinutes: 60
  },
  {
    id: "running",
    name: "Running",
    icon: "Footprints",
    minPlayers: 2,
    idealPlayers: 5,
    maxPlayers: 20,
    defaultDurationMinutes: 45
  },
  {
    id: "volleyball",
    name: "Volleyball",
    icon: "Badge",
    minPlayers: 6,
    idealPlayers: 8,
    maxPlayers: 12,
    defaultDurationMinutes: 75
  }
];

export function getSportById(sportId: string): Sport | undefined {
  return sports.find((sport) => sport.id === sportId);
}
