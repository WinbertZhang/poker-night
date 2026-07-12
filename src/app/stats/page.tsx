export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { getPlayerSummariesAsync } from "@/lib/data";
import StatsTable from "@/components/StatsTable";

export default async function StatsPage() {
  const summaries = await getPlayerSummariesAsync();
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Player Stats
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          All-time standings across every tracked session.
        </p>
      </div>
      <StatsTable summaries={summaries} />
    </div>
  );
}
