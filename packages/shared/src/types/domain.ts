export const userRoles = ["user", "organizer", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

export const skillLevels = ["beginner", "casual", "intermediate", "advanced"] as const;
export type SkillLevel = (typeof skillLevels)[number];

export const playIntensities = ["social", "balanced", "competitive"] as const;
export type PlayIntensity = (typeof playIntensities)[number];

export const locationPrivacyModes = ["approximate", "precise", "hidden"] as const;
export type LocationPrivacy = (typeof locationPrivacyModes)[number];

export const eventStatuses = [
  "draft",
  "suggested",
  "open",
  "pending_confirmation",
  "confirmed",
  "active",
  "completed",
  "cancelled"
] as const;
export type EventStatus = (typeof eventStatuses)[number];

export const eventVisibilityModes = ["public", "friends", "invite_only"] as const;
export type EventVisibility = (typeof eventVisibilityModes)[number];

export const participantStatuses = [
  "invited",
  "joined",
  "confirmed",
  "waitlisted",
  "attended",
  "cancelled"
] as const;
export type ParticipantStatus = (typeof participantStatuses)[number];

export type ConversationKind = "direct" | "group" | "event";
export type MessageKind = "text" | "event_invitation" | "poll_prompt" | "system_update";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Sport {
  id: string;
  name: string;
  icon: string;
  minPlayers: number;
  idealPlayers: number;
  maxPlayers: number;
  defaultDurationMinutes: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  passwordHash?: string;
  createdAt: string;
}

export interface Profile {
  userId: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  homeArea: string;
  preferredRadiusKm: number;
  locationPrivacy: LocationPrivacy;
  allowsAiProfile: boolean;
  coordinates: Coordinates;
}

export interface UserSportPreference {
  userId: string;
  sportId: string;
  skillLevel: SkillLevel;
  intensity: PlayIntensity;
  preferredRoles: string[];
}

export interface AvailabilityWindow {
  userId: string;
  showUpToday: boolean;
  startsAt: string;
  endsAt: string;
  note?: string;
}

export interface EventLocation {
  name: string;
  address: string;
  city: string;
  coordinates: Coordinates;
  priceEstimateCents?: number;
}

export interface SportsEvent {
  id: string;
  title: string;
  sportId: string;
  imageUrl: string;
  startsAt: string;
  endsAt: string;
  status: EventStatus;
  visibility: EventVisibility;
  location: EventLocation;
  distanceKm: number;
  skillRange: [SkillLevel, SkillLevel];
  capacity: number;
  participantCount: number;
  organizerId?: string;
  captainId?: string;
  description: string;
  reasonCodes: string[];
}

export interface EventParticipant {
  eventId: string;
  userId: string;
  status: ParticipantStatus;
  joinedAt: string;
}

export interface Conversation {
  id: string;
  kind: ConversationKind;
  title: string;
  eventId?: string;
  participantIds: string[];
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  kind: MessageKind;
  body: string;
  eventId?: string;
  createdAt: string;
}

export interface CompatibilityScore {
  userId: string;
  targetId: string;
  score: number;
  reasonCodes: string[];
}

export interface TeammateRecommendation {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  sportId: string;
  score: number;
  reasonCodes: string[];
  distanceKm: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  readAt?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  eventId: string;
  caption: string;
  visibility: EventVisibility;
  sportId: string;
  eventDate: string;
  createdAt: string;
}

export interface PostMedia {
  id: string;
  postId: string;
  url: string;
  contentType: string;
  byteSize: number;
  createdAt: string;
}

export type PollKind = "time" | "location" | "team" | "other";

export interface Poll {
  id: string;
  eventId: string;
  title: string;
  kind: PollKind;
  closesAt?: string;
  createdBy?: string;
  createdAt: string;
}

export interface PollOption {
  id: string;
  pollId: string;
  label: string;
  metadata: Record<string, unknown>;
}

export interface PollVote {
  pollId: string;
  optionId: string;
  userId: string;
  createdAt: string;
}

export interface OrganizerProfile {
  userId: string;
  organizationName: string;
  verificationStatus: "pending" | "verified" | "rejected";
  websiteUrl?: string;
  createdAt: string;
}

export interface Venue {
  id: string;
  organizerId?: string;
  name: string;
  address: string;
  city: string;
  coordinates: Coordinates;
  priceEstimateCents?: number;
  amenities: string[];
  createdAt: string;
}

export interface ModerationReport {
  id: string;
  reporterId?: string;
  subjectUserId?: string;
  eventId?: string;
  postId?: string;
  reason: string;
  status: "open" | "resolved" | "dismissed";
  resolution?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}
