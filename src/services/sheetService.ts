import { MonthlyDataset, CancelledDoItem } from '../types';
import { parseSpreadsheetData, parseDetailLkpb, parseDetailPending, extractGoogleSheetInfo } from '../utils/csvParser';
import { 
  DEFAULT_SEPTEMBER_DATASET, 
  DEFAULT_SEPTEMBER_RAW_CSV, 
  DEFAULT_SEPTEMBER_DETAIL_LKPB_CSV, 
  DEFAULT_SEPTEMBER_DETAIL_PENDING_CSV 
} from '../data/defaultSeptemberData';
import { DEFAULT_AUGUST_DATASET, DEFAULT_AUGUST_RAW_CSV } from '../data/defaultAugustData';
import { 
  DEFAULT_OCTOBER_DATASET, 
  DEFAULT_OCTOBER_RAW_CSV, 
  DEFAULT_OCTOBER_DETAIL_LKPB_CSV, 
  DEFAULT_OCTOBER_DETAIL_PENDING_CSV 
} from '../data/defaultOctoberData';
import {
  DEFAULT_NOVEMBER_2026_DATASET,
  DEFAULT_NOVEMBER_2026_RAW_CSV,
  DEFAULT_NOVEMBER_2026_DETAIL_LKPB_CSV,
  DEFAULT_NOVEMBER_2026_DETAIL_PENDING_CSV
} from '../data/defaultNovemberData';
import { DEFAULT_2025_DATASETS } from '../data/default2025Data';
import { DEFAULT_SEPTEMBER_CANCELED_DOS, DEFAULT_OCTOBER_CANCELED_DOS, getCanceledDosForDate } from '../data/defaultCanceledDos';

export interface RegisteredMonthConfig {
  id: string; // e.g. "2026-09"
  monthName: string;
  monthNumber: number;
  year: number;
  sheetUrl: string;
  gid: string;
  detailPendingGid?: string;
  detailLkpbGid?: string;
  lastUpdated: string;
  isDefault?: boolean;
}

const STORAGE_KEY_CONFIGS = 'pool_singkawang_registered_months';
const STORAGE_KEY_DATA_PREFIX = 'pool_singkawang_dataset_';

/**
 * Get all registered month configs
 */
export async function getRegisteredMonths(): Promise<RegisteredMonthConfig[]> {
  const defaultList: RegisteredMonthConfig[] = [
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

  // Helper to upgrade outdated cached or default month entries
  const upgradeOutdatedMonths = (items: RegisteredMonthConfig[]): RegisteredMonthConfig[] => {
    return items.map((item) => {
      if (
        item.id === '2025-11' &&
        (!item.gid || item.gid === '0' || (item.sheetUrl && item.sheetUrl.includes('1jMnR44bhTr2uf5s_S01hHZrro0drS7IR9sgi5DHE7Lo')))
      ) {
        return {
          ...item,
          sheetUrl:
            'https://docs.google.com/spreadsheets/d/1iittRJgYUBmE5-vVt_ycnyekzZ6siaxYRWwRhIlZMPQ/edit?gid=476175390#gid=476175390',
          gid: '1355304594',
          detailPendingGid: '476175390',
          detailLkpbGid: '2113562402',
          lastUpdated: new Date().toISOString(),
        };
      }
      return item;
    });
  };

  try {
    // 1. Try fetching from server backend database
    const res = await fetch(`/api/months?_t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const idSet = new Set(data.map((item: any) => item.id));
        const merged = upgradeOutdatedMonths([...data]);
        for (const def of defaultList) {
          if (!idSet.has(def.id)) {
            merged.push(def);
          }
        }
        localStorage.setItem(STORAGE_KEY_CONFIGS, JSON.stringify(merged));
        return merged;
      }
    }
  } catch (err) {
    console.warn('Could not fetch months from backend, checking localStorage:', err);
  }

  // 2. Check localStorage
  try {
    const cached = localStorage.getItem(STORAGE_KEY_CONFIGS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const idSet = new Set(parsed.map((item: any) => item.id));
        const merged = upgradeOutdatedMonths([...parsed]);
        for (const def of defaultList) {
          if (!idSet.has(def.id)) {
            merged.push(def);
          }
        }
        return merged;
      }
    }
  } catch (err) {
    console.error('Error reading localStorage:', err);
  }

  return defaultList;
}

/**
 * Save registered month configs to server and localStorage
 */
export async function saveRegisteredMonths(list: RegisteredMonthConfig[]): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIGS, JSON.stringify(list));
    await fetch('/api/months', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list),
    });
  } catch (err) {
    console.warn('Could not persist months to backend, saved in localStorage:', err);
  }
}

/**
 * Fetch and parse spreadsheet for a month with full live data for Centralize, Detail LKPB, and Detail Pending
 */
export async function fetchMonthDataset(
  config: RegisteredMonthConfig,
  forceRefresh = false
): Promise<MonthlyDataset> {
  const cacheKey = `${STORAGE_KEY_DATA_PREFIX}${config.id}`;
  const nowTime = Date.now();

  const isSep = config.id === '2026-09';
  const centralGid = config.gid || (isSep ? '808257444' : '');
  const lkpbGid = config.detailLkpbGid || (isSep ? '200773994' : '');
  const pendingGid = config.detailPendingGid || (isSep ? '216624293' : '');

  let centralCsv = '';
  let lkpbCsv = '';
  let pendingCsv = '';
  let unlistedPendingDos: import('../types').UnlistedPendingDo[] = [];

  // 1. Primary path: Call /api/fetch-full-dataset for zero-latency parallel live fetch
  try {
    const fullUrl = `/api/fetch-full-dataset?url=${encodeURIComponent(
      config.sheetUrl
    )}&centralGid=${encodeURIComponent(centralGid)}&lkpbGid=${encodeURIComponent(
      lkpbGid
    )}&pendingGid=${encodeURIComponent(pendingGid)}&_t=${nowTime}${forceRefresh ? '&force=true' : ''}`;

    const res = await fetch(fullUrl, {
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        centralCsv = json.centralCsv || '';
        lkpbCsv = json.lkpbCsv || '';
        pendingCsv = json.pendingCsv || '';
        if (Array.isArray(json.unlistedPendingDos)) {
          unlistedPendingDos = json.unlistedPendingDos;
        }
      }
    }
  } catch (err) {
    console.warn('Full dataset proxy fetch failed, attempting single fetch fallback...', err);
  }

  // 2. Secondary fallback: individual fetch if full-dataset failed
  if (!centralCsv) {
    try {
      const proxyUrl = `/api/fetch-sheet?url=${encodeURIComponent(
        config.sheetUrl
      )}&gid=${encodeURIComponent(centralGid)}&_t=${nowTime}`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const json = await res.json();
        if (json.csv) centralCsv = json.csv;
      }
    } catch (e) {
      console.warn('Single proxy fetch failed:', e);
    }
  }

  // 3. Fallback for default September, August & October if offline/blocked
  if (!centralCsv && config.id === '2026-09') {
    console.info('Using bundled fallback for September 2026 data');
    centralCsv = DEFAULT_SEPTEMBER_RAW_CSV;
  }
  if (!centralCsv && config.id === '2026-08') {
    console.info('Using bundled fallback for August 2026 data');
    centralCsv = DEFAULT_AUGUST_RAW_CSV;
  }
  if (!centralCsv && config.id === '2026-10') {
    console.info('Using bundled fallback for October 2026 data');
    centralCsv = DEFAULT_OCTOBER_RAW_CSV;
  }
  if (!centralCsv && config.id === '2026-11') {
    console.info('Using bundled fallback for November 2026 data');
    centralCsv = DEFAULT_NOVEMBER_2026_RAW_CSV;
  }
  if (!lkpbCsv && config.id === '2026-09') {
    lkpbCsv = DEFAULT_SEPTEMBER_DETAIL_LKPB_CSV;
  }
  if (!lkpbCsv && config.id === '2026-10') {
    lkpbCsv = DEFAULT_OCTOBER_DETAIL_LKPB_CSV;
  }
  if (!lkpbCsv && config.id === '2026-11') {
    lkpbCsv = DEFAULT_NOVEMBER_2026_DETAIL_LKPB_CSV;
  }
  if (!pendingCsv && config.id === '2026-09') {
    pendingCsv = DEFAULT_SEPTEMBER_DETAIL_PENDING_CSV;
  }
  if (!pendingCsv && config.id === '2026-10') {
    pendingCsv = DEFAULT_OCTOBER_DETAIL_PENDING_CSV;
  }
  if (!pendingCsv && config.id === '2026-11') {
    pendingCsv = DEFAULT_NOVEMBER_2026_DETAIL_PENDING_CSV;
  }

  if (!centralCsv) {
    // If 2025 dataset has bundled fallback data, use it immediately
    if (DEFAULT_2025_DATASETS[config.id]) {
      return DEFAULT_2025_DATASETS[config.id];
    }

    // If still nothing, check localStorage
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }

    throw new Error(
      'Gagal mengambil data dari Google Spreadsheet. Pastikan URL benar dan spreadsheet dibagikan publik (Anyone with the link can view).'
    );
  }

  // Parse centralize sheet with safe fallback
  let dataset: MonthlyDataset;
  try {
    dataset = parseSpreadsheetData(
      centralCsv,
      config.monthName,
      config.monthNumber,
      config.year,
      config.sheetUrl,
      config.gid
    );
  } catch (parseErr) {
    console.warn('Parsing live CSV failed, using pre-baked dataset fallback:', parseErr);
    if (DEFAULT_2025_DATASETS[config.id]) {
      return DEFAULT_2025_DATASETS[config.id];
    }
    if (config.id === '2026-09') return DEFAULT_SEPTEMBER_DATASET;
    if (config.id === '2026-10') return DEFAULT_OCTOBER_DATASET;
    if (config.id === '2026-11') return DEFAULT_NOVEMBER_2026_DATASET;
    throw parseErr;
  }

  // Parse Detail LKPB & Detail Pendingan safely
  if (lkpbCsv) {
    try {
      dataset.detailLkpb = parseDetailLkpb(lkpbCsv);
    } catch (e) {
      console.warn('Detail LKPB parse error:', e);
    }
  }
  if (pendingCsv) {
    try {
      dataset.detailPending = parseDetailPending(pendingCsv);
    } catch (e) {
      console.warn('Detail Pending parse error:', e);
    }
  }

  // Attach unlisted pending DOs if any
  if (unlistedPendingDos && unlistedPendingDos.length > 0) {
    dataset.unlistedPendingDos = unlistedPendingDos;
  } else if (config.id === '2026-09') {
    // Default fallback audit for September: 5A.XH.000058 (Tgl 15 Sep 2026, Status Brg)
    const existingPendingNos = new Set((dataset.detailPending || []).map((p) => p.noDo.toUpperCase().replace(/\s+/g, '')));
    if (!existingPendingNos.has('5A.XH.000058')) {
      dataset.unlistedPendingDos = [
        {
          id: 'tgl 15-5A.XH.000058',
          sheetName: 'tgl 15',
          tanggal: '15 Sep 2026',
          dayNumber: 15,
          noDo: '5A.XH.000058',
          teamName: 'Project Team',
          status: 'Brg',
          reason: 'Kendala Barang / Pending',
          detectedAt: new Date().toISOString(),
        },
      ];
    }
  }

  // Attach Canceled DOs
  let allCanceledDos: CancelledDoItem[] = [];
  if (config.id === '2026-10' || config.monthName.toLowerCase().includes('okt')) {
    allCanceledDos = DEFAULT_OCTOBER_CANCELED_DOS;
  } else if (config.id === '2026-09' || config.monthName.toLowerCase().includes('sep')) {
    allCanceledDos = DEFAULT_SEPTEMBER_CANCELED_DOS;
  }
  dataset.canceledDos = allCanceledDos;

  // Distribute canceled DOs to each day record for fast lookup
  if (dataset.records && dataset.records.length > 0) {
    dataset.records.forEach((r) => {
      r.canceledDos = getCanceledDosForDate(allCanceledDos, r.tanggal);
    });
  }

  // Update lastUpdated
  dataset.lastUpdated = new Date().toISOString();

  // Cache parsed dataset in localStorage
  try {
    localStorage.setItem(cacheKey, JSON.stringify(dataset));
  } catch (e) {
    console.warn('Could not cache dataset in localStorage:', e);
  }

  return dataset;
}

/**
 * Loads datasets for multiple registered months in parallel with caching and fallback
 */
export async function fetchMultipleMonthDatasets(
  configs: RegisteredMonthConfig[],
  force = false
): Promise<Record<string, MonthlyDataset>> {
  const result: Record<string, MonthlyDataset> = {};
  await Promise.all(
    configs.map(async (cfg) => {
      try {
        const ds = await fetchMonthDataset(cfg, force);
        result[cfg.id] = ds;
      } catch (e) {
        console.warn(`[sheetService] Could not load dataset for ${cfg.id}:`, e);
        if (DEFAULT_2025_DATASETS[cfg.id]) {
          result[cfg.id] = DEFAULT_2025_DATASETS[cfg.id];
        } else if (cfg.id === '2026-09') {
          result[cfg.id] = DEFAULT_SEPTEMBER_DATASET;
        } else if (cfg.id === '2026-08') {
          result[cfg.id] = DEFAULT_AUGUST_DATASET;
        } else if (cfg.id === '2026-10') {
          result[cfg.id] = DEFAULT_OCTOBER_DATASET;
        }
      }
    })
  );
  return result;
}

