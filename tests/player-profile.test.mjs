import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import ts from "typescript";
const compiled = ts.transpileModule(fs.readFileSync("src/lib/player-profile.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const profileModule = new Module("player-profile");
profileModule._compile(compiled.outputText, "player-profile.js");
const { buildPlayerProfile, summarizePlayers, resolvePlayerName } = profileModule.exports;
const row = (player, buyIn, cashOut, net = cashOut - buyIn) => ({ player, buyIn, cashOut, net });

test("filters players, combines session entries, and sorts newest first", () => {
  const profile = buildPlayerProfile([
    { date: "2026-09-30", players: [row("Allen Mons", 300, 337), row("Other", 500, 900), row("Allen Mons", 100, 0)] },
    { date: "2026-10-01", players: [row("Allen Mons", 200, 250)] },
    { date: "2026-10-02", players: [row("Other", 100, 0)] },
  ], "Allen Mons");
  assert.equal(profile.sessions, 2);
  assert.deepEqual(profile.results.map(r => r.date), ["2026-10-01", "2026-09-30"]);
  assert.deepEqual(profile.results[1], { date: "2026-09-30", buyIn: 400, cashOut: 337, net: -63 });
  assert.deepEqual(profile.totals, { buyIn: 600, cashOut: 587, net: -13 });
  assert.equal(profile.averageNet, -6.5);
  assert.equal(profile.winRate, 50);
});

test("keeps supplied net values and selected game datasets separate", () => {
  const small = buildPlayerProfile([{ date: "2026-09-30", players: [row("Allen Mons", 20, 40)] }], "Allen Mons");
  const large = buildPlayerProfile([{ date: "2026-09-30", players: [row("Allen Mons", 300, 337, 35)] }], "Allen Mons");
  assert.equal(small.totals.net, 20);
  assert.equal(large.totals.net, 35);
  assert.equal(large.totals.buyIn, 300);
});

test("returns safe zero totals when a player has no sessions at these blinds", () => {
  const profile = buildPlayerProfile([{ date: "2026-09-30", players: [row("Other", 20, 40)] }], "Allen Mons");
  assert.equal(profile.sessions, 0);
  assert.equal(profile.averageNet, 0);
  assert.equal(profile.winRate, 0);
  assert.deepEqual(profile.results, []);
  assert.deepEqual(profile.totals, { buyIn: 0, cashOut: 0, net: 0 });
});

test("Player Stats matches profiles, counting unique sessions rather than entries", () => {
  const sessions = [
    { date: "2026-09-30", players: [row("Allen Mons", 300, 337), row("Allen Mons", 100, 0), row("Other", 20, 100)] },
    { date: "2026-10-01", players: [row("Allen Mons", 200, 250)] },
  ];
  const summaries = summarizePlayers(sessions);
  assert.equal(summaries[0].player, "Other");
  const summary = summaries.find(s => s.player === "Allen Mons");
  assert.equal(summary.sessions, 2);
  assert.equal(summary.avgNetPerSession, -6.5);
  const profile = buildPlayerProfile(sessions, "Allen Mons");
  assert.equal(summary.net, profile.totals.net);
  assert.equal(summary.totalBuyIn, profile.totals.buyIn);
  assert.equal(summary.totalCashOut, profile.totals.cashOut);
  assert.deepEqual(summarizePlayers([]), []);
});

test("Guest Lee URL params decode for both the heading and session lookup", () => {
  const player = resolvePlayerName("Guest%20Lee", ["Guest Lee"]);
  assert.equal(player, "Guest Lee");
  const profile = buildPlayerProfile([{ date: "2026-10-01", players: [row("Guest Lee", 100, 137)] }], player);
  assert.equal(profile.sessions, 1);
  assert.equal(profile.totals.net, 37);
  assert.equal(resolvePlayerName("Guest Lee"), "Guest Lee");
  assert.equal(resolvePlayerName("Guest%20Lee", ["Guest%20Lee"]), "Guest%20Lee");
  assert.equal(resolvePlayerName("Guest 50%"), "Guest 50%");
});
