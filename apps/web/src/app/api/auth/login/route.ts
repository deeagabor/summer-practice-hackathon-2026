import { loginSchema } from "@showup2move/shared";
import { loginUser } from "@/server/auth/service";
import { sessionCookieName, sessionCookieOptions } from "@/server/auth/session";
import { handleRouteError, jsonOk, readJson } from "@/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = await readJson(request, loginSchema);
    const result = loginUser(input);
    const response = jsonOk({ user: result.user });
    response.cookies.set(sessionCookieName, result.session.token, sessionCookieOptions);

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
