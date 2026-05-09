import { jsonOk } from "@/server/http";
import { listSports } from "@/server/sports/service";

export function GET() {
  return jsonOk({ sports: listSports() });
}
