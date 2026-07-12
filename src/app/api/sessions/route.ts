export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

interface PlayerEntry {
  name: string;
  buyIn: number;
  cashOut: number;
}

interface SessionPayload {
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

  if (!date || !players?.length) {
    return NextResponse.json({ error: "Missing date or players" }, { status: 400 });
  }

  const firstBuyIn = `${date} 08:00 PM`;

  const rows = players.map((p) => {
    const net = p.cashOut - p.buyIn;
    const match =
      p.buyIn > 0 && p.cashOut > 0 ? "OK"
      : p.buyIn > 0 && p.cashOut === 0 ? "BUYIN-ONLY"
      : "PAYOUT-ONLY";
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
    await appendRows("sessions", rows);
  } else {
    const csvPath = path.join(process.cwd(), "data", "sessions.csv");
    const lines = rows.map((r) => r.join(","));
    fs.appendFileSync(csvPath, "\n" + lines.join("\n"), "utf8");
  }

  revalidatePath("/");
  revalidatePath("/sessions");
  revalidatePath("/trends");
  revalidatePath("/stats");

  return NextResponse.json({ ok: true, rows: rows.length });
}
