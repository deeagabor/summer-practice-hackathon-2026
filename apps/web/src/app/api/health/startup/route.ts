import { jsonOk } from "@/server/http";

export function GET() {
  return jsonOk({ status: "started", checkedAt: new Date().toISOString() });
}
