import { getCurrentUser } from "@/server/auth/session";
import { stripPassword } from "@/server/auth/service";
import { jsonOk } from "@/server/http";

export async function GET() {
  const user = await getCurrentUser();

  return jsonOk({ user: user ? stripPassword(user) : null });
}
