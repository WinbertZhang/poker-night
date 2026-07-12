import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID!;

function auth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function readSheet(range: string): Promise<string[][]> {
  const sheets = google.sheets({ version: "v4", auth: auth() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range,
  });
  return (res.data.values as string[][] | null) ?? [];
}

export async function appendRows(sheet: string, rows: (string | number)[][]): Promise<void> {
  const sheets = google.sheets({ version: "v4", auth: auth() });
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheet}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: rows },
  });
}
