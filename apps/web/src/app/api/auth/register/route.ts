import { registerSchema } from "@showup2move/shared";
import { handleRouteError, jsonOk, readJson } from "@/server/http";
import { registerUser } from "@/server/auth/service";
import { sessionCookieName, sessionCookieOptions } from "@/server/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = await readJson(request, registerSchema);
    const result = registerUser(input);
    const response = jsonOk({ user: result.user }, { status: 201 });
    response.cookies.set(sessionCookieName, result.session.token, sessionCookieOptions);

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
