import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let bucket = rateLimitBuckets.get(ip);

  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitBuckets.set(ip, bucket);
  }

  bucket.count++;

  return bucket.count <= RATE_LIMIT_MAX;
}

export function middleware(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return new NextResponse(JSON.stringify({ error: "Too many requests." }), {
      status: 429,
      headers: { "Content-Type": "application/json", "X-Request-Id": requestId }
    });
  }

  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/api/auth/login") ||
    request.nextUrl.pathname.startsWith("/api/auth/register");

  if (isMutating && isApiRoute && !isAuthRoute) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    if (origin && host && !origin.includes(host)) {
      return new NextResponse(JSON.stringify({ error: "CSRF validation failed." }), {
        status: 403,
        headers: { "Content-Type": "application/json", "X-Request-Id": requestId }
      });
    }
  }

  const response = NextResponse.next();

  response.headers.set("X-Request-Id", requestId);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/api/:path*"]
};
