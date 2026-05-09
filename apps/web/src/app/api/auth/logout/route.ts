import { NextResponse } from "next/server";
import { deleteSession, sessionCookieName } from "@/server/auth/session";

export async function POST(request: Request) {
  const token = request.headers.get("cookie")?.match(/showup2move_session=([^;]+)/)?.[1];
  deleteSession(token);
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(sessionCookieName);

  return response;
}
