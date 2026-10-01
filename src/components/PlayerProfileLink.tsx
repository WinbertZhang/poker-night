"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

type Props = { player: string; children: ReactNode; className?: string; style?: CSSProperties; as?: "row" };

// The link is the box itself, so padding, results, and empty space are clickable.
export default function PlayerProfileLink({ player, children, className = "", style, as }: Props) {
  const router = useRouter();
  const available = Boolean(player.trim()) && player !== "\u2014" && player !== "-";
  if (as === "row") return <tr className={`${className} player-profile-link`} style={{ ...style, display: "table-row" }}
    tabIndex={available ? 0 : undefined} aria-label={`View ${player}'s profile`}
    onClick={available ? () => router.push(`/stats/${encodeURIComponent(player)}`) : undefined}
    onKeyDown={available ? (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        router.push(`/stats/${encodeURIComponent(player)}`);
      }
    } : undefined}>{children}</tr>;
  if (!available) return <div className={className} style={style}>{children}</div>;
  return <Link href={`/stats/${encodeURIComponent(player)}`} className={`${className} player-profile-link`}
    style={{ ...style, display: "block" }} aria-label={`View ${player}'s profile`}>{children}</Link>;
}
