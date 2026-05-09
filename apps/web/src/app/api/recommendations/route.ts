import { getRecommendations } from "@/server/matching/service";
import { jsonOk } from "@/server/http";

export function GET() {
  return jsonOk({ recommendations: getRecommendations() });
}
