import express from 'express';
import path from 'path';
import fs from 'fs';
import http from 'http';
import compression from 'compression';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

// Prevent crashes from uncaught errors or unhandled promise rejections
process.on('uncaughtException', (err) => {
  console.error('[Server UncaughtException]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Server UnhandledRejection]', reason);
});

function parsePort(): number {
  const portArgIdx = process.argv.findIndex((a) => a === '--port' || a === '-p');
  if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
    const val = parseInt(process.argv[portArgIdx + 1], 10);
    if (!isNaN(val) && val > 0) return val;
  }
  if (process.env.PORT) {
    const val = parseInt(process.env.PORT, 10);
    if (!isNaN(val) && val > 0) return val;
  }
  return 3000;
}

const app = express();
const PORT = parsePort();

// Enable high-speed text compression (Gzip / Deflate) to dramatically reduce initial server response time & payloads
app.use(compression({
  threshold: 512,
  level: 6,
}));

// Performance, CDN caching, and security headers
app.use((req, res, next) => {
  res.setHeader('Timing-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Vary', 'Accept-Encoding');
  next();
});

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const MONTHS_FILE = path.join(DATA_DIR, 'registered_months.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial registered months if not existing
const initialData = [
  {
    id: '2026-01',
    monthName: 'Januari',
    monthNumber: 1,
    year: 2026,
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1xlDAikoiZwATIiv08DY8GGsyNN-cQrS0psocFHUqT4M/edit?gid=808257444#gid=808257444',
    gid: '808257444',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2026-02',
    monthName: 'Februari',
    monthNumber: 2,
    year: 2026,
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1HxbUXLiXnaaSJDU_5tbCRcMs6iSRLkYyEg1BYSvft3M/edit?usp=sharing',
    gid: '0',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2026-03',
    monthName: 'Maret',
    monthNumber: 3,
    year: 2026,
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1LmOJ7MAPjaoMd7aJ2IGOneUAN-_0C4kmXk9OXL1ZGQk/edit?usp=sharing',
    gid: '0',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2026-04',
    monthName: 'April',
    monthNumber: 4,
    year: 2026,
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1Kqnef5aq4i0UsO3Y75IYqDMcDD-TmYh0TMpxIRawq4A/edit?usp=sharing',
    gid: '0',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2026-05',
    monthName: 'Mei',
    monthNumber: 5,
    year: 2026,
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1_WeRlHzzshSAlRwdVfoeNNx6xixfn6ArAd5S85LxnCg/edit?usp=sharing',
    gid: '0',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2026-06',
    monthName: 'Juni',
    monthNumber: 6,
    year: 2026,
    sheetUrl: 'https://docs.google.com/spreadsheets/d/17X-4C21GubSXnet2uI1XCtEtsbg1hQaWdPtw6SV63jI/edit?usp=sharing',
    gid: '0',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2026-07',
    monthName: 'Juli',
    monthNumber: 7,
    year: 2026,
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1-kWaoaNUqive7g09ddPwu7yD3JVrxyZOkXMtgcvSVEE/edit?usp=sharing',
    gid: '0',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2026-08',
    monthName: 'Agustus',
    monthNumber: 8,
    year: 2026,
    sheetUrl:
      'https://docs.google.com/spreadsheets/d/1lpiHvWrdj5eyTHqYzgkcWjz9ch-1YGoPXIK2CWwYoHk/edit?gid=0#gid=0',
    gid: '0',
    detailPendingGid: '',
    detailLkpbGid: '',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2026-09',
    monthName: 'September',
    monthNumber: 9,
    year: 2026,
    sheetUrl:
      'https://docs.google.com/spreadsheets/d/10yajj552DnuKf0-rroYqcdyET60WjTCe58PknW7L6Dw/edit?gid=808257444#gid=808257444',
    gid: '808257444',
    detailPendingGid: '216624293',
    detailLkpbGid: '200773994',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2026-10',
    monthName: 'Oktober',
    monthNumber: 10,
    year: 2026,
    sheetUrl:
      'https://docs.google.com/spreadsheets/d/1lVcO9SDDlelm0n65LdN2qNcdliCpfK230Nq19MnLGRM/edit?gid=808257444#gid=808257444',
    gid: '808257444',
    detailPendingGid: '216624293',
    detailLkpbGid: '200773994',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2026-11',
    monthName: 'November',
    monthNumber: 11,
    year: 2026,
    sheetUrl:
      'https://docs.google.com/spreadsheets/d/1HN4MlIUBsEP5tzpOfKFeNbQ2G7ldgaZu9_r9qOHm6pA/edit?gid=808257444#gid=808257444',
    gid: '808257444',
    detailPendingGid: '216624293',
    detailLkpbGid: '200773994',
    lastUpdated: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: '2025-02',
    monthName: 'Februari',
    monthNumber: 2,
    year: 2025,
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1-9UH4NQ6PLCZTK_CPIzZs9zhczd7gd_7Lv3xM6lgS_U/edit?usp=sharing',
    gid: '0',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2025-03',
    monthName: 'Maret',
    monthNumber: 3,
    year: 2025,
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1cPdvPr4LoBuhP-iQH1U4T_gBEeZwCXi0RL-MxWw7L90/edit?usp=sharing',
    gid: '0',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2025-04',
    monthName: 'April',
    monthNumber: 4,
    year: 2025,
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1o0vAn7RIPCumSVTJWG1uj-XEzO6il1BGiszbeRz1XfY/edit?usp=sharing',
    gid: '0',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2025-05',
    monthName: 'Mei',
    monthNumber: 5,
    year: 2025,
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1NgpuXCLRtedbGeBEHzLKdWRLVUJUnxKEBEfWi6RcV0M/edit?usp=sharing',
    gid: '0',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2025-06',
    monthName: 'Juni',
    monthNumber: 6,
    year: 2025,
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1_5QC55X9d3LveM-oxiRiuG5KqcFIcoc8qc0h6REXvCY/edit?usp=sharing',
    gid: '0',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2025-07',
    monthName: 'Juli',
    monthNumber: 7,
    year: 2025,
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1WVD4cqdAv_Ilt50YAisdgCZThwR17MvpoXQc9MzCrZ8/edit?usp=sharing',
    gid: '0',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2025-08',
    monthName: 'Agustus',
    monthNumber: 8,
    year: 2025,
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1XCoTq8K3SldrynHusCzEJ2qL92UBkJul-GH46kRu_C0/edit?usp=sharing',
    gid: '0',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2025-09',
    monthName: 'September',
    monthNumber: 9,
    year: 2025,
    sheetUrl: 'https://docs.google.com/spreadsheets/d/10n6zcZDWOQUN2B_OGG_JLzM5eGOKt0SeptsqwQbzwtU/edit?usp=sharing',
    gid: '0',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2025-10',
    monthName: 'Oktober',
    monthNumber: 10,
    year: 2025,
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1KFeqkE-qgOo3xLbzI0yliA02NgxOUKykm5IaavuyYNc/edit?usp=sharing',
    gid: '0',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2025-11',
    monthName: 'November',
    monthNumber: 11,
    year: 2025,
    sheetUrl:
      'https://docs.google.com/spreadsheets/d/1iittRJgYUBmE5-vVt_ycnyekzZ6siaxYRWwRhIlZMPQ/edit?gid=476175390#gid=476175390',
    gid: '1355304594',
    detailPendingGid: '476175390',
    detailLkpbGid: '2113562402',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
  {
    id: '2025-12',
    monthName: 'Desember',
    monthNumber: 12,
    year: 2025,
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1YRr98oEKTPz_pNo2Sbs3Op7YQdr8qvc1vNjJZSXCogw/edit?usp=sharing',
    gid: '0',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
  },
];

if (!fs.existsSync(MONTHS_FILE)) {
  fs.writeFileSync(MONTHS_FILE, JSON.stringify(initialData, null, 2));
} else {
  try {
    const existing = JSON.parse(fs.readFileSync(MONTHS_FILE, 'utf-8'));
    if (Array.isArray(existing)) {
      let changed = false;
      const nov26 = existing.find((m: any) => m.id === '2026-11');
      if (!nov26) {
        existing.unshift({
          id: '2026-11',
          monthName: 'November',
          monthNumber: 11,
          year: 2026,
          sheetUrl:
            'https://docs.google.com/spreadsheets/d/1HN4MlIUBsEP5tzpOfKFeNbQ2G7ldgaZu9_r9qOHm6pA/edit?gid=808257444#gid=808257444',
          gid: '808257444',
          detailPendingGid: '216624293',
          detailLkpbGid: '200773994',
          lastUpdated: new Date().toISOString(),
          isDefault: true,
        });
        existing.forEach((m: any) => {
          if (m.id !== '2026-11') m.isDefault = false;
        });
        changed = true;
      }

      const nov = existing.find((m: any) => m.id === '2025-11');
      if (nov && (!nov.gid || nov.gid === '0' || (nov.sheetUrl && nov.sheetUrl.includes('1jMnR44bhTr2uf5s_S01hHZrro0drS7IR9sgi5DHE7Lo')))) {
        nov.sheetUrl =
          'https://docs.google.com/spreadsheets/d/1iittRJgYUBmE5-vVt_ycnyekzZ6siaxYRWwRhIlZMPQ/edit?gid=476175390#gid=476175390';
        nov.gid = '1355304594';
        nov.detailPendingGid = '476175390';
        nov.detailLkpbGid = '2113562402';
        nov.lastUpdated = new Date().toISOString();
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(MONTHS_FILE, JSON.stringify(existing, null, 2));
      }
    }
  } catch (e) {
    console.warn('Error verifying registered months startup config:', e);
  }
}

// --- REAL-TIME WEBSOCKET & LIVE SYNC ENGINE ---
interface DoStatusEntry {
  noDo: string;
  status: string;
  sheetName: string;
  dateStr?: string;
  team?: string;
  reason?: string;
  lastUpdated: string;
}

interface StatusChangeNotification {
  id: string;
  timestamp: string;
  noDo: string;
  oldStatus: string;
  newStatus: string;
  sheetName: string;
  customerName?: string;
  teamName?: string;
  dateStr?: string;
}

interface UnlistedPendingDo {
  id: string;
  sheetName: string;
  tanggal: string;
  dayNumber: number;
  noDo: string;
  customerName?: string;
  teamName?: string;
  status: string;
  reason?: string;
  detectedAt: string;
}

// In-memory state tracking
const knownDoMap = new Map<string, DoStatusEntry>();
const recentChangeNotifications: StatusChangeNotification[] = [];
let latestUnlistedPendingList: UnlistedPendingDo[] = [];
let lastLivePollTime: string = new Date().toISOString();
let isLivePolling = false;

// Strict validator for Pool Singkawang DO Numbers
function isValidDoNumber(raw: string): boolean {
  if (!raw) return false;
  const clean = raw.trim();
  if (clean.length < 5 || clean.length > 32) return false;
  if (clean.includes('%') || clean.includes('#') || clean.includes('<') || clean.includes('{')) return false;
  if (/^\d+$/.test(clean)) return false;
  if (/\b(Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)\b/i.test(clean)) return false;

  const upper = clean.toUpperCase();
  if (
    upper.includes('TOTAL') ||
    upper.includes('SUMMARY') ||
    upper.includes('AVERAGE') ||
    upper.includes('PRODUKTIVITY') ||
    upper.includes('REKAP') ||
    upper.includes('WEEK') ||
    upper.startsWith('NO.') ||
    upper === 'NO' ||
    upper === 'NO DO' ||
    upper === 'NO. DO' ||
    upper === 'STATUS'
  ) {
    return false;
  }

  const hasLetter = /[A-Za-z]/.test(clean);
  const hasDigit = /[0-9]/.test(clean);
  const hasDelimiter = clean.includes('.') || clean.includes('-') || clean.includes('/');
  return hasLetter && hasDigit && (hasDelimiter || clean.length >= 8);
}

// Standard non-pending statuses: Open, Finish, Close, LKPB, Cancel
const NON_PENDING_STATUSES = new Set(['OPEN', 'FINISH', 'CLOSE', 'LKPB', 'CANCEL']);

function isPendingStatus(status: string): boolean {
  if (!status || status.trim() === '' || status.trim() === '-') return false;
  const upper = status.trim().toUpperCase();
  if (/^\d+$/.test(upper) || upper.includes('%') || upper.length > 30) return false;
  if (/\b(Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)\b/i.test(upper)) return false;
  return !NON_PENDING_STATUSES.has(upper);
}

// Simple RFC 4180 CSV parser for backend
function parseCSVServer(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.length > 0 && currentRow.some((c) => c !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else if (char !== '\r') {
        currentField += char;
      }
    }
  }

  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((c) => c !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// In-memory short TTL cache to avoid hammering Google Sheets and make repeated/parallel calls instantaneous
const csvCache = new Map<string, { csv: string; cachedAt: number }>();
const CSV_CACHE_TTL_MS = 30000; // 30 seconds TTL (fast responses, bypassed when force=true)

// Function to fetch any sheet tab by name or gid with high speed & timeouts
async function fetchSheetCsv(
  sheetId: string, 
  tabIdentifier: { sheetName?: string; gid?: string },
  forceBypassCache = false
): Promise<string> {
  const cacheKey = `${sheetId}:${tabIdentifier.sheetName || ''}:${tabIdentifier.gid || '0'}`;
  const now = Date.now();

  if (!forceBypassCache && csvCache.has(cacheKey)) {
    const entry = csvCache.get(cacheKey)!;
    if (now - entry.cachedAt < CSV_CACHE_TTL_MS && entry.csv.length > 30) {
      return entry.csv;
    }
  }

  const cacheBuster = now;
  const timeoutMs = 4500;

  // 1. Direct CSV export for GID (Significantly faster and more reliable than gviz)
  if (tabIdentifier.gid !== undefined && tabIdentifier.gid !== '') {
    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${encodeURIComponent(tabIdentifier.gid)}&_t=${cacheBuster}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(exportUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Cache-Control': 'no-cache, no-store, max-age=0',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 30 && !text.includes('<!DOCTYPE html>')) {
          csvCache.set(cacheKey, { csv: text, cachedAt: now });
          return text;
        }
      }
    } catch {
      // fallback to gviz
    }
  }

  // 2. GViz endpoint (best for named sheets like "tgl 15" or fallback)
  const param = tabIdentifier.sheetName
    ? `sheet=${encodeURIComponent(tabIdentifier.sheetName)}`
    : `gid=${encodeURIComponent(tabIdentifier.gid || '0')}`;
  const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&${param}&_t=${cacheBuster}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(gvizUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cache-Control': 'no-cache, no-store, max-age=0',
        'Pragma': 'no-cache',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    // 3. Fallback: direct CSV export without gid parameter (returns the first tab automatically)
    const noGidExportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&_t=${cacheBuster}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(noGidExportUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Cache-Control': 'no-cache, no-store, max-age=0',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 30 && !text.includes('<!DOCTYPE html>')) {
          csvCache.set(cacheKey, { csv: text, cachedAt: now });
          return text;
        }
      }
    } catch {}
  } catch (e) {
    // silently catch timeout or network issues
  }

  return '';
}

// API Health
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    livePollActive: !isLivePolling,
    unlistedPendingCount: latestUnlistedPendingList.length,
    recentNotificationsCount: recentChangeNotifications.length,
  });
});

// GET Live status & audit details
app.get('/api/live-status', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    lastPollTime: lastLivePollTime,
    trackedDoCount: knownDoMap.size,
    unlistedPendingCount: latestUnlistedPendingList.length,
    unlistedPendingList: latestUnlistedPendingList,
    recentNotifications: recentChangeNotifications.slice(-20).reverse(),
  });
});

// GET Audit Pending discrepancy
app.get('/api/audit-pending', async (req, res) => {
  try {
    await runLiveSpreadsheetPoll(true);
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      unlistedPendingCount: latestUnlistedPendingList.length,
      unlistedPendingList: latestUnlistedPendingList,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST test / simulate status update to verify live toast notification
app.post('/api/test-simulate-update', (req, res) => {
  const { noDo, oldStatus, newStatus, sheetName } = req.body;
  const simulated: StatusChangeNotification = {
    id: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    noDo: noDo || '5A.XH.000058',
    oldStatus: oldStatus || 'Finish',
    newStatus: newStatus || 'Brg (Pending)',
    sheetName: sheetName || 'tgl 15',
    teamName: 'Project Team',
  };

  recentChangeNotifications.push(simulated);
  broadcastToAll({
    type: 'STATUS_CHANGED',
    notification: simulated,
  });

  res.json({ success: true, simulated });
});

// Proxy route to fetch Google Sheet CSV without CORS restrictions
app.get('/api/fetch-sheet', async (req, res) => {
  try {
    const rawUrl = req.query.url as string;
    const customGid = req.query.gid as string;
    const customSheet = req.query.sheet as string;

    if (!rawUrl) {
      return res.status(400).json({ error: 'URL Google Spreadsheet diperlukan' });
    }

    const idMatch = rawUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const sheetId = idMatch ? idMatch[1] : rawUrl;

    let param = '';
    if (customSheet) {
      param = `sheet=${encodeURIComponent(customSheet)}`;
    } else {
      let gid = customGid || '0';
      if (!customGid) {
        const gidParamMatch = rawUrl.match(/[?&]gid=([0-9]+)/);
        const gidHashMatch = rawUrl.match(/#gid=([0-9]+)/);
        if (gidParamMatch) gid = gidParamMatch[1];
        else if (gidHashMatch) gid = gidHashMatch[1];
      }
      param = `gid=${encodeURIComponent(gid)}`;
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const cacheBuster = Date.now();
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&${param}&_t=${cacheBuster}`;

    const response = await fetch(csvUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cache-Control': 'no-cache, no-store, max-age=0',
      },
    });

    if (!response.ok) {
      const fallbackUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&${param}&_t=${cacheBuster}`;
      const fallbackResponse = await fetch(fallbackUrl);
      if (!fallbackResponse.ok) {
        return res.status(fallbackResponse.status).json({
          error: `Gagal mengambil spreadsheet: status ${fallbackResponse.status}`,
        });
      }
      const csvData = await fallbackResponse.text();
      return res.json({ csv: csvData, source: fallbackUrl, sheetId, timestamp: cacheBuster });
    }

    const csvData = await response.text();
    return res.json({ csv: csvData, source: csvUrl, sheetId, timestamp: cacheBuster });
  } catch (error: any) {
    console.error('[GoogleSheet Proxy Error]:', error);
    return res.status(500).json({
      error: error.message || 'Terjadi kesalahan saat memproses spreadsheet',
    });
  }
});

// Helper functions to identify sheet tab contents
function isCentralizeTable(csv: string): boolean {
  if (!csv || csv.length < 50) return false;
  const lower = csv.toLowerCase();
  // Centralize recap table has Centralized or (Pool Name and Tanggal / Total Jalur)
  const hasCentralKeywords =
    lower.includes('centralized') ||
    (lower.includes('pool name') && (lower.includes('tanggal') || lower.includes('achv'))) ||
    (lower.includes('total jalur') && lower.includes('bobot masuk'));
  // Daily sheets (tgl 1..31) have 'summary detail jalur' or 'rating' or 'reason pending'
  const isDailySheet = lower.includes('summary detail jalur') || lower.includes('reason pending');
  return hasCentralKeywords && !isDailySheet;
}

function isPendingTable(csv: string): boolean {
  if (!csv || csv.length < 50) return false;
  const lower = csv.toLowerCase();
  return (
    lower.includes('detail pending') ||
    (lower.includes('no do') && lower.includes('nama customer') && lower.includes('status'))
  );
}

function isLkpbTable(csv: string): boolean {
  if (!csv || csv.length < 50) return false;
  const lower = csv.toLowerCase();
  return lower.includes('lkpb') || (lower.includes('no do') && lower.includes('cacat'));
}

async function fetchSmartCentralize(sheetId: string, customGid?: string, force = false): Promise<string> {
  // 1. If customGid is provided and valid, try it first and return immediately if valid
  if (customGid && customGid !== '0') {
    const csv = await fetchSheetCsv(sheetId, { gid: customGid }, force);
    if (csv && csv.length > 50) {
      return csv;
    }
  }

  // 2. Try known Centralize sheet names
  const candidateNames = ['Centralize', 'CENTRALIZE', 'Schedule Jalur', 'Schedule', 'Jalur', 'Sheet1'];
  for (const name of candidateNames) {
    const csv = await fetchSheetCsv(sheetId, { sheetName: name }, force);
    if (csv && csv.length > 50) return csv;
  }

  // 3. Try gid 0
  let csv = await fetchSheetCsv(sheetId, { gid: '0' }, force);
  if (csv && csv.length > 50) return csv;

  // 4. Try export without GID (direct default sheet)
  csv = await fetchSheetCsv(sheetId, {}, force);
  if (csv && csv.length > 50) return csv;

  // 5. If September sheet ID, try September default GID
  if (sheetId === '10yajj552DnuKf0-rroYqcdyET60WjTCe58PknW7L6Dw') {
    csv = await fetchSheetCsv(sheetId, { gid: '808257444' }, force);
    if (csv && csv.length > 50) return csv;
  }

  return customGid ? await fetchSheetCsv(sheetId, { gid: customGid }, force) : '';
}

async function fetchSmartPending(sheetId: string, customGid?: string, force = false): Promise<string> {
  // 1. Try customGid FIRST if provided!
  if (customGid && customGid.trim() !== '') {
    const csv = await fetchSheetCsv(sheetId, { gid: customGid }, force);
    if (csv && csv.length > 50) return csv;
  }

  // 2. If September default sheet ID, use September pending GID
  if (sheetId === '10yajj552DnuKf0-rroYqcdyET60WjTCe58PknW7L6Dw') {
    const csv = await fetchSheetCsv(sheetId, { gid: '216624293' }, force);
    if (csv && csv.length > 50) return csv;
  }

  // 3. Try candidate sheet names for Pendingan
  const candidateNames = ['Detail Pendingan', 'Detail Pending', 'Data Pendingan', 'Pendingan', 'Weekly Pending'];
  for (const name of candidateNames) {
    const csv = await fetchSheetCsv(sheetId, { sheetName: name }, force);
    if (csv && csv.length > 50) return csv;
  }

  return '';
}

async function fetchSmartLkpb(sheetId: string, customGid?: string, force = false): Promise<string> {
  // 1. Try customGid FIRST if provided!
  if (customGid && customGid.trim() !== '') {
    const csv = await fetchSheetCsv(sheetId, { gid: customGid }, force);
    if (csv && csv.length > 50) return csv;
  }

  // 2. If September default sheet ID, use September LKPB GID
  if (sheetId === '10yajj552DnuKf0-rroYqcdyET60WjTCe58PknW7L6Dw') {
    const csv = await fetchSheetCsv(sheetId, { gid: '200773994' }, force);
    if (csv && csv.length > 50) return csv;
  }

  // 3. Try candidate sheet names for LKPB
  const candidateNames = ['Detail LKPB', 'LKPB', 'Data LKPB'];
  for (const name of candidateNames) {
    const csv = await fetchSheetCsv(sheetId, { sheetName: name }, force);
    if (csv && csv.length > 50) return csv;
  }

  return '';
}

// GET complete dataset with multiple tabs in parallel (Centralize, Detail LKPB, Detail Pending, and Unlisted Pending Audit)
app.get('/api/fetch-full-dataset', async (req, res) => {
  try {
    const rawUrl = (req.query.url as string) || '';
    const centralGid = (req.query.centralGid as string) || '';
    const lkpbGid = (req.query.lkpbGid as string) || '';
    const pendingGid = (req.query.pendingGid as string) || '';
    const force = req.query.force === 'true' || req.query._force === 'true';

    if (!rawUrl) {
      return res.status(400).json({ error: 'Parameter URL spreadsheet diperlukan' });
    }

    const idMatch = rawUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const sheetId = idMatch ? idMatch[1] : rawUrl;
    const cacheBuster = Date.now();

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Smart multi-tab fetch: automatically resolves Centralize, Detail LKPB, and Detail Pendingan in parallel
    const [centralCsv, lkpbCsv, pendingCsv] = await Promise.all([
      fetchSmartCentralize(sheetId, centralGid, force),
      fetchSmartLkpb(sheetId, lkpbGid, force),
      fetchSmartPending(sheetId, pendingGid, force),
    ]);

    // Note: Live spreadsheet polling is handled independently via periodic intervals
    // to prevent cascading feedback loops and log flooding.

    return res.json({
      success: true,
      sheetId,
      centralCsv,
      lkpbCsv,
      pendingCsv,
      unlistedPendingDos: latestUnlistedPendingList,
      timestamp: cacheBuster,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Direct proxy sheet endpoint (used by TeamScheduleView and individual tabs)
app.get('/api/proxy-sheet', async (req, res) => {
  try {
    const sheetId = (req.query.sheetId as string) || '';
    const gid = (req.query.gid as string) || '0';
    const force = req.query.force === 'true';
    if (!sheetId) return res.status(400).json({ error: 'sheetId required' });
    const csv = await fetchSheetCsv(sheetId, { gid }, force);
    return res.json({ success: true, csv, gid, timestamp: Date.now() });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// Memory cache for individual summary & daily sheets per sheetId
const cachedIndividualSummaryBySheet = new Map<string, { data: any; timestamp: number }>();
let cachedIndividualSummaryData: any = null; // fallback reference
const INDIVIDUAL_SUMMARY_CACHE_TTL = 90000; // 90 seconds cache

// Helper to extract canceled DOs from daily sheet CSVs
function extractCanceledDosFromDays(validDays: Array<{ day: number; csv: string }>, defaultMonth: string = 'Sep', defaultYear: number = 2026): any[] {
  const canceledDos: any[] = [];
  for (const { day, csv } of validDays) {
    if (!csv) continue;
    const lines = csv.split('\n');
    let headerIdx = -1;
    let detectedMonth = defaultMonth;
    let detectedYear = defaultYear;

    for (let i = 0; i < Math.min(lines.length, 35); i++) {
      const l = lines[i].toUpperCase();
      if (l.includes('OKTOBER') || l.includes('OKT')) detectedMonth = 'Okt';
      else if (l.includes('SEPTEMBER') || l.includes('SEP')) detectedMonth = 'Sep';
      else if (l.includes('JANUARI') || l.includes('JAN')) detectedMonth = 'Jan';
      else if (l.includes('AGUSTUS') || l.includes('AGU')) detectedMonth = 'Agu';

      if (lines[i].toUpperCase().includes('NAMA TEAM YANG JALUR')) {
        headerIdx = i;
        break;
      }
    }
    if (headerIdx === -1) continue;
    const dateStr = `${String(day).padStart(2, '0')} ${detectedMonth} ${detectedYear}`;
    for (let i = headerIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const parts = line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());
      if (parts.length < 6) continue;
      const noDo = parts[2];
      const team = parts[3];
      const bobotStr = (parts[4] || '0').replace(',', '.');
      const bobot = parseFloat(bobotStr) || 0;
      const status = (parts[5] || '').toUpperCase();
      const kategori = parts[1] || 'REGULER';
      const reason = parts[26] || parts[8] || 'Cancel Order';

      if (!noDo || noDo === '-' || noDo.toUpperCase().includes('TOTAL')) continue;
      if (status === 'CANCEL') {
        canceledDos.push({
          id: `cancel-${day}-${noDo}`,
          dayNumber: day,
          tanggal: dateStr,
          noDo,
          kategori,
          teamName: team || 'Pool Team',
          bobot,
          status: 'CANCEL',
          reason: reason || 'Cancel Order',
        });
      }
    }
  }
  canceledDos.sort((a, b) => b.dayNumber - a.dayNumber);
  return canceledDos;
}

// GET Summary Individu data from Google Sheets & daily sheets breakdown
app.get('/api/fetch-individual-summary', async (req, res) => {
  try {
    const rawUrl = (req.query.url as string) || '';
    const force = req.query.force === 'true';

    let sheetId = '10yajj552DnuKf0-rroYqcdyET60WjTCe58PknW7L6Dw';
    if (rawUrl) {
      const idMatch = rawUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (idMatch) sheetId = idMatch[1];
      else sheetId = rawUrl;
    }

    const now = Date.now();
    // Return cached data if valid for this specific sheetId and not force refresh
    const cachedEntry = cachedIndividualSummaryBySheet.get(sheetId);
    if (!force && cachedEntry && (now - cachedEntry.timestamp < INDIVIDUAL_SUMMARY_CACHE_TTL)) {
      return res.json({
        ...cachedEntry.data,
        source: 'server_cache',
      });
    }

    // 1. Fetch raw Summary Individu tab
    let summaryCsv = await fetchSheetCsv(sheetId, { sheetName: 'Summary Individu' }, force);
    if (!summaryCsv || summaryCsv.length < 50) {
      summaryCsv = await fetchSheetCsv(sheetId, { sheetName: 'summary individu' }, force);
    }

    // 2. Fetch daily sheets in controlled batches of 6 to prevent Google Sheets rate-limiting
    const activeDays = Array.from({ length: 31 }, (_, i) => i + 1);
    const dayResults: Array<{ day: number; csv: string }> = [];
    const BATCH_SIZE = 6;
    for (let i = 0; i < activeDays.length; i += BATCH_SIZE) {
      const chunk = activeDays.slice(i, i + BATCH_SIZE);
      const chunkResults = await Promise.all(
        chunk.map(async (day) => {
          const sheetName = `tgl ${day}`;
          const csv = await fetchSheetCsv(sheetId, { sheetName }, force);
          return { day, csv };
        })
      );
      dayResults.push(...chunkResults);
    }

    const validDays = dayResults.filter((d) => d.csv && d.csv.length > 100);

    // 3. Extract all cancelled DOs from the daily sheets
    const defaultMonth = sheetId === '1lVcO9SDDlelm0n65LdN2qNcdliCpfK230Nq19MnLGRM' ? 'Okt' : (sheetId === '1xlDAikoiZwATIiv08DY8GGsyNN-cQrS0psocFHUqT4M' ? 'Jan' : 'Sep');
    const canceledDos = extractCanceledDosFromDays(validDays, defaultMonth);

    const resultPayload = {
      success: true,
      sheetId,
      summaryCsv,
      validDaysCount: validDays.length,
      daysData: validDays,
      canceledDos,
      timestamp: Date.now(),
      source: 'live',
    };

    cachedIndividualSummaryData = resultPayload;
    cachedIndividualSummaryBySheet.set(sheetId, { data: resultPayload, timestamp: now });

    return res.json(resultPayload);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET all canceled DOs extracted from daily sheets
app.get('/api/canceled-dos', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    if (!force && cachedIndividualSummaryData?.canceledDos) {
      return res.json({
        success: true,
        count: cachedIndividualSummaryData.canceledDos.length,
        canceledDos: cachedIndividualSummaryData.canceledDos,
      });
    }

    // Trigger internal fetch to populate
    const sheetId = '10yajj552DnuKf0-rroYqcdyET60WjTCe58PknW7L6Dw';
    const activeDays = Array.from({ length: 26 }, (_, i) => i + 1);
    const dayResults: Array<{ day: number; csv: string }> = [];
    const BATCH_SIZE = 6;
    for (let i = 0; i < activeDays.length; i += BATCH_SIZE) {
      const chunk = activeDays.slice(i, i + BATCH_SIZE);
      const chunkResults = await Promise.all(
        chunk.map(async (day) => {
          const sheetName = `tgl ${day}`;
          const csv = await fetchSheetCsv(sheetId, { sheetName }, force);
          return { day, csv };
        })
      );
      dayResults.push(...chunkResults);
    }

    const validDays = dayResults.filter((d) => d.csv && d.csv.length > 100);
    const canceledDos = extractCanceledDosFromDays(validDays);
    return res.json({ success: true, count: canceledDos.length, canceledDos });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET registered months
app.get('/api/months', (req, res) => {
  try {
    let list: any[] = [];
    if (fs.existsSync(MONTHS_FILE)) {
      list = JSON.parse(fs.readFileSync(MONTHS_FILE, 'utf-8'));
    }
    if (!Array.isArray(list) || list.length === 0) {
      list = [...initialData];
      fs.writeFileSync(MONTHS_FILE, JSON.stringify(list, null, 2));
    } else {
      // Ensure default months (including September, August, and October) exist in the list
      const idSet = new Set(list.map((m: any) => m.id));
      let changed = false;
      for (const initMonth of initialData) {
        if (!idSet.has(initMonth.id)) {
          list.push(initMonth);
          changed = true;
        }
      }
      if (changed) {
        list.sort((a: any, b: any) => (a.id || '').localeCompare(b.id || ''));
        fs.writeFileSync(MONTHS_FILE, JSON.stringify(list, null, 2));
      }
    }
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// --- MULTI-CONTAINER CROSS-SYNC CONFIG & STATE ---
const PEER_SYNC_URL = (process.env.PEER_SYNC_URL || '').replace(/\/+$/, '');
const CURRENT_APP_URL = (process.env.APP_URL || '').replace(/\/+$/, '');
const APP_SEMVER_VERSION = '1.11.0';

let isSyncingWithPeer = false;
let lastPeerSyncTime = '';
let peerSyncStatus: 'synced' | 'syncing' | 'idle' | 'error' = 'idle';
let peerSyncMessage = 'Standalone mode (no peer URL)';
let peerSyncDetails = {
  peerUrl: PEER_SYNC_URL,
  syncedMonthsCount: 0,
  lastAttemptTime: '',
  lastSuccessTime: '',
  errorCount: 0,
};

/**
 * Bi-directional synchronization between containers (Development & Published Instance)
 */
async function syncWithPeerContainer(force = false): Promise<{ success: boolean; message: string }> {
  if (!PEER_SYNC_URL) {
    peerSyncStatus = 'idle';
    peerSyncMessage = 'Standalone mode (no peer URL)';
    return { success: true, message: peerSyncMessage };
  }

  // Prevent infinite loop if current instance is peer
  if (CURRENT_APP_URL && PEER_SYNC_URL && CURRENT_APP_URL === PEER_SYNC_URL) {
    peerSyncStatus = 'synced';
    peerSyncMessage = 'Kontainer ini adalah primary endpoint';
    return { success: true, message: peerSyncMessage };
  }

  if (isSyncingWithPeer && !force) {
    return { success: false, message: 'Sinkronisasi antar-kontainer sedang berlangsung' };
  }

  // Throttle retrying failed peer connections to once every 60s in the background
  if (!force && peerSyncStatus === 'error') {
    const lastAttempt = new Date(peerSyncDetails.lastAttemptTime || 0).getTime();
    if (Date.now() - lastAttempt < 60000) {
      return { success: false, message: peerSyncMessage };
    }
  }

  isSyncingWithPeer = true;
  peerSyncStatus = 'syncing';
  peerSyncDetails.lastAttemptTime = new Date().toISOString();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${PEER_SYNC_URL}/api/months?_t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store',
        'X-Container-Sync-Source': CURRENT_APP_URL || 'ais-dev-container',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      peerSyncStatus = 'error';
      peerSyncDetails.errorCount++;
      peerSyncMessage = `Kontainer peer (${PEER_SYNC_URL}) merespon HTTP ${res.status}`;
      isSyncingWithPeer = false;
      return { success: false, message: peerSyncMessage };
    }

    const peerMonths = await res.json();
    if (!Array.isArray(peerMonths)) {
      peerSyncStatus = 'error';
      peerSyncDetails.errorCount++;
      peerSyncMessage = 'Respon peer tidak berupa array bulan terdaftar';
      isSyncingWithPeer = false;
      return { success: false, message: peerSyncMessage };
    }

    // Read local months
    let localMonths: any[] = [];
    if (fs.existsSync(MONTHS_FILE)) {
      try {
        localMonths = JSON.parse(fs.readFileSync(MONTHS_FILE, 'utf-8'));
      } catch {
        localMonths = [];
      }
    }
    if (!Array.isArray(localMonths) || localMonths.length === 0) {
      localMonths = [...initialData];
    }

    // Bi-directional merging logic
    const mergedMap = new Map<string, any>();
    for (const pm of peerMonths) {
      if (pm && pm.id) mergedMap.set(pm.id, pm);
    }

    let localUpdated = false;
    let peerNeedsUpdate = false;

    for (const lm of localMonths) {
      if (!lm || !lm.id) continue;
      if (!mergedMap.has(lm.id)) {
        mergedMap.set(lm.id, lm);
        peerNeedsUpdate = true;
      } else {
        const existing = mergedMap.get(lm.id);
        const localTime = new Date(lm.lastUpdated || 0).getTime();
        const peerTime = new Date(existing.lastUpdated || 0).getTime();
        if (localTime > peerTime) {
          mergedMap.set(lm.id, lm);
          peerNeedsUpdate = true;
        } else if (peerTime > localTime) {
          localUpdated = true;
        }
      }
    }

    const localIdSet = new Set(localMonths.map((m) => m.id));
    for (const pm of peerMonths) {
      if (pm && pm.id && !localIdSet.has(pm.id)) {
        localUpdated = true;
      }
    }

    const finalList = Array.from(mergedMap.values());

    // Write to local database file if changed
    if (localUpdated || localMonths.length !== finalList.length) {
      fs.writeFileSync(MONTHS_FILE, JSON.stringify(finalList, null, 2));
      console.log(`[CrossContainerSync] Local database updated from peer (${finalList.length} bulan)`);
    }

    // Push to peer if peer is missing months
    if (peerNeedsUpdate || peerMonths.length < finalList.length) {
      try {
        const pushCtrl = new AbortController();
        const pushTimer = setTimeout(() => pushCtrl.abort(), 6000);
        await fetch(`${PEER_SYNC_URL}/api/months`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Container-Sync-Source': CURRENT_APP_URL || 'ais-dev-container',
          },
          body: JSON.stringify(finalList),
          signal: pushCtrl.signal,
        });
        clearTimeout(pushTimer);
        console.log(`[CrossContainerSync] Replicated ${finalList.length} months to peer ${PEER_SYNC_URL}`);
      } catch (pushErr: any) {
        console.warn(`[CrossContainerSync] Replicate to peer warning:`, pushErr.message);
      }
    }

    lastPeerSyncTime = new Date().toISOString();
    peerSyncStatus = 'synced';
    peerSyncDetails.lastSuccessTime = lastPeerSyncTime;
    peerSyncDetails.syncedMonthsCount = finalList.length;
    peerSyncMessage = `Terhubung & sinkron dengan ${PEER_SYNC_URL} (${finalList.length} periode terdata)`;
    isSyncingWithPeer = false;

    // Broadcast sync status via WebSocket
    broadcastToAll({
      type: 'CONTAINER_SYNC_STATUS',
      status: peerSyncStatus,
      lastSyncTime: lastPeerSyncTime,
      peerUrl: PEER_SYNC_URL,
      monthsCount: finalList.length,
      version: APP_SEMVER_VERSION,
    });

    return { success: true, message: peerSyncMessage };
  } catch (err: any) {
    peerSyncStatus = 'error';
    peerSyncDetails.errorCount++;
    peerSyncMessage = `Koneksi ke ${PEER_SYNC_URL} gagal: ${err.message || 'Timeout'}`;
    isSyncingWithPeer = false;
    return { success: false, message: peerSyncMessage };
  }
}

// POST save/update registered months list
app.post('/api/months', async (req, res) => {
  try {
    const list = req.body;
    if (!Array.isArray(list)) {
      return res.status(400).json({ error: 'Body harus berupa array' });
    }
    fs.writeFileSync(MONTHS_FILE, JSON.stringify(list, null, 2));

    // Asynchronously replicate changes to peer container
    const syncSource = req.headers['x-container-sync-source'];
    if (!syncSource && PEER_SYNC_URL && PEER_SYNC_URL !== CURRENT_APP_URL) {
      fetch(`${PEER_SYNC_URL}/api/months`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Container-Sync-Source': CURRENT_APP_URL || 'ais-dev-container',
        },
        body: JSON.stringify(list),
      }).catch((e) => console.warn('[POST /api/months] Replicate to peer warning:', e.message));
    }

    return res.json({ success: true, count: list.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET Container Sync Status
app.get('/api/container-sync-status', (req, res) => {
  return res.json({
    status: peerSyncStatus,
    peerUrl: PEER_SYNC_URL,
    currentAppUrl: CURRENT_APP_URL,
    lastSyncTime: lastPeerSyncTime,
    message: peerSyncMessage,
    version: APP_SEMVER_VERSION,
    details: peerSyncDetails,
  });
});

// POST Trigger Container Sync Now
app.post('/api/container-sync-trigger', async (req, res) => {
  const result = await syncWithPeerContainer(true);
  return res.json({
    ...result,
    status: peerSyncStatus,
    lastSyncTime: lastPeerSyncTime,
    peerUrl: PEER_SYNC_URL,
    version: APP_SEMVER_VERSION,
  });
});

// GET Semantic Versioning Info
app.get('/api/version', (req, res) => {
  return res.json({
    version: APP_SEMVER_VERSION,
    appName: 'Monitoring DO Pool Singkawang',
    releaseDate: '16 Sep 2026',
    peerSyncStatus,
    lastPeerSyncTime,
    peerUrl: PEER_SYNC_URL,
  });
});

// POST Export to Google Slides via Google Drive API (RFC 2387 multipart/related)
app.post('/api/export/google-slides', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token otentikasi Google diperlukan. Silakan masuk dengan akun Google terlebih dahulu.',
      });
    }

    const { filename, pptxBase64 } = req.body;
    if (!pptxBase64) {
      return res.status(400).json({
        success: false,
        error: 'Data file presentasi (pptxBase64) tidak boleh kosong.',
      });
    }

    const cleanFilename = (filename || 'Laporan_Analytic_Pool_Singkawang')
      .replace(/[\\/:*?"<>|]/g, '_')
      .trim();

    const fileBuffer = Buffer.from(pptxBase64, 'base64');

    // Helper to upload via Drive API v3 multipart/related without CORS limits
    async function uploadMultipart(targetMimeType: string, targetName: string) {
      const boundary = '-------GoogleSlidesExportServerBoundary' + Date.now();
      const metadata = JSON.stringify({
        name: targetName,
        mimeType: targetMimeType,
      });

      const part1 = Buffer.from(
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`
      );
      const part2Header = Buffer.from(
        `--${boundary}\r\nContent-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation\r\n\r\n`
      );
      const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
      const requestBody = Buffer.concat([part1, part2Header, fileBuffer, footer]);

      const driveRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
        {
          method: 'POST',
          headers: {
            Authorization: authHeader!,
            'Content-Type': `multipart/related; boundary=${boundary}`,
            'Content-Length': String(requestBody.length),
          },
          body: requestBody,
        }
      );

      return driveRes;
    }

    // 1. First attempt: Convert into native Google Slides presentation
    let driveResponse = await uploadMultipart(
      'application/vnd.google-apps.presentation',
      `${cleanFilename} - Google Slides`
    );

    // If conversion fails (e.g. 400 or conversion issue), fallback to standard PPTX in Drive
    if (!driveResponse.ok) {
      const errText = await driveResponse.text().catch(() => '');
      console.warn(`[Google Slides Export] Conversion attempt returned ${driveResponse.status}:`, errText);

      driveResponse = await uploadMultipart(
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        `${cleanFilename}.pptx`
      );
    }

    if (!driveResponse.ok) {
      const errorJson = (await driveResponse.json().catch(() => ({}))) as any;
      const message =
        errorJson.error?.message || driveResponse.statusText || 'Gagal menyimpan ke Google Drive';
      return res.status(driveResponse.status).json({
        success: false,
        error: `Gagal membuat presentasi Google Slides (${driveResponse.status}): ${message}`,
      });
    }

    const driveData = (await driveResponse.json()) as any;
    const presentationId = driveData.id;
    const webViewLink =
      driveData.webViewLink || `https://docs.google.com/presentation/d/${presentationId}/edit`;

    return res.json({
      success: true,
      presentationId,
      webViewLink,
      title: driveData.name || `${cleanFilename} - Google Slides`,
    });
  } catch (err: any) {
    console.error('[Google Slides Export] Unexpected error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Terjadi kesalahan internal saat membuat presentasi.',
    });
  }
});

// --- WEBSOCKET SERVER & BROADCASTER ---
const connectedClients = new Set<WebSocket>();

function broadcastToAll(message: any) {
  const payload = JSON.stringify(message);
  for (const client of connectedClients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
      } catch (err) {
        console.warn('Failed to send WS message:', err);
      }
    }
  }
}

// Background Live Scanner & Discrepancy Auditor
async function runLiveSpreadsheetPoll(forceBroadcast = false) {
  if (isLivePolling) return;
  isLivePolling = true;

  try {
    let sheetUrl = 'https://docs.google.com/spreadsheets/d/1HN4MlIUBsEP5tzpOfKFeNbQ2G7ldgaZu9_r9qOHm6pA/edit?gid=808257444#gid=808257444';
    let currentMonthName = 'Nov';
    let currentYear = 2026;
    if (fs.existsSync(MONTHS_FILE)) {
      try {
        const months = JSON.parse(fs.readFileSync(MONTHS_FILE, 'utf-8'));
        if (Array.isArray(months) && months.length > 0) {
          const activeMonth = months.find((m: any) => m.isDefault) || months[0];
          if (activeMonth?.sheetUrl) sheetUrl = activeMonth.sheetUrl;
          if (activeMonth?.monthName) currentMonthName = activeMonth.monthName.slice(0, 3);
          if (activeMonth?.year) currentYear = activeMonth.year;
        }
      } catch {
        // use default
      }
    }

    const idMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const sheetId = idMatch ? idMatch[1] : '1HN4MlIUBsEP5tzpOfKFeNbQ2G7ldgaZu9_r9qOHm6pA';

    // 1. Fetch Detail Pendingan to extract known registered pending DOs
    const pendingCsv = await fetchSheetCsv(sheetId, { sheetName: 'Detail Pendingan' });
    const knownPendingDoSet = new Set<string>();

    if (pendingCsv) {
      const pRows = parseCSVServer(pendingCsv);
      for (const row of pRows) {
        const doVal = (row[1] || '').trim();
        if (doVal && isValidDoNumber(doVal)) {
          const normalized = doVal.toUpperCase().replace(/\s+/g, '');
          knownPendingDoSet.add(normalized);
          // Also record in status map
          const statusVal = (row[5] || 'OPEN').trim();
          updateAndDetectChange(doVal, statusVal, 'Detail Pendingan');
        }
      }
    }

    // 2. Fetch Detail LKPB to track status changes in LKPB
    const lkpbCsv = await fetchSheetCsv(sheetId, { sheetName: 'Detail LKPB' });
    if (lkpbCsv) {
      const lkpbRows = parseCSVServer(lkpbCsv);
      for (const row of lkpbRows) {
        const doVal = (row[1] || '').trim();
        const statusVal = (row[6] || 'OPEN').trim();
        if (doVal && isValidDoNumber(doVal)) {
          updateAndDetectChange(doVal, statusVal, 'Detail LKPB');
        }
      }
    }

    // 3. Scan active Date Sheets in parallel
    // Dynamically scan the active days of the current month
    const unlistedPendingList: UnlistedPendingDo[] = [];
    const now = new Date();
    const todayDay = now.getDate();
    const activeDaysToScan = [
      Math.max(1, todayDay - 2),
      Math.max(1, todayDay - 1),
      Math.max(1, todayDay),
    ].filter((v, i, a) => a.indexOf(v) === i);

    const dayResults = await Promise.all(
      activeDaysToScan.map(async (day) => {
        const sheetName = `tgl ${day}`;
        const dayCsv = await fetchSheetCsv(sheetId, { sheetName });
        return { day, sheetName, dayCsv };
      })
    );

    for (const { day, sheetName, dayCsv } of dayResults) {
      if (!dayCsv) continue;

      const rows = parseCSVServer(dayCsv);
      let headerIdx = -1;
      let colNoIdx = 0;
      let colDoIdx = 2;
      let colTeamIdx = 3;
      let colStatusIdx = 5;
      let colReasonIdx = 8;

      for (let i = 0; i < Math.min(rows.length, 30); i++) {
        const row = rows[i];
        const rowStr = row.join(' ').toUpperCase();
        if (rowStr.includes('NO. DO') || rowStr.includes('NO DO') || (rowStr.includes('NO.') && rowStr.includes('STATUS'))) {
          headerIdx = i;
          for (let c = 0; c < row.length; c++) {
            const h = (row[c] || '').trim().toUpperCase();
            if (h.includes('NO. DO') || h.includes('NO DO')) colDoIdx = c;
            else if (h === 'NO.' || h === 'NO') colNoIdx = c;
            else if (h.includes('TEAM') || h.includes('NAMA TEAM')) colTeamIdx = c;
            else if (h === 'STATUS') colStatusIdx = c;
            else if (h.includes('ALASAN') || h.includes('KETERANGAN') || h.includes('REASON')) colReasonIdx = c;
          }
          break;
        }
      }

      const startIdx = headerIdx >= 0 ? headerIdx + 1 : 22;
      let consecutiveEmpty = 0;

      for (let i = startIdx; i < rows.length; i++) {
        const r = rows[i];
        if (!r || r.length < 3) {
          consecutiveEmpty++;
          if (consecutiveEmpty >= 2) break;
          continue;
        }

        const noDo = (r[colDoIdx] || '').trim();
        const team = (r[colTeamIdx] || '').trim();
        const status = (r[colStatusIdx] || '').trim();
        const reason = (r[colReasonIdx] || r[26] || r[8] || '').trim();

        const rowStr = r.join(' ').toUpperCase();
        if (rowStr.includes('TOTAL') || rowStr.includes('SUMMARY') || rowStr.includes('PRODUKTIVITY') || rowStr.includes('AVERAGE')) {
          break;
        }

        if (!noDo || !isValidDoNumber(noDo)) {
          consecutiveEmpty++;
          if (consecutiveEmpty >= 2) break;
          continue;
        }

        consecutiveEmpty = 0;

        // Detect status change in date sheet
        const normalizedDo = noDo.toUpperCase().replace(/\s+/g, '');
        const dateStr = `${String(day).padStart(2, '0')} ${currentMonthName} ${currentYear}`;
        updateAndDetectChange(noDo, status, sheetName, dateStr, team);

        // Check if status is Pending category
        // Requirement: selain status "Open, Finish, Close, LKPB, Cancel" adalah berkategori pending
        if (isPendingStatus(status)) {
          // Check if present in Detail Pendingan
          if (!knownPendingDoSet.has(normalizedDo)) {
            unlistedPendingList.push({
              id: `${sheetName}-${noDo}`,
              sheetName,
              tanggal: dateStr,
              dayNumber: day,
              noDo,
              teamName: team,
              status,
              reason,
              detectedAt: new Date().toISOString(),
            });
          }
        }
      }
    }

    // Check if unlisted pending list has changed or is newly discovered
    const previousUnlistedCount = latestUnlistedPendingList.length;
    latestUnlistedPendingList = unlistedPendingList;
    lastLivePollTime = new Date().toISOString();

    if (unlistedPendingList.length > 0 && (previousUnlistedCount !== unlistedPendingList.length || forceBroadcast)) {
      broadcastToAll({
        type: 'PENDING_AUDIT_WARNING',
        count: unlistedPendingList.length,
        unlistedPendingDos: unlistedPendingList,
        timestamp: lastLivePollTime,
      });
    }

    // Send general heartbeat / sync ping
    broadcastToAll({
      type: 'LIVE_HEARTBEAT',
      timestamp: lastLivePollTime,
      connectedClients: connectedClients.size,
      unlistedPendingCount: unlistedPendingList.length,
    });
  } catch (err) {
    console.error('[runLiveSpreadsheetPoll] Error:', err);
  } finally {
    isLivePolling = false;
  }
}

// Status change detector
function updateAndDetectChange(
  noDo: string,
  newStatus: string,
  sheetName: string,
  dateStr?: string,
  team?: string
) {
  if (!noDo || !newStatus || newStatus.length > 25 || newStatus.includes('<') || newStatus.includes('{')) return;
  const key = `${noDo.toUpperCase().replace(/\s+/g, '')}@${sheetName}`;
  const existing = knownDoMap.get(key);

  if (!existing) {
    // Initial record: store without emitting change
    knownDoMap.set(key, {
      noDo,
      status: newStatus,
      sheetName,
      dateStr,
      team,
      lastUpdated: new Date().toISOString(),
    });
    return;
  }

  // If status changed
  if (existing.status.trim().toUpperCase() !== newStatus.trim().toUpperCase()) {
    const oldStatus = existing.status;
    existing.status = newStatus;
    existing.lastUpdated = new Date().toISOString();
    knownDoMap.set(key, existing);

    const notification: StatusChangeNotification = {
      id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      noDo,
      oldStatus,
      newStatus,
      sheetName,
      teamName: team,
      dateStr,
    };

    recentChangeNotifications.push(notification);
    if (recentChangeNotifications.length > 50) {
      recentChangeNotifications.splice(0, recentChangeNotifications.length - 50);
    }

    // Broadcast toast alert event immediately to all clients!
    broadcastToAll({
      type: 'STATUS_CHANGED',
      notification,
    });
  }
}

// Vite middleware & Static Serving with HTTP Server + WebSocket Server
async function startServer() {
  const server = http.createServer(app);

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Server] Port ${PORT} is already in use. Retrying or shutting down cleanly.`);
    } else {
      console.error('[Server] HTTP server error:', err);
    }
  });

  // Initialize WebSocket server attached to the HTTP server
  const wss = new WebSocketServer({ server, path: '/ws/live' });

  wss.on('error', (err) => {
    console.error('[WebSocket] WSS error:', err);
  });

  wss.on('connection', (ws) => {
    connectedClients.add(ws);
    console.log(`[WebSocket] Client connected. Active clients: ${connectedClients.size}`);

    // Send initial status payload upon connection
    ws.send(
      JSON.stringify({
        type: 'INITIAL_CONNECTION',
        status: 'connected',
        timestamp: new Date().toISOString(),
        unlistedPendingCount: latestUnlistedPendingList.length,
        unlistedPendingDos: latestUnlistedPendingList,
        recentNotifications: recentChangeNotifications.slice(-10).reverse(),
        version: APP_SEMVER_VERSION,
        containerSync: {
          status: peerSyncStatus,
          lastSyncTime: lastPeerSyncTime,
          peerUrl: PEER_SYNC_URL,
        },
      })
    );

    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        if (data.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
        } else if (data.type === 'TRIGGER_POLL') {
          runLiveSpreadsheetPoll(true);
        } else if (data.type === 'TRIGGER_CONTAINER_SYNC') {
          syncWithPeerContainer(true).catch((e) => console.warn('Trigger container sync error:', e));
        }
      } catch {
        // ignore
      }
    });

    ws.on('close', () => {
      connectedClients.delete(ws);
      console.log(`[WebSocket] Client disconnected. Active clients: ${connectedClients.size}`);
    });

    ws.on('error', (err) => {
      console.warn('[WebSocket] Client error:', err);
      connectedClients.delete(ws);
    });
  });

  // Setup Vite / Static Serving
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (process.env.NODE_ENV === 'production' || hasDist) {
    console.log('[Server] Serving pre-compiled production build from dist/');

    const getFreshIndexHtml = () => {
      try {
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          return fs.readFileSync(indexPath, 'utf-8');
        }
      } catch (err) {
        console.warn('[Server] Error reading dist/index.html:', err);
      }
      return '';
    };

    app.get(['/', '/index.html'], (req, res) => {
      const htmlStr = getFreshIndexHtml();
      if (!htmlStr) {
        return res.status(404).send('Not Found');
      }
      res.setHeader('Timing-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.send(htmlStr);
    });

    // Long-term immutable caching for hashed production assets with CDN compliance headers
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true,
      etag: true,
      lastModified: true,
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('Timing-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Age', '86400');
      },
    }));

    app.use(express.static(distPath, {
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        }
      },
    }));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
        return next();
      }
      const htmlStr = getFreshIndexHtml();
      if (!htmlStr) {
        return res.status(404).send('Not Found');
      }
      res.setHeader('Timing-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.send(htmlStr);
    });
  } else {
    console.log('[Server] Mounting Vite dev middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // Periodic background polling every 30 seconds only if clients are active
  setInterval(() => {
    if (connectedClients.size > 0) {
      runLiveSpreadsheetPoll(false).catch(() => {});
    }
    if (PEER_SYNC_URL) {
      syncWithPeerContainer(false).catch(() => {});
    }
  }, 30000);

  // Initial poll and cross-container sync on server start
  setTimeout(() => {
    syncWithPeerContainer(false).catch((e) => console.warn('Initial cross-container sync error:', e));
    runLiveSpreadsheetPoll(false).catch((e) => console.warn('Initial startup poll error:', e));
  }, 2000);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server monitoring DO Pool Singkawang running at http://0.0.0.0:${PORT}`);
    console.log(`WebSocket Live server attached at ws://0.0.0.0:${PORT}/ws/live`);
  });
}

startServer();
