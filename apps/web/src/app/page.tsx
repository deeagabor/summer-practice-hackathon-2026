import { MapExperience } from "@/components/map/MapExperience";
import { AppNav } from "@/components/navigation/AppNav";
import { listEvents } from "@/server/events/service";
import { listSports } from "@/server/sports/service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <main className="min-h-dvh bg-field px-4 pb-36 pt-5 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <MapExperience
          events={listEvents()}
          sports={listSports()}
          mapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_MAP_PROVIDER_KEY}
        />
      </div>
      <AppNav />
    </main>
  );
}
