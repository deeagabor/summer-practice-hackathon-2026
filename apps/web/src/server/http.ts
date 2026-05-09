import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { AuthError } from "./auth/session";

export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse<T> {
  return NextResponse.json(data, init);
}

export function jsonError(status: number, message: string, details?: unknown): NextResponse {
  return NextResponse.json({ error: message, details }, { status });
}

export async function readJson<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  const payload = await request.json();

  return schema.parse(payload);
}

export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return jsonError(error.status, error.message);
  }

  if (error instanceof ZodError) {
    return jsonError(400, "Invalid request payload.", error.flatten());
  }

  const message = error instanceof Error ? error.message : "Unexpected server error.";

  return jsonError(400, message);
}
