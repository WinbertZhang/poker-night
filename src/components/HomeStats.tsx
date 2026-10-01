"use client";

import type { HomepageStats, Session } from "@/lib/types";
import type { ReactNode } from "react";
import Link from "next/link";

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatTile({
  label,
  value,
  sub,
  valueClass = "",
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  valueClass?: string;
}) {
  const content = (
    <div className="card p-5 flex flex-col justify-between min-h-[110px]">
      <p className="tag mb-3">{label}</p>
      <div>
        <p className={`text-3xl font-semibold tracking-tight leading-none ${valueClass}`}>
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-2 leading-snug" style={{ color: "var(--muted)" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
  return content;
}

interface Props {
  stats: HomepageStats;
  recentSessions: Session[];
}

export default function HomeStats({ stats, recentSessions }: Props) {
  const {
    totalSessions,
    totalMoneyInPlay,
    biggestWin,
    biggestLoss,
    leaderboard,
    recentWinners,
    highlights,
  } = stats;
  const { currentLeader, shark, lastSessionKing, onAHeater } = highlights;

  const highlightItems = [
    {
      label: "Current Leader",
      name: currentLeader.player.split(" ")[0],
      player: currentLeader.player,
      value: `${currentLeader.net >= 0 ? "+" : ""}$${currentLeader.net.toFixed(2)}`,
      valueClass: currentLeader.net >= 0 ? "val-win" : "val-loss",
      icon: "👑",
    },
    {
      label: "Shark",
      name: shark.player.split(" ")[0],
      player: shark.player,
      value: `${shark.winRate}% win rate`,
      valueClass: "val-win",
      icon: "🦈",
    },
    {
      label: "Last Session King",
      name: lastSessionKing.player.split(" ")[0],
      player: lastSessionKing.player,
      value: `+$${lastSessionKing.net.toFixed(2)}`,
      valueClass: "val-win",
      icon: "🎯",
    },
    {
      label: "On a Heater",
      name: onAHeater.player.split(" ")[0],
      player: onAHeater.player,
      value: `${onAHeater.net >= 0 ? "+" : ""}$${onAHeater.net.toFixed(2)} last 5`,
      valueClass: onAHeater.net >= 0 ? "val-win" : "val-loss",
      icon: "🔥",
    },
  ];

  return (
    <div className="space-y-5">
      {/* ── Highlights row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {highlightItems.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl p-4 flex flex-col gap-2"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm leading-none">{item.icon}</span>
              <p className="tag">{item.label}</p>
            </div>
            <p className="text-lg font-semibold leading-tight" style={{ color: "var(--foreground)" }}>
              {item.name}
            </p>
            <p className={`text-sm font-mono font-semibold ${item.valueClass}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Stat tiles ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          label="Sessions"
          value={String(totalSessions)}
          sub="all time"
          valueClass="text-gradient"
        />
        <StatTile
          label="Money in Play"
          value={`$${totalMoneyInPlay.toLocaleString()}`}
          sub="total buy-ins"
          valueClass="text-gradient-accent"
        />
        <StatTile
          label="Biggest Win"
          value={`+$${biggestWin.amount.toFixed(0)}`}
          sub={biggestWin.date ? `${biggestWin.player.split(" ")[0]} - ${formatDate(biggestWin.date)}` : "No results yet"}
          valueClass="val-win"
        />
        <StatTile
          label="Biggest Loss"
          value={`-$${Math.abs(biggestLoss.amount).toFixed(0)}`}
          sub={biggestLoss.date ? `${biggestLoss.player.split(" ")[0]} - ${formatDate(biggestLoss.date)}` : "No results yet"}
          valueClass="val-loss"
        />
      </div>

      {/* ── Middle row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Leaderboard */}
        <div className="card md:col-span-2 overflow-hidden">
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              All-Time Leaderboard
            </p>
            <Link
              href="/stats"
              className="tag transition-colors hover:text-white"
              style={{ color: "var(--accent-blue)", textDecoration: "none", letterSpacing: "0.06em" }}
            >
              Full stats →
            </Link>
          </div>
          <div>
            {leaderboard.map((entry, i) => {
              const medals = ["🥇", "🥈", "🥉"];
              const maxAbsNet = Math.max(...leaderboard.map((e) => Math.abs(e.net)));
              const barPct = maxAbsNet === 0 ? 0 : (Math.abs(entry.net) / maxAbsNet) * 78;
              const isWinner = entry.net >= 0;
              return (
                <div
                  key={entry.player}
                  className="px-5 py-3.5"
                  style={{ borderBottom: i < leaderboard.length - 1 ? "1px solid var(--border)" : "none" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm w-5 shrink-0">{medals[i] ?? `#${i + 1}`}</span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                          {entry.player}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                          {entry.sessions} sessions · {entry.winRate}% win rate
                        </p>
                      </div>
                    </div>
                    <span className={`font-mono font-semibold text-sm ${isWinner ? "val-win" : "val-loss"}`}>
                      {isWinner ? "+" : ""}${entry.net.toFixed(2)}
                    </span>
                  </div>
                  <div
                    className="ml-8 h-[3px] rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${barPct}%`,
                        background: isWinner
                          ? "linear-gradient(90deg, #16a34a, #22c55e)"
                          : "linear-gradient(90deg, #b91c1c, #ef4444)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent winners */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Recent Winners
            </p>
          </div>
          {recentWinners.map((w, i) => (
            <div
              key={w.date}
              className="px-5 py-3 flex items-center justify-between"
              style={{ borderBottom: i < recentWinners.length - 1 ? "1px solid var(--border)" : "none" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  {w.player.split(" ")[0]}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  {formatDate(w.date)}
                </p>
              </div>
              <span className="font-mono font-semibold text-sm val-win">
                +${w.net.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Previous sessions grid ── */}
      {recentSessions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="tag">Previous Sessions</p>
            <Link
              href="/sessions"
              className="tag transition-colors hover:text-white"
              style={{ color: "var(--accent-blue)", textDecoration: "none", letterSpacing: "0.06em" }}
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentSessions.slice(0, 6).map((sess) => {
              const winner = sess.players
                .filter((p) => p.net > 0)
                .sort((a, b) => b.net - a.net)[0];
              const loser = sess.players
                .filter((p) => p.net < 0)
                .sort((a, b) => a.net - b.net)[0];
              return (
                <div
                  key={sess.date}
                  className="rounded-2xl p-4 transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    boxShadow: "0 0 0 0 transparent",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.07)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.22)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.14)";
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      {formatDate(sess.date)}
                    </p>
                    <span className="tag" style={{ letterSpacing: "0.06em" }}>
                      {sess.players.length}p
                    </span>
                  </div>
                  <div className="flex gap-4">
                    {winner && (
                      <div className="flex-1">
                        <p className="tag mb-1">Winner</p>
                        <p className="text-xs font-semibold val-win">
                          {winner.player.split(" ")[0]}
                        </p>
                        <p className="text-xs font-mono val-win">+${winner.net.toFixed(2)}</p>
                      </div>
                    )}
                    {loser && (
                      <div className="flex-1">
                        <p className="tag mb-1">Biggest L</p>
                        <p className="text-xs font-semibold val-loss">
                          {loser.player.split(" ")[0]}
                        </p>
                        <p className="text-xs font-mono val-loss">${loser.net.toFixed(2)}</p>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="tag mb-1">Pot</p>
                      <p className="text-xs font-mono font-semibold" style={{ color: "var(--foreground)" }}>
                        ${sess.totalPot.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
