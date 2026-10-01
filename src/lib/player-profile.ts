import type { Session, PlayerSummary } from "./types";

export function buildPlayerProfile(sessions: Session[], player: string) {
  const results = sessions.flatMap((session) => {
    const rows = session.players.filter((row) => row.player === player);
    if (!rows.length) return [];
    return [{ date: session.date, buyIn: rows.reduce((sum, row) => sum + row.buyIn, 0),
      cashOut: rows.reduce((sum, row) => sum + row.cashOut, 0),
      net: rows.reduce((sum, row) => sum + row.net, 0) }];
  }).sort((a, b) => b.date.localeCompare(a.date));
  const totals = results.reduce((sum, row) => ({ buyIn: sum.buyIn + row.buyIn,
    cashOut: sum.cashOut + row.cashOut, net: sum.net + row.net }), { buyIn: 0, cashOut: 0, net: 0 });
  return { player, results, totals, sessions: results.length,
    averageNet: results.length ? totals.net / results.length : 0,
    winRate: results.length ? Math.round(results.filter((row) => row.net > 0).length / results.length * 100) : 0 };
}

export function summarizePlayers(sessions: Session[]): PlayerSummary[] {
  const players = new Set(sessions.flatMap((session) => session.players.map((row) => row.player)));
  return [...players].map((player) => {
    const profile = buildPlayerProfile(sessions, player);
    return { player, sessions: profile.sessions, venmoBuyIn: profile.totals.buyIn,
      offVenmoBuyIn: 0, totalBuyIn: profile.totals.buyIn, totalCashOut: profile.totals.cashOut,
      net: profile.totals.net, avgNetPerSession: profile.averageNet, note: "" };
  }).sort((a, b) => b.net - a.net);
}

export function resolvePlayerName(value: string, knownPlayers: string[] = []): string {
  // Preserve literal percent characters in existing names, while decoding URL params.
  if (knownPlayers.includes(value)) return value;
  try { return decodeURIComponent(value); } catch { return value; }
}
