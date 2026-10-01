"use client";

import { useState, useMemo } from "react";
import PlayerProfileLink from "@/components/PlayerProfileLink";
import type { Session } from "@/lib/types";

function netClass(n: number) {
  if (n > 0) return "val-win";
  if (n < 0) return "val-loss";
  return "val-neutral";
}

function fmt(n: number) {
  return (n >= 0 ? "+" : "") + n.toFixed(2);
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMonth(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function monthKey(d: string) {
  return d.slice(0, 7);
}

interface Props {
  sessions: Session[];
}

export default function SessionsExplorer({ sessions }: Props) {
  const [activeDate, setActiveDate] = useState<string>(sessions[0]?.date ?? "");
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return sessions;
    const q = search.toLowerCase();
    return sessions.filter(
      (s) =>
        s.date.includes(q) ||
        s.players.some((p) => p.player.toLowerCase().includes(q))
    );
  }, [sessions, search]);

  const filteredMonths = useMemo(() => {
    const map = new Map<string, Session[]>();
    for (const s of filtered) {
      const k = monthKey(s.date);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(s);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const active = sessions.find((s) => s.date === activeDate);

  function selectSession(date: string) {
    setActiveDate(date);
    setMobileView("detail");
  }

  const sidebar = (
    <div className="card overflow-hidden">
      {/* Search */}
      <div className="p-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <input
          type="text"
          placeholder="Search date or player..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm rounded-lg px-3 py-2 outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-blue)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(94,106,210,0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Month groups */}
      <div className="overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin">
        {filteredMonths.map(([mk, group]) => (
          <div key={mk}>
            <div
              className="px-4 py-2 tag"
              style={{
                borderBottom: "1px solid var(--border)",
                background: "rgba(255,255,255,0.025)",
                letterSpacing: "0.1em",
              }}
            >
              {formatMonth(group[0].date)}
            </div>
            {group.map((s) => {
              const winner = s.players
                .filter((p) => p.net > 0)
                .sort((a, b) => b.net - a.net)[0];
              const isActive = s.date === activeDate;
              return (
                <button
                  key={s.date}
                  type="button"
                  onClick={() => selectSession(s.date)}
                  aria-pressed={isActive}
                  className="w-full text-left px-4 py-3 transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                  style={{
                    background: isActive ? "rgba(94,106,210,0.12)" : undefined,
                    borderLeft: isActive ? "2px solid var(--accent-blue)" : "2px solid transparent",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: isActive ? "#c7caff" : "var(--foreground)" }}>
                      {new Date(s.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <span className="tag">{s.players.length}p</span>
                  </span>
                  {winner && <span className="block text-xs mt-0.5 font-mono truncate val-win">{winner.player.split(" ")[0]} +${winner.net.toFixed(0)}</span>}
                </button>
              );
            })}
          </div>
        ))}
        {filteredMonths.length === 0 && (
          <p className="px-4 py-8 text-sm text-center" style={{ color: "var(--muted)" }}>
            No sessions found
          </p>
        )}
      </div>
    </div>
  );

  const detail = active ? (
    <SessionDetail session={active} />
  ) : (
    <div className="card p-12 text-center">
      <p className="tag">Select a session</p>
    </div>
  );

  return (
    <>
      {/* Desktop: side-by-side */}
      <div className="hidden sm:flex gap-5 items-start">
        <div className="w-60 shrink-0 sticky top-16">{sidebar}</div>
        <div className="flex-1 min-w-0">{detail}</div>
      </div>

      {/* Mobile: toggled views */}
      <div className="sm:hidden">
        {mobileView === "list" ? (
          sidebar
        ) : (
          <div>
            <button
              onClick={() => setMobileView("list")}
              className="flex items-center gap-2 text-sm font-medium mb-4 transition-opacity hover:opacity-70"
              style={{ color: "var(--accent-blue)" }}
            >
              ← All Sessions
            </button>
            {detail}
          </div>
        )}
      </div>
    </>
  );
}

function SessionDetail({ session }: { session: Session }) {
  const winner = session.players
    .filter((p) => p.net > 0)
    .sort((a, b) => b.net - a.net)[0];
  const loser = session.players
    .filter((p) => p.net < 0)
    .sort((a, b) => a.net - b.net)[0];
  const maxAbsNet = Math.max(...session.players.map((p) => Math.abs(p.net)));

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div
        className="px-5 sm:px-6 py-5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <h2 className="text-lg sm:text-xl font-semibold text-gradient leading-tight">
          {formatDate(session.date)}
        </h2>
        <p className="text-xs mt-1.5 font-mono" style={{ color: "var(--muted)" }}>
          {session.players.length} players · pot ${session.totalPot.toFixed(2)}
        </p>

        {/* Chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {winner && (
            <PlayerProfileLink player={winner.player}
              className="px-3 py-1.5 rounded-lg text-xs font-mono"
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.22)",
              }}
            >
              <span style={{ color: "var(--muted)" }}>Winner </span>
              <span className="font-semibold val-win">
                {winner.player.split(" ")[0]} +${winner.net.toFixed(2)}
              </span>
            </PlayerProfileLink>
          )}
          {loser && (
            <PlayerProfileLink player={loser.player}
              className="px-3 py-1.5 rounded-lg text-xs font-mono"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.22)",
              }}
            >
              <span style={{ color: "var(--muted)" }}>Biggest L </span>
              <span className="font-semibold val-loss">
                {loser.player.split(" ")[0]} {loser.net.toFixed(2)}
              </span>
            </PlayerProfileLink>
          )}
          <div
            className="px-3 py-1.5 rounded-lg text-xs font-mono"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border)",
            }}
          >
            <span style={{ color: "var(--muted)" }}>Banker net </span>
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
          </div>
        </div>
      </div>

      {/* Player rows */}
      <div>
        {session.players.map((p, i) => {
          const barPct =
            maxAbsNet === 0 ? 0 : (Math.abs(p.net) / maxAbsNet) * 100;
          return (
            <PlayerProfileLink player={p.player}
              key={p.player}
              className="w-full px-5 sm:px-6 py-4"
              style={{
                borderBottom:
                  i < session.players.length - 1
                    ? "1px solid var(--border)"
                    : "none",
              }}
            >
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid var(--border)",
                      color: "var(--muted)",
                    }}
                  >
                    {p.player.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--foreground)" }}
                    >
                      {p.player}
                    </p>
                    <p className="text-xs font-mono" style={{ color: "var(--muted)" }}>
                      {p.match === "BUYIN-ONLY"
                        ? "busted"
                        : `in $${p.buyIn.toFixed(2)} · out $${p.cashOut.toFixed(2)}`}
                    </p>
                  </div>
                </div>
                <span className={`font-mono font-semibold text-base shrink-0 ${netClass(p.net)}`}>
                  {fmt(p.net)}
                </span>
              </div>
              {/* Net bar */}
              <div
                className="h-[3px] rounded-full overflow-hidden ml-11"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${barPct}%`,
                    background:
                      p.net > 0
                        ? "linear-gradient(90deg,#16a34a,#22c55e)"
                        : "linear-gradient(90deg,#b91c1c,#ef4444)",
                  }}
                />
              </div>
            </PlayerProfileLink>
          );
        })}
      </div>
    </div>
  );
}
