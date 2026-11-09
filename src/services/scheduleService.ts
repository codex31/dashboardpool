import { 
  MonthScheduleDataset, 
  MONTH_SCHEDULES, 
  SCHEDULE_SPREADSHEET_ID, 
  SCHEDULE_SPREADSHEET_URL,
  TechnicianSchedule,
  DayColumnInfo,
  DailyTotals
} from '../data/teamScheduleData';
import { parseCSV } from '../utils/csvParser';

const STORAGE_KEY_SCHEDULES = 'pool_singkawang_team_schedules_cache';

/**
 * Get all month schedules (from local cache or preloaded datasets)
 */
export function getStoredSchedules(): MonthScheduleDataset[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = localStorage.getItem(STORAGE_KEY_SCHEDULES);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Reconcile and ensure all preloaded months (e.g. October 2026) are present
          const idSet = new Set(parsed.map((m: any) => m.id));
          const merged = [...parsed];
          for (const defMonth of MONTH_SCHEDULES) {
            if (!idSet.has(defMonth.id)) {
              merged.push(defMonth);
            }
          }
          merged.sort((a, b) => a.id.localeCompare(b.id));
          return merged;
        }
      }
    }
  } catch (err) {
    console.warn('[ScheduleService] Error reading schedule cache:', err);
  }
  return MONTH_SCHEDULES;
}

/**
 * Save schedule datasets to local cache
 */
export function saveStoredSchedules(schedules: MonthScheduleDataset[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_SCHEDULES, JSON.stringify(schedules));
    }
  } catch (err) {
    console.warn('[ScheduleService] Error writing schedule cache:', err);
  }
}

/**
 * Parse raw CSV string from Google Sheets into a MonthScheduleDataset
 */
export function parseScheduleCSV(
  csvText: string, 
  monthId: string, 
  monthName: string, 
  year: number, 
  gid: string
): MonthScheduleDataset {
  const rows = parseCSV(csvText);

  let headerIdx = -1;
  for (let idx = 0; idx < rows.length; idx++) {
    const r = rows[idx];
    if (r.length > 3 && (r[0].trim().toUpperCase() === 'NO' || r[1].trim().toUpperCase() === 'NIP')) {
      headerIdx = idx;
      break;
    }
  }

  if (headerIdx === -1) {
    throw new Error(`Format header tabel jadwal tidak ditemukan pada sheet ${monthName}`);
  }

  const numRow = rows[headerIdx];
  const dayNameRow = headerIdx + 1 < rows.length ? rows[headerIdx + 1] : [];

  const dayCols: DayColumnInfo[] = [];
  const summaryCols: Record<string, number> = {};

  for (let cIdx = 5; cIdx < numRow.length; cIdx++) {
    const val = numRow[cIdx]?.trim() || '';
    const dayName = dayNameRow[cIdx]?.trim() || '';
    if (/^\d+$/.test(val)) {
      dayCols.push({ day: parseInt(val, 10), dayName });
    } else if (val) {
      summaryCols[val] = cIdx;
    }
  }

  const members: TechnicianSchedule[] = [];
  const dailyStats: DailyTotals = {
    m0067: {},
    off: {},
    al: {}
  };
  const notes: Record<string, string> = {};

  for (let rIdx = headerIdx + 2; rIdx < rows.length; rIdx++) {
    const r = rows[rIdx];
    if (!r || r.length < 4) continue;

    // Personnel row
    if (r[1] && /^\d+$/.test(r[1].trim())) {
      const nip = r[1].trim();
      const nama = r[2]?.trim() || '';
      const job = r[3]?.trim() || 'INST';
      const tglTotal = r[4]?.trim() || '30';

      const shifts: Record<string, string> = {};
      dayCols.forEach((dc, i) => {
        const colIdx = 5 + i;
        const shiftVal = r[colIdx]?.trim() || '';
        shifts[String(dc.day)] = shiftVal;
      });

      const memberSummary: Record<string, string> = {};
      Object.entries(summaryCols).forEach(([sName, sIdx]) => {
        if (sIdx < r.length && r[sIdx]?.trim()) {
          memberSummary[sName] = r[sIdx].trim();
        }
      });

      members.push({
        no: r[0]?.trim() || String(members.length + 1),
        nip,
        nama,
        jobTitle: job,
        totalHariKerja: tglTotal,
        shifts,
        summary: memberSummary
      });
    } else if (r[3] && r[3].trim()) {
      const key = r[3].trim().toUpperCase();
      let targetDict: Record<string, string> | null = null;
      if (key.includes('M0067')) targetDict = dailyStats.m0067;
      else if (key.includes('OFF')) targetDict = dailyStats.off;
      else if (key.includes('AL')) targetDict = dailyStats.al;

      if (targetDict) {
        dayCols.forEach((dc, i) => {
          const colIdx = 5 + i;
          const val = r[colIdx]?.trim() || '0';
          targetDict![String(dc.day)] = val;
        });
      }
    } else {
      // Notes row
      dayCols.forEach((dc, i) => {
        const colIdx = 5 + i;
        if (colIdx < r.length && r[colIdx]?.trim()) {
          const txt = r[colIdx].trim();
          if (txt.toUpperCase() !== 'NOTE:' && txt !== '') {
            const dKey = String(dc.day);
            if (notes[dKey]) {
              notes[dKey] += ' | ' + txt;
            } else {
              notes[dKey] = txt;
            }
          }
        }
      });
    }
  }

  return {
    id: monthId,
    monthName,
    year,
    gid,
    totalDays: dayCols.length,
    days: dayCols,
    members,
    dailyStats,
    notes
  };
}

/**
 * Live sync a specific month from Google Sheets via the proxy or direct fetch
 */
export async function syncMonthFromGoogleSheet(month: MonthScheduleDataset): Promise<MonthScheduleDataset> {
  const cacheBuster = Date.now();
  const directUrl = `https://docs.google.com/spreadsheets/d/${SCHEDULE_SPREADSHEET_ID}/export?format=csv&gid=${month.gid}&_t=${cacheBuster}`;

  let csvText = '';
  // Try via proxy first
  try {
    const proxyRes = await fetch(`/api/proxy-sheet?sheetId=${SCHEDULE_SPREADSHEET_ID}&gid=${month.gid}&_t=${cacheBuster}`);
    if (proxyRes.ok) {
      const json = await proxyRes.json();
      if (json.csv && json.csv.length > 50) {
        csvText = json.csv;
      }
    }
  } catch (err) {
    console.warn('[ScheduleService] Proxy fetch failed, trying direct:', err);
  }

  // Fallback to direct fetch
  if (!csvText) {
    const res = await fetch(directUrl);
    if (!res.ok) {
      throw new Error(`Gagal mengunduh spreadsheet jadwal untuk bulan ${month.monthName} (Status: ${res.status})`);
    }
    csvText = await res.text();
  }

  const updatedMonth = parseScheduleCSV(csvText, month.id, month.monthName, month.year, month.gid);
  
  // Update local storage
  const currentList = getStoredSchedules();
  const idx = currentList.findIndex(m => m.id === month.id);
  let updatedList: MonthScheduleDataset[];
  if (idx >= 0) {
    updatedList = [...currentList];
    updatedList[idx] = updatedMonth;
  } else {
    updatedList = [...currentList, updatedMonth];
  }
  saveStoredSchedules(updatedList);

  return updatedMonth;
}

/**
 * Calculate yearly statistics across all loaded months
 */
export interface YearlyMemberStat {
  nip: string;
  nama: string;
  jobTitle: string;
  totalWorkingDays: number;
  totalOffDays: number;
  totalLeaveDays: number;
  monthBreakdowns: {
    monthName: string;
    workingDays: number;
    offDays: number;
    leaveDays: number;
  }[];
}

export function calculateYearlyStats(months: MonthScheduleDataset[]): YearlyMemberStat[] {
  const memberMap = new Map<string, YearlyMemberStat>();

  for (const m of months) {
    for (const mem of m.members) {
      if (!memberMap.has(mem.nip)) {
        memberMap.set(mem.nip, {
          nip: mem.nip,
          nama: mem.nama,
          jobTitle: mem.jobTitle,
          totalWorkingDays: 0,
          totalOffDays: 0,
          totalLeaveDays: 0,
          monthBreakdowns: []
        });
      }

      const stat = memberMap.get(mem.nip)!;
      
      // Calculate from shifts or summary
      let workCount = 0;
      let offCount = 0;
      let leaveCount = 0;

      (Object.values(mem.shifts) as string[]).forEach(shift => {
        const s = shift.toUpperCase();
        if (s === 'M0067') workCount++;
        else if (s === 'O') offCount++;
        else if (s === 'AL') leaveCount++;
      });

      // If summary is available, cross-check
      if (mem.summary['M0067'] && parseInt(mem.summary['M0067'], 10)) {
        workCount = parseInt(mem.summary['M0067'], 10);
      }
      if (mem.summary['O'] && parseInt(mem.summary['O'], 10)) {
        offCount = parseInt(mem.summary['O'], 10);
      }
      if (mem.summary['AL'] && parseInt(mem.summary['AL'], 10)) {
        leaveCount = parseInt(mem.summary['AL'], 10);
      }

      stat.totalWorkingDays += workCount;
      stat.totalOffDays += offCount;
      stat.totalLeaveDays += leaveCount;
      stat.monthBreakdowns.push({
        monthName: m.monthName,
        workingDays: workCount,
        offDays: offCount,
        leaveDays: leaveCount
      });
    }
  }

  return Array.from(memberMap.values());
}

/**
 * Export a month's schedule to clean CSV for download
 */
export function exportScheduleMonthToCSV(month: MonthScheduleDataset): void {
  const lines: string[] = [];
  
  // Header 1: Month title
  lines.push(`JADWAL OPERASIONAL TEKNISI - ${month.monthName.toUpperCase()} ${month.year}`);
  lines.push(`Pool Singkawang - Google Spreadsheet Source: ${SCHEDULE_SPREADSHEET_URL}`);
  lines.push('');

  // Row 1: Day numbers
  const row1 = ['NO', 'NIP', 'NAMA', 'JOB TITLE', 'TGL TOTAL', ...month.days.map(d => String(d.day)), 'TOTAL KERJA', 'TOTAL OFF', 'TOTAL CUTI (AL)'];
  lines.push(row1.map(c => `"${c.replace(/"/g, '""')}"`).join(','));

  // Row 2: Day names
  const row2 = ['', '', '', '', 'HARI', ...month.days.map(d => d.dayName), '', '', ''];
  lines.push(row2.map(c => `"${c.replace(/"/g, '""')}"`).join(','));

  // Personnel rows
  month.members.forEach((mem, idx) => {
    const shiftCols = month.days.map(d => mem.shifts[String(d.day)] || '-');
    const work = mem.summary['M0067'] || '';
    const off = mem.summary['O'] || '';
    const al = mem.summary['AL'] || '0';
    const row = [String(idx + 1), mem.nip, mem.nama, mem.jobTitle, mem.totalHariKerja, ...shiftCols, work, off, al];
    lines.push(row.map(c => `"${c.replace(/"/g, '""')}"`).join(','));
  });

  // Daily stats rows
  lines.push('');
  const mRow = ['', '', '', 'TOTAL MASUK (M0067)', '', ...month.days.map(d => month.dailyStats.m0067[String(d.day)] || '0'), '', '', ''];
  lines.push(mRow.map(c => `"${c.replace(/"/g, '""')}"`).join(','));

  const oRow = ['', '', '', 'TOTAL OFF (O)', '', ...month.days.map(d => month.dailyStats.off[String(d.day)] || '0'), '', '', ''];
  lines.push(oRow.map(c => `"${c.replace(/"/g, '""')}"`).join(','));

  const alRow = ['', '', '', 'TOTAL CUTI (AL)', '', ...month.days.map(d => month.dailyStats.al[String(d.day)] || '0'), '', '', ''];
  lines.push(alRow.map(c => `"${c.replace(/"/g, '""')}"`).join(','));

  // Notes
  if (Object.keys(month.notes).length > 0) {
    lines.push('');
    lines.push('CATATAN / AGENDA KHUSUS:');
    Object.entries(month.notes).forEach(([day, note]) => {
      lines.push(`Tanggal ${day}: ${note}`);
    });
  }

  const csvContent = lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Jadwal_Tim_Pool_Singkawang_${month.monthName}_${month.year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Retrieves scheduled working days for a technician in a given month from the schedule spreadsheet.
 * Returns daily schedule status (1 for working, 0 for off/leave) and total scheduled working days.
 */
export function getTechnicianScheduleWorkDays(
  monthName: string,
  year: number = 2026,
  techName: string
): {
  dailyWorkDays: Map<number, number>;
  totalWorkDays: number;
} {
  const allSchedules = getStoredSchedules();
  
  // Clean search query
  const cleanMonth = monthName.trim().toLowerCase();
  const targetMonth = allSchedules.find((s) => {
    return s.monthName.toLowerCase() === cleanMonth ||
      s.id.toLowerCase().includes(cleanMonth) ||
      (cleanMonth.includes('sep') && s.id.includes('09')) ||
      (cleanMonth.includes('okt') && s.id.includes('10')) ||
      (cleanMonth.includes('jan') && s.id.includes('01')) ||
      (cleanMonth.includes('agu') && s.id.includes('08'));
  }) || allSchedules.find((s) => s.id === '2026-09');

  const dailyWorkDays = new Map<number, number>();
  let totalWorkDays = 0;

  if (targetMonth && targetMonth.members && targetMonth.members.length > 0) {
    const cleanTech = techName.trim().toUpperCase();
    const member = targetMonth.members.find((m) => {
      const mName = m.nama.toUpperCase();
      return mName.includes(cleanTech) || cleanTech.includes(mName) ||
        (cleanTech.includes('KEMAS') && mName.includes('KEMAS')) ||
        (cleanTech.includes('DONI') && mName.includes('DONI')) ||
        (cleanTech.includes('JUPI') && mName.includes('JUPI'));
    });

    if (member && member.shifts) {
      const daysCount = targetMonth.totalDays || 30;
      for (let day = 1; day <= daysCount; day++) {
        const shift = (member.shifts[String(day)] || '').trim().toUpperCase();
        // Any shift like M0067 or starting with M is a working day.
        // O (Off), AL (Annual Leave), CUTI, LIBUR are 0.
        const isWorking = shift.startsWith('M') || (shift !== 'O' && shift !== 'OFF' && shift !== 'AL' && shift !== 'LIBUR' && shift !== '');
        const val = isWorking ? 1 : 0;
        dailyWorkDays.set(day, val);
        if (val === 1) {
          totalWorkDays++;
        }
      }
      return { dailyWorkDays, totalWorkDays };
    }
  }

  // Fallback if not found: standard 26 workdays
  for (let day = 1; day <= 30; day++) {
    const isSunday = (day % 7 === 6);
    const val = isSunday ? 0 : 1;
    dailyWorkDays.set(day, val);
    if (val === 1) totalWorkDays++;
  }

  return { dailyWorkDays, totalWorkDays };
}

