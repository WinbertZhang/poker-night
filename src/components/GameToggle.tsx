"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { GAMES, type Game } from "@/lib/games";
export default function GameToggle({ game }: { game: Game }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 flex flex-wrap items-center gap-3">
    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>Game</span>
    <div role="group" aria-label="Select poker game" className="flex gap-1 rounded-xl p-1" style={{ border: "1px solid var(--border)" }}>
      {(Object.keys(GAMES) as Game[]).map((value) => <button key={value} type="button" aria-pressed={game === value} disabled={pending}
        className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
        style={{ background: game === value ? "rgba(94,106,210,0.25)" : "transparent", color: game === value ? "#c7caff" : "var(--muted)" }}
        onClick={() => { document.cookie = `poker-game=${value}; Path=/; Max-Age=31536000; SameSite=Lax`; startTransition(() => router.refresh()); }}>
        {GAMES[value].label}
      </button>)}
    </div>
    {pending && <span role="status" className="text-xs" style={{ color: "var(--muted)" }}>Loading game...</span>}
  </div>;
}
