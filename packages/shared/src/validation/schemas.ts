import { z } from "zod";
import {
  eventVisibilityModes,
  locationPrivacyModes,
  playIntensities,
  skillLevels
} from "../types/domain";

const nonEmptyText = z.string().trim().min(1).max(280);

export const registerSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(2).max(80)
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128)
});

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

export const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(500),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  homeArea: z.string().trim().min(2).max(120),
  preferredRadiusKm: z.number().min(1).max(80),
  locationPrivacy: z.enum(locationPrivacyModes),
  allowsAiProfile: z.boolean(),
  coordinates: coordinatesSchema
});

export const sportPreferenceSchema = z.object({
  sportId: z.string().trim().min(2).max(40),
  skillLevel: z.enum(skillLevels),
  intensity: z.enum(playIntensities),
  preferredRoles: z.array(z.string().trim().min(1).max(40)).max(6)
});

export const availabilitySchema = z.object({
  showUpToday: z.boolean(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  note: z.string().trim().max(160).optional()
});

export const eventCreateSchema = z.object({
  title: z.string().trim().min(4).max(120),
  sportId: z.string().trim().min(2).max(40),
  imageUrl: z.string().url().optional().or(z.literal("")),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  visibility: z.enum(eventVisibilityModes),
  location: z.object({
    name: z.string().trim().min(2).max(120),
    address: z.string().trim().min(2).max(180),
    city: z.string().trim().min(2).max(80),
    coordinates: coordinatesSchema,
    priceEstimateCents: z.number().int().min(0).optional()
  }),
  skillRange: z.tuple([z.enum(skillLevels), z.enum(skillLevels)]),
  capacity: z.number().int().min(2).max(60),
  description: z.string().trim().min(10).max(1000)
});

export const joinEventSchema = z.object({
  status: z.enum(["joined", "confirmed", "waitlisted"]).default("joined")
});

export const messageCreateSchema = z.object({
  conversationId: z.string().trim().min(2).max(80),
  body: nonEmptyText,
  eventId: z.string().trim().min(2).max(80).optional()
});

export const uploadRequestSchema = z.object({
  fileName: z.string().trim().min(3).max(180),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  byteSize: z.number().int().min(1).max(6_000_000)
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type SportPreferenceInput = z.infer<typeof sportPreferenceSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type MessageCreateInput = z.infer<typeof messageCreateSchema>;
export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;

export const postCreateSchema = z.object({
  eventId: z.string().trim().min(2).max(80),
  caption: z.string().trim().max(500),
  visibility: z.enum(eventVisibilityModes).default("public"),
  mediaUrls: z.array(z.string().url()).max(10).default([])
});

export const pollCreateSchema = z.object({
  title: z.string().trim().min(4).max(120),
  kind: z.enum(["time", "location", "team", "other"]),
  closesAt: z.string().datetime().optional(),
  options: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(120),
        metadata: z.record(z.unknown()).default({})
      })
    )
    .min(2)
    .max(10)
});

export const pollVoteSchema = z.object({
  optionId: z.string().trim().min(2).max(80)
});

export const invitationCreateSchema = z.object({
  targetUserId: z.string().trim().min(2).max(80),
  eventId: z.string().trim().min(2).max(80),
  message: z.string().trim().max(280).default("You're invited!")
});

export const organizerProfileSchema = z.object({
  organizationName: z.string().trim().min(2).max(120),
  websiteUrl: z.string().url().optional().or(z.literal(""))
});

export const moderationReportSchema = z.object({
  subjectUserId: z.string().trim().min(2).max(80).optional(),
  eventId: z.string().trim().min(2).max(80).optional(),
  postId: z.string().trim().min(2).max(80).optional(),
  reason: z.string().trim().min(10).max(500)
});

export const adminUserUpdateSchema = z.object({
  status: z.enum(["active", "suspended"]).optional(),
  addRole: z.enum(["user", "organizer", "admin"]).optional(),
  removeRole: z.enum(["user", "organizer", "admin"]).optional()
});

export const eventUpdateSchema = z.object({
  status: z
    .enum([
      "draft",
      "suggested",
      "open",
      "pending_confirmation",
      "confirmed",
      "active",
      "completed",
      "cancelled"
    ])
    .optional(),
  title: z.string().trim().min(4).max(120).optional(),
  description: z.string().trim().min(10).max(1000).optional(),
  capacity: z.number().int().min(2).max(60).optional()
});

export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PollCreateInput = z.infer<typeof pollCreateSchema>;
export type PollVoteInput = z.infer<typeof pollVoteSchema>;
export type InvitationCreateInput = z.infer<typeof invitationCreateSchema>;
export type OrganizerProfileInput = z.infer<typeof organizerProfileSchema>;
export type ModerationReportInput = z.infer<typeof moderationReportSchema>;
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;
