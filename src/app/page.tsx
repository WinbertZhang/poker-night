export const dynamic = "force-dynamic";
import { getSessionsAsync, getHomepageStatsAsync } from "@/lib/data";
import SessionCard from "@/components/SessionCard";
import HomeStats from "@/components/HomeStats";

export default async function Home() {
  const sessions = await getSessionsAsync();
  const stats = await getHomepageStatsAsync();
  const latest = sessions[0];
  const recent = sessions.slice(1, 6);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-10">
      <HomeStats stats={stats} recentSessions={recent} />
      {latest && (
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--muted)" }}>
            Most Recent Session
          </p>
          <SessionCard session={latest} featured />
        </div>
      )}
    </div>
  );
}
