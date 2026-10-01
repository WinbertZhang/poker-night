export const GAMES = {
  "0.1-0.2": { label: "$0.10 / $0.20", sheet: "sessions", file: "sessions.csv", gid: "0" },
  "1-3": { label: "$1 / $1", sheet: "1/3 sessions", file: "sessions-1-3.csv", gid: "369354554" },
} as const;
export type Game = keyof typeof GAMES;
export function parseGame(value: unknown): Game {
  return value === "1-3" ? "1-3" : "0.1-0.2";
}
