import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Trophy, 
  Award, 
  Clock, 
  XCircle, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Calendar, 
  Layers, 
  RefreshCw, 
  Download, 
  Info, 
  ChevronRight, 
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  Percent,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { 
  TechnicianSummary, 
  IndividualDailyAssignment, 
  RawSummaryIndividuRow,
  PROJECT_TEAM_STANDALONE,
  DEFAULT_TECHNICIANS_DATA
} from '../data/defaultSummaryIndividuData';
import { 
  fetchIndividualSummaryData, 
  getCachedIndividualSummary,
  subscribeIndividualSummary,
  INITIAL_DEFAULT_RESULT,
  IndividualCalculationResult 
} from '../services/individualSummaryService';
import { RegisteredMonthConfig, fetchMonthDataset, fetchMultipleMonthDatasets } from '../services/sheetService';
import { DailyRecord, MonthSummary, MonthlyDataset } from '../types';
import { IndividualKpiTable } from './IndividualKpiTable';
import { getTechnicianScheduleWorkDays } from '../services/scheduleService';
import { INDO_MONTHS_MAP, formatIsoToIndo } from '../utils/dateRangeUtils';

interface IndividualSummaryViewProps {
  currentMonth: RegisteredMonthConfig;
  registeredMonths?: RegisteredMonthConfig[];
  onSelectMonth?: (config: RegisteredMonthConfig) => void;
  monthlyRecords?: DailyRecord[];
  monthSummary?: MonthSummary;
}

export const IndividualSummaryView: React.FC<IndividualSummaryViewProps> = ({ 
  currentMonth,
  registeredMonths = [],
  onSelectMonth,
  monthlyRecords,
  monthSummary,
}) => {
  const [data, setData] = useState<IndividualCalculationResult>(() => getCachedIndividualSummary() || INITIAL_DEFAULT_RESULT);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedTech, setSelectedTech] = useState<TechnicianSummary | null>(() => {
    return (getCachedIndividualSummary() || INITIAL_DEFAULT_RESULT).technicians?.[0] || null;
  });
  // Attribution mode: true = Project Team credited to all 3 technicians (user's rule), false = Standalone
  const [useProjectTeamAttribution, setUseProjectTeamAttribution] = useState(true);
  const [activeTab, setActiveTab] = useState<'kpi' | 'cards' | 'leaderboard' | 'table'>('kpi');

  // Timeframe state for Kartu Performa Individu (MTD, 7D, 30D, YTD, CUSTOM)
  type IndividualTimeframe = 'MTD' | '7D' | '30D' | 'YTD' | 'CUSTOM';
  const [timeframe, setTimeframe] = useState<IndividualTimeframe>('MTD');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-10-07');
  const [multiMonthDatasets, setMultiMonthDatasets] = useState<Record<string, MonthlyDataset>>({});

  useEffect(() => {
    if (registeredMonths && registeredMonths.length > 0) {
      fetchMultipleMonthDatasets(registeredMonths, false)
        .then((map) => setMultiMonthDatasets(map))
        .catch((e) => console.warn('Could not load multi-month datasets:', e));
    }
  }, [registeredMonths]);

  const loadData = async (force = false) => {
    setIsSyncing(true);

    try {
      const res = await fetchIndividualSummaryData(
        currentMonth.sheetUrl, 
        force,
        currentMonth.monthName,
        currentMonth.year || 2026
      );
      setData(res);
      // Auto-select technician if none selected
      setSelectedTech((prev) => {
        if (!prev) return res.technicians[0] || null;
        return res.technicians.find((t) => t.nama === prev.nama) || res.technicians[0] || null;
      });
    } catch (err) {
      console.warn('Background sync individual summary data:', err);
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Subscribe to any background sync events across the entire application
    const unsubscribe = subscribeIndividualSummary((freshResult) => {
      setData(freshResult);
      setSelectedTech((prev) => {
        if (!prev) return freshResult.technicians[0] || null;
        return freshResult.technicians.find((t) => t.nama === prev.nama) || freshResult.technicians[0] || null;
      });
    });

    // 2. Seamlessly trigger background load (non-blocking)
    loadData(false);

    return () => {
      unsubscribe();
    };
  }, [currentMonth.sheetUrl, currentMonth.monthName, currentMonth.year]);

  const [internalMonthlyRecords, setInternalMonthlyRecords] = useState<DailyRecord[]>([]);

  useEffect(() => {
    if (monthlyRecords && monthlyRecords.length > 0) {
      setInternalMonthlyRecords(monthlyRecords);
      return;
    }
    let isCancelled = false;
    fetchMonthDataset(currentMonth)
      .then((ds) => {
        if (!isCancelled && ds && ds.records && ds.records.length > 0) {
          setInternalMonthlyRecords(ds.records);
        }
      })
      .catch((e) => console.warn('Could not load month dataset for individual view:', e));

    return () => {
      isCancelled = true;
    };
  }, [currentMonth, monthlyRecords]);

  const activeMonthlyRecords = (monthlyRecords && monthlyRecords.length > 0) ? monthlyRecords : internalMonthlyRecords;

  const rawTechnicians = data?.technicians || [];

  // Helper to get ISO date from assignment
  const getIsoDate = useCallback((assignment: IndividualDailyAssignment, defMonth: string, defYear: number = 2026): string => {
    if (assignment.isoDate) return assignment.isoDate;
    const parts = (assignment.date || '').trim().split(/\s+/);
    if (parts.length >= 3) {
      const day = parts[0].padStart(2, '0');
      const mStr = parts[1].toLowerCase().slice(0, 3);
      const mNum = INDO_MONTHS_MAP[mStr]?.num || '10';
      const yr = parts[2] || String(defYear);
      return `${yr}-${mNum}-${day}`;
    }
    const mLower = defMonth.toLowerCase().slice(0, 3);
    const mNum = INDO_MONTHS_MAP[mLower]?.num || '10';
    return `${defYear}-${mNum}-${String(assignment.dayNumber).padStart(2, '0')}`;
  }, []);

  // Derive technicians dynamically: each technician receives individual schedule-verified metrics
  // User Rule: "jika off maka DO finish tidak masuk ke pencapaian, di tgl 4 kan KEMAS HIDAYAT OFF harusnya di KARTU PERFORMA INDIVIDU ada perbedaan data antara mereka bertiga, berlaku juga ke yang lain"
  const technicians: TechnicianSummary[] = useMemo(() => {
    const base = rawTechnicians.length > 0 ? rawTechnicians : DEFAULT_TECHNICIANS_DATA;
    const yr = currentMonth.year || 2026;
    const monthLower = currentMonth.monthName.toLowerCase().slice(0, 3);
    const shortM = INDO_MONTHS_MAP[monthLower]?.short || currentMonth.monthName.slice(0, 3);

    return base.map((t) => {
      const scheduleWork = getTechnicianScheduleWorkDays(currentMonth.monthName, yr, t.nama);
      const existingDaily = t.dailyAssignments || [];

      // Create a map by dayNumber
      const dayMap = new Map<number, IndividualDailyAssignment>();

      // 1. First add from existing dailyAssignments with schedule check
      for (const d of existingDaily) {
        const isWorking = scheduleWork.dailyWorkDays.get(d.dayNumber) === 1;
        dayMap.set(d.dayNumber, {
          ...d,
          hariKerja: isWorking ? 1 : 0,
          isOff: !isWorking,
          finishDo: isWorking ? d.finishDo : 0,
          bobotFinish: isWorking ? d.bobotFinish : 0,
          teamString: isWorking ? d.teamString : 'LIBUR / OFF',
        });
      }

      // 2. Supplement from activeMonthlyRecords (Centralize) if day not already recorded
      if (activeMonthlyRecords && activeMonthlyRecords.length > 0) {
        for (const rec of activeMonthlyRecords) {
          if (!rec.hasData && rec.totalJalur === 0 && rec.bobotMasuk === 0) continue;
          if (!dayMap.has(rec.dayNumber)) {
            const isWorking = scheduleWork.dailyWorkDays.get(rec.dayNumber) === 1;
            dayMap.set(rec.dayNumber, {
              date: rec.tanggal || `${String(rec.dayNumber).padStart(2, '0')} ${shortM} ${yr}`,
              dayNumber: rec.dayNumber,
              teamString: isWorking ? (rec.poolName || 'Project Team') : 'LIBUR / OFF',
              isProjectTeam: true,
              totalDo: isWorking ? rec.totalJalur : 0,
              finishDo: isWorking ? rec.realisasi : 0,
              pendingDo: isWorking ? rec.totalPending : 0,
              pendingCustomerDo: isWorking ? rec.totalPending : 0,
              lkpbDo: isWorking ? rec.lkpb : 0,
              cancelDo: isWorking ? rec.cancel : 0,
              bobotDibawa: isWorking ? rec.bobotMasuk : 0,
              bobotFinish: isWorking ? rec.bobotFinish : 0,
              hariKerja: isWorking ? 1 : 0,
              isOff: !isWorking,
            });
          }
        }
      }

      const dailyList = Array.from(dayMap.values()).sort((a, b) => a.dayNumber - b.dayNumber);

      let finish = 0;
      let pending = 0;
      let cancel = 0;
      let lkpb = 0;
      let totalDo = 0;
      let bobotDibawa = 0;
      let bobotFinish = 0;

      for (const d of dailyList) {
        finish += d.finishDo || 0;
        pending += d.pendingDo || 0;
        cancel += d.cancelDo || 0;
        lkpb += d.lkpbDo || 0;
        totalDo += d.totalDo || 0;
        bobotDibawa += d.bobotDibawa || 0;
        bobotFinish += d.bobotFinish || 0;
      }

      const finishPercent = totalDo > 0 ? Number(((finish / totalDo) * 100).toFixed(1)) : 0;
      const clearancePercent = bobotDibawa > 0 ? Number(((bobotFinish / bobotDibawa) * 100).toFixed(1)) : 0;

      return {
        ...t,
        withProjectTeam: {
          finish,
          pending,
          cancel,
          lkpb,
          open: 0,
          totalDo,
          bobotDibawa: Math.round(bobotDibawa * 10) / 10,
          bobotFinish: Math.round(bobotFinish * 10) / 10,
          finishPercent,
          clearancePercent,
        },
        dailyAssignments: dailyList,
      };
    });
  }, [rawTechnicians, activeMonthlyRecords, currentMonth]);

  // Helper to extract relevant stats based on attribution toggle
  const getStats = useCallback((tech: TechnicianSummary) => {
    return useProjectTeamAttribution ? tech.withProjectTeam : tech.standalone;
  }, [useProjectTeamAttribution]);

  // Build Leaderboard rankings with memoization to eliminate recalculation on every render
  const rankedByFinish = React.useMemo(() => {
    return [...technicians].sort((a, b) => {
      const sA = getStats(a);
      const sB = getStats(b);
      if (sB.finish !== sA.finish) return sB.finish - sA.finish;
      return sB.bobotFinish - sA.bobotFinish;
    });
  }, [technicians, getStats]);

  const rankedByPending = React.useMemo(() => {
    return [...technicians].sort((a, b) => {
      const sA = getStats(a);
      const sB = getStats(b);
      return sB.pending - sA.pending;
    });
  }, [technicians, getStats]);

  const rankedByCancel = React.useMemo(() => {
    return [...technicians].sort((a, b) => {
      const sA = getStats(a);
      const sB = getStats(b);
      return sB.cancel - sA.cancel;
    });
  }, [technicians, getStats]);

  const rankedByClearance = React.useMemo(() => {
    return [...technicians].sort((a, b) => {
      const sA = getStats(a);
      const sB = getStats(b);
      return sB.clearancePercent - sA.clearancePercent;
    });
  }, [technicians, getStats]);

  // Determine latest active date across all technicians' assignments
  const effectiveMonthNumStr = String(currentMonth.monthNumber || 10).padStart(2, '0');
  const currentMonthPrefix = `${currentMonth.year || 2026}-${effectiveMonthNumStr}`;

  const allAssignmentDates = useMemo(() => {
    const dates: string[] = [];
    technicians.forEach((t) => {
      (t.dailyAssignments || []).forEach((a) => {
        if ((a.totalDo > 0 || a.finishDo > 0 || a.bobotDibawa > 0) && a.date) {
          const iso = a.isoDate || getIsoDate(a, currentMonth.monthName, currentMonth.year);
          if (iso && !dates.includes(iso)) dates.push(iso);
        }
      });
    });
    return dates.sort();
  }, [technicians, getIsoDate, currentMonth]);

  const latestActiveIso = useMemo(() => {
    if (allAssignmentDates.length > 0) {
      return allAssignmentDates[allAssignmentDates.length - 1];
    }
    return `${currentMonthPrefix}-07`;
  }, [allAssignmentDates, currentMonthPrefix]);

  const { effectiveStartDate, effectiveEndDate, activeDateRangeLabel } = useMemo(() => {
    const yr = currentMonth.year || 2026;
    if (timeframe === 'MTD') {
      const s = `${currentMonthPrefix}-01`;
      const e = `${currentMonthPrefix}-31`;
      return {
        effectiveStartDate: s,
        effectiveEndDate: e,
        activeDateRangeLabel: `MTD (${currentMonth.monthName} ${yr})`,
      };
    }
    if (timeframe === '7D') {
      const dEnd = new Date(latestActiveIso);
      const dStart = new Date(dEnd);
      dStart.setDate(dStart.getDate() - 6);
      const s = dStart.toISOString().split('T')[0];
      const e = latestActiveIso;
      return {
        effectiveStartDate: s,
        effectiveEndDate: e,
        activeDateRangeLabel: `7D (${formatIsoToIndo(s)} - ${formatIsoToIndo(e)})`,
      };
    }
    if (timeframe === '30D') {
      const dEnd = new Date(latestActiveIso);
      const dStart = new Date(dEnd);
      dStart.setDate(dStart.getDate() - 29);
      const s = dStart.toISOString().split('T')[0];
      const e = latestActiveIso;
      return {
        effectiveStartDate: s,
        effectiveEndDate: e,
        activeDateRangeLabel: `30D (${formatIsoToIndo(s)} - ${formatIsoToIndo(e)})`,
      };
    }
    if (timeframe === 'YTD') {
      const s = `${yr}-01-01`;
      const e = latestActiveIso;
      return {
        effectiveStartDate: s,
        effectiveEndDate: e,
        activeDateRangeLabel: `YTD (01 Jan ${yr} - ${formatIsoToIndo(e)})`,
      };
    }
    // CUSTOM
    const s = customStartDate || `${currentMonthPrefix}-01`;
    const e = customEndDate || latestActiveIso;
    return {
      effectiveStartDate: s,
      effectiveEndDate: e,
      activeDateRangeLabel: `Kustom (${formatIsoToIndo(s)} - ${formatIsoToIndo(e)})`,
    };
  }, [timeframe, currentMonthPrefix, currentMonth, latestActiveIso, customStartDate, customEndDate]);

  // Compute filtered assignments and performance statistics per technician based on the timeframe
  const filteredTechniciansData = useMemo(() => {
    const map = new Map<string, {
      stats: {
        finish: number;
        pending: number;
        cancel: number;
        lkpb: number;
        totalDo: number;
        bobotDibawa: number;
        bobotFinish: number;
        finishPercent: number;
        clearancePercent: number;
        activeDays: number;
        workDays: number;
      };
      assignments: IndividualDailyAssignment[];
    }>();

    for (const tech of technicians) {
      let sourceAssignments = tech.dailyAssignments || [];

      // If YTD and multiMonthDatasets is available, aggregate across all months
      if (timeframe === 'YTD' && Object.keys(multiMonthDatasets).length > 0) {
        const crossAssignments: IndividualDailyAssignment[] = [];
        for (const [mId, dsVal] of Object.entries(multiMonthDatasets)) {
          const ds = dsVal as MonthlyDataset;
          if (!ds || !ds.records) continue;
          const mParts = mId.split('-');
          const mYear = parseInt(mParts[0], 10) || 2026;
          const mNum = parseInt(mParts[1], 10) || 9;
          const monthConfig = (registeredMonths || []).find((r) => r.id === mId);
          const mName = monthConfig?.monthName || ds.monthName || 'Bulan';
          const sch = getTechnicianScheduleWorkDays(mName, mYear, tech.nama);

          ds.records.forEach((rec) => {
            if (!rec.hasData && rec.totalJalur === 0 && rec.bobotMasuk === 0) return;
            const isWorking = sch.dailyWorkDays.get(rec.dayNumber) === 1;
            crossAssignments.push({
              date: rec.tanggal,
              dayNumber: rec.dayNumber,
              teamString: isWorking ? (rec.poolName || 'Project Team') : 'LIBUR / OFF',
              isProjectTeam: true,
              totalDo: isWorking ? rec.totalJalur : 0,
              finishDo: isWorking ? rec.realisasi : 0,
              pendingDo: isWorking ? rec.totalPending : 0,
              pendingCustomerDo: isWorking ? rec.totalPending : 0,
              lkpbDo: isWorking ? rec.lkpb : 0,
              cancelDo: isWorking ? rec.cancel : 0,
              bobotDibawa: isWorking ? rec.bobotMasuk : 0,
              bobotFinish: isWorking ? rec.bobotFinish : 0,
              hariKerja: isWorking ? 1 : 0,
              isOff: !isWorking,
              isoDate: `${mYear}-${String(mNum).padStart(2, '0')}-${String(rec.dayNumber).padStart(2, '0')}`,
            });
          });
        }
        if (crossAssignments.length > 0) {
          sourceAssignments = crossAssignments;
        }
      }

      const inRangeAssignments = sourceAssignments.filter((a) => {
        const iso = a.isoDate || getIsoDate(a, currentMonth.monthName, currentMonth.year);
        return iso >= effectiveStartDate && iso <= effectiveEndDate;
      });

      let finish = 0;
      let pending = 0;
      let cancel = 0;
      let lkpb = 0;
      let totalDo = 0;
      let bobotDibawa = 0;
      let bobotFinish = 0;
      let activeDays = 0;
      let workDays = 0;

      for (const d of inRangeAssignments) {
        finish += d.finishDo || 0;
        pending += d.pendingDo || 0;
        cancel += d.cancelDo || 0;
        lkpb += d.lkpbDo || 0;
        totalDo += d.totalDo || 0;
        bobotDibawa += d.bobotDibawa || 0;
        bobotFinish += d.bobotFinish || 0;
        if ((d.totalDo || 0) > 0 || (d.finishDo || 0) > 0 || (d.bobotDibawa || 0) > 0) {
          activeDays++;
        }
        if (!d.isOff && d.hariKerja !== 0) {
          workDays++;
        }
      }

      const finishPercent = totalDo > 0 ? Number(((finish / totalDo) * 100).toFixed(1)) : 0;
      const clearancePercent = bobotDibawa > 0 ? Number(((bobotFinish / bobotDibawa) * 100).toFixed(1)) : 0;

      map.set(tech.nama, {
        stats: {
          finish,
          pending,
          cancel,
          lkpb,
          totalDo,
          bobotDibawa: Math.round(bobotDibawa * 10) / 10,
          bobotFinish: Math.round(bobotFinish * 10) / 10,
          finishPercent,
          clearancePercent,
          activeDays,
          workDays,
        },
        assignments: inRangeAssignments,
      });
    }

    return map;
  }, [technicians, timeframe, multiMonthDatasets, registeredMonths, currentMonth, effectiveStartDate, effectiveEndDate, getIsoDate]);

  // Export to CSV
  const handleExportCsv = () => {
    if (!data) return;
    const headers = [
      'NAMA STAFF',
      'TOTAL DO',
      'FINISH DO',
      'PENDING DO',
      'CANCEL DO',
      '% FINISH',
      'BOBOT FINISH',
      'BOBOT DIBAWA',
      '% CLEARANCE BOBOT'
    ];

    const rows = technicians.map((tech) => {
      const s = getStats(tech);
      return [
        `"${tech.nama}"`,
        s.totalDo,
        s.finish,
        s.pending,
        s.cancel,
        `"${s.finishPercent}%"`,
        s.bobotFinish,
        s.bobotDibawa,
        `"${s.clearancePercent}%"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Summary_Individu_${currentMonth.monthName}_${currentMonth.year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Control Bar */}
      <div className="neo-card p-4 sm:p-5 bg-gradient-to-r from-amber-50 via-white to-blue-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-amber-400 border-2.5 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] flex items-center justify-center text-slate-900 shrink-0">
              <Trophy className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="neo-pill bg-amber-200 text-amber-950 border-slate-900 text-xs font-black">
                  SUMMARY INDIVIDU & LEADERBOARD
                </span>
                <span className="neo-pill bg-blue-100 text-blue-900 border-slate-900 text-xs font-mono font-bold">
                  {currentMonth.monthName} {currentMonth.year}
                </span>
                {data?.source === 'live' && (
                  <span className="neo-pill bg-emerald-200 text-emerald-950 border-slate-900 text-xs font-black flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                    LIVE SINKRON SPREADSHEET
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-['Space_Grotesk',sans-serif]">
                Performa Individu & Klasemen Tim Pool Singkawang
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Monitoring pencapaian finish, pending, cancel, serta perolehan bobot per person dari total bobot yang dibawa.
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Project Team Attribution Rule Toggle */}
            <div className="neo-card p-1.5 bg-white flex items-center gap-2 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]">
              <span className="text-[11px] font-black text-slate-700 pl-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                Aturan Project Team:
              </span>
              <button
                id="btn-toggle-project-team-rule"
                onClick={() => setUseProjectTeamAttribution(!useProjectTeamAttribution)}
                className={`neo-pill text-xs font-black px-2.5 py-1 cursor-pointer transition-all ${
                  useProjectTeamAttribution 
                    ? 'bg-emerald-300 text-emerald-950 border-slate-900 shadow-[1px_1px_0px_0px_#0f172a]' 
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}
                title="Bila aktif: DO finish pada Project Team diatribusikan ke ketiga individu (Kemas, Doni, Jupi)"
              >
                {useProjectTeamAttribution ? 'AKTIF (3 Anggota)' : 'NON-AKTIF (Terpisah)'}
              </button>
            </div>

            <button
              id="btn-refresh-individual-data"
              onClick={() => loadData(true)}
              disabled={isLoading}
              className="neo-btn bg-white hover:bg-slate-100 text-slate-900 text-xs px-3 py-2 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              id="btn-export-individual-csv"
              onClick={handleExportCsv}
              className="neo-btn bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Info Note on Project Team logic */}
        <div className="mt-3 pt-3 border-t-2 border-slate-200 text-[11px] text-slate-600 flex items-center gap-2 flex-wrap">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>
            <strong>Aturan Penugasan:</strong> Bila <em>"Project Team"</em> bertugas, hasil penyelesaian DO finish dan bobot finish diperhitungkan ke 3 anggota tim (<strong>Kemas Hidayat</strong>, <strong>Doni Ashari</strong>, dan <strong>Muhammad Jupi</strong>).
          </span>
          <span className="font-bold text-blue-700 ml-auto font-mono">
            Catatan: Bobot bukan kilogram (KG), melainkan poin bobot penugasan.
          </span>
        </div>
      </div>

      {/* Navigation Pills (Tabel Khusus KPI, Cards, Leaderboard, Table) */}
      <div className="flex items-center gap-2 border-b-2.5 border-slate-900 pb-2 flex-wrap">
        <button
          id="tab-btn-kpi-table"
          onClick={() => setActiveTab('kpi')}
          className={`neo-pill text-xs font-black px-4 py-2 cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTab === 'kpi'
              ? 'bg-blue-600 text-white border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]'
              : 'bg-white text-slate-700 border-slate-900 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4 stroke-[2.5]" />
          <span>TABEL KHUSUS KPI PER INDIVIDU</span>
          <span className="neo-stamp bg-amber-300 text-slate-950 text-[9px] py-0.5 px-1 font-mono">
            FORMAT GAMBAR
          </span>
        </button>

        <button
          id="tab-btn-cards"
          onClick={() => setActiveTab('cards')}
          className={`neo-pill text-xs font-black px-4 py-2 cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTab === 'cards'
              ? 'bg-blue-600 text-white border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]'
              : 'bg-white text-slate-700 border-slate-900 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4 stroke-[2.5]" />
          <span>KARTU PERFORMA INDIVIDU</span>
        </button>

        <button
          id="tab-btn-leaderboard"
          onClick={() => setActiveTab('leaderboard')}
          className={`neo-pill text-xs font-black px-4 py-2 cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTab === 'leaderboard'
              ? 'bg-amber-400 text-slate-950 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]'
              : 'bg-white text-slate-700 border-slate-900 hover:bg-slate-50'
          }`}
        >
          <Trophy className="w-4 h-4 stroke-[2.5]" />
          <span>LEADERBOARD KLUB JUARA</span>
        </button>

        <button
          id="tab-btn-table"
          onClick={() => setActiveTab('table')}
          className={`neo-pill text-xs font-black px-4 py-2 cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTab === 'table'
              ? 'bg-emerald-400 text-slate-950 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]'
              : 'bg-white text-slate-700 border-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4 stroke-[2.5]" />
          <span>TABEL REKAP SUMMARY INDIVIDU</span>
        </button>
      </div>

      {/* SECTION: TABEL KHUSUS KPI PER INDIVIDU (SESUAI GAMBAR & DATA SPREADSHEET PENGATURAN) */}
      {activeTab === 'kpi' && (
        <IndividualKpiTable
          technicians={technicians}
          currentMonth={currentMonth}
          registeredMonths={registeredMonths}
          onSelectMonth={onSelectMonth}
          selectedTechName={selectedTech?.nama}
          onSelectTechName={(name) => {
            const found = technicians.find((t) => t.nama.toUpperCase() === name.toUpperCase());
            if (found) setSelectedTech(found);
          }}
          monthlyRecords={activeMonthlyRecords}
        />
      )}

      {/* SECTION 1: LEADERBOARDS (4 Podium Categories: Finish, Pending, Cancel, Clearance) */}
      {activeTab === 'leaderboard' && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Leaderboard 1: FINISH TERBANYAK */}
        <div className="neo-card p-4 bg-amber-50/60 border-2.5 border-slate-900">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🥇</span>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase font-['Space_Grotesk']">
                  Finish Terbanyak
                </h3>
                <span className="text-[10px] text-slate-600 font-bold block">Paling produktif selesaikan DO</span>
              </div>
            </div>
            <span className="neo-pill bg-amber-200 text-amber-950 text-[10px] font-black">TOP DO</span>
          </div>

          <div className="space-y-2.5">
            {rankedByFinish.map((tech, idx) => {
              const s = getStats(tech);
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
              const rankBg = idx === 0 ? 'bg-amber-100 border-amber-400' : idx === 1 ? 'bg-slate-100 border-slate-300' : 'bg-orange-50 border-orange-200';

              return (
                <div 
                  key={tech.nama} 
                  className={`neo-card p-2.5 ${rankBg} flex items-center justify-between transition-transform hover:-translate-y-0.5 cursor-pointer`}
                  onClick={() => setSelectedTech(tech)}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{medal}</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{tech.nama}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold">
                        <span>Bobot Finish: <strong className="text-slate-900">{s.bobotFinish}</strong></span>
                        <span>•</span>
                        <span>Clearance: <strong>{s.clearancePercent}%</strong></span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-emerald-700 font-['Space_Grotesk']">
                      {s.finish} <span className="text-[10px] font-bold text-slate-500 font-mono">DO</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      dari {s.totalDo} DO
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard 2: PENDING TERBANYAK */}
        <div className="neo-card p-4 bg-orange-50/60 border-2.5 border-slate-900">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase font-['Space_Grotesk']">
                  Pending Terbanyak
                </h3>
                <span className="text-[10px] text-slate-600 font-bold block">Memerlukan follow-up prioritas</span>
              </div>
            </div>
            <span className="neo-pill bg-amber-200 text-amber-950 text-[10px] font-black">PENDING</span>
          </div>

          <div className="space-y-2.5">
            {rankedByPending.map((tech, idx) => {
              const s = getStats(tech);
              const rankNumber = idx + 1;

              return (
                <div 
                  key={tech.nama} 
                  className="neo-card p-2.5 bg-white flex items-center justify-between transition-transform hover:-translate-y-0.5 cursor-pointer"
                  onClick={() => setSelectedTech(tech)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-amber-100 border border-slate-900 text-amber-950 flex items-center justify-center font-black text-xs">
                      #{rankNumber}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{tech.nama}</h4>
                      <span className="text-[10px] text-slate-600 font-bold">
                        Rasio Pending: {s.totalDo > 0 ? ((s.pending / s.totalDo) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-amber-700 font-['Space_Grotesk']">
                      {s.pending} <span className="text-[10px] font-bold text-slate-500 font-mono">DO</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      Perlu tindak lanjut
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard 3: CANCEL TERBANYAK */}
        <div className="neo-card p-4 bg-rose-50/60 border-2.5 border-slate-900">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛑</span>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase font-['Space_Grotesk']">
                  Cancel Terbanyak
                </h3>
                <span className="text-[10px] text-slate-600 font-bold block">DO dibatalkan saat jalur</span>
              </div>
            </div>
            <span className="neo-pill bg-rose-200 text-rose-950 text-[10px] font-black">CANCEL</span>
          </div>

          <div className="space-y-2.5">
            {rankedByCancel.map((tech, idx) => {
              const s = getStats(tech);
              const rankNumber = idx + 1;

              return (
                <div 
                  key={tech.nama} 
                  className="neo-card p-2.5 bg-white flex items-center justify-between transition-transform hover:-translate-y-0.5 cursor-pointer"
                  onClick={() => setSelectedTech(tech)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-rose-100 border border-slate-900 text-rose-950 flex items-center justify-center font-black text-xs">
                      #{rankNumber}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{tech.nama}</h4>
                      <span className="text-[10px] text-slate-600 font-bold">
                        Rasio Cancel: {s.totalDo > 0 ? ((s.cancel / s.totalDo) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-rose-700 font-['Space_Grotesk']">
                      {s.cancel} <span className="text-[10px] font-bold text-slate-500 font-mono">DO</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      Batal kirim
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* SECTION 2: 3 PROMINENT INDIVIDUAL CARDS (Kemas Hidayat, Doni Ashari, Muhammad Jupi) */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 font-['Space_Grotesk',sans-serif] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600 stroke-[2.5]" />
                Kartu Detail & Bobot Per Orang (Kemas, Doni, Jupi)
              </h2>
              <span className="text-xs text-slate-600 font-bold">
                Pencapaian riil per individu berdasarkan jadwal dinas (hari OFF tidak dihitung)
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono font-bold">
              Klik kartu untuk melihat rincian tanggal penugasan
            </span>
          </div>

          {/* TIMEFRAME FILTER BAR FOR INDIVIDUAL CARDS (YTD, MTD, 7D, 30D, CUSTOM) */}
          <div className="neo-card p-3.5 bg-slate-50 border-2 border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[2px_2px_0px_0px_#0f172a]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5 font-mono">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                Timeframe:
              </span>
              {(['MTD', '7D', '30D', 'YTD', 'CUSTOM'] as IndividualTimeframe[]).map((tf) => (
                <button
                  key={tf}
                  id={`btn-timeframe-${tf.toLowerCase()}`}
                  onClick={() => setTimeframe(tf)}
                  className={`neo-btn text-xs px-3 py-1.5 font-black uppercase transition-all ${
                    timeframe === tf
                      ? 'bg-blue-600 text-white shadow-[2px_2px_0px_0px_#0f172a]'
                      : 'bg-white hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  {tf === 'CUSTOM' ? 'Rentang Kustom' : tf}
                </button>
              ))}
            </div>

            {/* Date Range Badge & Custom Inputs */}
            <div className="flex items-center gap-2 flex-wrap">
              {timeframe === 'CUSTOM' ? (
                <div className="flex items-center gap-2 bg-white p-1 rounded border border-slate-900">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="text-xs py-1 px-1.5 border border-slate-300 rounded font-mono bg-white text-slate-900 font-bold focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-500">s/d</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="text-xs py-1 px-1.5 border border-slate-300 rounded font-mono bg-white text-slate-900 font-bold focus:outline-none"
                  />
                </div>
              ) : (
                <span className="neo-pill bg-white text-slate-900 border-slate-900 text-xs font-bold font-mono">
                  📅 {activeDateRangeLabel}
                </span>
              )}
              <span className="neo-pill bg-blue-100 text-blue-950 border-slate-900 text-xs font-black">
                {timeframe}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {technicians.map((tech) => {
              const fData = filteredTechniciansData.get(tech.nama);
              const s = fData?.stats || getStats(tech);
              const activeCount = fData?.assignments.length ?? tech.dailyAssignments.length;
              const isSelected = selectedTech?.nama === tech.nama;

              return (
                <div
                  key={tech.nama}
                  id={`card-tech-${tech.alias.toLowerCase()}`}
                  onClick={() => setSelectedTech(tech)}
                  className={`neo-card p-5 cursor-pointer transition-all relative ${
                    isSelected 
                      ? 'ring-3 ring-blue-600 bg-white shadow-[6px_6px_0px_0px_#2563eb]' 
                      : 'bg-white hover:bg-slate-50 shadow-[4px_4px_0px_0px_#0f172a]'
                  }`}
                >
                  {/* Top Badge: Rank & Timeframe Indicator */}
                  <div className="flex items-start justify-between pb-3 border-b-2 border-slate-900 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg ${tech.avatarBg} text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center font-black text-base font-['Space_Grotesk']`}>
                        {tech.alias.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 font-['Space_Grotesk']">
                          {tech.nama}
                        </h3>
                        <span className="text-[11px] font-bold text-slate-500">
                          {tech.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="neo-pill bg-blue-100 text-blue-900 border-slate-900 text-xs font-mono font-black">
                        {tech.alias}
                      </span>
                      <span className="neo-pill bg-slate-100 text-slate-700 border-slate-900 text-[10px] font-mono font-bold">
                        {timeframe}
                      </span>
                    </div>
                  </div>

                  {/* Main Metric: BOBOT FINISH DARI TOTAL BOBOT YANG DIBAWA */}
                  <div className="neo-card p-3.5 bg-emerald-50 border-2 border-slate-900 mb-4">
                    <div className="flex items-center justify-between text-[11px] font-black text-emerald-950 mb-1">
                      <span className="flex items-center gap-1 uppercase">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                        Total Bobot Finish / Dibawa:
                      </span>
                      <span className="neo-pill bg-emerald-200 text-emerald-950 text-[10px] font-mono font-black">
                        {s.clearancePercent}% Clearance
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-black text-emerald-900 font-['Space_Grotesk']">
                        {s.bobotFinish}
                      </span>
                      <span className="text-sm font-bold text-slate-600 font-mono">
                        / {s.bobotDibawa} Bobot
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-3 border-1.5 border-slate-900 overflow-hidden mt-2">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, s.clearancePercent))}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats Grid: Finish, Pending, Cancel, Total DO */}
                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    <div className="neo-card p-2.5 bg-blue-50 border-1.5 border-slate-900">
                      <span className="text-[10px] font-black text-blue-950 uppercase font-mono block">
                        FINISH DO
                      </span>
                      <div className="text-2xl font-black text-blue-900 font-['Space_Grotesk'] mt-0.5">
                        {s.finish} <span className="text-xs font-bold text-slate-500 font-mono">DO</span>
                      </div>
                      <span className="text-[10px] text-blue-800 font-black">
                        {s.finishPercent}% dari total
                      </span>
                    </div>

                    <div className="neo-card p-2.5 bg-amber-50 border-1.5 border-slate-900">
                      <span className="text-[10px] font-black text-amber-950 uppercase font-mono block">
                        PENDING DO
                      </span>
                      <div className="text-2xl font-black text-amber-900 font-['Space_Grotesk'] mt-0.5">
                        {s.pending} <span className="text-xs font-bold text-slate-500 font-mono">DO</span>
                      </div>
                      <span className="text-[10px] text-amber-800 font-bold">
                        {s.totalDo > 0 ? ((s.pending / s.totalDo) * 100).toFixed(1) : 0}% pending
                      </span>
                    </div>

                    <div className="neo-card p-2.5 bg-rose-50 border-1.5 border-slate-900">
                      <span className="text-[10px] font-black text-rose-950 uppercase font-mono block">
                        CANCEL DO
                      </span>
                      <div className="text-2xl font-black text-rose-900 font-['Space_Grotesk'] mt-0.5">
                        {s.cancel} <span className="text-xs font-bold text-slate-500 font-mono">DO</span>
                      </div>
                      <span className="text-[10px] text-rose-800 font-bold">
                        {s.totalDo > 0 ? ((s.cancel / s.totalDo) * 100).toFixed(1) : 0}% cancel
                      </span>
                    </div>

                    <div className="neo-card p-2.5 bg-slate-100 border-1.5 border-slate-900">
                      <span className="text-[10px] font-black text-slate-800 uppercase font-mono block">
                        TOTAL DO JALUR
                      </span>
                      <div className="text-2xl font-black text-slate-900 font-['Space_Grotesk'] mt-0.5">
                        {s.totalDo} <span className="text-xs font-bold text-slate-500 font-mono">DO</span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-bold">
                        {s.activeDays ?? activeCount} Hari aktif jalur
                      </span>
                    </div>
                  </div>

                  {/* Action buttons: Open Specific KPI Table or View Daily Log */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTech(tech);
                        setActiveTab('kpi');
                      }}
                      className="neo-btn bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_#0f172a]"
                      title={`Buka Tabel Khusus KPI ${tech.alias} sesuai format gambar`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Tabel KPI</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTech(tech);
                      }}
                      className="neo-btn bg-white hover:bg-slate-100 text-slate-900 text-xs py-2 flex items-center justify-center gap-1 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]"
                    >
                      <span>Log Harian</span>
                      <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: TABEL REKAP SUMMARY INDIVIDU (REFERENCE FROM GOOGLE SHEETS) */}
      {activeTab === 'table' && (
        <div className="neo-card p-4 sm:p-5 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2.5 border-slate-900 gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="neo-pill bg-emerald-100 text-emerald-950 border-slate-900 text-xs font-black">
                  REFERENSI GOOGLE SHEETS
                </span>
                <span className="text-xs text-slate-600 font-mono font-bold">
                  Tab: "Summary Individu"
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1 font-['Space_Grotesk']">
                Tabel Rekapitulasi Summary Hasil Individu Pool Singkawang
              </h3>
            </div>
            <div className="text-xs text-slate-600 font-bold">
              Mode Aturan: <strong>{useProjectTeamAttribution ? 'Distribusi Project Team Aktif' : 'Standar Sheet Mentah'}</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-mono uppercase text-[10px]">
                  <th className="p-3 border-b-2 border-slate-900">NAMA STAFF</th>
                  <th className="p-3 text-center border-b-2 border-slate-900 bg-emerald-950">FINISH</th>
                  <th className="p-3 text-center border-b-2 border-slate-900">RESCH</th>
                  <th className="p-3 text-center border-b-2 border-slate-900">RUSONG</th>
                  <th className="p-3 text-center border-b-2 border-slate-900">TUNGKOM</th>
                  <th className="p-3 text-center border-b-2 border-slate-900">BRG</th>
                  <th className="p-3 text-center border-b-2 border-slate-900">LJI</th>
                  <th className="p-3 text-center border-b-2 border-slate-900">INST</th>
                  <th className="p-3 text-center border-b-2 border-slate-900 bg-rose-950">CANCEL</th>
                  <th className="p-3 text-center border-b-2 border-slate-900">LKPB</th>
                  <th className="p-3 text-center border-b-2 border-slate-900 bg-blue-950">TOTAL DO</th>
                  <th className="p-3 text-center border-b-2 border-slate-900 bg-amber-950">TOTAL PENDING</th>
                  <th className="p-3 text-center border-b-2 border-slate-900">% FINISH</th>
                  <th className="p-3 text-right border-b-2 border-slate-900 bg-emerald-900">BOBOT FINISH</th>
                  <th className="p-3 text-right border-b-2 border-slate-900">BOBOT DIBAWA</th>
                  <th className="p-3 text-center border-b-2 border-slate-900">CLEARANCE %</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200 font-mono">
                {technicians.map((tech) => {
                  const s = getStats(tech);
                  return (
                    <tr 
                      key={tech.nama} 
                      className="hover:bg-blue-50/60 transition-colors font-bold cursor-pointer"
                      onClick={() => setSelectedTech(tech)}
                    >
                      <td className="p-3 font-black text-slate-900 font-sans flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${tech.avatarBg} inline-block border border-slate-900`}></span>
                        <span>{tech.nama}</span>
                      </td>
                      <td className="p-3 text-center font-black text-emerald-800 bg-emerald-50/50">
                        {s.finish}
                      </td>
                      <td className="p-3 text-center text-slate-700">
                        {tech.nama === 'DONI ASHARI' || tech.nama === 'MUHAMMAD JUPI' ? '1' : '0'}
                      </td>
                      <td className="p-3 text-center text-slate-700">
                        {tech.nama === 'DONI ASHARI' || tech.nama === 'MUHAMMAD JUPI' ? '1' : '0'}
                      </td>
                      <td className="p-3 text-center text-slate-500">0</td>
                      <td className="p-3 text-center text-slate-500">0</td>
                      <td className="p-3 text-center text-slate-500">0</td>
                      <td className="p-3 text-center text-slate-500">0</td>
                      <td className="p-3 text-center font-black text-rose-700 bg-rose-50/50">
                        {s.cancel}
                      </td>
                      <td className="p-3 text-center text-slate-500">0</td>
                      <td className="p-3 text-center font-black text-blue-900 bg-blue-50/50">
                        {s.totalDo}
                      </td>
                      <td className="p-3 text-center font-black text-amber-800 bg-amber-50/50">
                        {s.pending}
                      </td>
                      <td className="p-3 text-center font-black text-slate-900">
                        {s.finishPercent}%
                      </td>
                      <td className="p-3 text-right font-black text-emerald-800 bg-emerald-50/50">
                        {s.bobotFinish}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-700">
                        {s.bobotDibawa}
                      </td>
                      <td className="p-3 text-center font-black text-teal-800">
                        {s.clearancePercent}%
                      </td>
                    </tr>
                  );
                })}

                {/* Standalone Project Team row if user wants to see it */}
                {!useProjectTeamAttribution && (
                  <tr className="bg-amber-50/40 hover:bg-amber-100/50 transition-colors font-bold">
                    <td className="p-3 font-black text-amber-950 font-sans flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block border border-slate-900"></span>
                      <span>PROJECT TEAM (BERSAMA)</span>
                    </td>
                    <td className="p-3 text-center font-black text-emerald-800">
                      {PROJECT_TEAM_STANDALONE.finish}
                    </td>
                    <td className="p-3 text-center text-slate-500">0</td>
                    <td className="p-3 text-center text-slate-500">0</td>
                    <td className="p-3 text-center text-slate-500">0</td>
                    <td className="p-3 text-center text-slate-500">0</td>
                    <td className="p-3 text-center text-slate-500">0</td>
                    <td className="p-3 text-center text-slate-500">0</td>
                    <td className="p-3 text-center font-black text-rose-700">
                      {PROJECT_TEAM_STANDALONE.cancel}
                    </td>
                    <td className="p-3 text-center text-slate-500">0</td>
                    <td className="p-3 text-center font-black text-blue-900">
                      {PROJECT_TEAM_STANDALONE.totalDo}
                    </td>
                    <td className="p-3 text-center font-black text-amber-800">
                      {PROJECT_TEAM_STANDALONE.pending}
                    </td>
                    <td className="p-3 text-center font-black text-slate-900">
                      {PROJECT_TEAM_STANDALONE.finishPercent}%
                    </td>
                    <td className="p-3 text-right font-black text-emerald-800">
                      {PROJECT_TEAM_STANDALONE.bobotFinish}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-700">
                      {PROJECT_TEAM_STANDALONE.bobotDibawa}
                    </td>
                    <td className="p-3 text-center font-black text-teal-800">
                      {PROJECT_TEAM_STANDALONE.clearancePercent}%
                    </td>
                  </tr>
                )}

                {/* TOTAL SUMMARY ROW */}
                <tr className="bg-slate-100 font-black text-slate-900 border-t-2.5 border-slate-900">
                  <td className="p-3 font-sans uppercase">
                    TOTAL KESELURUHAN POOL
                  </td>
                  <td className="p-3 text-center text-emerald-900 bg-emerald-100/50">
                    {technicians.reduce((acc, t) => acc + getStats(t).finish, 0)}
                  </td>
                  <td className="p-3 text-center text-slate-700">2</td>
                  <td className="p-3 text-center text-slate-700">2</td>
                  <td className="p-3 text-center text-slate-500">0</td>
                  <td className="p-3 text-center text-slate-500">0</td>
                  <td className="p-3 text-center text-slate-500">0</td>
                  <td className="p-3 text-center text-slate-500">0</td>
                  <td className="p-3 text-center text-rose-900 bg-rose-100/50">
                    {technicians.reduce((acc, t) => acc + getStats(t).cancel, 0)}
                  </td>
                  <td className="p-3 text-center text-slate-500">0</td>
                  <td className="p-3 text-center text-blue-950 bg-blue-100/50">
                    {technicians.reduce((acc, t) => acc + getStats(t).totalDo, 0)}
                  </td>
                  <td className="p-3 text-center text-amber-950 bg-amber-100/50">
                    {technicians.reduce((acc, t) => acc + getStats(t).pending, 0)}
                  </td>
                  <td className="p-3 text-center">
                    {Number(
                      (
                        (technicians.reduce((acc, t) => acc + getStats(t).finish, 0) /
                          Math.max(1, technicians.reduce((acc, t) => acc + getStats(t).totalDo, 0))) *
                        100
                      ).toFixed(1)
                    )}%
                  </td>
                  <td className="p-3 text-right text-emerald-950 bg-emerald-100/50">
                    {technicians.reduce((acc, t) => acc + getStats(t).bobotFinish, 0)}
                  </td>
                  <td className="p-3 text-right">
                    {technicians.reduce((acc, t) => acc + getStats(t).bobotDibawa, 0)}
                  </td>
                  <td className="p-3 text-center text-teal-950">
                    {Number(
                      (
                        (technicians.reduce((acc, t) => acc + getStats(t).bobotFinish, 0) /
                          Math.max(1, technicians.reduce((acc, t) => acc + getStats(t).bobotDibawa, 0))) *
                        100
                      ).toFixed(1)
                    )}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: MODAL / DRAWER DETAIL RINCIAN PENUGASAN HARIAN */}
      {selectedTech && (() => {
        const activeFilteredAssignments = filteredTechniciansData.get(selectedTech.nama)?.assignments || selectedTech.dailyAssignments || [];
        return (
        <div className="neo-card p-5 bg-white border-2.5 border-slate-900">
          <div className="flex items-center justify-between pb-3 border-b-2.5 border-slate-900 mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${selectedTech.avatarBg} text-white border-2 border-slate-900 flex items-center justify-center font-black text-sm`}>
                {selectedTech.alias.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="neo-pill bg-blue-100 text-blue-950 border-slate-900 text-xs font-black">
                    LOG HARIAN TEKNISI
                  </span>
                  <span className="neo-pill bg-slate-100 text-slate-800 border-slate-900 text-xs font-mono font-bold">
                    {timeframe}: {activeDateRangeLabel}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {activeFilteredAssignments.length} Hari Tercatat
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5 font-['Space_Grotesk']">
                  Riwayat Jalur & Penugasan: {selectedTech.nama}
                </h3>
              </div>
            </div>
            <button
              onClick={() => setSelectedTech(null)}
              className="neo-btn bg-white hover:bg-rose-100 text-slate-900 text-xs px-2.5 py-1.5 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span>Tutup Log</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-100 text-slate-900 uppercase text-[10px] border-b-2 border-slate-900">
                  <th className="p-2.5">TANGGAL</th>
                  <th className="p-2.5">TIM PENUGASAN</th>
                  <th className="p-2.5 text-center">TIPE TIM</th>
                  <th className="p-2.5 text-center bg-blue-50">TOTAL DO</th>
                  <th className="p-2.5 text-center bg-emerald-50">FINISH DO</th>
                  <th className="p-2.5 text-center bg-amber-50">PENDING</th>
                  <th className="p-2.5 text-center bg-rose-50">CANCEL</th>
                  <th className="p-2.5 text-right">BOBOT DIBAWA</th>
                  <th className="p-2.5 text-right bg-emerald-50">BOBOT FINISH</th>
                  <th className="p-2.5 text-center">CLEARANCE %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activeFilteredAssignments.map((dayLog) => {
                  const clearance = dayLog.bobotDibawa > 0 
                    ? Number(((dayLog.bobotFinish / dayLog.bobotDibawa) * 100).toFixed(1)) 
                    : 100;

                  return (
                    <tr key={`${dayLog.date}-${dayLog.dayNumber}`} className={`hover:bg-slate-50 transition-colors ${dayLog.isOff ? 'bg-slate-50/50' : ''}`}>
                      <td className="p-2.5 font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>{dayLog.date}</span>
                      </td>
                      <td className="p-2.5 font-bold text-slate-800">
                        {dayLog.isOff ? (
                          <span className="neo-pill bg-amber-100 text-amber-950 border-slate-900 text-[10px] font-black">
                            LIBUR / OFF
                          </span>
                        ) : (
                          dayLog.teamString
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`neo-pill text-[10px] font-black ${
                          dayLog.isOff
                            ? 'bg-slate-200 text-slate-700 border-slate-400'
                            : dayLog.isProjectTeam
                            ? 'bg-amber-200 text-amber-950 border-slate-900'
                            : 'bg-blue-100 text-blue-950 border-slate-900'
                        }`}>
                          {dayLog.isOff ? 'Off / Libur' : (dayLog.isProjectTeam ? 'Project Team' : 'Tim Reguler')}
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-bold text-blue-900 bg-blue-50/30">
                        {dayLog.totalDo}
                      </td>
                      <td className="p-2.5 text-center font-black text-emerald-800 bg-emerald-50/30">
                        {dayLog.isOff ? <span className="text-slate-400 font-normal">0 (OFF)</span> : dayLog.finishDo}
                      </td>
                      <td className="p-2.5 text-center font-bold text-amber-800 bg-amber-50/30">
                        {dayLog.pendingDo}
                      </td>
                      <td className="p-2.5 text-center font-bold text-rose-800 bg-rose-50/30">
                        {dayLog.cancelDo}
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-700">
                        {dayLog.bobotDibawa}
                      </td>
                      <td className="p-2.5 text-right font-black text-emerald-800 bg-emerald-50/30">
                        {dayLog.isOff ? <span className="text-slate-400 font-normal">0</span> : dayLog.bobotFinish}
                      </td>
                      <td className="p-2.5 text-center font-black">
                        {dayLog.isOff ? (
                          <span className="text-slate-400 font-normal text-[10px]">-</span>
                        ) : (
                          <span className={`neo-pill text-[10px] font-mono ${
                            clearance >= 90
                              ? 'bg-emerald-200 text-emerald-950'
                              : clearance >= 70
                              ? 'bg-blue-100 text-blue-950'
                              : 'bg-rose-200 text-rose-950'
                          }`}>
                            {clearance}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        );
      })()}
    </div>
  );
};
