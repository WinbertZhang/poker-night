export const dynamic = "force-dynamic";
import NewSessionForm from "@/components/NewSessionForm";
import { getSessionsAsync, getPlayerSummariesAsync } from "@/lib/data";

export default async function NewSessionPage() {
  const [sessions, summaries] = await Promise.all([
    getSessionsAsync(),
    getPlayerSummariesAsync(),
  ]);

  const lastSessionPlayers = sessions[0]?.players.map((p) => p.player) ?? [];
  const allPlayers = summaries.map((s) => s.player);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gradient mb-1">
          New Session
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Enter player results. Net is calculated automatically.
        </p>
      </div>
      <NewSessionForm
        lastSessionPlayers={lastSessionPlayers}
        allPlayers={allPlayers}
      />
    </main>
  );
}
