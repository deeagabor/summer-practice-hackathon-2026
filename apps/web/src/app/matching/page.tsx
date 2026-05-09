import { PageShell } from "@/components/ui/PageShell";
import { MatchingPanel } from "@/features/matching/MatchingPanel";
import { getRecommendations } from "@/server/matching/service";

export const dynamic = "force-dynamic";

export default function MatchingPage() {
  return (
    <PageShell title="Matching">
      <MatchingPanel initialRecommendations={getRecommendations()} />
    </PageShell>
  );
}
