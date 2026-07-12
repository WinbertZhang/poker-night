export interface SessionRow {
  sessionDate: string;
  firstBuyIn: string;
  player: string;
  buyIn: number;
  cashOut: number;
  net: number;
  numBuyInTxns: number;
  numCashOutTxns: number;
  match: string;
  note: string;
}

export interface Session {
  date: string;
  firstBuyIn: string;
  players: SessionRow[];
  totalPot: number;
  totalOut: number;
  bankerNet: number;
}

export interface PlayerSummary {
  player: string;
  sessions: number;
  venmoBuyIn: number;
  offVenmoBuyIn: number;
  totalBuyIn: number;
  totalCashOut: number;
  net: number;
  avgNetPerSession: number;
  note: string;
}

export interface PlayerTrend {
  date: string;
  [player: string]: number | string;
}

export interface HomepageStats {
  totalSessions: number;
  totalMoneyInPlay: number;
  biggestWin: { player: string; amount: number; date: string };
  biggestLoss: { player: string; amount: number; date: string };
  leaderboard: Array<{ player: string; net: number; sessions: number; winRate: number }>;
  recentWinners: Array<{ date: string; player: string; net: number }>;
  highlights: {
    currentLeader: { player: string; net: number };
    shark: { player: string; winRate: number; sessions: number };
    lastSessionKing: { player: string; net: number; date: string };
    onAHeater: { player: string; net: number };
  };
}
