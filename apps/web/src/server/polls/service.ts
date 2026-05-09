import type { Poll, PollCreateInput, PollOption, PollVote } from "@showup2move/shared";
import { getStore, newId } from "../data/store";

export function createPoll(
  userId: string,
  eventId: string,
  input: Omit<PollCreateInput, "options"> & {
    options: Array<{ label: string; metadata?: Record<string, unknown> }>;
  }
): { poll: Poll; options: PollOption[] } {
  const store = getStore();
  const event = store.events.find((e) => e.id === eventId);

  if (!event) {
    throw new Error("Event not found.");
  }

  const poll: Poll = {
    id: newId("poll"),
    eventId,
    title: input.title,
    kind: input.kind,
    closesAt: input.closesAt,
    createdBy: userId,
    createdAt: new Date().toISOString()
  };

  store.polls.push(poll);

  const options: PollOption[] = input.options.map((opt) => ({
    id: newId("option"),
    pollId: poll.id,
    label: opt.label,
    metadata: opt.metadata ?? {}
  }));

  store.pollOptions.push(...options);

  return { poll, options };
}

export function votePoll(userId: string, pollId: string, optionId: string): PollVote {
  const store = getStore();
  const poll = store.polls.find((p) => p.id === pollId);

  if (!poll) {
    throw new Error("Poll not found.");
  }

  const option = store.pollOptions.find((o) => o.id === optionId && o.pollId === pollId);

  if (!option) {
    throw new Error("Poll option not found.");
  }

  const existing = store.pollVotes.find((v) => v.pollId === pollId && v.userId === userId);

  if (existing) {
    existing.optionId = optionId;

    return existing;
  }

  const vote: PollVote = {
    pollId,
    optionId,
    userId,
    createdAt: new Date().toISOString()
  };

  store.pollVotes.push(vote);

  return vote;
}

export function getPollResults(pollId: string) {
  const store = getStore();
  const poll = store.polls.find((p) => p.id === pollId);

  if (!poll) {
    throw new Error("Poll not found.");
  }

  const options = store.pollOptions.filter((o) => o.pollId === pollId);
  const votes = store.pollVotes.filter((v) => v.pollId === pollId);

  return {
    poll,
    options: options.map((opt) => ({
      ...opt,
      voteCount: votes.filter((v) => v.optionId === opt.id).length
    })),
    totalVotes: votes.length
  };
}

export function listEventPolls(eventId: string): Poll[] {
  return getStore()
    .polls.filter((p) => p.eventId === eventId)
    .toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
