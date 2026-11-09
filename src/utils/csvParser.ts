import { DailyRecord, MonthlyDataset, MonthSummary, DetailLkpbItem, DetailPendingItem } from '../types';

/**
 * Standard CSV line parser adhering to RFC 4180
 */
export function parseCSV(text: string): string[][] {
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
          i++; // skip escaped quote
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
      } else if (char === '\r') {
        // skip carriage return
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.length > 0 && currentRow.some((c) => c !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
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

/**
 * Helper to parse Indonesian / standard numbers, handles "-", empty string, commas
 */
export function parseNum(val: string | undefined | null): number {
  if (!val) return 0;
  const clean = val.trim().replace(/\./g, '').replace(/,/g, '.');
  if (clean === '-' || clean === '' || isNaN(Number(clean))) {
    return 0;
  }
  return Number(clean);
}

/**
 * Parses Google Sheets CSV rows into DailyRecords and summary
 */
export function parseSpreadsheetData(
  csvContent: string,
  monthName: string = 'September',
  monthNumber: number = 9,
  year: number = 2026,
  sheetUrl: string = '',
  gid: string = ''
): MonthlyDataset {
  const rawRows = parseCSV(csvContent);
  if (rawRows.length === 0) {
    throw new Error('Spreadsheet kosong atau tidak dapat diuraikan.');
  }

  const safeMonthName = monthName || 'Sep';
  const safeYear = year || 2026;

  // Find header index: look for "CENTRALIZED MANUAL" or "Pool Name" or "Tanggal"
  let headerIndex = -1;
  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    const rowStr = rawRows[i].join(' ').toLowerCase();
    if (rowStr.includes('tanggal') || rowStr.includes('pool name') || rowStr.includes('total jalur')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    headerIndex = 0;
  }

  const dataRows = rawRows.slice(headerIndex + 1);
  const records: DailyRecord[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const col0 = (r[0] || '').trim();
    const col1 = (r[1] || '').trim();
    const col3 = (r[3] || '').trim();

    // Skip footer / total / summary rows
    const isSummaryRow = 
      (!col0 && !col3 && r.some((c) => c !== '' && c !== '-')) ||
      col0.includes('%') ||
      col0.toUpperCase().includes('TOTAL') ||
      col1.toUpperCase().includes('TOTAL') ||
      col3.toUpperCase().includes('TOTAL') ||
      r.some((c) => (c || '').toUpperCase().includes('TOTAL') || (c || '').toUpperCase().includes('GRAND TOTAL') || (c || '').toUpperCase().includes('SUMMARY'));
    if (isSummaryRow) {
      continue;
    }

    // Must have a valid day number (1 to 31)
    const rawNo = parseInt(col0, 10);
    const dateDayMatch = col3.match(/^0?([1-9]|[12][0-9]|3[01])\b/);
    const noVal = !isNaN(rawNo) && rawNo >= 1 && rawNo <= 31 
      ? rawNo 
      : (dateDayMatch ? parseInt(dateDayMatch[1], 10) : (i + 1));

    if (noVal > 31 || noVal < 1) {
      continue;
    }

    const rawDate = col3 || `${String(noVal).padStart(2, '0')} ${safeMonthName.slice(0, 3)} ${safeYear}`;
    const poolName = col1 || 'SINGKAWANG';
    const achv = (r[2] || '').trim();

    const totalJalur = parseNum(r[4]);
    const totalTeam = parseNum(r[5]);
    const prod = parseNum(r[6]);
    const bobotMasuk = parseNum(r[7]);
    const bobotFinish = parseNum(r[8]);

    const pendingResch = parseNum(r[9]);
    const rusong = parseNum(r[10]);
    const tungkom = parseNum(r[11]);
    const brg = parseNum(r[12]);
    const inst = parseNum(r[13]);
    const totalPending = parseNum(r[14]) || (pendingResch + rusong + tungkom + brg + inst);

    const open = parseNum(r[15]);
    const lanjutInstall = parseNum(r[16]);
    const cancel = parseNum(r[17]);
    const lkpb = parseNum(r[18]);
    const na = parseNum(r[19]);

    const rawTarget = parseNum(r[20]);
    const rawReal = parseNum(r[21]);

    // Logic Target & Realisasi:
    // 1. "Target" adalah total DO diambil dari yang statusnya "Open" (total Jalur / penugasan DO hari tersebut)
    // 2. "Realisasi" adalah DO berstatus finish dikurangi Pending, LKPB & Cancel
    const target = Math.max(rawTarget, totalJalur, open);
    const deductions = totalPending + lkpb + cancel;
    const realisasi = rawReal > 0 ? rawReal : (target > 0 ? Math.max(0, target - deductions) : 0);

    const hasData = totalJalur > 0 || bobotMasuk > 0 || target > 0 || (r[4] !== '-' && r[4] !== '' && r[4] !== undefined);

    const completionRate = bobotMasuk > 0 ? Math.round((bobotFinish / bobotMasuk) * 1000) / 10 : 0;
    // Presisi 2 desimal (e.g. 7 / 9 = 77.78%)
    const achievementRate = target > 0 ? Math.round((realisasi / target) * 10000) / 100 : 0;
    const achvFormatted = target > 0
      ? `${achievementRate.toFixed(2).replace('.', ',')}%`
      : (hasData ? '0,00%' : '-');

    records.push({
      no: noVal,
      poolName,
      achv: achvFormatted,
      tanggal: rawDate,
      rawDate,
      dayNumber: noVal,
      totalJalur,
      totalTeam,
      prod,
      bobotMasuk,
      bobotFinish,
      pendingResch,
      rusong,
      tungkom,
      brg,
      inst,
      totalPending,
      open,
      lanjutInstall,
      cancel,
      lkpb,
      na,
      target,
      realisasi,
      hasData,
      completionRate,
      achievementRate,
    });
  }

  // Calculate summary
  let totalJalur = 0;
  let totalTeam = 0;
  let totalProd = 0;
  let prodCount = 0;
  let totalBobotMasuk = 0;
  let totalBobotFinish = 0;
  let totalPending = 0;
  let totalCancel = 0;
  let totalLkpb = 0;
  let totalTarget = 0;
  let totalRealisasi = 0;
  let activeDaysCount = 0;

  records.forEach((rec) => {
    if (rec.hasData) {
      activeDaysCount++;
      totalJalur += rec.totalJalur;
      totalTeam += rec.totalTeam;
      if (rec.prod > 0) {
        totalProd += rec.prod;
        prodCount++;
      }
      totalBobotMasuk += rec.bobotMasuk;
      totalBobotFinish += rec.bobotFinish;
      totalPending += rec.totalPending;
      totalCancel += rec.cancel;
      totalLkpb += rec.lkpb;
      totalTarget += rec.target;
      totalRealisasi += rec.realisasi;
    }
  });

  const avgProd = prodCount > 0 ? Math.round((totalProd / prodCount) * 10) / 10 : 0;
  const overallCompletionRate =
    totalBobotMasuk > 0 ? Math.round((totalBobotFinish / totalBobotMasuk) * 1000) / 10 : 0;
  const overallAchvRate =
    totalTarget > 0 ? Math.round((totalRealisasi / totalTarget) * 10000) / 100 : 0;

  const summary: MonthSummary = {
    totalJalur,
    totalTeam,
    avgProd,
    totalBobotMasuk,
    totalBobotFinish,
    totalPending,
    totalCancel,
    totalLkpb,
    totalTarget,
    totalRealisasi,
    overallAchvRate,
    overallAchievementRate: overallAchvRate,
    overallCompletionRate,
    activeDaysCount,
  };

  const id = `${year}-${String(monthNumber).padStart(2, '0')}`;

  return {
    id,
    monthName,
    monthNumber,
    year,
    sheetUrl,
    gid,
    lastUpdated: new Date().toISOString(),
    records,
    summary,
  };
}

/**
 * Extracts spreadsheet ID and GID from any Google Sheets URL
 */
export function extractGoogleSheetInfo(url: string): { sheetId: string; gid: string } {
  try {
    const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const sheetId = idMatch ? idMatch[1] : '';

    let gid = '0';
    const gidParamMatch = url.match(/[?&]gid=([0-9]+)/);
    const gidHashMatch = url.match(/#gid=([0-9]+)/);

    if (gidParamMatch) {
      gid = gidParamMatch[1];
    } else if (gidHashMatch) {
      gid = gidHashMatch[1];
    }

    return { sheetId, gid };
  } catch {
    return { sheetId: '', gid: '0' };
  }
}

/**
 * Constructs direct CSV download/gviz URL
 */
export function buildGoogleSheetCsvUrl(urlOrId: string, customGid?: string): string {
  const { sheetId, gid } = extractGoogleSheetInfo(urlOrId);
  const finalId = sheetId || urlOrId;
  const finalGid = customGid || gid || '0';
  return `https://docs.google.com/spreadsheets/d/${finalId}/gviz/tq?tqx=out:csv&gid=${finalGid}`;
}

/**
 * Parses Indonesian / mixed date string (e.g. "13 Jul 2026", "7 Agustus 2026", "2026-09-15") into Date
 */
export function parseFlexibleDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '' || dateStr.trim() === '-') return null;
  const clean = dateStr.trim();

  // Try standard Date.parse
  const direct = new Date(clean);
  if (!isNaN(direct.getTime())) return direct;

  const parts = clean.split(/[\s/-]+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1].toLowerCase();
    const year = parseInt(parts[2], 10);

    const monthMap: Record<string, number> = {
      jan: 0, januari: 0,
      feb: 1, februari: 1,
      mar: 2, maret: 2,
      apr: 3, april: 3,
      mei: 4, may: 4,
      jun: 5, juni: 5,
      jul: 6, juli: 6,
      agu: 7, agustus: 7, aug: 7,
      sep: 8, september: 8,
      okt: 9, oktober: 9, oct: 9,
      nov: 10, november: 10,
      des: 11, desember: 11, dec: 11,
    };

    const month = monthMap[monthStr] ?? 0;
    if (!isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }

  return null;
}

/**
 * Calculates day difference from a date string to reference date (defaults to current date or 2026-09-15)
 */
export function calculateAgingDays(dateStr: string, fallbackDays = 0): number {
  const d = parseFlexibleDate(dateStr);
  if (!d) return fallbackDays;

  // Use reference date: current date or September 2026 context
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return days > 0 ? days : fallbackDays;
}

/**
 * Parses "Detail LKPB" Google Sheet tab into structured DetailLkpbItem[]
 * with intelligent operational follow-up recommendations.
 */
export function parseDetailLkpb(csvContent: string): DetailLkpbItem[] {
  const rawRows = parseCSV(csvContent);
  const items: DetailLkpbItem[] = [];

  // Find header index: look for "NO DO" or "STATUS" with "CUSTOMER" or "LKPB"
  let headerIndex = -1;
  let headerRow: string[] = [];
  for (let i = 0; i < Math.min(rawRows.length, 12); i++) {
    const rowStr = rawRows[i].join(' ').toUpperCase();
    if (rowStr.includes('NO DO') || (rowStr.includes('CUSTOMER') && rowStr.includes('STATUS')) || (rowStr.includes('KATEGORI LKPB') && rowStr.includes('STATUS'))) {
      headerIndex = i;
      headerRow = rawRows[i].map((c) => c.trim().toUpperCase());
      break;
    }
  }

  // Detect column indices dynamically if header exists
  let colNo = -1;
  let colNoDo = -1;
  let colCust = -1;
  let colTglAwal = -1;
  let colTglTarget = -1;
  let colAging = -1;
  let colStatus = -1;
  let colKategori = -1;
  let colReason = -1;

  if (headerIndex >= 0 && headerRow.length > 0) {
    headerRow.forEach((h, idx) => {
      if (colNo < 0 && (h === 'NO' || h === 'NO.')) colNo = idx;
      if (colNoDo < 0 && (h.includes('NO DO') || h === 'DO')) colNoDo = idx;
      if (colCust < 0 && (h.includes('CUSTOMER') || h.includes('NAMA'))) colCust = idx;
      if (colTglAwal < 0 && (h.includes('TGL AWAL') || h.includes('JALUR AWAL') || h.includes('TANGGAL JALUR'))) colTglAwal = idx;
      if (colTglTarget < 0 && (h.includes('TARGET') || h.includes('REINSTALL') || h.includes('TGL ULANG'))) colTglTarget = idx;
      if (colAging < 0 && (h.includes('AGING') || h.includes('HARI') || h.includes('DAY'))) colAging = idx;
      if (colStatus < 0 && h === 'STATUS') colStatus = idx;
      if (colKategori < 0 && (h.includes('KATEGORI') || h.includes('CATEGORY'))) colKategori = idx;
      if (colReason < 0 && (h.includes('REASON') || h.includes('KENDALA') || h.includes('CACAT') || h.includes('ALASAN'))) colReason = idx;
    });
  }

  // Fallbacks if columns were not detected by header string
  if (colNoDo < 0) colNoDo = 1;
  if (colCust < 0) colCust = 2;
  if (colTglAwal < 0) colTglAwal = 3;
  if (colTglTarget < 0) colTglTarget = 4;

  const dataRows = headerIndex >= 0 ? rawRows.slice(headerIndex + 1) : rawRows;

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const noDo = (r[colNoDo] || '').trim();
    const namaCustomer = (r[colCust] || '').trim();

    // Skip empty lines, summary rows, invalid DO numbers, or headers
    if (!noDo || !isValidDoNumber(noDo)) {
      continue;
    }

    const noVal = (colNo >= 0 ? parseInt((r[colNo] || '').trim(), 10) : 0) || (items.length + 1);
    const tglJalurAwal = (r[colTglAwal] || '').trim();
    const tglTarget = (r[colTglTarget] || '').trim();

    let rawAging = colAging >= 0 ? (r[colAging] || '').trim() : '';
    let parsedDays = 0;
    const dayMatch = rawAging.match(/([0-9]+)/);
    if (dayMatch) {
      parsedDays = parseInt(dayMatch[1], 10);
    } else {
      parsedDays = calculateAgingDays(tglJalurAwal, 0);
    }

    // Resolve Status, Kategori, and Reason
    // In October sheet layout: col 5 is STATUS (e.g. "OPEN"), col 6 is KATEGORI (e.g. "KURANG SPAREPART"), col 7 is REASON
    // In September sheet layout: col 6 is STATUS, col 7 is KATEGORI, col 8 is REASON
    let status = 'OPEN';
    let kategori = '';
    let reason = '';

    if (colStatus >= 0) {
      status = (r[colStatus] || 'OPEN').trim().toUpperCase();
    }
    if (colKategori >= 0) {
      kategori = (r[colKategori] || '').trim();
    }
    if (colReason >= 0) {
      reason = (r[colReason] || '').trim();
    }

    // Secondary fallback heuristics if header didn't find them explicitly
    if (!kategori && !reason) {
      if (r[5] && ['OPEN', 'FINISH'].includes(r[5].trim().toUpperCase())) {
        status = r[5].trim().toUpperCase();
        kategori = (r[6] || '').trim();
        reason = (r[7] || '').trim();
      } else if (r[6] && ['OPEN', 'FINISH'].includes(r[6].trim().toUpperCase())) {
        status = r[6].trim().toUpperCase();
        kategori = (r[7] || '').trim();
        reason = (r[8] || '').trim();
      } else {
        kategori = (r[7] || r[6] || '').trim();
        reason = (r[8] || r[7] || '').trim();
      }
    }

    // If status ended up looking like a category rather than OPEN/FINISH (e.g. "KURANG SPAREPART")
    const knownCategories = ['KURANG SPAREPART', 'CACAT', 'CACAT VENDOR', 'KURANG KIRIM', 'LEBIH KIRIM', 'KURANG PART', 'SALAH INSTALL', 'RUSAK', 'LAINNYA'];
    if (knownCategories.some(kc => status.toUpperCase().includes(kc))) {
      if (!kategori) kategori = status;
      status = 'OPEN';
    }

    if (!kategori) {
      kategori = 'CACAT';
    }

    const isFinish = status === 'FINISH';

    // Smart Follow-Up Logic & Recommendations
    let actionLevel: DetailLkpbItem['actionLevel'] = 'ontrack';
    let actionTag = 'Monitoring Standar SLA';
    let recommendation = '';
    let needsStoreFollowUp = false;

    if (isFinish) {
      actionLevel = 'resolved';
      actionTag = 'Selesai & Terpasang';
      recommendation = `Kasus tuntas terselesaikan (${parsedDays} hari total durasi penanganan). BAST dan penutupan LKPB selesai.`;
      needsStoreFollowUp = false;
    } else {
      // Status OPEN
      const katUpper = kategori.toUpperCase();
      const isSparepart = katUpper.includes('SPAREPART') || katUpper.includes('PART') || (reason && reason.toUpperCase().includes('SPAREPART'));

      if (parsedDays >= 60) {
        actionLevel = 'critical';
        actionTag = 'Follow Up Segera ke Store & Vendor';
        recommendation = `🚨 KASUS KRITIS: Sudah ${parsedDays} hari sejak jalur awal (${tglJalurAwal})! Segera koordinasi dan Follow Up intensif ke Store & Vendor untuk sparepart / unit pengganti, serta eskalasi ke Service Head.`;
        needsStoreFollowUp = true;
      } else if (parsedDays >= 30) {
        actionLevel = 'warning';
        actionTag = 'Follow Up ke Store';
        recommendation = `⚠️ PERHATIAN TINGGI: Sudah ${parsedDays} hari sejak jalur awal (${tglJalurAwal}). Follow Up ke Store untuk update kepastian estimasi kedatangan barang & tindak lanjut komplain.`;
        needsStoreFollowUp = true;
      } else if (isSparepart) {
        actionLevel = 'moderate';
        actionTag = 'Cek Ketersediaan Sparepart Store';
        recommendation = `🔧 KENDALA / CACAT SPAREPART: Koordinasikan ketersediaan sparepart / part pengganti dengan Store / Vendor untuk persiapan jadwal reinstall.`;
        needsStoreFollowUp = true;
      } else if (parsedDays >= 15) {
        actionLevel = 'moderate';
        actionTag = 'Cek Tracking Part & Jadwal';
        recommendation = `🟡 Sudah ${parsedDays} hari. Cek status tracking sparepart di logistik dan siapkan jadwal installer untuk re-visit.`;
        needsStoreFollowUp = false;
      } else {
        actionLevel = 'ontrack';
        actionTag = 'Monitoring Standar SLA';
        recommendation = `🔵 Dalam batas SLA awal (${parsedDays} hari). Pantau pengiriman barang pengganti ke Pool Singkawang.`;
        needsStoreFollowUp = false;
      }
    }

    items.push({
      no: noVal,
      noDo,
      namaCustomer,
      tglJalurAwal,
      tglTarget,
      agingDays: parsedDays,
      status,
      kategori,
      reason,
      actionLevel,
      actionTag,
      recommendation,
      needsStoreFollowUp,
    });
  }

  return items;
}

/**
 * Parses "Detail Pendingan" Google Sheet tab into structured DetailPendingItem[]
 * with intelligent operational follow-up recommendations.
 */
export function parseDetailPending(csvContent: string): DetailPendingItem[] {
  const rawRows = parseCSV(csvContent);
  const items: DetailPendingItem[] = [];

  // Find header index: look for "NO DO" or "NAMA CUSTOMER"
  let headerIndex = -1;
  for (let i = 0; i < Math.min(rawRows.length, 12); i++) {
    const rowStr = rawRows[i].join(' ').toUpperCase();
    if (rowStr.includes('NO DO') || (rowStr.includes('NAMA CUSTOMER') && rowStr.includes('STATUS'))) {
      headerIndex = i;
      break;
    }
  }

  const dataRows = headerIndex >= 0 ? rawRows.slice(headerIndex + 1) : rawRows;

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const noDo = (r[1] || '').trim();
    const namaCustomer = (r[2] || '').trim();

    // Skip empty lines, summary rows, invalid DO numbers, or headers
    if (!noDo || !isValidDoNumber(noDo)) {
      continue;
    }

    const noVal = parseInt((r[0] || '').trim(), 10) || (items.length + 1);
    const tglJalurAwal = (r[3] || '').trim();
    const tglTarget = (r[4] || '').trim();
    const status = (r[5] || 'OPEN').trim().toUpperCase();
    const konfirmasiBy = (r[6] || '').trim();
    const kategori = (r[7] || '').trim();
    const keterangan = (r[8] || '').trim();

    // Compute aging days from tglJalurAwal
    const agingDays = calculateAgingDays(tglJalurAwal, 14);

    const isFinish = status === 'FINISH';

    // Smart Follow-Up Logic & Recommendations
    let actionLevel: DetailPendingItem['actionLevel'] = 'revisit';
    let actionTag = 'Follow Up Customer';
    let recommendation = '';
    let needsStoreFollowUp = false;

    if (isFinish) {
      actionLevel = 'resolved';
      actionTag = 'Pemasangan Selesai';
      recommendation = `Instalasi telah berhasil diselesaikan pada jadwal tanggal target (${tglTarget}).`;
      needsStoreFollowUp = false;
    } else {
      const katUpper = kategori.toUpperCase();
      const ketUpper = keterangan.toUpperCase();
      const combinedReason = `${katUpper} ${ketUpper}`.trim();

      const isSparepart =
        combinedReason.includes('SPAREPART') ||
        combinedReason.includes('PART') ||
        combinedReason.includes('BARANG') ||
        combinedReason.includes('BELUM DATANG') ||
        combinedReason.includes('CACAT') ||
        combinedReason.includes('KURANG');

      if (isSparepart) {
        actionLevel = agingDays >= 14 ? 'critical' : 'revisit';
        actionTag = 'Koordinasi Sparepart & Logistik Store';
        recommendation = `🔧 KENDALA PENGIRIMAN / SPAREPART (${kategori || keterangan || 'Barang Belum Datang'}): Sudah ${agingDays} hari sejak jalur awal (${tglJalurAwal}). Koordinasikan estimasi kedatangan part dengan Store / Logistik untuk persiapan reinstall (${tglTarget}).`;
        needsStoreFollowUp = true;
      } else if (
        combinedReason.includes('LOKASI') ||
        combinedReason.includes('RENOV') ||
        combinedReason.includes('KONSTRUKSI') ||
        combinedReason.includes('ROOFTOP') ||
        combinedReason.includes('BELUM SIAP')
      ) {
        actionLevel = 'location_prep';
        actionTag = 'Follow Up Kesiapan Lokasi Proyek';
        recommendation = `🚧 Kesiapan Lokasi (${keterangan || kategori}): Hubungi customer via ${
          konfirmasiBy || 'telepon/WA'
        } minimal H-2 sebelum ${tglTarget} untuk memastikan ruangan/area sudah 100% siap dipasang.`;
        if (agingDays >= 30) {
          needsStoreFollowUp = true;
          recommendation += ` (Sudah ${agingDays} hari pending -> koordinasikan dengan Store untuk tanggal renovasi customer).`;
        }
      } else if (combinedReason.includes('LJI') || combinedReason.includes('LANJUT')) {
        actionLevel = 'revisit';
        actionTag = 'Jadwalkan Re-Visit Installer';
        recommendation = `⚡ Lanjut Install (${keterangan || kategori || 'LJI'}): Siapkan material/alat pendukung dan kunci jadwal tim installer pada tanggal target ${tglTarget}.`;
      } else if (combinedReason.includes('PERMINTAAN') || combinedReason.includes('RESCHEDULE')) {
        actionLevel = 'reschedule';
        actionTag = 'Konfirmasi Tanggal Pengganti Cust';
        recommendation = `📅 Reschedule Customer: Hubungi customer untuk mengunci jam kedatangan installer pada tanggal target ${tglTarget}.`;
      } else {
        actionLevel = 'critical';
        actionTag = 'Follow Up ke Store & Cust';
        recommendation = `⚠️ Tindak lanjuti pendingan order ini ke Store dan Customer untuk kesepakatan penanganan lanjut.`;
        needsStoreFollowUp = true;
      }
    }

    items.push({
      no: noVal,
      noDo,
      namaCustomer,
      tglJalurAwal,
      tglTarget,
      agingDays,
      status,
      konfirmasiBy: konfirmasiBy || '-',
      kategori: kategori || 'PENDING',
      keterangan: keterangan || '-',
      actionLevel,
      actionTag,
      recommendation,
      needsStoreFollowUp,
    });
  }

  return items;
}

export interface ParsedDateSheetDo {
  no: number;
  noDo: string;
  category: string;
  teamName: string;
  status: string;
  reason?: string;
  sheetName: string;
  dateStr: string;
  dayNumber: number;
  isPendingCategory: boolean;
}

/**
 * Strict validator for Pool Singkawang DO Numbers.
 * Filters out percentages, pure numbers, dates, formulas, and summary labels.
 */
export function isValidDoNumber(raw: string): boolean {
  if (!raw) return false;
  const clean = raw.trim();
  if (clean.length < 5 || clean.length > 32) return false;

  // Filter out percentages, formula errors, HTML/JSON
  if (clean.includes('%') || clean.includes('#') || clean.includes('<') || clean.includes('{')) {
    return false;
  }

  // Filter out pure numbers
  if (/^\d+$/.test(clean)) return false;

  // Filter out dates (e.g. "01 Nov 2026", "22 Sep 2026")
  if (/\b(Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)\b/i.test(clean)) {
    return false;
  }

  // Filter out common header / summary words
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
    upper === 'STATUS' ||
    upper === 'KATEGORY' ||
    upper === 'KATEGORI'
  ) {
    return false;
  }

  // Valid DO must have letters and numbers
  const hasLetter = /[A-Za-z]/.test(clean);
  const hasDigit = /[0-9]/.test(clean);
  const hasDelimiter = clean.includes('.') || clean.includes('-') || clean.includes('/');

  return hasLetter && hasDigit && (hasDelimiter || clean.length >= 8);
}

/**
 * Standard statuses that are NOT considered pending:
 * Open, Finish, Close, LKPB, Cancel
 */
export const NON_PENDING_STATUSES = new Set(['OPEN', 'FINISH', 'CLOSE', 'LKPB', 'CANCEL']);

export function isPendingCategoryStatus(status: string): boolean {
  if (!status || status.trim() === '' || status.trim() === '-') return false;
  const upper = status.trim().toUpperCase();
  // Filter out pure numbers, percentages, dates
  if (/^\d+$/.test(upper) || upper.includes('%') || upper.length > 30) return false;
  if (/\b(Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)\b/i.test(upper)) return false;
  return !NON_PENDING_STATUSES.has(upper);
}

/**
 * Parse a daily date sheet (e.g. "tgl 1" ... "tgl 31") CSV content to extract DO records
 */
export function parseDateSheetDos(
  csvContent: string,
  sheetName: string,
  dateStr: string,
  dayNumber: number
): ParsedDateSheetDo[] {
  const rows = parseCSV(csvContent);
  const result: ParsedDateSheetDo[] = [];
  if (rows.length === 0) return result;

  // Search for the DO list header row containing "NO." and "NO. DO"
  let headerIndex = -1;
  let colNoIdx = 0;
  let colCategoryIdx = 1;
  let colDoIdx = 2;
  let colTeamIdx = 3;
  let colStatusIdx = 5;
  let colReasonIdx = 8;

  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    const row = rows[i];
    const rowStr = row.join(' ').toUpperCase();
    if (rowStr.includes('NO. DO') || rowStr.includes('NO DO') || (rowStr.includes('NO.') && rowStr.includes('STATUS'))) {
      headerIndex = i;
      // Dynamically resolve column indices
      for (let c = 0; c < row.length; c++) {
        const h = (row[c] || '').trim().toUpperCase();
        if (h.includes('NO. DO') || h.includes('NO DO')) colDoIdx = c;
        else if (h === 'NO.' || h === 'NO') colNoIdx = c;
        else if (h.includes('KATEGOR')) colCategoryIdx = c;
        else if (h.includes('TEAM') || h.includes('NAMA TEAM')) colTeamIdx = c;
        else if (h === 'STATUS') colStatusIdx = c;
        else if (h.includes('ALASAN') || h.includes('KETERANGAN') || h.includes('REASON')) colReasonIdx = c;
      }
      break;
    }
  }

  const startIdx = headerIndex >= 0 ? headerIndex + 1 : 22; // default around row 22
  let consecutiveEmpty = 0;

  for (let i = startIdx; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < 3) {
      consecutiveEmpty++;
      if (consecutiveEmpty >= 2) break;
      continue;
    }

    const colNo = (r[colNoIdx] || '').trim();
    const colCategory = (r[colCategoryIdx] || '').trim();
    const colNoDo = (r[colDoIdx] || '').trim();
    const colTeam = (r[colTeamIdx] || '').trim();
    const colStatus = (r[colStatusIdx] || '').trim();
    const colReason = (r[colReasonIdx] || r[26] || r[8] || '').trim();

    // Check if table has reached total / summary row
    const rowFull = r.join(' ').toUpperCase();
    if (rowFull.includes('TOTAL') || rowFull.includes('SUMMARY') || rowFull.includes('PRODUKTIVITY') || rowFull.includes('AVERAGE')) {
      break;
    }

    // Stop or skip if not a valid DO
    if (!colNoDo || !isValidDoNumber(colNoDo)) {
      consecutiveEmpty++;
      if (consecutiveEmpty >= 2) break;
      continue;
    }

    consecutiveEmpty = 0;
    const noNum = parseInt(colNo, 10) || result.length + 1;
    const isPending = isPendingCategoryStatus(colStatus);

    result.push({
      no: noNum,
      noDo: colNoDo,
      category: colCategory,
      teamName: colTeam,
      status: colStatus,
      reason: colReason,
      sheetName,
      dateStr,
      dayNumber,
      isPendingCategory: isPending,
    });
  }

  return result;
}

/**
 * Cross-checks date sheet DOs against Detail Pendingan.
 * If a DO in date sheet has a pending status (not Open, Finish, Close, LKPB, Cancel)
 * but is absent from Detail Pendingan, flag it as unlisted pending!
 */
export function auditPendingDiscrepancies(
  dateSheetDos: ParsedDateSheetDo[],
  detailPendingItems: DetailPendingItem[]
): import('../types').UnlistedPendingDo[] {
  const existingPendingDoSet = new Set(
    detailPendingItems.map((p) => p.noDo.toUpperCase().replace(/\s+/g, ''))
  );

  const discrepancies: import('../types').UnlistedPendingDo[] = [];

  for (const item of dateSheetDos) {
    if (!item.isPendingCategory) continue;

    const normalizedDo = item.noDo.toUpperCase().replace(/\s+/g, '');
    if (!existingPendingDoSet.has(normalizedDo)) {
      discrepancies.push({
        id: `${item.sheetName}-${item.noDo}`,
        sheetName: item.sheetName,
        tanggal: item.dateStr,
        dayNumber: item.dayNumber,
        noDo: item.noDo,
        teamName: item.teamName,
        status: item.status,
        reason: item.reason,
        detectedAt: new Date().toISOString(),
      });
    }
  }

  return discrepancies;
}

