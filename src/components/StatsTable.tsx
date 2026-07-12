"use client";

import { useState } from "react";
import type { PlayerSummary } from "@/lib/types";

type SortKey = keyof PlayerSummary;

function NetBar({ value, max, win }: { value: number; max: number; win: boolean }) {
  const pct = max === 0 ? 0 : Math.abs(value / max) * 100;
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ background: "rgba(255,255,255,0.05)", height: 3 }}
    >
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${pct}%`,
          background: win
            ? "linear-gradient(90deg,#16a34a,#22c55e)"
            : "linear-gradient(90deg,#b91c1c,#ef4444)",
        }}
      />
    </div>
  );
}

export default function StatsTable({ summaries }: { summaries: PlayerSummary[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("net");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = [...summaries].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === "number" && typeof bv === "number") {
      return sortDir === "desc" ? bv - av : av - bv;
    }
    return sortDir === "desc"
      ? String(bv).localeCompare(String(av))
      : String(av).localeCompare(String(bv));
  });

  const maxNet = Math.max(...summaries.map((s) => Math.abs(s.net)));
  const maxAvg = Math.max(...summaries.map((s) => Math.abs(s.avgNetPerSession)));

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const SortIndicator = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      <span style={{ color: "var(--accent-blue)", marginLeft: 4 }}>
        {sortDir === "desc" ? "↓" : "↑"}
      </span>
    ) : (
      <span style={{ color: "rgba(255,255,255,0.15)", marginLeft: 4 }}>↕</span>
    );

  const Th = ({
    label,
    k,
    align = "right",
  }: {
    label: string;
    k: SortKey;
    align?: "left" | "right";
  }) => (
    <th
      onClick={() => handleSort(k)}
      className={`px-4 py-3 tag cursor-pointer select-none text-${align}`}
      style={{ whiteSpace: "nowrap", letterSpacing: "0.1em" }}
    >
      {label}
      <SortIndicator k={k} />
    </th>
  );

  return (
    <div className="card overflow-hidden">
      {/* Podium */}
      <div
        className="px-4 sm:px-6 py-5 flex gap-3 flex-wrap"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {sorted.slice(0, 3).map((s, i) => {
          const medals = ["🥇", "🥈", "🥉"];
          const win = s.net >= 0;
          return (
            <div
              key={s.player}
              className="flex items-center gap-3 px-4 py-3 rounded-xl flex-1"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border)",
                minWidth: 140,
              }}
            >
              <span className="text-xl">{medals[i]}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  {s.player.split(" ")[0]}
                </p>
                <p className={`text-xs font-mono font-semibold ${win ? "val-win" : "val-loss"}`}>
                  {win ? "+" : ""}${s.net.toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile sort pills */}
      <div
        className="sm:hidden flex gap-2 px-4 py-3 overflow-x-auto"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {(["net", "sessions", "avgNetPerSession", "totalBuyIn"] as SortKey[]).map((key) => {
          const labels: Record<string, string> = {
            net: "Net",
            sessions: "Sessions",
            avgNetPerSession: "Avg/Sess",
            totalBuyIn: "Buy-in",
          };
          const active = sortKey === key;
          return (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: active ? "rgba(94,106,210,0.2)" : "rgba(255,255,255,0.04)",
                color: active ? "#c7caff" : "var(--muted)",
                border: `1px solid ${active ? "rgba(94,106,210,0.4)" : "var(--border)"}`,
              }}
            >
              {labels[key]}
              {active ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
            </button>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <Th label="Player" k="player" align="left" />
              <Th label="Sessions" k="sessions" />
              <Th label="Buy-in" k="totalBuyIn" />
              <Th label="Cash-out" k="totalCashOut" />
              <Th label="Net" k="net" />
              <Th label="Avg/Sess" k="avgNetPerSession" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, idx) => {
              const win = s.net >= 0;
              return (
                <tr
                  key={s.player}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background:
                      idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.012)",
                  }}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid var(--border)",
                          color: "var(--muted)",
                        }}
                      >
                        {s.player.charAt(0)}
                      </div>
                      <div>
                        <p style={{ color: "var(--foreground)" }}>{s.player}</p>
                        {s.note && (
                          <p className="text-xs font-mono mt-0.5" style={{ color: "var(--muted)" }}>
                            {s.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-mono" style={{ color: "var(--muted)" }}>
                    {s.sessions}
                  </td>
                  <td className="px-4 py-4 text-right font-mono" style={{ color: "var(--muted)" }}>
                    ${s.totalBuyIn.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-right font-mono" style={{ color: "var(--muted)" }}>
                    ${s.totalCashOut.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`font-mono font-semibold ${win ? "val-win" : "val-loss"}`}>
                        {win ? "+" : ""}${s.net.toFixed(2)}
                      </span>
                      <div className="w-24">
                        <NetBar value={s.net} max={maxNet} win={win} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`font-mono text-xs ${
                          s.avgNetPerSession >= 0 ? "val-win" : "val-loss"
                        }`}
                      >
                        {s.avgNetPerSession >= 0 ? "+" : ""}$
                        {Math.abs(s.avgNetPerSession).toFixed(2)}
                      </span>
                      <div className="w-24">
                        <NetBar
                          value={s.avgNetPerSession}
                          max={maxAvg}
                          win={s.avgNetPerSession >= 0}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden divide-y" style={{ borderColor: "var(--border)" }}>
        {sorted.map((s) => {
          const win = s.net >= 0;
          return (
            <div key={s.player} className="px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid var(--border)",
                      color: "var(--muted)",
                    }}
                  >
                    {s.player.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      {s.player}
                    </p>
                    <p className="text-xs font-mono" style={{ color: "var(--muted)" }}>
                      {s.sessions} sessions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-mono font-semibold ${win ? "val-win" : "val-loss"}`}>
                    {win ? "+" : ""}${s.net.toFixed(2)}
                  </p>
                  <p className="text-xs font-mono" style={{ color: "var(--muted)" }}>
                    avg {s.avgNetPerSession >= 0 ? "+" : ""}$
                    {s.avgNetPerSession.toFixed(2)}/sess
                  </p>
                </div>
              </div>
              <NetBar value={s.net} max={maxNet} win={win} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
