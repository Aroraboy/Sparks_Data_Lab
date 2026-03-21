import { google } from 'googleapis';

const log = (msg) => console.log(`[${new Date().toISOString()}] [GoogleSheets] ${msg}`);

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback';

function getOAuthClient() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required');
  }
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

export function getAuthUrl(state) {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    state,
    prompt: 'consent',
  });
}

export async function getTokensFromCode(code) {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens;
}

export async function fetchSheetData(accessToken, spreadsheetId, range = 'Sheet1') {
  const client = getOAuthClient();
  client.setCredentials({ access_token: accessToken });

  const sheets = google.sheets({ version: 'v4', auth: client });

  log(`Fetching sheet: ${spreadsheetId}, range: ${range}`);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values || [];
  if (rows.length === 0) {
    log('Sheet is empty');
    return { headers: [], rows: [], total: 0 };
  }

  const headers = rows[0].map((h) => String(h).trim().toLowerCase().replace(/\s+/g, '_'));
  const dataRows = rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] !== undefined ? String(row[i]).trim() : null;
    });
    return obj;
  });

  log(`Fetched ${dataRows.length} rows with ${headers.length} columns`);
  return { headers, rows: dataRows, total: dataRows.length };
}

export function extractSpreadsheetId(url) {
  // Accepts URLs like:
  // https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
  // https://docs.google.com/spreadsheets/d/SPREADSHEET_ID
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}
