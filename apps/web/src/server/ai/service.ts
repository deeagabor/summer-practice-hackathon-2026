import { getStore } from "../data/store";

export interface AIProfile {
  userId: string;
  extractedSports: string[];
  extractedInterests: string[];
  moderationFlags: string[];
  compatibilityNotes: string[];
  profileSummary: string;
  provider: "gemini" | "local";
  updatedAt: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

interface ParsedAIProfile {
  extractedSports?: unknown;
  extractedInterests?: unknown;
  moderationFlags?: unknown;
  compatibilityNotes?: unknown;
  profileSummary?: unknown;
}

const sportKeywords = ["football", "basketball", "tennis", "running", "volleyball", "swimming"];

export function enqueueProfileEnrichment(userId: string): { queued: boolean } {
  const aiProfile = buildHeuristicProfile(userId);

  if (!aiProfile) {
    return { queued: false };
  }

  saveAIProfile(aiProfile);

  return { queued: true };
}

export async function enrichProfileWithAI(userId: string): Promise<{ queued: boolean; profile?: AIProfile }> {
  const fallback = buildHeuristicProfile(userId);

  if (!fallback) {
    return { queued: false };
  }

  const apiKey = process.env.GOOGLE_AI_API_KEY ?? process.env.GEMINI_API_KEY ?? process.env.AI_PROVIDER_API_KEY;

  if (!apiKey) {
    saveAIProfile(fallback);
    return { queued: true, profile: fallback };
  }

  try {
    const aiProfile = await generateGeminiProfile(userId, apiKey, fallback);
    saveAIProfile(aiProfile);
    return { queued: true, profile: aiProfile };
  } catch {
    saveAIProfile(fallback);
    return { queued: true, profile: fallback };
  }
}

export function getAIProfile(userId: string): AIProfile | undefined {
  const globalAI = globalThis as Record<string, unknown>;
  const profiles = (globalAI.aiProfiles as AIProfile[] | undefined) ?? [];

  return profiles.find((p) => p.userId === userId);
}

export function generateCompatibilityReport(userId: string) {
  const store = getStore();
  const scores = store.compatibilityScores.filter((s) => s.userId === userId);
  const recommendations = store.recommendations.filter((r) => r.userId !== userId);
  const aiProfile = getAIProfile(userId);

  return {
    userId,
    totalScores: scores.length,
    averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length) : 0,
    topRecommendations: recommendations.slice(0, 5),
    aiNotes: aiProfile?.compatibilityNotes ?? [],
    generatedAt: new Date().toISOString(),
  };
}

function buildHeuristicProfile(userId: string): AIProfile | undefined {
  const store = getStore();
  const profile = store.profiles.find((p) => p.userId === userId);

  if (!profile || !profile.allowsAiProfile) {
    return undefined;
  }

  const preferences = store.sportPreferences.filter((p) => p.userId === userId);
  const extractedSports = preferences.map((p) => p.sportId);
  const bioWords = profile.bio.toLowerCase().split(/\W+/).filter((word) => word.length > 3);
  const extractedInterests = bioWords.filter(
    (word) => sportKeywords.includes(word) || word.includes("sport") || word.includes("fitness"),
  );

  return {
    userId,
    extractedSports,
    extractedInterests: [...new Set(extractedInterests)],
    moderationFlags: [],
    compatibilityNotes: ["Local profile signals are ready. Add GOOGLE_AI_API_KEY for Gemini-generated notes."],
    profileSummary: `${profile.displayName} prefers ${extractedSports.join(", ") || "social sports"} near ${profile.homeArea}.`,
    provider: "local",
    updatedAt: new Date().toISOString(),
  };
}

async function generateGeminiProfile(userId: string, apiKey: string, fallback: AIProfile): Promise<AIProfile> {
  const store = getStore();
  const profile = store.profiles.find((p) => p.userId === userId);
  const preferences = store.sportPreferences.filter((p) => p.userId === userId);
  const model = process.env.GOOGLE_AI_MODEL ?? "gemini-2.0-flash";

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: [
                "Analyze this sports profile for a teammate matching app.",
                "Return only compact JSON with extractedSports, extractedInterests, moderationFlags, compatibilityNotes, and profileSummary.",
                "Do not include markdown fences.",
                JSON.stringify({ profile, preferences }),
              ].join("\n"),
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Gemini profile enrichment failed.");
  }

  const payload = (await response.json()) as GeminiResponse;
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  const parsed = JSON.parse(stripMarkdownFence(text)) as ParsedAIProfile;

  return {
    userId,
    extractedSports: normalizeList(parsed.extractedSports, fallback.extractedSports),
    extractedInterests: normalizeList(parsed.extractedInterests, fallback.extractedInterests),
    moderationFlags: normalizeList(parsed.moderationFlags, []),
    compatibilityNotes: normalizeList(parsed.compatibilityNotes, fallback.compatibilityNotes),
    profileSummary: typeof parsed.profileSummary === "string" ? parsed.profileSummary : fallback.profileSummary,
    provider: "gemini",
    updatedAt: new Date().toISOString(),
  };
}

function normalizeList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 8);
}

function stripMarkdownFence(value: string): string {
  return value.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}

function saveAIProfile(profile: AIProfile): void {
  const globalAI = globalThis as Record<string, unknown>;
  const profiles = (globalAI.aiProfiles as AIProfile[] | undefined) ?? [];
  globalAI.aiProfiles = [...profiles.filter((p) => p.userId !== profile.userId), profile];
}
