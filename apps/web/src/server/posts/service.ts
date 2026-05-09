import type { Post, PostCreateInput } from "@showup2move/shared";
import { getStore, newId } from "../data/store";

export function createPost(userId: string, input: Omit<PostCreateInput, "visibility" | "mediaUrls"> & { visibility?: PostCreateInput["visibility"]; mediaUrls?: PostCreateInput["mediaUrls"] }): Post {
  const store = getStore();
  const event = store.events.find((e) => e.id === input.eventId);

  if (!event) {
    throw new Error("Event not found.");
  }

  const attended = store.participants.find(
    (p) => p.eventId === input.eventId && p.userId === userId && p.status === "attended"
  );

  const confirmed = store.participants.find(
    (p) =>
      p.eventId === input.eventId &&
      p.userId === userId &&
      (p.status === "confirmed" || p.status === "joined")
  );

  if (!attended && !confirmed) {
    throw new Error("You must attend or be confirmed for this event to post.");
  }

  const post: Post = {
    id: newId("post"),
    userId,
    eventId: input.eventId,
    caption: input.caption,
    visibility: input.visibility ?? "public",
    sportId: event.sportId,
    eventDate: event.startsAt.split("T")[0] ?? event.startsAt,
    createdAt: new Date().toISOString()
  };

  store.posts.push(post);

  for (const url of input.mediaUrls ?? []) {
    store.postMedia.push({
      id: newId("media"),
      postId: post.id,
      url,
      contentType: "image/jpeg",
      byteSize: 0,
      createdAt: post.createdAt
    });
  }

  return post;
}

export function listPostsByEvent(eventId: string): Post[] {
  return getStore()
    .posts.filter((p) => p.eventId === eventId)
    .toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function listPostsByUser(userId: string): Post[] {
  return getStore()
    .posts.filter((p) => p.userId === userId)
    .toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getPost(postId: string): Post | undefined {
  return getStore().posts.find((p) => p.id === postId);
}
