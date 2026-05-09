"use client";

import { useState, useTransition } from "react";
import { Bot, Sparkles, Trophy, UsersRound } from "lucide-react";
import type { CompatibilityScore, TeammateRecommendation } from "@showup2move/shared";

interface AIProfilePayload {
  extractedSports: string[];
  extractedInterests: string[];
  moderationFlags: string[];
  compatibilityNotes: string[];
  profileSummary: string;
  provider: "gemini" | "local";
  updatedAt: string;
}

export function MatchingPanel({
  initialRecommendations,
}: Readonly<{
  initialRecommendations: TeammateRecommendation[];
}>) {
  const [scores, setScores] = useState<CompatibilityScore[]>([]);
  const [captainId, setCaptainId] = useState<string | undefined>();
  const [message, setMessage] = useState("");
  const [aiProfile, setAiProfile] = useState<AIProfilePayload | undefined>();
  const [isPending, startTransition] = useTransition();
  const [isAiPending, startAiTransition] = useTransition();

  function runMatching() {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/matching/run", { method: "POST" });

      if (response.ok) {
        const payload = (await response.json()) as {
          scores: CompatibilityScore[];
          captainId?: string;
        };
        setScores(payload.scores);
        setCaptainId(payload.captainId);
        setMessage("Matches refreshed with current availability.");
      } else {
        setMessage("Log in to run matching.");
      }
    });
  }

  function enrichProfile() {
    setMessage("");
    startAiTransition(async () => {
      const response = await fetch("/api/ai/profile", { method: "POST" });

      if (response.ok) {
        const payload = (await response.json()) as { profile?: AIProfilePayload; queued: boolean };
        setAiProfile(payload.profile);
        setMessage(payload.profile ? `AI profile updated with ${payload.profile.provider}.` : "Enable AI in profile settings first.");
      } else {
        setMessage("Log in to use AI profile enrichment.");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
      <section className="rounded-lg border border-black/10 bg-white p-5 shadow-nav">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black">ShowUpToday matching</h2>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              Sport, distance, skill, availability, social signal, reliability, and AI opt-in.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-black text-white disabled:opacity-60"
            disabled={isPending}
            onClick={runMatching}
            type="button"
          >
            <Sparkles className="h-4 w-4" />
            {isPending ? "Running..." : "Run"}
          </button>
        </div>
        {message ? <p className="mt-4 rounded-lg bg-field p-3 text-sm font-black text-slate-700">{message}</p> : null}
        <div className="mt-5 grid gap-3">
          {(scores.length ? scores : seedScores).map((score) => (
            <article className="rounded-lg border border-black/10 bg-field p-4" key={score.targetId}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="truncate text-sm font-black">{score.targetId.replaceAll("_", " ")}</h3>
                <span className="rounded-full bg-cyan px-3 py-1 text-sm font-black">{score.score}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {score.reasonCodes.map((reason) => (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700" key={reason}>
                    {reason.replaceAll("_", " ")}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="grid content-start gap-4">
        <section className="rounded-lg border border-black/10 bg-white p-5 shadow-nav">
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-court" />
            <h2 className="text-xl font-black">AI profile</h2>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-600">
            {aiProfile?.profileSummary ?? "Generate a sports profile from your bio, preferences, and availability."}
          </p>
          {aiProfile ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {[...aiProfile.extractedSports, ...aiProfile.extractedInterests].slice(0, 6).map((item) => (
                <span className="rounded-full bg-field px-3 py-1 text-xs font-black" key={item}>
                  {item}
                </span>
              ))}
            </div>
          ) : null}
          {aiProfile?.compatibilityNotes.length ? (
            <ul className="mt-3 grid gap-2 text-xs font-bold text-slate-600">
              {aiProfile.compatibilityNotes.slice(0, 3).map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}
          <button
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan px-4 py-2 text-sm font-black text-ink disabled:opacity-60"
            disabled={isAiPending}
            onClick={enrichProfile}
            type="button"
          >
            <Sparkles className="h-4 w-4" />
            {isAiPending ? "Updating..." : "Update AI"}
          </button>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-5 shadow-nav">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-coral" />
            <h2 className="text-xl font-black">Captain</h2>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-600">
            {captainId ? captainId.replaceAll("_", " ") : "Run matching to assign by reliability."}
          </p>
        </section>
        <section className="rounded-lg border border-black/10 bg-white p-5 shadow-nav">
          <div className="flex items-center gap-3">
            <UsersRound className="h-6 w-6 text-court" />
            <h2 className="text-xl font-black">Teammates</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {initialRecommendations.map((recommendation) => (
              <article className="rounded-lg bg-field p-3" key={recommendation.userId}>
                <div className="flex items-center justify-between">
                  <h3 className="font-black">{recommendation.displayName}</h3>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black">{recommendation.score}</span>
                </div>
                <p className="mt-2 text-xs font-bold text-slate-600">
                  {recommendation.distanceKm.toFixed(1)} km - {recommendation.reasonCodes.join(", ")}
                </p>
              </article>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

const seedScores: CompatibilityScore[] = [
  {
    userId: "demo",
    targetId: "event_football_kiseleff",
    score: 92,
    reasonCodes: ["same_sport", "available_now", "close_distance", "similar_skill"],
  },
  {
    userId: "demo",
    targetId: "event_basketball_victoriei",
    score: 78,
    reasonCodes: ["close_distance", "friend_attending"],
  },
];
