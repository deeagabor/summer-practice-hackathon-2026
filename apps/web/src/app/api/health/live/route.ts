import { jsonOk } from "@/server/http";

export function GET() {
  return jsonOk({ status: "live", checkedAt: new Date().toISOString() });
}
