"use client";

import { useState, useTransition } from "react";
import type { Conversation, Message } from "@showup2move/shared";
import { formatEventTime } from "@/lib/format";

type Thread = Conversation & { messages: Message[] };

export function MessageCenter({ initialThreads }: Readonly<{ initialThreads: Thread[] }>) {
  const [threads, setThreads] = useState(initialThreads);
  const [selectedId, setSelectedId] = useState(initialThreads[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const selectedThread = threads.find((thread) => thread.id === selectedId) ?? threads[0];

  function send(formData: FormData) {
    if (!selectedThread) {
      return;
    }

    const body = String(formData.get("body") ?? "");
    if (!body.trim()) {
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedThread.id, body })
      });

      if (response.ok) {
        const payload = (await response.json()) as { message: Message };
        setThreads((current) =>
          current.map((thread) =>
            thread.id === selectedThread.id
              ? { ...thread, messages: [...thread.messages, payload.message] }
              : thread
          )
        );
      }
    });
  }

  return (
    <div className="grid min-h-[34rem] overflow-hidden rounded-lg border border-black/10 bg-white shadow-nav lg:grid-cols-[20rem_1fr]">
      <aside className="border-b border-black/10 bg-field p-3 lg:border-b-0 lg:border-r">
        <div className="grid gap-2">
          {threads.map((thread) => (
            <button
              className={`rounded-lg px-4 py-3 text-left transition ${
                selectedThread?.id === thread.id ? "bg-cyan text-ink" : "bg-white hover:bg-white/80"
              }`}
              key={thread.id}
              onClick={() => setSelectedId(thread.id)}
              type="button"
            >
              <span className="block truncate text-sm font-black">{thread.title}</span>
              <span className="mt-1 block text-xs font-bold text-slate-600">
                {thread.kind} · {thread.unreadCount} unread
              </span>
            </button>
          ))}
        </div>
      </aside>
      <section className="flex min-h-[34rem] flex-col">
        <header className="border-b border-black/10 px-5 py-4">
          <h2 className="text-xl font-black">{selectedThread?.title ?? "Messages"}</h2>
        </header>
        <div className="flex-1 space-y-3 overflow-y-auto bg-white p-5">
          {selectedThread?.messages.map((message) => (
            <article className="max-w-xl rounded-lg bg-field p-4" key={message.id}>
              <p className="text-sm leading-6 text-slate-800">{message.body}</p>
              <p className="mt-2 text-xs font-black text-slate-500">
                {message.kind.replace("_", " ")} · {formatEventTime(message.createdAt)}
              </p>
            </article>
          ))}
        </div>
        {selectedThread ? (
          <form action={send} className="flex gap-3 border-t border-black/10 p-4">
            <input
              className="min-w-0 flex-1 rounded-full border border-black/10 bg-field px-5 py-3 text-sm font-semibold"
              name="body"
              placeholder="Message"
            />
            <button
              className="rounded-full bg-ink px-5 py-3 text-sm font-black text-white disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              Send
            </button>
          </form>
        ) : null}
      </section>
    </div>
  );
}
