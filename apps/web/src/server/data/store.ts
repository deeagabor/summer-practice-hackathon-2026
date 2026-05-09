import { randomUUID, scryptSync } from "node:crypto";
import type {
  AvailabilityWindow,
  CompatibilityScore,
  Conversation,
  EventParticipant,
  Message,
  ModerationReport,
  Notification,
  OrganizerProfile,
  Poll,
  PollOption,
  PollVote,
  Post,
  PostMedia,
  Profile,
  SportsEvent,
  TeammateRecommendation,
  User,
  UserSportPreference,
  Venue
} from "@showup2move/shared";

export interface SessionRecord {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface AuditRecord {
  id: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AppStore {
  users: User[];
  profiles: Profile[];
  sportPreferences: UserSportPreference[];
  availability: AvailabilityWindow[];
  events: SportsEvent[];
  participants: EventParticipant[];
  conversations: Conversation[];
  messages: Message[];
  sessions: SessionRecord[];
  compatibilityScores: CompatibilityScore[];
  recommendations: TeammateRecommendation[];
  auditLogs: AuditRecord[];
  notifications: Notification[];
  posts: Post[];
  postMedia: PostMedia[];
  polls: Poll[];
  pollOptions: PollOption[];
  pollVotes: PollVote[];
  organizerProfiles: OrganizerProfile[];
  venues: Venue[];
  moderationReports: ModerationReport[];
}

const globalStore = globalThis as typeof globalThis & {
  showUp2MoveStore?: AppStore;
};

export function getStore(): AppStore {
  globalStore.showUp2MoveStore ??= createSeedStore();

  return globalStore.showUp2MoveStore;
}

function createSeedStore(): AppStore {
  const now = "2026-05-09T09:30:00.000Z";
  const users: User[] = [
    {
      id: "user_mara",
      email: "mara@example.com",
      passwordHash: seededHash("Showup2026!", "mara"),
      name: "Mara Ionescu",
      roles: ["user"],
      createdAt: now
    },
    {
      id: "user_andrei",
      email: "andrei@example.com",
      passwordHash: seededHash("Showup2026!", "andrei"),
      name: "Andrei Pop",
      roles: ["user"],
      createdAt: now
    },
    {
      id: "organizer_kiseleff",
      email: "organizer@example.com",
      passwordHash: seededHash("Showup2026!", "organizer"),
      name: "Kiseleff Sports Hub",
      roles: ["organizer"],
      createdAt: now
    },
    {
      id: "admin_irina",
      email: "admin@example.com",
      passwordHash: seededHash("Showup2026!", "admin"),
      name: "Irina Admin",
      roles: ["admin"],
      createdAt: now
    }
  ];

  const profiles: Profile[] = [
    {
      userId: "user_mara",
      displayName: "Mara",
      bio: "Football midfielder, casual runner, happiest when plans happen fast.",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
      homeArea: "Piata Victoriei",
      preferredRadiusKm: 8,
      locationPrivacy: "approximate",
      allowsAiProfile: true,
      coordinates: { lat: 44.452, lng: 26.085 }
    },
    {
      userId: "user_andrei",
      displayName: "Andrei",
      bio: "Basketball and tennis after work. Likes balanced games and clear plans.",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
      homeArea: "Aviatorilor",
      preferredRadiusKm: 6,
      locationPrivacy: "approximate",
      allowsAiProfile: true,
      coordinates: { lat: 44.467, lng: 26.088 }
    },
    {
      userId: "organizer_kiseleff",
      displayName: "Kiseleff Sports Hub",
      bio: "Verified organizer running friendly weekly sessions in north-central Bucharest.",
      avatarUrl:
        "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=256&q=80",
      homeArea: "Kiseleff",
      preferredRadiusKm: 12,
      locationPrivacy: "precise",
      allowsAiProfile: false,
      coordinates: { lat: 44.459, lng: 26.082 }
    },
    {
      userId: "admin_irina",
      displayName: "Irina",
      bio: "Platform operations and safety.",
      homeArea: "Bucharest",
      preferredRadiusKm: 20,
      locationPrivacy: "hidden",
      allowsAiProfile: false,
      coordinates: { lat: 44.437, lng: 26.097 }
    }
  ];

  const sportPreferences: UserSportPreference[] = [
    {
      userId: "user_mara",
      sportId: "football",
      skillLevel: "intermediate",
      intensity: "balanced",
      preferredRoles: ["midfielder", "wing"]
    },
    {
      userId: "user_mara",
      sportId: "running",
      skillLevel: "casual",
      intensity: "social",
      preferredRoles: ["5k"]
    },
    {
      userId: "user_andrei",
      sportId: "basketball",
      skillLevel: "intermediate",
      intensity: "balanced",
      preferredRoles: ["guard"]
    },
    {
      userId: "user_andrei",
      sportId: "tennis",
      skillLevel: "casual",
      intensity: "social",
      preferredRoles: ["doubles"]
    }
  ];

  const availability: AvailabilityWindow[] = [
    {
      userId: "user_mara",
      showUpToday: true,
      startsAt: "2026-05-09T15:30:00.000Z",
      endsAt: "2026-05-09T20:00:00.000Z",
      note: "After work near Victoriei."
    },
    {
      userId: "user_andrei",
      showUpToday: true,
      startsAt: "2026-05-09T16:00:00.000Z",
      endsAt: "2026-05-09T19:30:00.000Z",
      note: "Can bring a basketball."
    }
  ];

  const events: SportsEvent[] = [
    {
      id: "event_football_kiseleff",
      title: "Kiseleff five-a-side",
      sportId: "football",
      imageUrl:
        "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=640&q=80",
      startsAt: "2026-05-09T16:30:00.000Z",
      endsAt: "2026-05-09T18:00:00.000Z",
      status: "open",
      visibility: "public",
      location: {
        name: "Parcul Kiseleff Mini Pitch",
        address: "Soseaua Pavel D. Kiseleff 32",
        city: "Bucharest",
        coordinates: { lat: 44.4596, lng: 26.0823 },
        priceEstimateCents: 2500
      },
      distanceKm: 1.1,
      skillRange: ["casual", "advanced"],
      capacity: 12,
      participantCount: 9,
      organizerId: "organizer_kiseleff",
      captainId: "user_mara",
      description: "Fast, friendly football near the park. Bring a light shirt and water.",
      reasonCodes: ["same_sport", "close_distance", "available_now"]
    },
    {
      id: "event_basketball_victoriei",
      title: "Victoriei half-court",
      sportId: "basketball",
      imageUrl:
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=640&q=80",
      startsAt: "2026-05-09T17:00:00.000Z",
      endsAt: "2026-05-09T18:00:00.000Z",
      status: "suggested",
      visibility: "public",
      location: {
        name: "Victoriei Outdoor Court",
        address: "Bulevardul Aviatorilor 8",
        city: "Bucharest",
        coordinates: { lat: 44.4534, lng: 26.0901 },
        priceEstimateCents: 0
      },
      distanceKm: 0.8,
      skillRange: ["beginner", "intermediate"],
      capacity: 8,
      participantCount: 5,
      captainId: "user_andrei",
      description: "Suggested match waiting for two more players before confirmation.",
      reasonCodes: ["close_distance", "similar_skill"]
    },
    {
      id: "event_tennis_herastrau",
      title: "Doubles at Herastrau",
      sportId: "tennis",
      imageUrl:
        "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=640&q=80",
      startsAt: "2026-05-10T08:30:00.000Z",
      endsAt: "2026-05-10T10:00:00.000Z",
      status: "confirmed",
      visibility: "public",
      location: {
        name: "Herastrau Tennis Club",
        address: "Intrarea Pavilionului",
        city: "Bucharest",
        coordinates: { lat: 44.4718, lng: 26.0813 },
        priceEstimateCents: 6000
      },
      distanceKm: 2.4,
      skillRange: ["casual", "intermediate"],
      capacity: 4,
      participantCount: 3,
      organizerId: "organizer_kiseleff",
      description: "Morning doubles with one open slot and racket rental nearby.",
      reasonCodes: ["scheduled", "venue_available"]
    }
  ];

  const participants: EventParticipant[] = [
    {
      eventId: "event_football_kiseleff",
      userId: "user_mara",
      status: "confirmed",
      joinedAt: "2026-05-09T10:00:00.000Z"
    },
    {
      eventId: "event_basketball_victoriei",
      userId: "user_andrei",
      status: "joined",
      joinedAt: "2026-05-09T10:04:00.000Z"
    }
  ];

  const conversations: Conversation[] = [
    {
      id: "conversation_football",
      kind: "event",
      title: "Kiseleff five-a-side",
      eventId: "event_football_kiseleff",
      participantIds: ["user_mara", "user_andrei", "organizer_kiseleff"],
      unreadCount: 2,
      updatedAt: "2026-05-09T10:14:00.000Z"
    },
    {
      id: "conversation_match",
      kind: "group",
      title: "ShowUpToday match",
      participantIds: ["user_mara", "user_andrei"],
      unreadCount: 1,
      updatedAt: "2026-05-09T10:20:00.000Z"
    }
  ];

  const messages: Message[] = [
    {
      id: "message_1",
      conversationId: "conversation_football",
      senderId: "organizer_kiseleff",
      kind: "system_update",
      body: "Pitch confirmed. Meet at the north gate 10 minutes early.",
      eventId: "event_football_kiseleff",
      createdAt: "2026-05-09T10:08:00.000Z"
    },
    {
      id: "message_2",
      conversationId: "conversation_match",
      senderId: "user_andrei",
      kind: "event_invitation",
      body: "Want to join the Victoriei half-court group before it locks?",
      eventId: "event_basketball_victoriei",
      createdAt: "2026-05-09T10:20:00.000Z"
    }
  ];

  return {
    users,
    profiles,
    sportPreferences,
    availability,
    events,
    participants,
    conversations,
    messages,
    sessions: [],
    compatibilityScores: [],
    recommendations: [
      {
        userId: "user_andrei",
        displayName: "Andrei",
        avatarUrl: profiles[1]?.avatarUrl,
        sportId: "basketball",
        score: 88,
        reasonCodes: ["available_now", "close_distance", "similar_skill"],
        distanceKm: 1.6
      }
    ],
    auditLogs: [
      {
        id: "audit_seed",
        actorId: "admin_irina",
        action: "seeded_demo_data",
        entityType: "system",
        entityId: "showup2move",
        createdAt: now
      }
    ],
    notifications: [
      {
        id: "notif_seed_1",
        userId: "user_mara",
        title: "Match found!",
        body: "You've been matched for Kiseleff five-a-side. Check your events.",
        createdAt: now
      }
    ],
    posts: [],
    postMedia: [],
    polls: [],
    pollOptions: [],
    pollVotes: [],
    organizerProfiles: [
      {
        userId: "organizer_kiseleff",
        organizationName: "Kiseleff Sports Hub",
        verificationStatus: "verified",
        websiteUrl: "https://kiseleffsports.example.com",
        createdAt: now
      }
    ],
    venues: [
      {
        id: "venue_kiseleff",
        organizerId: "organizer_kiseleff",
        name: "Parcul Kiseleff Mini Pitch",
        address: "Soseaua Pavel D. Kiseleff 32",
        city: "Bucharest",
        coordinates: { lat: 44.4596, lng: 26.0823 },
        priceEstimateCents: 2500,
        amenities: ["lighting", "water", "parking"],
        createdAt: now
      }
    ],
    moderationReports: []
  };
}

function seededHash(password: string, salt: string): string {
  const key = scryptSync(password, salt, 64).toString("hex");

  return `scrypt$${salt}$${key}`;
}

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}
