export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { getPlayerTrendsAsync } from "@/lib/data";
import TrendChart from "@/components/TrendChart";

export default async function TrendsPage() {
  const { trends, players, sessionCounts } = await getPlayerTrendsAsync();
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Running Net by Player
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Cumulative net across all sessions. Select players to compare.
        </p>
      </div>
      <TrendChart trends={trends} allPlayers={players} sessionCounts={sessionCounts} />
    </div>
  );
}
