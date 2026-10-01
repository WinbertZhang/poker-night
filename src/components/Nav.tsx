"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GAMES, type Game } from "@/lib/games";

const links = [
  { href: "/",             label: "Home",     fullLabel: "Home",        icon: "♠" },
  { href: "/sessions",     label: "Sessions", fullLabel: "All Sessions", icon: "◈" },
  { href: "/trends",       label: "Trends",   fullLabel: "Trends",       icon: "↗" },
  { href: "/stats",        label: "Stats",    fullLabel: "Player Stats", icon: "⬡" },
  { href: "/new-session",  label: "New",      fullLabel: "New Session",  icon: "+" },
];

export default function Nav({ game }: { game: Game }) {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop top nav ── */}
      <nav
        className="hidden sm:block sticky top-0 z-50"
        style={{
          background: "rgba(5,5,6,0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0"
            style={{ textDecoration: "none" }}
          >
            <span
              className="text-base font-semibold"
              style={{ color: "var(--accent-blue)", lineHeight: 1 }}
            >
              ♠
            </span>
            <span
              className="text-sm font-semibold tracking-wide"
              style={{ color: "var(--foreground)", letterSpacing: "0.08em" }}
            >
              POKER NIGHTS
            </span>
          </Link>

          <div className="flex items-center gap-0.5 ml-2">
            {links.map(({ href, fullLabel }) => {
              const active = (pathname === href || (href === "/stats" && pathname.startsWith("/stats/")));
              const isNew = href === "/new-session";
              return (
                <Link
                  key={href}
                  href={href}
                  className="px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                  style={
                    isNew
                      ? {
                          background: "linear-gradient(135deg,rgba(94,106,210,0.5),rgba(168,85,247,0.4))",
                          color: "#e0e2ff",
                          border: "1px solid rgba(94,106,210,0.4)",
                          boxShadow: "0 0 14px rgba(94,106,210,0.2)",
                          marginLeft: "8px",
                        }
                      : {
                          background: active ? "rgba(94,106,210,0.18)" : "transparent",
                          color: active ? "#c7caff" : "var(--muted)",
                          border: active ? "1px solid rgba(94,106,210,0.28)" : "1px solid transparent",
                          boxShadow: active ? "0 0 12px rgba(94,106,210,0.12)" : "none",
                        }
                  }
                >
                  {fullLabel}
                </Link>
              );
            })}
          </div>

          {/* Sheets link — pushed to the right */}
          <a
            href={`https://docs.google.com/spreadsheets/d/1URCn1xxzoqeYHHerS_Ij_zInNA1nPxmxxN3atjjAh4A/edit#gid=${GAMES[game].gid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 shrink-0"
            style={{ color: "var(--muted)", border: "1px solid transparent" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--foreground)";
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--muted)";
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "transparent";
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
            Sheets
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <path d="M7 17L17 7M7 7h10v10"/>
            </svg>
          </a>
        </div>
      </nav>

      {/* ── Mobile top bar ── */}
      <div
        className="sm:hidden h-12 flex items-center px-5 sticky top-0 z-50"
        style={{
          background: "rgba(5,5,6,0.82)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <span style={{ color: "var(--accent-blue)", fontSize: "0.9rem" }}>♠</span>
          <span
            className="text-xs font-semibold tracking-widest"
            style={{ color: "var(--foreground)", letterSpacing: "0.12em" }}
          >
            POKER NIGHTS
          </span>
        </Link>
        <a
          href={`https://docs.google.com/spreadsheets/d/1URCn1xxzoqeYHHerS_Ij_zInNA1nPxmxxN3atjjAh4A/edit#gid=${GAMES[game].gid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center justify-center w-8 h-8 rounded-lg transition-all"
          style={{ color: "var(--muted)", border: "1px solid transparent" }}
          onTouchStart={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
          onTouchEnd={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
          </svg>
        </a>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex"
        style={{
          background: "rgba(5,5,6,0.90)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid var(--border)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {links.map(({ href, label, icon }) => {
          const active = (pathname === href || (href === "/stats" && pathname.startsWith("/stats/")));
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-medium transition-colors duration-200"
              style={{
                color: active ? "#c7caff" : "var(--muted)",
              }}
            >
              <span
                className="text-base leading-none"
                style={{
                  color: active ? "var(--accent-blue)" : "var(--muted)",
                  textShadow: active ? "0 0 12px var(--accent-glow)" : "none",
                  transition: "all 200ms ease",
                }}
              >
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer for bottom tab bar content clearance */}
    </>
  );
}
