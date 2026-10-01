export const dynamic = "force-dynamic";
import { getSessionsAsync } from "@/lib/data";
import { getSelectedGame } from "@/lib/selected-game";
import SessionsExplorer from "@/components/SessionsExplorer";

export default async function SessionsPage() {
  const game = await getSelectedGame();
  const sessions = await getSessionsAsync(game);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          All Sessions
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          {sessions.length} sessions tracked
        </p>
      </div>
      <SessionsExplorer key={game} sessions={sessions} />
    </div>
  );
}
