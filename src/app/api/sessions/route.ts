export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

import { GAMES, parseGame } from "@/lib/games";
import Papa from "papaparse";

interface PlayerEntry {
  name: string;
  buyIn: number;
  cashOut: number;
}

interface SessionPayload {
  game?: string;
  date: string;
  players: PlayerEntry[];
}

const USE_SHEETS = !!(
  process.env.GOOGLE_SHEET_ID &&
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
  process.env.GOOGLE_PRIVATE_KEY
);

export async function POST(req: NextRequest) {
  const body: SessionPayload = await req.json();
  const { date, players } = body;
  if (body.game !== undefined && !Object.hasOwn(GAMES, body.game)) {
    return NextResponse.json({ error: "Invalid game" }, { status: 400 });
  }
  const game = parseGame(body.game);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(players) || !players.length || players.some((p) => !p.name?.trim() || !Number.isFinite(p.buyIn) || !Number.isFinite(p.cashOut) || p.buyIn < 0 || p.cashOut < 0)) {
    return NextResponse.json({ error: "Missing date or players" }, { status: 400 });
  }

  const firstBuyIn = `${date} 08:00 PM`;

  const rows = players.map((p) => {
    const net = p.cashOut - p.buyIn;
    const match =
      p.buyIn > 0 && p.cashOut > 0 ? "OK"
      : p.buyIn > 0 && p.cashOut === 0 ? "BUYIN-ONLY"
      : "PAYOUT-ONLY";
    if (game === "1-3") return [date, p.name.trim(), p.buyIn.toFixed(2), p.cashOut.toFixed(2), net.toFixed(2)];
    return [
      date,
      firstBuyIn,
      p.name,
      p.buyIn.toFixed(2),
      p.cashOut.toFixed(2),
      (net >= 0 ? "+" : "") + net.toFixed(2),
      p.buyIn > 0 ? "1" : "0",
      p.cashOut > 0 ? "1" : "0",
      match,
      "manual-entry",
    ];
  });

  if (USE_SHEETS) {
    const { appendRows } = await import("@/lib/sheets");
    await appendRows(`'${GAMES[game].sheet}'`, rows);
  } else {
    const csvPath = path.join(process.cwd(), "data", GAMES[game].file);
    const exists = fs.existsSync(csvPath);
    const delimiter = exists && fs.readFileSync(csvPath, "utf8").split("\n")[0].includes("\t") ? "\t" : ",";
    const header = game === "1-3" ? ["Session Date", "Player", "Buy-in", "Cash-out", "Net"] : [];
    const csv = Papa.unparse(!exists && header.length ? [header, ...rows] : rows, { delimiter });
    fs.appendFileSync(csvPath, "\n" + csv, "utf8");
  }

  revalidatePath("/");
  revalidatePath("/sessions");
  revalidatePath("/trends");
  revalidatePath("/stats");

  return NextResponse.json({ ok: true, rows: rows.length });
}
