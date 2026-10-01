# Poker Nights

A personal poker tracker for home games. Track sessions, player stats, running nets, and trends. Built with Next.js and backed by Google Sheets.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8) ![Google Sheets](https://img.shields.io/badge/data-Google%20Sheets-34a853)

---

## Features

- **Home** — highlights, leaderboard, recent winners, latest session
- **All Sessions** — searchable session explorer with per-player breakdown
- **Trends** — cumulative net chart per player over time
- **Player Stats** — sortable all-time standings table
- **New Session** — form to log a session directly into Google Sheets

---

## Local Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
git clone <your-repo>
cd app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Local dev uses fake seed data from `data/sessions.csv` — no credentials needed. Edit that file freely to test with your own players.

---

## Connecting Google Sheets (Production)

All data lives in a single Google Sheet. The app reads and writes it directly.

### 1. Create a Google Cloud service account

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → create a new project
2. Search for **Google Sheets API** → Enable it
3. Go to **IAM & Admin → Service Accounts** → Create Service Account
4. Click the account → **Keys → Add Key → JSON** → download the file
5. Note the `client_email` and `private_key` values from the JSON

### 2. Create the Google Sheet

1. Create a new Google Sheet at [sheets.google.com](https://sheets.google.com)
2. Rename the first tab to exactly `sessions`
3. Paste this header in row 1:

```
Session Date | First Buy-in (PST) | Player | Buy-in | Cash-out | Net | # Buy-in txns | # Cash-out txns | Match | Note
```

4. Paste your historical session data below the header (or start fresh)
5. **Share** the sheet with your service account `client_email` as **Editor**
6. Copy the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit`

### 3. Configure environment variables

Create `app/.env.local`:

```bash
GOOGLE_SHEET_ID=your-sheet-id-here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

> The private key must be on a single line with literal `\n` between each line, wrapped in double quotes.

To test Sheets locally (instead of fake data):

```bash
FORCE_SHEETS=true
```

### 4. Deploy to Vercel

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com) — set the **Root Directory** to `app`
3. Add the same three env vars under **Settings → Environment Variables**
4. Deploy

The app will automatically re-fetch from Sheets on every page load (no stale cache).

---

## Adding a Session

1. Go to `/new-session` (or click **New Session** in the nav)
2. Set the date, enter each player's name, buy-in, and cash-out
3. Net is calculated automatically
4. Hit **Save Session** — the row is appended to the `sessions` sheet instantly
5. All pages reflect the new data on next load

Player names have autocomplete from historical players. **Load last session** pre-fills names from the most recent game.

---

## Importing Historical Data from Venmo

If your banker uses Venmo, the `archive/poker_sessions.py` script can parse Venmo CSV exports and reconstruct sessions automatically.

### How it works

Export your Venmo statements as CSV files, place them in `archive/`, then run:

```bash
cd archive
python3 poker_sessions.py
```

This generates `poker_sessions_output.csv` which you can paste into the `sessions` sheet.

### Configuration

Edit the constants at the top of `poker_sessions.py` to match your group:

| Constant | Purpose |
|---|---|
| `ME` | Your Venmo display name (the banker) |
| `EXCLUDE_PLAYERS` | Names that are never poker players (ignore their transactions) |
| `EXCLUDE_IDS` | Specific transaction IDs to drop (non-poker payments in the window) |
| `AMOUNT_OVERRIDES` | Fix transactions that bundled poker buy-ins with other charges |
| `ZELLE_BUYIN_PLAYERS` | Players who sometimes buy in via Zelle (suppresses false PAYOUT-ONLY flag) |

---

## Project Structure

```
app/
├── data/
│   └── sessions.csv        # Fake seed data for local dev
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── page.tsx        # Home
│   │   ├── sessions/       # All Sessions
│   │   ├── trends/         # Trends chart
│   │   ├── stats/          # Player Stats
│   │   ├── new-session/    # New Session form
│   │   └── api/sessions/   # POST endpoint (writes to Sheets or CSV)
│   ├── components/         # UI components
│   └── lib/
│       ├── data.ts         # Data access layer (CSV or Sheets)
│       ├── sheets.ts       # Google Sheets API client
│       └── types.ts        # TypeScript interfaces
archive/
├── poker_sessions.py       # Venmo CSV parser
└── data/                   # Real historical data (not committed)
```

---

## Customising

**Change the minimum sessions for "regulars"** (affects leaderboard and highlight cards):
In `src/lib/data.ts`, search for `sessions >= 5` and adjust the threshold.

**Add a player alias** (e.g. someone whose Venmo name differs from their preferred name):
In `archive/poker_sessions.py`, add to `PLAYER_ALIASES`:
```python
PLAYER_ALIASES = {
    "Full Venmo Name": "Nickname",
}
```
Then re-run the script and re-paste the output into Sheets.

**Update the Google Sheets link** in the nav:
In `src/components/Nav.tsx`, search for `https://google.com` and replace with your sheet URL.

## Game selection

Use the game toggle to switch between **$0.10 / $0.20** and **$1 / $1**.
The selection is remembered across navigation and filters Home, Sessions,
Trends, Player Stats, and New Session.

The existing game reads the `sessions` tab. The $1 / $1 game reads the
`1/3 sessions` tab in the same spreadsheet configured by `GOOGLE_SHEET_ID`.
For the supplied spreadsheet, set that ID to
`1URCn1xxzoqeYHHerS_Ij_zInNA1nPxmxxN3atjjAh4A`.
The new tab's columns must be:

```text
Session Date,Player,Buy-in,Cash-out,Net
9/30/2026,Allen Mons,$300.00,$337.00,$37.00
```

Dollar signs and thousands separators are supported (quote CSV amounts
containing commas). Dates such as `9/30/2026` are normalized for sorting.
New Session writes to the selected game's tab using its column format.

Without Sheets credentials, the new game uses `data/sessions-1-3.csv` if
present, otherwise the example row above. CSV files remain locally ignored.

## Player profiles

Click anywhere in a player's box on All Sessions or a Player Stats row to open their individual
profile under `/stats/[player]`. Profiles show session count, total buy-ins,
cash-outs, net, average net, winning session rate, and every session result
(newest first). The game toggle filters the profile to the selected blinds.
Multiple entries for a player on the same session date are combined into
one session result. `PlayerProfileLink` makes the entire player container clickable, using native links for session boxes
and mobile stats cards, and keyboard-accessible table rows on Player Stats.
URL-encoded names are decoded before displaying and looking up results.
