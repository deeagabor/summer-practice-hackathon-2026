import { Pool } from "pg";

let pool: Pool | undefined;

export async function checkPostgres(): Promise<"ready" | "not-configured" | "unreachable"> {
  if (!process.env.DATABASE_URL) {
    return "not-configured";
  }

  try {
    pool ??= new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      connectionTimeoutMillis: 1500,
      idleTimeoutMillis: 5000,
    });

    await pool.query("SELECT 1");
    return "ready";
  } catch {
    return "unreachable";
  }
}
