import { DailyRecord, MonthlyDataset } from '../types';

export interface DailyRecordExtended extends DailyRecord {
  isoDate: string; // "YYYY-MM-DD"
  monthId: string; // "2026-09"
  monthName: string; // "September"
  year: number; // 2026
}

export interface MonthlyAggregate {
  key: string; // "2026-08"
  label: string; // "Agu 2026"
  shortLabel: string; // "Agu"
  fullLabel: string; // "Agustus 2026"
  year: number;
  monthNumber: number;
  totalDays: number;
  activeDays: number;
  totalJalur: number;
  totalTeam: number;
  avgTeamPerDay: number;
  prod: number;
  bobotMasuk: number;
  bobotFinish: number;
  clearanceRate: number;
  pending: number;
  cancel: number;
  target: number;
  realisasi: number;
  achievementRate: number;
  cumTarget?: number;
  cumReal?: number;
}

export interface WeeklyAggregate {
  key: string; // e.g. "2026-08-W3"
  label: string; // "W3 Agu"
  rangeLabel: string; // "15 - 21 Agu 2026"
  activeDays: number;
  totalJalur: number;
  totalTeam: number;
  prod: number;
  bobotMasuk: number;
  bobotFinish: number;
  clearanceRate: number;
  pending: number;
  cancel: number;
  target: number;
  realisasi: number;
  achievementRate: number;
  cumTarget?: number;
  cumReal?: number;
}

export const INDO_MONTHS_MAP: Record<string, { num: string; name: string; short: string }> = {
  jan: { num: '01', name: 'Januari', short: 'Jan' },
  januari: { num: '01', name: 'Januari', short: 'Jan' },
  feb: { num: '02', name: 'Februari', short: 'Feb' },
  februari: { num: '02', name: 'Februari', short: 'Feb' },
  mar: { num: '03', name: 'Maret', short: 'Mar' },
  maret: { num: '03', name: 'Maret', short: 'Mar' },
  apr: { num: '04', name: 'April', short: 'Apr' },
  april: { num: '04', name: 'April', short: 'Apr' },
  mei: { num: '05', name: 'Mei', short: 'Mei' },
  may: { num: '05', name: 'Mei', short: 'Mei' },
  jun: { num: '06', name: 'Juni', short: 'Jun' },
  juni: { num: '06', name: 'Juni', short: 'Jun' },
  jul: { num: '07', name: 'Juli', short: 'Jul' },
  juli: { num: '07', name: 'Juli', short: 'Jul' },
  agu: { num: '08', name: 'Agustus', short: 'Agu' },
  agt: { num: '08', name: 'Agustus', short: 'Agu' },
  ags: { num: '08', name: 'Agustus', short: 'Agu' },
  agustus: { num: '08', name: 'Agustus', short: 'Agu' },
  aug: { num: '08', name: 'Agustus', short: 'Agu' },
  august: { num: '08', name: 'Agustus', short: 'Agu' },
  sep: { num: '09', name: 'September', short: 'Sep' },
  sept: { num: '09', name: 'September', short: 'Sep' },
  september: { num: '09', name: 'September', short: 'Sep' },
  okt: { num: '10', name: 'Oktober', short: 'Okt' },
  oktober: { num: '10', name: 'Oktober', short: 'Okt' },
  oct: { num: '10', name: 'Oktober', short: 'Okt' },
  nov: { num: '11', name: 'November', short: 'Nov' },
  nop: { num: '11', name: 'November', short: 'Nov' },
  november: { num: '11', name: 'November', short: 'Nov' },
  des: { num: '12', name: 'Desember', short: 'Des' },
  desember: { num: '12', name: 'Desember', short: 'Des' },
  dec: { num: '12', name: 'Desember', short: 'Des' },
};

/**
 * Parses Indonesian dates like "01 Sep 2026", "16 Agu 2026", "3 September 2026" into "YYYY-MM-DD"
 */
export function parseTanggalToIso(tanggal: string, defaultYear = 2026): string | null {
  if (!tanggal || typeof tanggal !== 'string') return null;
  const parts = tanggal.trim().split(/[\s-]+/);
  if (parts.length < 2) return null;

  const dayNum = parseInt(parts[0], 10);
  if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) return null;
  const dayStr = dayNum.toString().padStart(2, '0');

  const monthKey = parts[1].toLowerCase().replace(/[^a-z]/g, '');
  const monthInfo = INDO_MONTHS_MAP[monthKey];
  if (!monthInfo) return null;

  let year = defaultYear;
  if (parts.length >= 3) {
    const parsedYear = parseInt(parts[2], 10);
    if (!isNaN(parsedYear) && parsedYear > 2000) {
      year = parsedYear;
    }
  }

  return `${year}-${monthInfo.num}-${dayStr}`;
}

/**
 * Formats "YYYY-MM-DD" into Indonesian readable format e.g. "16 Agu 2026"
 */
export function formatIsoToIndo(isoDate: string): string {
  if (!isoDate || !isoDate.includes('-')) return isoDate || '';
  const [year, month, day] = isoDate.split('-');
  const mNum = parseInt(month, 10);
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  const mName = monthNames[mNum - 1] || month;
  return `${parseInt(day, 10).toString().padStart(2, '0')} ${mName} ${year}`;
}

/**
 * Formats "YYYY-MM-DD" into short format e.g. "16 Agu"
 */
export function formatIsoToShort(isoDate: string): string {
  if (!isoDate || !isoDate.includes('-')) return isoDate || '';
  const [, month, day] = isoDate.split('-');
  const mNum = parseInt(month, 10);
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  const mName = monthNames[mNum - 1] || month;
  return `${parseInt(day, 10).toString().padStart(2, '0')} ${mName}`;
}

/**
 * Extracts all daily records across multiple datasets and returns them sorted chronologically
 */
export function extractAllChronologicalRecords(
  datasets: Record<string, MonthlyDataset>
): DailyRecordExtended[] {
  const all: DailyRecordExtended[] = [];

  const monthKeys = Object.keys(datasets).sort(); // "2026-08", "2026-09"
  for (const mKey of monthKeys) {
    const ds = datasets[mKey];
    if (!ds || !Array.isArray(ds.records)) continue;

    for (const rec of ds.records) {
      const iso = parseTanggalToIso(rec.tanggal, ds.year) || 
        `${ds.year}-${ds.monthNumber.toString().padStart(2, '0')}-${rec.dayNumber.toString().padStart(2, '0')}`;
      
      all.push({
        ...rec,
        isoDate: iso,
        monthId: mKey,
        monthName: ds.monthName,
        year: ds.year,
      });
    }
  }

  // Sort chronologically
  return all.sort((a, b) => a.isoDate.localeCompare(b.isoDate));
}

/**
 * Aggregates records into monthly buckets for clean YTD rendering
 */
export function aggregateRecordsByMonth(records: DailyRecordExtended[]): MonthlyAggregate[] {
  const map: Record<string, DailyRecordExtended[]> = {};

  for (const rec of records) {
    const monthKey = rec.isoDate.slice(0, 7); // "2026-08"
    if (!map[monthKey]) map[monthKey] = [];
    map[monthKey].push(rec);
  }

  const keys = Object.keys(map).sort();
  let cumTarget = 0;
  let cumReal = 0;

  return keys.map((k) => {
    const recs = map[k];
    const activeRecs = recs.filter((r) => r.hasData);
    const [yearStr, monthStr] = k.split('-');
    const year = parseInt(yearStr, 10);
    const monthNumber = parseInt(monthStr, 10);
    const monthShortNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    const monthFullNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const shortLabel = monthShortNames[monthNumber - 1] || monthStr;
    const fullLabel = monthFullNames[monthNumber - 1] || monthStr;

    const totalJalur = activeRecs.reduce((sum, r) => sum + r.totalJalur, 0);
    const totalTeam = activeRecs.reduce((sum, r) => sum + r.totalTeam, 0);
    const avgTeamPerDay = activeRecs.length > 0 
      ? Math.round((totalTeam / activeRecs.length) * 10) / 10 
      : 0;
    const prod = totalTeam > 0 
      ? Math.round((totalJalur / totalTeam) * 10) / 10 
      : 0;
    const bobotMasuk = activeRecs.reduce((sum, r) => sum + r.bobotMasuk, 0);
    const bobotFinish = activeRecs.reduce((sum, r) => sum + r.bobotFinish, 0);
    const clearanceRate = bobotMasuk > 0 
      ? Math.round((bobotFinish / bobotMasuk) * 1000) / 10 
      : 0;
    const pending = activeRecs.reduce((sum, r) => sum + r.totalPending, 0);
    const cancel = activeRecs.reduce((sum, r) => sum + r.cancel, 0);
    const target = activeRecs.reduce((sum, r) => sum + r.target, 0);
    const realisasi = activeRecs.reduce((sum, r) => sum + r.realisasi, 0);
    const achievementRate = target > 0 
      ? Math.round((realisasi / target) * 10000) / 100 
      : 0;

    cumTarget += target;
    cumReal += realisasi;

    return {
      key: k,
      label: `${shortLabel} ${year}`,
      shortLabel,
      fullLabel: `${fullLabel} ${year}`,
      year,
      monthNumber,
      totalDays: recs.length,
      activeDays: activeRecs.length,
      totalJalur,
      totalTeam,
      avgTeamPerDay,
      prod,
      bobotMasuk,
      bobotFinish,
      clearanceRate,
      pending,
      cancel,
      target,
      realisasi,
      achievementRate,
      cumTarget,
      cumReal,
    };
  });
}

/**
 * Aggregates records into weekly buckets for weekly pacing
 */
export function aggregateRecordsByWeek(records: DailyRecordExtended[]): WeeklyAggregate[] {
  if (records.length === 0) return [];

  // Group by calendar weeks (chunks of 7 days or date blocks)
  const weeks: WeeklyAggregate[] = [];
  let chunk: DailyRecordExtended[] = [];
  let currentMonthId = '';
  let weekIndexInMonth = 1;

  let cumTarget = 0;
  let cumReal = 0;

  const flushChunk = () => {
    if (chunk.length === 0) return;
    const activeRecs = chunk.filter((r) => r.hasData);
    const first = chunk[0];
    const last = chunk[chunk.length - 1];

    const totalJalur = activeRecs.reduce((sum, r) => sum + r.totalJalur, 0);
    const totalTeam = activeRecs.reduce((sum, r) => sum + r.totalTeam, 0);
    const prod = totalTeam > 0 ? Math.round((totalJalur / totalTeam) * 10) / 10 : 0;
    const bobotMasuk = activeRecs.reduce((sum, r) => sum + r.bobotMasuk, 0);
    const bobotFinish = activeRecs.reduce((sum, r) => sum + r.bobotFinish, 0);
    const clearanceRate = bobotMasuk > 0 ? Math.round((bobotFinish / bobotMasuk) * 1000) / 10 : 0;
    const pending = activeRecs.reduce((sum, r) => sum + r.totalPending, 0);
    const cancel = activeRecs.reduce((sum, r) => sum + r.cancel, 0);
    const target = activeRecs.reduce((sum, r) => sum + r.target, 0);
    const realisasi = activeRecs.reduce((sum, r) => sum + r.realisasi, 0);
    const achievementRate = target > 0 ? Math.round((realisasi / target) * 10000) / 100 : 0;

    cumTarget += target;
    cumReal += realisasi;

    const shortMonth = formatIsoToShort(first.isoDate).split(' ')[1] || '';
    const label = `W${weekIndexInMonth} ${shortMonth}`;
    const rangeLabel = `${formatIsoToShort(first.isoDate)} - ${formatIsoToShort(last.isoDate)}`;

    weeks.push({
      key: `${first.isoDate}-W${weekIndexInMonth}`,
      label,
      rangeLabel,
      activeDays: activeRecs.length,
      totalJalur,
      totalTeam,
      prod,
      bobotMasuk,
      bobotFinish,
      clearanceRate,
      pending,
      cancel,
      target,
      realisasi,
      achievementRate,
      cumTarget,
      cumReal,
    });

    chunk = [];
  };

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const mId = rec.isoDate.slice(0, 7);

    if (currentMonthId !== '' && currentMonthId !== mId) {
      flushChunk();
      currentMonthId = mId;
      weekIndexInMonth = 1;
    } else if (chunk.length >= 7) {
      flushChunk();
      weekIndexInMonth++;
    }

    if (currentMonthId === '') {
      currentMonthId = mId;
    }

    chunk.push(rec);
  }

  flushChunk();
  return weeks;
}
