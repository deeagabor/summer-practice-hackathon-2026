import { getStore } from "@/server/data/store";
import { checkPostgres } from "@/server/data/postgres";
import { jsonOk } from "@/server/http";

export async function GET() {
  const store = getStore();
  const databaseStatus = await checkPostgres();

  return jsonOk({
    status: "ready",
    dependencies: {
      database: databaseStatus === "not-configured" ? "using-seed-store" : databaseStatus,
      redis: process.env.REDIS_URL ? "configured" : "not-configured"
    },
    seedCounts: {
      users: store.users.length,
      events: store.events.length,
      conversations: store.conversations.length
    },
    checkedAt: new Date().toISOString()
  });
}
