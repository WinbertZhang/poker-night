"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PlayerRow {
  id: number;
  name: string;
  buyIn: string;
  cashOut: string;
}

interface Props {
  lastSessionPlayers: string[];
  allPlayers: string[];
}

let nextId = 1;
function makeRow(name = ""): PlayerRow {
  return { id: nextId++, name, buyIn: "20", cashOut: "" };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Autocomplete dropdown for a single name input
function NameInput({
  value,
  onChange,
  allPlayers,
}: {
  value: string;
  onChange: (v: string) => void;
  allPlayers: string[];
}) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const query = value.toLowerCase();
  const suggestions = allPlayers.filter(
    (p) => p.toLowerCase().includes(query) && p !== value
  );
  const showDropdown = focused && open && suggestions.length > 0;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <input
        type="text"
        placeholder="Name"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setFocused(true);
          setOpen(true);
        }}
        onBlur={() => setFocused(false)}
        className="w-full rounded-xl px-3.5 py-2 text-sm outline-none transition-all"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${focused ? "var(--accent-blue)" : "var(--border)"}`,
          color: "var(--foreground)",
        }}
      />
      {showDropdown && (
        <div
          className="absolute z-50 left-0 right-0 mt-1 rounded-xl overflow-hidden"
          style={{
            background: "rgba(12,12,18,0.97)",
            backdropFilter: "blur(16px)",
            border: "1px solid var(--border-bright)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
            maxHeight: 200,
            overflowY: "auto",
          }}
        >
          {suggestions.slice(0, 10).map((p) => (
            <button
              key={p}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(p);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors"
              style={{ color: "var(--foreground)", background: "transparent" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(94,106,210,0.15)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "transparent")
              }
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NewSessionForm({ lastSessionPlayers, allPlayers }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(today);
  const [players, setPlayers] = useState<PlayerRow[]>(() =>
    [makeRow(), makeRow(), makeRow()]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dateFocused, setDateFocused] = useState(false);

  function loadLastSession() {
    if (!lastSessionPlayers.length) return;
    setPlayers(lastSessionPlayers.map((name) => makeRow(name)));
  }

  function updatePlayer(id: number, field: keyof PlayerRow, value: string) {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }

  function addPlayer() {
    setPlayers((prev) => [...prev, makeRow()]);
  }

  function removePlayer(id: number) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  function net(p: PlayerRow) {
    return (parseFloat(p.cashOut) || 0) - (parseFloat(p.buyIn) || 0);
  }

  const totalPot = players.reduce((s, p) => s + (parseFloat(p.buyIn) || 0), 0);
  const totalOut = players.reduce((s, p) => s + (parseFloat(p.cashOut) || 0), 0);
  const bankerNet = totalPot - totalOut;

  async function handleSubmit() {
    setError("");
    const filled = players.filter((p) => p.name.trim());
    if (!filled.length) { setError("Add at least one player."); return; }
    for (const p of filled) {
      if (!p.buyIn && !p.cashOut) {
        setError(`Fill in buy-in or cash-out for ${p.name}.`);
        return;
      }
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          players: filled.map((p) => ({
            name: p.name.trim(),
            buyIn: parseFloat(p.buyIn) || 0,
            cashOut: parseFloat(p.cashOut) || 0,
          })),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess(true);
      setTimeout(() => router.push("/sessions"), 1200);
    } catch (e) {
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="card p-10 flex flex-col items-center justify-center gap-4 text-center" style={{ minHeight: 240 }}>
        <span className="text-4xl">✓</span>
        <p className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>Session saved!</p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>Redirecting to sessions…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Date + quick-load */}
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="tag mb-3">Session Date</p>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full sm:w-56 rounded-xl px-4 py-2.5 text-sm font-mono outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${dateFocused ? "var(--accent-blue)" : "var(--border)"}`,
              color: "var(--foreground)",
              colorScheme: "dark",
            }}
            onFocus={() => setDateFocused(true)}
            onBlur={() => setDateFocused(false)}
          />
        </div>

        {lastSessionPlayers.length > 0 && (
          <div className="sm:self-end">
            <button
              onClick={loadLastSession}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "var(--foreground)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(94,106,210,0.15)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(94,106,210,0.4)";
                (e.currentTarget as HTMLButtonElement).style.color = "#c7caff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.14)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)";
              }}
            >
              <span style={{ color: "var(--accent-blue)" }}>↺</span>
              Load last session
              <span
                className="px-1.5 py-0.5 rounded-md text-[10px] font-mono"
                style={{
                  background: "rgba(94,106,210,0.15)",
                  border: "1px solid rgba(94,106,210,0.25)",
                  color: "var(--accent-blue)",
                }}
              >
                {lastSessionPlayers.length}p
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Players table */}
      <div className="card overflow-hidden">
        {/* Desktop header */}
        <div
          className="hidden sm:grid px-5 py-3"
          style={{
            gridTemplateColumns: "1fr 120px 120px 100px 40px",
            gap: "12px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {["Player", "Buy-in ($)", "Cash-out ($)", "Net", ""].map((h) => (
            <p key={h} className="tag">{h}</p>
          ))}
        </div>

        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {players.map((p, idx) => {
            const n = net(p);
            const hasNet = p.name.trim() && (p.buyIn || p.cashOut);
            return (
              <div key={p.id} className="px-4 sm:px-5 py-4">
                <p className="sm:hidden tag mb-3">Player {idx + 1}</p>
                <div
                  className="sm:grid sm:items-center gap-3"
                  style={{ gridTemplateColumns: "1fr 120px 120px 100px 40px" }}
                >
                  {/* Name with autocomplete */}
                  <div className="mb-2 sm:mb-0">
                    <NameInput
                      value={p.name}
                      onChange={(v) => updatePlayer(p.id, "name", v)}
                      allPlayers={allPlayers}
                    />
                  </div>

                  {/* Buy-in + cash-out */}
                  <div className="flex gap-2 sm:contents mb-2 sm:mb-0">
                    <div className="flex-1 sm:contents">
                      <p className="sm:hidden tag mb-1 text-[10px]">Buy-in</p>
                      <input
                        type="number"
                        placeholder="20"
                        value={p.buyIn}
                        onChange={(e) => updatePlayer(p.id, "buyIn", e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full rounded-xl px-3.5 py-2 text-sm font-mono outline-none transition-all"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid var(--border)",
                          color: "var(--foreground)",
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-blue)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                      />
                    </div>
                    <div className="flex-1 sm:contents">
                      <p className="sm:hidden tag mb-1 text-[10px]">Cash-out</p>
                      <input
                        type="number"
                        placeholder="0"
                        value={p.cashOut}
                        onChange={(e) => updatePlayer(p.id, "cashOut", e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full rounded-xl px-3.5 py-2 text-sm font-mono outline-none transition-all"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid var(--border)",
                          color: "var(--foreground)",
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-blue)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                      />
                    </div>
                  </div>

                  {/* Net */}
                  <div className="flex items-center justify-between sm:block mb-1 sm:mb-0">
                    <p className="sm:hidden tag">Net</p>
                    <p
                      className={`text-sm font-mono font-semibold ${
                        hasNet ? (n >= 0 ? "val-win" : "val-loss") : ""
                      }`}
                      style={!hasNet ? { color: "var(--muted)" } : {}}
                    >
                      {hasNet ? `${n >= 0 ? "+" : ""}$${n.toFixed(2)}` : "—"}
                    </p>
                  </div>

                  {/* Remove — desktop */}
                  <button
                    onClick={() => removePlayer(p.id)}
                    className="hidden sm:flex w-8 h-8 items-center justify-center rounded-lg transition-all"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border)",
                      color: "var(--muted)",
                      fontSize: "0.9rem",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.5)";
                      (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)";
                    }}
                  >
                    ×
                  </button>
                  {/* Remove — mobile */}
                  {players.length > 1 && (
                    <button
                      onClick={() => removePlayer(p.id)}
                      className="sm:hidden text-xs mt-1"
                      style={{ color: "rgba(239,68,68,0.7)", background: "none", border: "none" }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={addPlayer}
            className="text-sm font-medium transition-colors"
            style={{ color: "var(--accent-blue)", background: "none", border: "none" }}
          >
            + Add player
          </button>
        </div>
      </div>

      {/* Pot summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Pot", value: `$${totalPot.toFixed(2)}`, cls: "text-gradient" },
          { label: "Total Out", value: `$${totalOut.toFixed(2)}`, cls: "text-gradient-accent" },
          {
            label: "Banker Net",
            value: `${bankerNet >= 0 ? "+" : ""}$${bankerNet.toFixed(2)}`,
            cls: Math.abs(bankerNet) < 0.01 ? "" : bankerNet > 0 ? "val-win" : "val-loss",
          },
        ].map(({ label, value, cls }) => (
          <div
            key={label}
            className="rounded-2xl p-4 flex flex-col gap-1.5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            <p className="tag">{label}</p>
            <p className={`text-xl font-semibold font-mono ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#fca5a5",
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200"
        style={{
          background: submitting
            ? "rgba(94,106,210,0.3)"
            : "linear-gradient(135deg, rgba(94,106,210,0.8), rgba(168,85,247,0.7))",
          border: "1px solid rgba(94,106,210,0.4)",
          color: "#fff",
          boxShadow: submitting ? "none" : "0 0 24px rgba(94,106,210,0.25)",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "Saving…" : "Save Session"}
      </button>
    </div>
  );
}
