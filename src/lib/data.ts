import fs from "fs";
import path from "path";
import type { Session, SessionRow, PlayerSummary, PlayerTrend, HomepageStats } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
// Use Sheets only when credentials are present AND we're not in local dev.
// Local dev always falls back to app/data/ (fake seed data) so you never
// need credentials to iterate, and real data stays in the archive.
const USE_SHEETS = !!(
  process.env.GOOGLE_SHEET_ID &&
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
  process.env.GOOGLE_PRIVATE_KEY
);

// ─── CSV helpers ──────────────────────────────────────────────────────────────

function parseCSV(raw: string): string[][] {
  return raw
    .split("\n")
    .map((line) => {
      const cells: string[] = [];
      let inside = false;
      let cur = "";
      for (const ch of line) {
        if (ch === '"') { inside = !inside; }
        else if (ch === "," && !inside) { cells.push(cur); cur = ""; }
        else { cur += ch; }
      }
      cells.push(cur);
      return cells;
    })
    .filter((r) => r.length > 1);
}

function csvSessionRows(): string[][] {
  const raw = fs.readFileSync(path.join(DATA_DIR, "sessions.csv"), "utf8");
  const [, ...rows] = parseCSV(raw);
  return rows.filter((r) => r.length >= 9 && r[0]);
}

// ─── Sheets helpers ───────────────────────────────────────────────────────────

async function sheetsSessionRows(): Promise<string[][]> {
  const { readSheet } = await import("./sheets");
  const rows = await readSheet("sessions!A:J");
  return rows.slice(1).filter((r) => r.length >= 9 && r[0]);
}

// ─── Row → typed objects ──────────────────────────────────────────────────────

function toSessionRow(r: string[]): SessionRow {
  return {
    sessionDate: r[0].trim(),
    firstBuyIn: r[1].trim(),
    player: r[2].trim(),
    buyIn: parseFloat(r[3]) || 0,
    cashOut: parseFloat(r[4]) || 0,
    net: parseFloat(r[5]) || 0,
    numBuyInTxns: parseInt(r[6]) || 0,
    numCashOutTxns: parseInt(r[7]) || 0,
    match: r[8].trim(),
    note: r[9]?.trim() ?? "",
  };
}

// ─── Derive player summaries from session rows ────────────────────────────────

function computePlayerSummaries(sessions: Session[]): PlayerSummary[] {
  const acc: Record<string, {
    venmoBuyIn: number;
    totalCashOut: number;
    sessions: number;
  }> = {};

  for (const sess of sessions) {
    for (const p of sess.players) {
      if (!acc[p.player]) acc[p.player] = { venmoBuyIn: 0, totalCashOut: 0, sessions: 0 };
      acc[p.player].venmoBuyIn += p.buyIn;
      acc[p.player].totalCashOut += p.cashOut;
      acc[p.player].sessions += 1;
    }
  }

  return Object.entries(acc)
    .map(([player, d]) => {
      const net = d.totalCashOut - d.venmoBuyIn;
      const avgNetPerSession = d.sessions > 0 ? net / d.sessions : 0;
      return {
        player,
        sessions: d.sessions,
        venmoBuyIn: d.venmoBuyIn,
        offVenmoBuyIn: 0,
        totalBuyIn: d.venmoBuyIn,
        totalCashOut: d.totalCashOut,
        net,
        avgNetPerSession,
        note: "",
      };
    })
    .sort((a, b) => b.net - a.net);
}

// ─── Group session rows into Session objects ──────────────────────────────────

function groupSessions(rows: SessionRow[]): Session[] {
  const map = new Map<string, Session>();
  for (const row of rows) {
    if (!map.has(row.sessionDate)) {
      map.set(row.sessionDate, {
        date: row.sessionDate,
        firstBuyIn: row.firstBuyIn,
        players: [],
        totalPot: 0,
        totalOut: 0,
        bankerNet: 0,
      });
    }
    const sess = map.get(row.sessionDate)!;
    sess.players.push(row);
    sess.totalPot += row.buyIn;
    sess.totalOut += row.cashOut;
  }
  for (const sess of map.values()) {
    sess.bankerNet = sess.totalPot - sess.totalOut;
    sess.players.sort((a, b) => b.net - a.net);
  }
  return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
}

// ─── Raw row fetchers ─────────────────────────────────────────────────────────

async function getSessionRowsAsync(): Promise<SessionRow[]> {
  const rows = USE_SHEETS ? await sheetsSessionRows() : csvSessionRows();
  return rows.map(toSessionRow);
}

// ─── Public: Sessions ─────────────────────────────────────────────────────────

export function getSessions(): Session[] {
  return groupSessions(csvSessionRows().map(toSessionRow));
}

export async function getSessionsAsync(): Promise<Session[]> {
  return groupSessions(await getSessionRowsAsync());
}

// ─── Public: Player summaries (computed from sessions) ────────────────────────

export function getPlayerSummaries(): PlayerSummary[] {
  return computePlayerSummaries(getSessions());
}

export async function getPlayerSummariesAsync(): Promise<PlayerSummary[]> {
  return computePlayerSummaries(await getSessionsAsync());
}

// ─── Public: Trends ───────────────────────────────────────────────────────────

function buildPlayerTrends(sessions: Session[]): {
  trends: PlayerTrend[];
  players: string[];
  sessionCounts: Record<string, number>;
} {
  const chronological = sessions.slice().reverse();
  const sessionCounts: Record<string, number> = {};
  for (const sess of chronological)
    for (const row of sess.players)
      sessionCounts[row.player] = (sessionCounts[row.player] ?? 0) + 1;

  const players = Object.keys(sessionCounts).sort();
  const runningNet: Record<string, number> = {};
  for (const p of players) runningNet[p] = 0;

  const trends: PlayerTrend[] = chronological.map((sess) => {
    for (const row of sess.players)
      runningNet[row.player] = (runningNet[row.player] ?? 0) + row.net;
    const point: PlayerTrend = { date: sess.date };
    for (const p of players) if (runningNet[p] !== undefined) point[p] = runningNet[p];
    return point;
  });

  return { trends, players, sessionCounts };
}

export function getPlayerTrends(): {
  trends: PlayerTrend[];
  players: string[];
  sessionCounts: Record<string, number>;
} {
  return buildPlayerTrends(getSessions());
}

export async function getPlayerTrendsAsync(): Promise<{
  trends: PlayerTrend[];
  players: string[];
  sessionCounts: Record<string, number>;
}> {
  return buildPlayerTrends(await getSessionsAsync());
}

// ─── Public: Homepage stats ───────────────────────────────────────────────────

function buildHomepageStats(sessions: Session[], summaries: PlayerSummary[]): HomepageStats {
  const chronological = sessions.slice().reverse();

  const totalSessions = sessions.length;
  const totalMoneyInPlay = sessions.reduce((sum, s) => sum + s.totalPot, 0);

  let biggestWin = { player: "", amount: -Infinity, date: "" };
  let biggestLoss = { player: "", amount: Infinity, date: "" };
  for (const sess of sessions) {
    for (const p of sess.players) {
      if (p.net > biggestWin.amount) biggestWin = { player: p.player, amount: p.net, date: sess.date };
      if (p.net < biggestLoss.amount) biggestLoss = { player: p.player, amount: p.net, date: sess.date };
    }
  }

  const wins: Record<string, number> = {};
  const played: Record<string, number> = {};
  for (const sess of sessions) {
    for (const p of sess.players) {
      played[p.player] = (played[p.player] ?? 0) + 1;
      if (p.net > 0) wins[p.player] = (wins[p.player] ?? 0) + 1;
    }
  }

  const regulars = new Set(summaries.filter((s) => s.sessions >= 5).map((s) => s.player));

  const leaderboard = summaries
    .slice(0, 5)
    .map((s) => ({
      player: s.player,
      net: s.net,
      sessions: s.sessions,
      winRate: Math.round(((wins[s.player] ?? 0) / (played[s.player] ?? 1)) * 100),
    }));

  const recentWinners = chronological.slice(-5).reverse().map((sess) => {
    const winner = sess.players.filter((p) => p.net > 0).sort((a, b) => b.net - a.net)[0];
    return { date: sess.date, player: winner?.player ?? "—", net: winner?.net ?? 0 };
  });

  const currentLeader = summaries.filter((s) => regulars.has(s.player))[0] ?? summaries[0];

  const shark = summaries
    .filter((s) => regulars.has(s.player))
    .map((s) => ({
      player: s.player,
      winRate: Math.round(((wins[s.player] ?? 0) / (played[s.player] ?? 1)) * 100),
      sessions: s.sessions,
    }))
    .sort((a, b) => b.winRate - a.winRate)[0];

  const lastSess = sessions[0]; // sessions is newest-first
  const lastKing = lastSess?.players.filter((p) => p.net > 0).sort((a, b) => b.net - a.net)[0];

  const last5 = sessions.slice(0, 5);
  const heaterNet: Record<string, number> = {};
  for (const sess of last5) {
    for (const p of sess.players) {
      if (!regulars.has(p.player)) continue;
      heaterNet[p.player] = (heaterNet[p.player] ?? 0) + p.net;
    }
  }
  const heaterEntry = Object.entries(heaterNet).sort((a, b) => b[1] - a[1])[0];

  return {
    totalSessions,
    totalMoneyInPlay,
    biggestWin,
    biggestLoss,
    leaderboard,
    recentWinners,
    highlights: {
      currentLeader: { player: currentLeader?.player ?? "—", net: currentLeader?.net ?? 0 },
      shark: shark ?? { player: "—", winRate: 0, sessions: 0 },
      lastSessionKing: {
        player: lastKing?.player ?? "—",
        net: lastKing?.net ?? 0,
        date: lastSess?.date ?? "",
      },
      onAHeater: { player: heaterEntry?.[0] ?? "—", net: heaterEntry?.[1] ?? 0 },
    },
  };
}

export function getHomepageStats(): HomepageStats {
  const sessions = getSessions();
  return buildHomepageStats(sessions, computePlayerSummaries(sessions));
}

export async function getHomepageStatsAsync(): Promise<HomepageStats> {
  const sessions = await getSessionsAsync();
  return buildHomepageStats(sessions, computePlayerSummaries(sessions));
}
