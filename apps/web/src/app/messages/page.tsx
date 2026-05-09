import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { MessageCenter } from "@/features/messages/MessageCenter";
import { getCurrentUser } from "@/server/auth/session";
import { listMessageThreads } from "@/server/messages/service";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <PageShell title="Messages">
        <div className="max-w-md rounded-lg border border-black/10 bg-white p-5 shadow-nav">
          <p className="text-sm font-semibold text-slate-700">
            Log in to open group and event chats.
          </p>
          <Link
            className="mt-5 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-black text-white"
            href="/login"
          >
            Log in
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Messages">
      <MessageCenter initialThreads={listMessageThreads(user)} />
    </PageShell>
  );
}
