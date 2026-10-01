export const dynamic = "force-dynamic";
import { getSessionsAsync } from "@/lib/data";
import { getSelectedGame } from "@/lib/selected-game";
import { GAMES } from "@/lib/games";
const currency = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD" });
export default async function BuyinsPage() {
  const game = await getSelectedGame();
  const sessions = await getSessionsAsync(game);
  const rows = sessions.flatMap((session) => session.players);
  return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
    <h1 className="text-2xl font-bold">Buy-ins & Cash-outs</h1>
    <p className="text-sm mt-1 mb-8" style={{ color: "var(--muted)" }}>{GAMES[game].label} ? {sessions.length} sessions ? {currency(rows.reduce((sum, row) => sum + row.buyIn, 0))} total buy-ins</p>
    <div className="card overflow-x-auto">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead><tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
          {["Session Date", "Player", "Buy-in", "Cash-out", "Net"].map((label, i) => <th key={label} scope="col" className={`px-5 py-4 ${i > 1 ? "text-right" : ""}`}>{label}</th>)}
        </tr></thead>
        <tbody>{rows.map((row, index) => <tr key={`${row.sessionDate}-${row.player}-${index}`} style={{ borderBottom: "1px solid var(--border)" }}>
          <td className="px-5 py-4">{new Date(row.sessionDate + "T12:00:00").toLocaleDateString("en-US")}</td>
          <td className="px-5 py-4 font-medium">{row.player}</td>
          <td className="px-5 py-4 text-right">{currency(row.buyIn)}</td>
          <td className="px-5 py-4 text-right">{currency(row.cashOut)}</td>
          <td className={`px-5 py-4 text-right ${row.net > 0 ? "val-win" : row.net < 0 ? "val-loss" : "val-neutral"}`}>{currency(row.net)}</td>
        </tr>)}</tbody>
      </table>
      {!rows.length && <p className="p-6 text-sm" style={{ color: "var(--muted)" }}>No buy-ins recorded for this game yet.</p>}
    </div>
  </div>;
}
