import type { Session } from "@/lib/types";

export default function RecentSessionsList({ sessions }: { sessions: Session[] }) {
  return (
    <div className="space-y-2.5">
      {sessions.map((sess) => {
        const formatted = new Date(sess.date + "T12:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const winner = sess.players
          .filter((p) => p.net > 0)
          .sort((a, b) => b.net - a.net)[0];
        const loser = sess.players
          .filter((p) => p.net < 0)
          .sort((a, b) => a.net - b.net)[0];

        return (
          <div
            key={sess.date}
            className="card card-interactive px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {formatted}
              </p>
              <p className="text-xs mt-0.5 font-mono" style={{ color: "var(--muted)" }}>
                {sess.players.length} players
              </p>
            </div>

            <div className="flex items-center gap-5 shrink-0">
              {winner && (
                <div className="text-right">
                  <p className="tag mb-0.5">Winner</p>
                  <p className="text-xs font-mono font-semibold val-win">
                    {winner.player.split(" ")[0]} +${winner.net.toFixed(0)}
                  </p>
                </div>
              )}
              {loser && (
                <div className="text-right">
                  <p className="tag mb-0.5">Biggest L</p>
                  <p className="text-xs font-mono font-semibold val-loss">
                    {loser.player.split(" ")[0]} ${loser.net.toFixed(0)}
                  </p>
                </div>
              )}
              {/* Desktop: extra player chips */}
              <div className="hidden md:flex items-center gap-4">
                {sess.players.slice(0, 4).map((p) => (
                  <span
                    key={p.player}
                    className="text-xs font-mono"
                    style={{
                      color:
                        p.net > 0
                          ? "var(--accent-green)"
                          : p.net < 0
                          ? "var(--accent-red)"
                          : "var(--muted)",
                    }}
                  >
                    {p.player.split(" ")[0]}{" "}
                    {(p.net >= 0 ? "+" : "") + p.net.toFixed(0)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
