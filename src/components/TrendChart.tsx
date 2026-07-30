"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { PlayerTrend } from "@/lib/types";

const PALETTE = [
  "#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4",
  "#f97316", "#a855f7", "#14b8a6", "#ef4444", "#84cc16",
  "#3b82f6", "#e879f9", "#fb923c", "#4ade80", "#38bdf8",
];

function colorFor(index: number) {
  return PALETTE[index % PALETTE.length];
}

interface Props {
  trends: PlayerTrend[];
  allPlayers: string[];
  sessionCounts: Record<string, number>;
}

// Determine "active" players: those who played in the most recent session
function getDefaultSelected(
  trends: PlayerTrend[],
  allPlayers: string[],
  sessionCounts: Record<string, number>
): Set<string> {
  // Prefer players with >=5 sessions (regulars)
  const regulars = allPlayers.filter((p) => (sessionCounts[p] ?? 0) >= 5);
  if (!trends.length) return new Set(regulars.length ? regulars.slice(0, 8) : allPlayers.slice(0, 8));
  const last = trends[trends.length - 1];
  const active = (regulars.length ? regulars : allPlayers).filter(
    (p) => last[p] !== undefined && last[p] !== 0
  );
  const base = active.length > 0 ? active : regulars.length ? regulars.slice(0, 8) : allPlayers.slice(0, 8);
  return new Set(base);
}

interface TooltipPayload {
  color: string;
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const sorted = [...payload].sort((a, b) => b.value - a.value);

  return (
    <div
      className="rounded-xl p-3 text-xs min-w-[160px]"
      style={{
        background: "rgba(10,10,14,0.92)",
        backdropFilter: "blur(16px)",
        border: "1px solid var(--border-bright)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        color: "var(--foreground)",
      }}
    >
      <p className="font-mono mb-2" style={{ color: "var(--muted)", fontSize: "0.62rem", letterSpacing: "0.1em" }}>
        {label}
      </p>
      {sorted.map((entry) => (
        <div key={entry.name} className="flex justify-between gap-4 py-0.5">
          <span style={{ color: entry.color }}>{entry.name.split(" ")[0]}</span>
          <span
            className="font-mono font-semibold"
            style={{ color: entry.value >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}
          >
            {entry.value >= 0 ? "+" : ""}
            {entry.value.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TrendChart({ trends, allPlayers, sessionCounts }: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    () => getDefaultSelected(trends, allPlayers, sessionCounts)
  );
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"alpha" | "freq">("freq");

  const toggle = (player: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(player)) next.delete(player);
      else next.add(player);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(allPlayers));
  const clearAll = () => setSelected(new Set());

  const filteredPlayers = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = allPlayers.filter((p) => p.toLowerCase().includes(q));
    if (sortBy === "freq")
      return [...filtered].sort((a, b) => (sessionCounts[b] ?? 0) - (sessionCounts[a] ?? 0));
    return [...filtered].sort((a, b) => a.localeCompare(b));
  }, [allPlayers, search, sortBy, sessionCounts]);

  const chartData = trends.map((t) => {
    const point: Record<string, string | number> = { date: t.date as string };
    for (const p of allPlayers) {
      if (selected.has(p)) point[p] = (t[p] as number) ?? 0;
    }
    return point;
  });

  const formatDate = (d: string) => {
    const dt = new Date(d + "T12:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="card p-3 sm:p-6">
        <ResponsiveContainer width="100%" height={260} className="sm:!h-[420px]">
          <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1.5} />
            <Tooltip content={<CustomTooltip />} />
            {allPlayers
              .filter((p) => selected.has(p))
              .map((player, i) => (
                <Line
                  key={player}
                  type="monotone"
                  dataKey={player}
                  stroke={colorFor(allPlayers.indexOf(player))}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Player selector */}
      <div className="card p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Select Players ({selected.size}/{allPlayers.length})
            </p>
            <div
              className="flex rounded-lg overflow-hidden"
              style={{ border: "1px solid var(--border)" }}
            >
              {(["freq", "alpha"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className="px-2.5 py-1 text-xs font-medium transition-all"
                  style={{
                    background: sortBy === s ? "rgba(94,106,210,0.2)" : "transparent",
                    color: sortBy === s ? "#c7caff" : "var(--muted)",
                    borderRight: s === "freq" ? "1px solid var(--border)" : "none",
                  }}
                >
                  {s === "freq" ? "Most played" : "A–Z"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 sm:flex-none text-sm rounded-lg px-3 py-1.5 outline-none transition-all"
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
            <button
              onClick={selectAll}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all shrink-0"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border)",
                color: "var(--muted)",
              }}
            >
              All
            </button>
            <button
              onClick={clearAll}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all shrink-0"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border)",
                color: "var(--muted)",
              }}
            >
              None
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {filteredPlayers.map((player) => {
            const on = selected.has(player);
            const color = colorFor(allPlayers.indexOf(player));
            return (
              <button
                key={player}
                onClick={() => toggle(player)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150"
                style={{
                  background: on ? `${color}20` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${on ? color + "66" : "var(--border)"}`,
                  color: on ? color : "var(--muted)",
                  boxShadow: on ? `0 0 12px ${color}22` : "none",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: on ? color : "var(--border)" }}
                />
                {player.split(" ")[0]}
                <span
                  className="text-[10px] font-mono"
                  style={{ opacity: 0.55 }}
                >
                  {sessionCounts[player] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
