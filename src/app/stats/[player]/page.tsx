export const dynamic = "force-dynamic";
import Link from "next/link";
import { getSessionsAsync } from "@/lib/data";
import { getSelectedGame } from "@/lib/selected-game";
import { GAMES } from "@/lib/games";
import { buildPlayerProfile, resolvePlayerName } from "@/lib/player-profile";

const money = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD" });
const netClass = (value: number) => value > 0 ? "val-win" : value < 0 ? "val-loss" : "val-neutral";
const dateLabel = (date: string) => new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default async function PlayerProfilePage({ params }: { params: Promise<{ player: string }> }) {
  const [{ player: routePlayer }, game] = await Promise.all([params, getSelectedGame()]);
  const sessions = await getSessionsAsync(game);
  const player = resolvePlayerName(routePlayer, sessions.flatMap((session) => session.players.map((row) => row.player)));
  const profile = buildPlayerProfile(sessions, player);
  const cards = [
    { label: "Sessions played", value: String(profile.sessions) },
    { label: "Total buy-in", value: money(profile.totals.buyIn) },
    { label: "Total cash-out", value: money(profile.totals.cashOut) },
    { label: "Total net", value: money(profile.totals.net), color: netClass(profile.totals.net) },
    { label: "Average net / session", value: money(profile.averageNet), color: netClass(profile.averageNet) },
    { label: "Winning sessions", value: `${profile.winRate}%` },
  ];
  return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
    <Link href="/stats" className="text-sm hover:underline" style={{ color: "var(--accent-blue)" }}>Back to Player Stats</Link>
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold break-words">{player}</h1>
      <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>{GAMES[game].label} game - All-time player results</p>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {cards.map((card) => <div key={card.label} className="card p-4 sm:p-5">
        <p className="tag mb-2">{card.label}</p>
        <p className={`text-xl sm:text-2xl font-semibold font-mono ${card.color ?? ""}`}>{card.value}</p>
      </div>)}
    </div>
    <section aria-labelledby="session-history">
      <h2 id="session-history" className="text-lg font-semibold mb-3">Session history</h2>
      {!profile.sessions ? <div className="card p-6 text-sm" style={{ color: "var(--muted)" }}>No sessions recorded for {player} in the {GAMES[game].label} game. Use the game toggle to view their results at other blinds.</div> :
        <div className="card overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <caption className="sr-only">{player}&apos;s {GAMES[game].label} session results, newest first</caption>
            <thead><tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
              <th scope="col" className="px-4 sm:px-6 py-4 text-left">Session date</th>
              {["Buy-in", "Cash-out", "Net"].map((label) => <th key={label} scope="col" className="px-4 sm:px-6 py-4 text-right">{label}</th>)}
            </tr></thead>
            <tbody>{profile.results.map((row) => <tr key={row.date} style={{ borderBottom: "1px solid var(--border)" }}>
              <th scope="row" className="px-4 sm:px-6 py-4 text-left font-medium">{dateLabel(row.date)}</th>
              <td className="px-4 sm:px-6 py-4 text-right font-mono">{money(row.buyIn)}</td>
              <td className="px-4 sm:px-6 py-4 text-right font-mono">{money(row.cashOut)}</td>
              <td className={`px-4 sm:px-6 py-4 text-right font-mono font-semibold ${netClass(row.net)}`}>{money(row.net)}</td>
            </tr>)}</tbody>
            <tfoot><tr>
              <th scope="row" className="px-4 sm:px-6 py-4 text-left">Total</th>
              <td className="px-4 sm:px-6 py-4 text-right font-mono">{money(profile.totals.buyIn)}</td>
              <td className="px-4 sm:px-6 py-4 text-right font-mono">{money(profile.totals.cashOut)}</td>
              <td className={`px-4 sm:px-6 py-4 text-right font-mono font-semibold ${netClass(profile.totals.net)}`}>{money(profile.totals.net)}</td>
            </tr></tfoot>
          </table>
        </div>}
    </section>
  </div>;
}
