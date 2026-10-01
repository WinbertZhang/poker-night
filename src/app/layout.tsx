import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GameToggle from "@/components/GameToggle";
import { getSelectedGame } from "@/lib/selected-game";
import Nav from "@/components/Nav";
import AmbientBackground from "@/components/AmbientBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poker Nights",
  description: "Track your home poker game sessions, trends, and standings",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const game = await getSelectedGame();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <AmbientBackground />
        {/* All page content sits above the fixed background */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <Nav game={game} />
          <GameToggle game={game} />
          {/* pb-20 clears the mobile bottom tab bar */}
          <main className="min-h-screen pb-20 sm:pb-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
