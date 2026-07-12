import type { Session } from "@/lib/types";

function fmt(n: number) {
  return (n >= 0 ? "+" : "") + n.toFixed(2);
}

function netClass(n: number) {
  if (n > 0) return "val-win";
  if (n < 0) return "val-loss";
  return "val-neutral";
}

interface Props {
  session: Session;
  featured?: boolean;
}

export default function SessionCard({ session, featured = false }: Props) {
  const date = new Date(session.date + "T12:00:00");
  const formatted = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const bigWinner = session.players
    .filter((p) => p.net > 0)
    .sort((a, b) => b.net - a.net)[0];
  const bigLoser = session.players
    .filter((p) => p.net < 0)
    .sort((a, b) => a.net - b.net)[0];

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div
        className="px-5 sm:px-6 py-5 flex flex-wrap items-start justify-between gap-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <h2
            className={`font-semibold tracking-tight leading-tight ${
              featured ? "text-xl sm:text-2xl text-gradient" : "text-lg"
            }`}
            style={featured ? {} : { color: "var(--foreground)" }}
          >
            {formatted}
          </h2>
          <p className="text-xs mt-1.5 font-mono" style={{ color: "var(--muted)" }}>
            {session.players.length} players ·{" "}
            <span style={{ color: "var(--subtle)" }}>pot</span>{" "}
            ${session.totalPot.toFixed(2)}
          </p>
        </div>

        <div className="flex gap-5">
          {bigWinner && (
            <div className="text-right">
              <p className="tag mb-1">Winner</p>
              <p className="text-sm font-semibold val-win">
                {bigWinner.player.split(" ")[0]}
              </p>
              <p className="text-xs font-mono val-win">+${bigWinner.net.toFixed(2)}</p>
            </div>
          )}
          {bigLoser && (
            <div className="text-right">
              <p className="tag mb-1">Biggest L</p>
              <p className="text-sm font-semibold val-loss">
                {bigLoser.player.split(" ")[0]}
              </p>
              <p className="text-xs font-mono val-loss">{bigLoser.net.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Player rows */}
      <div>
        {session.players.map((p, i) => (
          <div
            key={p.player}
            className="px-5 sm:px-6 py-3 flex items-center justify-between gap-2"
            style={{
              borderBottom:
                i < session.players.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Avatar */}
              <div
                className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid var(--border)",
                  color: "var(--muted)",
                }}
              >
                {p.player.charAt(0)}
              </div>
              <span
                className="text-sm truncate"
                style={{ color: "var(--foreground)" }}
              >
                {p.player}
              </span>
              {p.match === "BUYIN-ONLY" && (
                <span
                  className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0"
                  style={{
                    background: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.22)",
                    color: "var(--accent-red)",
                  }}
                >
                  busted
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              <span className="hidden sm:inline text-xs font-mono" style={{ color: "var(--muted)" }}>
                in ${p.buyIn.toFixed(2)}
              </span>
              <span className="hidden sm:inline text-xs font-mono" style={{ color: "var(--muted)" }}>
                out ${p.cashOut.toFixed(2)}
              </span>
              {/* Mobile: buy-in only */}
              <span className="sm:hidden text-xs font-mono" style={{ color: "var(--muted)" }}>
                ${p.buyIn.toFixed(0)}
              </span>
              <span className={`font-mono font-semibold text-sm w-16 sm:w-20 text-right ${netClass(p.net)}`}>
                {fmt(p.net)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="px-5 sm:px-6 py-3 flex items-center justify-between"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>
          Banker net{" "}
          <span
            style={{
              color:
                session.bankerNet > 0.5
                  ? "var(--accent-yellow)"
                  : "var(--muted)",
            }}
          >
            ${session.bankerNet.toFixed(2)}
          </span>
        </span>
        <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>
          out ${session.totalOut.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
