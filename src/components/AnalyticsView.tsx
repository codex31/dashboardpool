import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Layers, 
  Weight, 
  CheckCircle2, 
  AlertCircle, 
  PieChart as PieIcon,
  Zap,
  Activity,
  Award,
  ArrowUpRight,
  Calendar,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Clock,
  Filter,
  Check,
  Presentation
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  BarChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { DailyRecord, MonthSummary, MonthlyDataset } from '../types';
import { ExportDropdown } from './ExportDropdown';
import { ExportTableData } from '../services/exportService';
import { GoogleSlidesExportModal } from './GoogleSlidesExportModal';
import { ComprehensiveReportData } from '../services/googleSlidesExportService';
import { ChartDataPoint } from '../utils/chartImageGenerator';
import { RegisteredMonthConfig, fetchMultipleMonthDatasets } from '../services/sheetService';
import { DEFAULT_SEPTEMBER_DATASET } from '../data/defaultSeptemberData';
import { DEFAULT_AUGUST_DATASET } from '../data/defaultAugustData';
import { DEFAULT_OCTOBER_DATASET } from '../data/defaultOctoberData';
import { DEFAULT_2025_DATASETS } from '../data/default2025Data';
import { 
  DailyRecordExtended, 
  MonthlyAggregate, 
  WeeklyAggregate, 
  extractAllChronologicalRecords, 
  aggregateRecordsByMonth, 
  aggregateRecordsByWeek, 
  parseTanggalToIso, 
  formatIsoToIndo, 
  formatIsoToShort 
} from '../utils/dateRangeUtils';

interface AnalyticsViewProps {
  records: DailyRecord[];
  summary: MonthSummary;
  monthName: string;
  year: number;
  registeredMonths?: RegisteredMonthConfig[];
  currentMonthId?: string;
}

export type DateRangeOption = 'ytd' | 'mtd' | '7d' | '30d' | 'custom';
export type ViewGranularity = 'monthly' | 'weekly' | 'daily';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  records,
  summary,
  monthName,
  year,
  registeredMonths = [],
  currentMonthId = '2026-09',
}) => {
  const [dateRange, setDateRange] = useState<DateRangeOption>('mtd');
  const [viewGranularity, setViewGranularity] = useState<ViewGranularity>('daily');
  const [chartDisplayMode, setChartDisplayMode] = useState<'fit' | 'bar'>('fit');
  const [userOverrodeGranularity, setUserOverrodeGranularity] = useState(false);
  const [googleSlidesModalOpen, setGoogleSlidesModalOpen] = useState(false);
  const [selectedYearFilter, setSelectedYearFilter] = useState<'all' | number>(year);
  const [yoyMetric, setYoyMetric] = useState<'jalur' | 'finish' | 'masuk'>('jalur');
  const [isYoyTableOpen, setIsYoyTableOpen] = useState(false);

  // Sync selectedYearFilter when parent year changes
  useEffect(() => {
    setSelectedYearFilter(year);
  }, [year]);

  // Multi-month dataset storage for YTD and cross-month custom ranges (e.g. 16 Agu - 3 Sep)
  const [datasetsMap, setDatasetsMap] = useState<Record<string, MonthlyDataset>>(() => ({
    ...DEFAULT_2025_DATASETS,
    '2026-10': DEFAULT_OCTOBER_DATASET,
    '2026-09': DEFAULT_SEPTEMBER_DATASET,
    '2026-08': DEFAULT_AUGUST_DATASET,
    [currentMonthId]: {
      records,
      summary,
      monthName,
      monthNumber: parseInt(currentMonthId.split('-')[1] || '9', 10),
      year,
      sheetUrl: '',
      gid: '',
      lastUpdated: new Date().toISOString(),
    },
  }));
  const [isMultiLoading, setIsMultiLoading] = useState(false);

  // Keep current active dataset up-to-date in datasetsMap
  useEffect(() => {
    setDatasetsMap((prev) => ({
      ...prev,
      [currentMonthId]: {
        records,
        summary,
        monthName,
        monthNumber: parseInt(currentMonthId.split('-')[1] || '9', 10),
        year,
        sheetUrl: '',
        gid: '',
        lastUpdated: new Date().toISOString(),
      },
    }));
  }, [records, summary, monthName, year, currentMonthId]);

  // Load all registered months in the background so YTD and cross-month date pickers work seamlessly
  useEffect(() => {
    if (registeredMonths.length > 0) {
      let isMounted = true;
      setIsMultiLoading(true);
      fetchMultipleMonthDatasets(registeredMonths, false)
        .then((dataMap) => {
          if (isMounted) {
            setDatasetsMap((prev) => ({
              ...DEFAULT_2025_DATASETS,
              ...prev,
              ...dataMap,
              // Always guarantee default fallbacks are present if fetch failed
              '2026-10': dataMap['2026-10'] || prev['2026-10'] || DEFAULT_OCTOBER_DATASET,
              '2026-09': dataMap['2026-09'] || prev['2026-09'] || DEFAULT_SEPTEMBER_DATASET,
              '2026-08': dataMap['2026-08'] || prev['2026-08'] || DEFAULT_AUGUST_DATASET,
            }));
            setIsMultiLoading(false);
          }
        })
        .catch((err) => {
          console.warn('[AnalyticsView] Multi-month fetch warning:', err);
          if (isMounted) setIsMultiLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [registeredMonths]);

  // Extract all chronological records across all loaded datasets
  const allChronologicalRecords = useMemo(() => {
    return extractAllChronologicalRecords(datasetsMap);
  }, [datasetsMap]);

  // Active records with data
  const allActiveChronological = useMemo(() => {
    return allChronologicalRecords.filter((r) => r.hasData);
  }, [allChronologicalRecords]);

  // Find latest active date across chronological records
  const latestActiveIso = useMemo(() => {
    if (allActiveChronological.length > 0) {
      return allActiveChronological[allActiveChronological.length - 1].isoDate;
    }
    return `${year}-09-15`;
  }, [allActiveChronological, year]);

  // Default Custom Range dates: adaptable by active year
  const [customStartDate, setCustomStartDate] = useState<string>(() => (year === 2025 ? '2025-02-01' : '2026-08-16'));
  const [customEndDate, setCustomEndDate] = useState<string>(() => (year === 2025 ? '2025-12-31' : '2026-09-03'));

  // Month-to-date boundary for active month
  const currentMonthNumStr = currentMonthId.split('-')[1] || '09';
  const mNum = parseInt(currentMonthNumStr, 10);
  const lastDayOfMonth = new Date(year, mNum, 0).getDate();
  const mtdStartDate = `${year}-${currentMonthNumStr}-01`;
  const mtdEndDate = latestActiveIso.startsWith(`${year}-${currentMonthNumStr}`)
    ? latestActiveIso
    : `${year}-${currentMonthNumStr}-${String(lastDayOfMonth).padStart(2, '0')}`;

  // Auto-adapt visual granularity when date range changes
  useEffect(() => {
    if (!userOverrodeGranularity) {
      if (dateRange === 'ytd') {
        // YTD spans multiple months: Default to Monthly for pristine clarity
        setViewGranularity('monthly');
      } else if (dateRange === 'custom') {
        const start = new Date(customStartDate).getTime();
        const end = new Date(customEndDate).getTime();
        const diffDays = Math.round(Math.abs((end - start) / (1000 * 60 * 60 * 24))) + 1;
        if (diffDays > 35) {
          setViewGranularity('monthly');
        } else if (diffDays > 14) {
          setViewGranularity('daily');
        } else {
          setViewGranularity('daily');
        }
      } else {
        // MTD, 7D, 30D default to Daily
        setViewGranularity('daily');
      }
    }
  }, [dateRange, customStartDate, customEndDate, userOverrodeGranularity]);

  // Filter records based on selected dateRange AND selectedYearFilter
  const filteredRecords = useMemo(() => {
    const targetYear = typeof selectedYearFilter === 'number' ? selectedYearFilter : year;

    // Scope by selected year if not 'all'
    const recordsInScope = selectedYearFilter === 'all'
      ? allChronologicalRecords
      : allChronologicalRecords.filter((r) => r.year === targetYear);

    const activeInScope = recordsInScope.filter((r) => r.hasData);
    const scopeLatestIso = activeInScope.length > 0 
      ? activeInScope[activeInScope.length - 1].isoDate 
      : `${targetYear}-12-31`;

    if (dateRange === 'ytd') {
      if (selectedYearFilter === 'all') {
        return allActiveChronological;
      }
      const ytdStart = `${targetYear}-01-01`;
      return allChronologicalRecords.filter((r) => {
        return r.isoDate >= ytdStart && r.isoDate <= scopeLatestIso && r.hasData;
      });
    }

    if (dateRange === 'mtd') {
      if (year === targetYear) {
        return recordsInScope.filter((r) => {
          return r.isoDate >= mtdStartDate && r.isoDate <= mtdEndDate && r.hasData;
        });
      } else {
        // Fallback to latest available month of that target year
        const lastPrefix = scopeLatestIso.slice(0, 7);
        return recordsInScope.filter((r) => r.isoDate.startsWith(lastPrefix) && r.hasData);
      }
    }

    if (dateRange === '7d') {
      if (activeInScope.length >= 7) {
        return activeInScope.slice(-7);
      }
      return activeInScope;
    }

    if (dateRange === '30d') {
      if (activeInScope.length >= 30) {
        return activeInScope.slice(-30);
      }
      return activeInScope;
    }

    if (dateRange === 'custom') {
      const start = customStartDate <= customEndDate ? customStartDate : customEndDate;
      const end = customStartDate <= customEndDate ? customEndDate : customStartDate;
      return allChronologicalRecords.filter((r) => {
        return r.isoDate >= start && r.isoDate <= end && r.hasData;
      });
    }

    return activeInScope;
  }, [
    dateRange,
    selectedYearFilter,
    year,
    allChronologicalRecords,
    allActiveChronological,
    mtdStartDate,
    mtdEndDate,
    customStartDate,
    customEndDate,
  ]);

  // Effective summary for the selected range
  const effectiveSummary = useMemo(() => {
    const totalJalur = filteredRecords.reduce((sum, r) => sum + r.totalJalur, 0);
    const totalTeam = filteredRecords.reduce((sum, r) => sum + r.totalTeam, 0);
    const totalBobotMasuk = filteredRecords.reduce((sum, r) => sum + r.bobotMasuk, 0);
    const totalBobotFinish = filteredRecords.reduce((sum, r) => sum + r.bobotFinish, 0);
    const totalPending = filteredRecords.reduce((sum, r) => sum + r.totalPending, 0);
    const totalCancel = filteredRecords.reduce((sum, r) => sum + r.cancel, 0);
    const totalTarget = filteredRecords.reduce((sum, r) => sum + r.target, 0);
    const totalRealisasi = filteredRecords.reduce((sum, r) => sum + r.realisasi, 0);

    const overallCompletionRate = totalBobotMasuk > 0
      ? Math.round((totalBobotFinish / totalBobotMasuk) * 1000) / 10
      : 0;
    const overallAchievementRate = totalTarget > 0
      ? Math.round((totalRealisasi / totalTarget) * 10000) / 100
      : 0;

    return {
      totalJalur,
      totalTeam,
      totalBobotMasuk,
      totalBobotFinish,
      totalPending,
      totalCancel,
      totalTarget,
      totalRealisasi,
      overallCompletionRate,
      overallAchievementRate,
      overallAchvRate: overallAchievementRate,
    };
  }, [filteredRecords]);

  // Human readable label for current active range
  const dateRangeLabel = useMemo(() => {
    const yearSuffix = selectedYearFilter === 'all' ? ' [Semua Tahun]' : ` [Tahun ${selectedYearFilter}]`;
    if (dateRange === 'ytd') {
      if (selectedYearFilter === 'all') {
        return `Year to Date (Semua Tahun: 2025 s/d ${formatIsoToIndo(latestActiveIso)})`;
      }
      const firstActive = filteredRecords[0]?.isoDate || `${selectedYearFilter}-01-01`;
      const lastActive = filteredRecords[filteredRecords.length - 1]?.isoDate || latestActiveIso;
      return `Year to Date (${formatIsoToIndo(firstActive)} - ${formatIsoToIndo(lastActive)})`;
    }
    if (dateRange === 'mtd') {
      const firstActive = filteredRecords[0]?.isoDate || mtdStartDate;
      const lastActive = filteredRecords[filteredRecords.length - 1]?.isoDate || mtdEndDate;
      return `Month to Date (${formatIsoToIndo(firstActive)} - ${formatIsoToIndo(lastActive)})${yearSuffix}`;
    }
    if (dateRange === '7d') {
      const first = filteredRecords[0]?.isoDate;
      const last = filteredRecords[filteredRecords.length - 1]?.isoDate;
      return `7 Hari Terakhir (${first ? formatIsoToIndo(first) : '-'} - ${last ? formatIsoToIndo(last) : '-'})${yearSuffix}`;
    }
    if (dateRange === '30d') {
      return `30 Hari (${monthName} ${year})${yearSuffix}`;
    }
    return `Custom Range (${formatIsoToIndo(customStartDate)} s/d ${formatIsoToIndo(customEndDate)})`;
  }, [dateRange, selectedYearFilter, year, latestActiveIso, mtdStartDate, mtdEndDate, monthName, filteredRecords, customStartDate, customEndDate]);

  // Year-over-Year (YoY: 2025 vs 2026) Comparative Analytics
  const yoyComparison = useMemo(() => {
    const recs2025 = allChronologicalRecords.filter((r) => r.year === 2025 && r.hasData);
    const recs2026 = allChronologicalRecords.filter((r) => r.year === 2026 && r.hasData);

    const calcSummary = (recs: DailyRecordExtended[]) => {
      const totalJalur = recs.reduce((s, r) => s + r.totalJalur, 0);
      const totalTeam = recs.reduce((s, r) => s + r.totalTeam, 0);
      const totalBobotMasuk = recs.reduce((s, r) => s + r.bobotMasuk, 0);
      const totalBobotFinish = recs.reduce((s, r) => s + r.bobotFinish, 0);
      const totalPending = recs.reduce((s, r) => s + r.totalPending, 0);
      const totalCancel = recs.reduce((s, r) => s + r.cancel, 0);
      const totalTarget = recs.reduce((s, r) => s + r.target, 0);
      const totalRealisasi = recs.reduce((s, r) => s + r.realisasi, 0);
      const completionRate = totalBobotMasuk > 0 ? Math.round((totalBobotFinish / totalBobotMasuk) * 1000) / 10 : 0;
      const achvRate = totalTarget > 0 ? Math.round((totalRealisasi / totalTarget) * 10000) / 100 : 0;
      const activeDays = recs.length;
      const avgJalurPerDay = activeDays > 0 ? Math.round((totalJalur / activeDays) * 10) / 10 : 0;

      return {
        totalJalur,
        totalTeam,
        totalBobotMasuk,
        totalBobotFinish,
        totalPending,
        totalCancel,
        totalTarget,
        totalRealisasi,
        completionRate,
        achvRate,
        activeDays,
        avgJalurPerDay,
      };
    };

    const stats2025 = calcSummary(recs2025);
    const stats2026 = calcSummary(recs2026);

    const monthShortNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    const monthFullNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const chartData = [];
    for (let m = 1; m <= 12; m++) {
      const mStr = String(m).padStart(2, '0');
      const m25 = recs2025.filter((r) => r.isoDate.startsWith(`2025-${mStr}`));
      const m26 = recs2026.filter((r) => r.isoDate.startsWith(`2026-${mStr}`));

      const j25 = m25.reduce((s, r) => s + r.totalJalur, 0);
      const j26 = m26.reduce((s, r) => s + r.totalJalur, 0);
      const f25 = m25.reduce((s, r) => s + r.bobotFinish, 0);
      const f26 = m26.reduce((s, r) => s + r.bobotFinish, 0);
      const m25Masuk = m25.reduce((s, r) => s + r.bobotMasuk, 0);
      const m26Masuk = m26.reduce((s, r) => s + r.bobotMasuk, 0);
      const t25 = m25.reduce((s, r) => s + r.target, 0);
      const t26 = m26.reduce((s, r) => s + r.target, 0);
      const r25 = m25.reduce((s, r) => s + r.realisasi, 0);
      const r26 = m26.reduce((s, r) => s + r.realisasi, 0);

      const jalurGrowth = j25 > 0 ? Math.round(((j26 - j25) / j25) * 1000) / 10 : null;
      const finishGrowth = f25 > 0 ? Math.round(((f26 - f25) / f25) * 1000) / 10 : null;
      const masukGrowth = m25Masuk > 0 ? Math.round(((m26Masuk - m25Masuk) / m25Masuk) * 1000) / 10 : null;

      if (j25 > 0 || j26 > 0 || f25 > 0 || f26 > 0 || m25Masuk > 0 || m26Masuk > 0) {
        chartData.push({
          month: monthShortNames[m - 1],
          fullMonth: monthFullNames[m - 1],
          monthNumber: m,
          jalur2025: j25,
          jalur2026: j26,
          jalurDelta: j26 - j25,
          jalurGrowth,
          finish2025: f25,
          finish2026: f26,
          finishDelta: f26 - f25,
          finishGrowth,
          masuk2025: m25Masuk,
          masuk2026: m26Masuk,
          masukDelta: m26Masuk - m25Masuk,
          masukGrowth,
          target2025: t25,
          target2026: t26,
          realisasi2025: r25,
          realisasi2026: r26,
          clearance2025: m25Masuk > 0 ? Math.round((f25 / m25Masuk) * 1000) / 10 : 0,
          clearance2026: m26Masuk > 0 ? Math.round((f26 / m26Masuk) * 1000) / 10 : 0,
        });
      }
    }

    const jalurGrowth = stats2025.totalJalur > 0 
      ? Math.round(((stats2026.totalJalur - stats2025.totalJalur) / stats2025.totalJalur) * 1000) / 10 
      : 0;
    const finishGrowth = stats2025.totalBobotFinish > 0 
      ? Math.round(((stats2026.totalBobotFinish - stats2025.totalBobotFinish) / stats2025.totalBobotFinish) * 1000) / 10 
      : 0;
    const masukGrowth = stats2025.totalBobotMasuk > 0 
      ? Math.round(((stats2026.totalBobotMasuk - stats2025.totalBobotMasuk) / stats2025.totalBobotMasuk) * 1000) / 10 
      : 0;

    return {
      stats2025,
      stats2026,
      chartData,
      jalurGrowth,
      finishGrowth,
      masukGrowth,
    };
  }, [allChronologicalRecords]);

  // Aggregated data for Monthly, Weekly, or Daily view modes
  const monthlyData = useMemo(() => aggregateRecordsByMonth(filteredRecords), [filteredRecords]);
  const weeklyData = useMemo(() => aggregateRecordsByWeek(filteredRecords), [filteredRecords]);

  // Daily trend data with running cumulative totals
  const dailyTrendData = useMemo(() => {
    let cumTarget = 0;
    let cumReal = 0;
    let cumMasuk = 0;
    let cumFinish = 0;

    // Detect if records span multiple months
    const monthSet = new Set(filteredRecords.map((r) => r.isoDate.slice(0, 7)));
    const isCrossMonth = monthSet.size > 1;

    return filteredRecords.map((r) => {
      cumTarget += r.target;
      cumReal += r.realisasi;
      cumMasuk += r.bobotMasuk;
      cumFinish += r.bobotFinish;

      // In single month, show clean 2-digit day number ("01", "02") to avoid label collision
      const dayLabel = isCrossMonth ? formatIsoToShort(r.isoDate) : String(r.dayNumber).padStart(2, '0');

      return {
        key: r.isoDate,
        day: dayLabel,
        fullDate: formatIsoToIndo(r.isoDate),
        jalur: r.totalJalur,
        team: r.totalTeam,
        prod: r.prod,
        bobotMasuk: r.bobotMasuk,
        bobotFinish: r.bobotFinish,
        target: r.target,
        realisasi: r.realisasi,
        cumTarget,
        cumReal,
        cumMasuk,
        cumFinish,
        cancel: r.cancel,
        pending: r.totalPending,
      };
    });
  }, [filteredRecords]);

  // Determine active chart dataset based on current granularity
  const activeChartData = useMemo(() => {
    if (viewGranularity === 'monthly' && monthlyData.length > 0) {
      return monthlyData.map((m) => ({
        key: m.key,
        day: selectedYearFilter === 'all' ? `${m.shortLabel} '${String(m.year).slice(2)}` : m.shortLabel,
        fullDate: m.fullLabel,
        jalur: m.totalJalur,
        team: m.totalTeam,
        prod: m.prod,
        bobotMasuk: m.bobotMasuk,
        bobotFinish: m.bobotFinish,
        target: m.target,
        realisasi: m.realisasi,
        cumTarget: m.cumTarget || 0,
        cumReal: m.cumReal || 0,
        pending: m.pending,
        cancel: m.cancel,
        isMonthly: true,
      }));
    }

    if (viewGranularity === 'weekly' && weeklyData.length > 0) {
      return weeklyData.map((w) => ({
        key: w.key,
        day: w.label,
        fullDate: `${w.label} (${w.rangeLabel})`,
        jalur: w.totalJalur,
        team: w.totalTeam,
        prod: w.prod,
        bobotMasuk: w.bobotMasuk,
        bobotFinish: w.bobotFinish,
        target: w.target,
        realisasi: w.realisasi,
        cumTarget: w.cumTarget || 0,
        cumReal: w.cumReal || 0,
        pending: w.pending,
        cancel: w.cancel,
        isWeekly: true,
      }));
    }

    return dailyTrendData;
  }, [viewGranularity, monthlyData, weeklyData, dailyTrendData]);

  // Threshold for large datasets (e.g. YTD weekly with ~38 points, or YTD daily with 240+ points)
  const isLargeDataset = activeChartData.length > 25;

  // Horizontal scroll widths for bar mode when dataset has many points
  const chartScrollWidth = useMemo(() => {
    if (chartDisplayMode !== 'bar' || !isLargeDataset) return '100%';
    const minItemWidth = viewGranularity === 'daily' ? 24 : 38;
    return `${Math.max(900, activeChartData.length * minItemWidth)}px`;
  }, [chartDisplayMode, isLargeDataset, viewGranularity, activeChartData.length]);

  const chartScrollWidthHalf = useMemo(() => {
    if (chartDisplayMode !== 'bar' || !isLargeDataset) return '100%';
    const minItemWidth = viewGranularity === 'daily' ? 20 : 34;
    return `${Math.max(500, activeChartData.length * minItemWidth)}px`;
  }, [chartDisplayMode, isLargeDataset, viewGranularity, activeChartData.length]);

  // Optimal dynamic interval for X-Axis to ensure zero label overlap
  const xAxisInterval = useMemo(() => {
    const len = activeChartData.length;
    if (viewGranularity === 'monthly') return 0; // Always show all months (max 12)

    // When in scrollable bar mode, wide canvas provides plenty of space
    if (chartDisplayMode === 'bar' && isLargeDataset) {
      if (viewGranularity === 'weekly') return len > 32 ? 1 : 0;
      return len > 120 ? 4 : 2;
    }

    // When in fit mode (fixed container width):
    if (viewGranularity === 'weekly') {
      if (len <= 14) return 0;
      if (len <= 26) return 1; // show every 2nd week
      if (len <= 40) return 2; // show every 3rd week (e.g. W1, W4, etc.)
      return Math.ceil(len / 10);
    }

    // Daily mode:
    if (len <= 14) return 0;
    if (len <= 31) return 1; // every 2nd day
    if (len <= 62) return 3; // every 4th day
    if (len <= 120) return 6; // every 7th day
    return Math.max(1, Math.ceil(len / 12) - 1); // target ~10-12 readable ticks across the period
  }, [viewGranularity, activeChartData.length, chartDisplayMode, isLargeDataset]);

  // Advanced statistics for current selected period
  const stats = useMemo(() => {
    const activeDaysCount = filteredRecords.length;
    const avgJalurPerDay = activeDaysCount > 0 
      ? Math.round((effectiveSummary.totalJalur / activeDaysCount) * 10) / 10 
      : 0;

    const avgBobotPerJalur = effectiveSummary.totalJalur > 0 
      ? Math.round((effectiveSummary.totalBobotMasuk / effectiveSummary.totalJalur) * 10) / 10 
      : 0;

    const pendingRate = effectiveSummary.totalJalur > 0 
      ? Math.round((effectiveSummary.totalPending / effectiveSummary.totalJalur) * 1000) / 10 
      : 0;

    const cancelRate = effectiveSummary.totalJalur > 0 
      ? Math.round((effectiveSummary.totalCancel / effectiveSummary.totalJalur) * 1000) / 10 
      : 0;

    // Peak day for bobot and jalur across the selected period
    let peakBobotDay = { date: '-', bobot: 0 };
    let peakJalurDay = { date: '-', jalur: 0 };

    filteredRecords.forEach((r) => {
      if (r.bobotMasuk > peakBobotDay.bobot) {
        peakBobotDay = { date: formatIsoToIndo(r.isoDate), bobot: r.bobotMasuk };
      }
      if (r.totalJalur > peakJalurDay.jalur) {
        peakJalurDay = { date: formatIsoToIndo(r.isoDate), jalur: r.totalJalur };
      }
    });

    return {
      activeDaysCount,
      avgJalurPerDay,
      avgBobotPerJalur,
      pendingRate,
      cancelRate,
      peakBobotDay,
      peakJalurDay,
    };
  }, [filteredRecords, effectiveSummary]);

  // Overall outcome distribution for Donut Chart
  const outcomePieData = [
    { name: 'Selesai (Realisasi)', value: effectiveSummary.totalRealisasi, color: '#10b981' },
    { name: 'Pending Order', value: effectiveSummary.totalPending, color: '#f59e0b' },
    { name: 'Cancel Order', value: effectiveSummary.totalCancel, color: '#f43f5e' },
  ];

  // Quick preset handler for Custom Range
  const applyCustomPreset = (start: string, end: string) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
    setDateRange('custom');
  };

  // Multi-format export data provider for Analytics
  const getAnalyticsExportData = (): ExportTableData => ({
    title: `ANALYTIC PERFORMANCE REPORT - POOL SINGKAWANG`,
    periodName: dateRangeLabel,
    poolName: 'Pool Singkawang',
    headers: [
      'Tanggal',
      'Total Jalur',
      'Total Team',
      'Prod',
      'Bobot Masuk',
      'Bobot Finish',
      'Clearance %',
      'Pending',
      'Cancel',
      'Target',
      'Realisasi',
      'Achv %',
    ],
    rows: filteredRecords.map((r) => [
      formatIsoToIndo(r.isoDate),
      r.totalJalur,
      r.totalTeam,
      r.prod,
      r.bobotMasuk,
      r.bobotFinish,
      `${r.completionRate}%`,
      r.totalPending,
      r.cancel,
      r.target,
      r.realisasi,
      r.achv || `${r.achievementRate}%`,
    ]),
    summaryCards: [
      { label: 'Rentang Waktu', value: dateRangeLabel, note: `${stats.activeDaysCount} Hari Aktif` },
      { label: 'Total Jalur', value: effectiveSummary.totalJalur, note: `${effectiveSummary.totalTeam} Team Total` },
      { label: 'Bobot Clearance', value: `${effectiveSummary.totalBobotFinish} / ${effectiveSummary.totalBobotMasuk}`, note: `${effectiveSummary.overallCompletionRate}% Selesai` },
      { label: 'Realisasi Target', value: `${effectiveSummary.totalRealisasi} / ${effectiveSummary.totalTarget}`, note: `${effectiveSummary.overallAchievementRate}% Tercapai` },
    ],
  });

  // Chart data points formatted for high-res vector/canvas rendering in Google Slides & PPT
  const chartDataPoints: ChartDataPoint[] = useMemo(() => {
    return filteredRecords.map((r) => ({
      day: r.date ? r.date.slice(0, 6) : `Tgl ${r.dayNumber}`,
      fullDate: formatIsoToIndo(r.isoDate),
      jalur: r.totalJalur,
      team: r.totalTeam,
      prod: r.prod,
      bobotMasuk: r.bobotMasuk,
      bobotFinish: r.bobotFinish,
    }));
  }, [filteredRecords]);

  // Comprehensive report data for Google Slides export and UI narrative
  const comprehensiveReportData: ComprehensiveReportData = useMemo(() => {
    const activeDays = Math.max(1, stats.activeDaysCount);
    const avgJalur = (effectiveSummary.totalJalur / activeDays).toFixed(1);
    const avgBobot = Math.round(effectiveSummary.totalBobotMasuk / activeDays).toLocaleString('id-ID');
    const avgBobotPerJalur = effectiveSummary.totalJalur > 0 
      ? (effectiveSummary.totalBobotMasuk / effectiveSummary.totalJalur).toFixed(1) 
      : '0';

    const pendingRate = stats.pendingRate;
    const cancelRate = stats.cancelRate;
    const totalPending = effectiveSummary.totalPending;
    const totalCancel = effectiveSummary.totalCancel;

    const prefix = dateRange === '7d' ? 'Di week ini' : 'Di periode ini';
    const narrativeText = `${prefix} average jalur ada diangka ${avgJalur} dengan average bobot perhari ${avgBobot} dengan persentase pending ${pendingRate}% (${totalPending} DO) & persentase cancel ${cancelRate}% (${totalCancel} DO)`;

    let reportTitle = 'EXECUTIVE REPORT - POOL SINGKAWANG';
    if (dateRange === '30d' || dateRange === 'mtd') {
      reportTitle = 'MONTHLY REPORT - POOL SINGKAWANG';
    } else if (dateRange === '7d') {
      reportTitle = 'WEEKLY REPORT - POOL SINGKAWANG';
    } else if (dateRange === 'ytd') {
      reportTitle = 'YEARLY REPORT - POOL SINGKAWANG';
    }

    return {
      title: reportTitle,
      poolName: 'Pool Singkawang',
      periodName: dateRangeLabel,
      rangeKey: dateRange,
      records: filteredRecords,
      chartData: chartDataPoints,
      summary: {
        avgJalur,
        avgBobot,
        avgBobotPerJalur,
        totalBobotMasuk: effectiveSummary.totalBobotMasuk,
        totalBobotFinish: effectiveSummary.totalBobotFinish,
        clearanceRate: effectiveSummary.overallCompletionRate,
        totalPending,
        pendingRate,
        totalCancel,
        cancelRate,
        totalTarget: effectiveSummary.totalTarget,
        totalRealisation: effectiveSummary.totalRealisasi,
        achievementRate: effectiveSummary.overallAchievementRate,
        activeDays,
        narrativeText,
      },
    };
  }, [filteredRecords, stats, effectiveSummary, dateRange, dateRangeLabel, chartDataPoints]);

  return (
    <div className="space-y-6">
      {/* Executive Header & Control Hub */}
      <div className="neo-card p-4 sm:p-5 bg-white">
        {/* Tier 1: Title, Context, and Primary Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-5 bg-blue-600 rounded-xs inline-block" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
                ANALISIS PERFORMA & TREN OPERASIONAL DO
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 mt-1">
              <span>Pool Singkawang</span>
              <span aria-hidden="true">·</span>
              <span className="text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {dateRangeLabel}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-600 font-bold tabular-nums">
                {stats.activeDaysCount} hari aktif
              </span>
              {isMultiLoading && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-700 font-bold flex items-center gap-1 text-[11px] animate-pulse">
                    <Clock className="w-3 h-3" /> Memuat data lintas bulan...
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-export-google-slides-direct"
              type="button"
              onClick={() => setGoogleSlidesModalOpen(true)}
              className="neo-btn bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-2 flex items-center gap-1.5 cursor-pointer"
              title="Ekspor laporan rangkuman komprehensif ke Google Slides"
            >
              <Presentation className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Google Slides</span>
            </button>

            <ExportDropdown
              getData={getAnalyticsExportData}
              defaultFilename={`Analytic_Performance_Singkawang_${dateRange.toUpperCase()}_${year}`}
              reportTitle={`Analytic Performance Report - ${dateRangeLabel}`}
              onExportGoogleSlides={() => setGoogleSlidesModalOpen(true)}
            />
          </div>
        </div>

        {/* Tier 2: Segmented Controls (Year, Range, Granularity) */}
        <div className="pt-3.5 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Year Segmented Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase font-mono text-slate-500">
                TAHUN:
              </span>
              <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg border border-slate-300">
                <button
                  id="btn-year-filter-2026"
                  type="button"
                  onClick={() => {
                    setSelectedYearFilter(2026);
                    setCustomStartDate('2026-01-01');
                    setCustomEndDate('2026-10-31');
                    setUserOverrodeGranularity(false);
                  }}
                  className={`text-xs font-black px-2.5 py-1 rounded transition-colors ${
                    selectedYearFilter === 2026
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Data performa tahun 2026 (10 Bulan)"
                >
                  2026 <span className="text-[9px] opacity-80 font-mono">(10 Bln)</span>
                </button>

                <button
                  id="btn-year-filter-2025"
                  type="button"
                  onClick={() => {
                    setSelectedYearFilter(2025);
                    setCustomStartDate('2025-02-01');
                    setCustomEndDate('2025-12-31');
                    setUserOverrodeGranularity(false);
                  }}
                  className={`text-xs font-black px-2.5 py-1 rounded transition-colors ${
                    selectedYearFilter === 2025
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Data performa tahun 2025 (11 Bulan: Feb - Des)"
                >
                  2025 <span className="text-[9px] opacity-80 font-mono">(11 Bln)</span>
                </button>

                <button
                  id="btn-year-filter-all"
                  type="button"
                  onClick={() => {
                    setSelectedYearFilter('all');
                    setCustomStartDate('2025-02-01');
                    setCustomEndDate('2026-10-31');
                    setUserOverrodeGranularity(false);
                  }}
                  className={`text-xs font-black px-2.5 py-1 rounded transition-colors ${
                    selectedYearFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Multi-tahun 2025 & 2026 (21 Bulan)"
                >
                  Semua <span className="text-[9px] opacity-80 font-mono">(21 Bln)</span>
                </button>
              </div>
            </div>

            {/* Range Segmented Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase font-mono text-slate-500">
                RENTANG:
              </span>
              <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg border border-slate-300">
                <button
                  id="btn-range-ytd"
                  type="button"
                  onClick={() => {
                    setDateRange('ytd');
                    setUserOverrodeGranularity(false);
                  }}
                  className={`text-xs font-black px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                    dateRange === 'ytd'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>YTD</span>
                </button>

                <button
                  id="btn-range-mtd"
                  type="button"
                  onClick={() => {
                    setDateRange('mtd');
                    setUserOverrodeGranularity(false);
                  }}
                  className={`text-xs font-black px-2.5 py-1 rounded transition-colors ${
                    dateRange === 'mtd'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  MTD
                </button>

                <button
                  id="btn-range-7d"
                  type="button"
                  onClick={() => {
                    setDateRange('7d');
                    setUserOverrodeGranularity(false);
                  }}
                  className={`text-xs font-black px-2.5 py-1 rounded transition-colors ${
                    dateRange === '7d'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  7 Hari
                </button>

                <button
                  id="btn-range-30d"
                  type="button"
                  onClick={() => {
                    setDateRange('30d');
                    setUserOverrodeGranularity(false);
                  }}
                  className={`text-xs font-black px-2.5 py-1 rounded transition-colors ${
                    dateRange === '30d'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  30 Hari
                </button>

                <button
                  id="btn-range-custom"
                  type="button"
                  onClick={() => {
                    setDateRange('custom');
                    setUserOverrodeGranularity(false);
                  }}
                  className={`text-xs font-black px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                    dateRange === 'custom'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Kustom</span>
                </button>
              </div>
            </div>

            {/* Granularity Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase font-mono text-slate-500">
                AGREGASI:
              </span>
              <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg border border-slate-300">
                <button
                  type="button"
                  id="btn-granularity-monthly"
                  onClick={() => {
                    setViewGranularity('monthly');
                    setUserOverrodeGranularity(true);
                  }}
                  className={`text-xs font-black px-2 py-1 rounded transition-colors ${
                    viewGranularity === 'monthly'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Agregasi per Bulan"
                >
                  Bulanan
                </button>
                <button
                  type="button"
                  id="btn-granularity-weekly"
                  onClick={() => {
                    setViewGranularity('weekly');
                    setUserOverrodeGranularity(true);
                  }}
                  className={`text-xs font-black px-2 py-1 rounded transition-colors ${
                    viewGranularity === 'weekly'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Agregasi per Minggu"
                >
                  Mingguan
                </button>
                <button
                  type="button"
                  id="btn-granularity-daily"
                  onClick={() => {
                    setViewGranularity('daily');
                    setUserOverrodeGranularity(true);
                  }}
                  className={`text-xs font-black px-2 py-1 rounded transition-colors ${
                    viewGranularity === 'daily'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Detail Harian"
                >
                  Harian
                </button>
              </div>
            </div>
          </div>

          {/* Right: Display Mode (if large dataset) or Data Count */}
          <div className="flex items-center gap-2 self-start xl:self-auto">
            {isLargeDataset && (
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-300">
                <button
                  type="button"
                  id="btn-chart-mode-fit"
                  onClick={() => setChartDisplayMode('fit')}
                  className={`text-[11px] font-black px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                    chartDisplayMode === 'fit'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Fit Layar (Tren)"
                >
                  <TrendingUp className="w-3 h-3" />
                  <span>Fit Layar</span>
                </button>
                <button
                  type="button"
                  id="btn-chart-mode-bar"
                  onClick={() => setChartDisplayMode('bar')}
                  className={`text-[11px] font-black px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                    chartDisplayMode === 'bar'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Scroll Bar Horisontal"
                >
                  <BarChart3 className="w-3 h-3" />
                  <span>Scroll Bar</span>
                </button>
              </div>
            )}
            <span className="text-[11px] font-mono font-bold text-slate-500">
              {activeChartData.length} {viewGranularity === 'monthly' ? 'bulan' : viewGranularity === 'weekly' ? 'pekan' : 'hari'}
            </span>
          </div>
        </div>

        {/* Custom Range Drawer (Clean, Structured, Non-Cluttered) */}
        {dateRange === 'custom' && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-200 bg-slate-50/70 p-3.5 rounded-lg border border-slate-300">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Date pickers */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="input-custom-start-date" className="text-[11px] font-black text-slate-600 uppercase font-mono">
                    DARI:
                  </label>
                  <input
                    id="input-custom-start-date"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => {
                      setCustomStartDate(e.target.value);
                      setUserOverrodeGranularity(false);
                    }}
                    className="neo-input text-xs font-bold py-1 px-2.5 bg-white text-slate-900 cursor-pointer"
                  />
                </div>

                <span className="text-slate-400 font-bold text-xs">➔</span>

                <div className="flex items-center gap-1.5">
                  <label htmlFor="input-custom-end-date" className="text-[11px] font-black text-slate-600 uppercase font-mono">
                    SAMPAI:
                  </label>
                  <input
                    id="input-custom-end-date"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => {
                      setCustomEndDate(e.target.value);
                      setUserOverrodeGranularity(false);
                    }}
                    className="neo-input text-xs font-bold py-1 px-2.5 bg-white text-slate-900 cursor-pointer"
                  />
                </div>

                <div className="text-xs font-bold text-blue-900 bg-white border border-slate-300 rounded px-2 py-1 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span>{formatIsoToIndo(customStartDate)} – {formatIsoToIndo(customEndDate)}</span>
                </div>
              </div>

              {/* Quick Preset Selector */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[10px] font-black text-slate-500 font-mono uppercase">PRESET:</span>
                {selectedYearFilter === 2025 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => applyCustomPreset('2025-02-01', '2025-12-31')}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-colors ${
                        customStartDate === '2025-02-01' && customEndDate === '2025-12-31'
                          ? 'bg-indigo-600 text-white border-indigo-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Full 2025
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCustomPreset('2025-02-01', '2025-03-31')}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-colors ${
                        customStartDate === '2025-02-01' && customEndDate === '2025-03-31'
                          ? 'bg-indigo-600 text-white border-indigo-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Q1
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCustomPreset('2025-04-01', '2025-06-30')}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-colors ${
                        customStartDate === '2025-04-01' && customEndDate === '2025-06-30'
                          ? 'bg-indigo-600 text-white border-indigo-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Q2
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCustomPreset('2025-07-01', '2025-09-30')}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-colors ${
                        customStartDate === '2025-07-01' && customEndDate === '2025-09-30'
                          ? 'bg-indigo-600 text-white border-indigo-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Q3
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCustomPreset('2025-10-01', '2025-12-31')}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-colors ${
                        customStartDate === '2025-10-01' && customEndDate === '2025-12-31'
                          ? 'bg-indigo-600 text-white border-indigo-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Q4
                    </button>
                    {/* Compact Month Dropdown Selector for 2025 */}
                    <select
                      value={customStartDate.startsWith('2025-') ? customStartDate.slice(5, 7) : ''}
                      onChange={(e) => {
                        const m = e.target.value;
                        if (!m) return;
                        const lastDay = new Date(2025, parseInt(m, 10), 0).getDate();
                        applyCustomPreset(`2025-${m}-01`, `2025-${m}-${String(lastDay).padStart(2, '0')}`);
                      }}
                      className="text-[11px] font-bold bg-white text-slate-800 border border-slate-300 rounded px-2 py-0.5 cursor-pointer"
                    >
                      <option value="">Pilih Bulan...</option>
                      <option value="02">Februari 2025</option>
                      <option value="03">Maret 2025</option>
                      <option value="04">April 2025</option>
                      <option value="05">Mei 2025</option>
                      <option value="06">Juni 2025</option>
                      <option value="07">Juli 2025</option>
                      <option value="08">Agustus 2025</option>
                      <option value="09">September 2025</option>
                      <option value="10">Oktober 2025</option>
                      <option value="11">November 2025</option>
                      <option value="12">Desember 2025</option>
                    </select>
                  </>
                ) : selectedYearFilter === 2026 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => applyCustomPreset('2026-08-16', '2026-09-03')}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-colors ${
                        customStartDate === '2026-08-16' && customEndDate === '2026-09-03'
                          ? 'bg-blue-600 text-white border-blue-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      16 Agu - 3 Sep
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCustomPreset('2026-08-01', '2026-08-31')}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-colors ${
                        customStartDate === '2026-08-01' && customEndDate === '2026-08-31'
                          ? 'bg-blue-600 text-white border-blue-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Agustus
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCustomPreset('2026-09-01', '2026-09-30')}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-colors ${
                        customStartDate === '2026-09-01' && customEndDate === '2026-09-30'
                          ? 'bg-blue-600 text-white border-blue-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      September
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCustomPreset('2026-01-01', '2026-10-31')}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-colors ${
                        customStartDate === '2026-01-01' && customEndDate === '2026-10-31'
                          ? 'bg-blue-600 text-white border-blue-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Full 2026 (Jan - Okt)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => applyCustomPreset('2025-02-01', '2026-10-31')}
                      className="text-[11px] font-bold px-2 py-0.5 rounded border bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                    >
                      Semua (2025 - 2026)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCustomPreset('2025-02-01', '2025-12-31')}
                      className="text-[11px] font-bold px-2 py-0.5 rounded border bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                    >
                      Tahun 2025
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCustomPreset('2026-01-01', '2026-10-31')}
                      className="text-[11px] font-bold px-2 py-0.5 rounded border bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                    >
                      Tahun 2026
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Executive Summary Callout (Slide 1 Narrative) */}
      <div className="neo-card p-4 bg-amber-50/70 border border-amber-300 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-900 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-amber-900 uppercase">
              <span>Rangkuman Eksekutif Operasional</span>
              <span aria-hidden="true">·</span>
              <span>{dateRangeLabel}</span>
            </div>
            <p className="text-sm font-bold text-slate-900 font-['Space_Grotesk',sans-serif] mt-1 leading-relaxed">
              "{comprehensiveReportData.summary.narrativeText}"
            </p>
          </div>
        </div>
      </div>

      {/* Analytic KPI Highlights (Clean, High-Legibility Executive Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="neo-card p-4 bg-white flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider block">
              {dateRange === 'ytd' ? 'RATA / HARI (YTD)' : 'RATA JALUR / HARI'}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-['Space_Grotesk',sans-serif] font-mono tabular-nums">
              {stats.avgJalurPerDay}
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 mt-2 block">
            {stats.activeDaysCount} hari kerja
          </span>
        </div>

        <div className="neo-card p-4 bg-white flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider block">
              BOBOT / JALUR
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-['Space_Grotesk',sans-serif] font-mono tabular-nums">
              {stats.avgBobotPerJalur}
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 mt-2 block">
            Intensitas beban kerja
          </span>
        </div>

        <div className="neo-card p-4 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-emerald-800 uppercase font-mono tracking-wider">
                CLEARANCE RATE
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1 font-['Space_Grotesk',sans-serif] font-mono tabular-nums">
              {effectiveSummary.overallCompletionRate}%
            </div>
          </div>
          <span className="text-[11px] font-mono font-semibold text-slate-600 mt-2 block">
            {effectiveSummary.totalBobotFinish} / {effectiveSummary.totalBobotMasuk}
          </span>
        </div>

        <div className="neo-card p-4 bg-white flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-teal-800 uppercase font-mono tracking-wider block">
              TARGET REALISASI
            </span>
            <div className="text-2xl font-black text-teal-700 mt-1 font-['Space_Grotesk',sans-serif] font-mono tabular-nums">
              {effectiveSummary.overallAchvRate}%
            </div>
          </div>
          <span className="text-[11px] font-mono font-semibold text-slate-600 mt-2 block">
            {effectiveSummary.totalRealisasi} / {effectiveSummary.totalTarget}
          </span>
        </div>

        <div className="neo-card p-4 bg-white flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-amber-800 uppercase font-mono tracking-wider block">
              PENDING RATE
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1 font-['Space_Grotesk',sans-serif] font-mono tabular-nums">
              {stats.pendingRate}%
            </div>
          </div>
          <span className="text-[11px] font-mono font-semibold text-amber-800 mt-2 block">
            {effectiveSummary.totalPending} DO Pending
          </span>
        </div>

        <div className="neo-card p-4 bg-white flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-rose-800 uppercase font-mono tracking-wider block">
              CANCEL RATE
            </span>
            <div className="text-2xl font-black text-rose-600 mt-1 font-['Space_Grotesk',sans-serif] font-mono tabular-nums">
              {stats.cancelRate}%
            </div>
          </div>
          <span className="text-[11px] font-mono font-semibold text-rose-800 mt-2 block">
            {effectiveSummary.totalCancel} DO Cancel
          </span>
        </div>
      </div>

      {/* Chart 1: Trend Jalur, Team, and Productivity */}
      <div className="neo-card p-5 sm:p-6 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 font-['Space_Grotesk',sans-serif]">
              <BarChart3 className="w-5 h-5 text-blue-700 stroke-[2.5]" />
              TREND JALUR, TEAM, DAN PRODUKTIVITAS {viewGranularity === 'monthly' ? 'BULANAN' : viewGranularity === 'weekly' ? 'MINGGUAN' : 'HARIAN'}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Grafik gabungan volume penugasan operasional dan rasio produktivitas periode {dateRangeLabel}
            </p>
          </div>

          {/* Integrated Clean Legend */}
          <div className="flex items-center gap-4 text-xs font-bold font-mono">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 bg-blue-600 rounded-xs inline-block" />
              <span>Total Jalur</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 bg-sky-400 rounded-xs inline-block" />
              <span>Total Team</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-0.5 bg-amber-500 inline-block" />
              <span>Produktivitas</span>
            </span>
          </div>
        </div>

        {isLargeDataset && chartDisplayMode === 'bar' && (
          <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded border border-slate-200 mt-3 flex items-center justify-between">
            <span>↔ Geser grafik ke samping untuk melihat detail seluruh {activeChartData.length} periode</span>
            <span className="font-mono text-slate-400">Scroll Aktif</span>
          </div>
        )}

        <div className="w-full overflow-x-auto pb-2 mt-4">
          <div style={{ minWidth: chartScrollWidth, height: '18rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartDisplayMode === 'fit' && isLargeDataset ? (
                <AreaChart data={activeChartData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorJalur" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.85}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.15}/>
                    </linearGradient>
                    <linearGradient id="colorTeam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.85}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.15}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="day" 
                    stroke="#64748b" 
                    fontSize={11} 
                    fontWeight={600}
                    interval={xAxisInterval}
                  />
                  <YAxis stroke="#64748b" fontSize={11} fontWeight={600} allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border-2 border-slate-900 rounded-lg p-3 text-xs shadow-md">
                            <div className="font-black text-slate-900 mb-1 border-b border-slate-200 pb-1">{d.fullDate}</div>
                            <div className="text-blue-800 font-bold font-mono">Total Jalur: {d.jalur}</div>
                            <div className="text-sky-700 font-bold font-mono">Total Team: {d.team}</div>
                            <div className="text-amber-700 font-black font-mono mt-0.5">Produktivitas: {d.prod}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="jalur" 
                    fill="url(#colorJalur)" 
                    stroke="#1d4ed8" 
                    strokeWidth={2} 
                    name="Total Jalur" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="team" 
                    fill="url(#colorTeam)" 
                    stroke="#0284c7" 
                    strokeWidth={2} 
                    name="Total Team" 
                  />
                </AreaChart>
              ) : (
                <ComposedChart data={activeChartData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                  <XAxis 
                    dataKey="day" 
                    stroke="#64748b" 
                    fontSize={11} 
                    fontWeight={600}
                    interval={xAxisInterval}
                  />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={11} fontWeight={600} allowDecimals={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#d97706" fontSize={11} fontWeight={600} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border-2 border-slate-900 rounded-lg p-3 text-xs shadow-md">
                            <div className="font-black text-slate-900 mb-1 border-b border-slate-200 pb-1">{d.fullDate}</div>
                            <div className="text-blue-800 font-bold font-mono">Total Jalur: {d.jalur}</div>
                            <div className="text-sky-700 font-bold font-mono">Total Team: {d.team}</div>
                            <div className="text-amber-700 font-black font-mono mt-0.5">Produktivitas: {d.prod}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    yAxisId="left" 
                    dataKey="jalur" 
                    fill="#2563eb" 
                    stroke="#0f172a" 
                    strokeWidth={isLargeDataset ? 0.75 : 1.5} 
                    name="Jalur" 
                    maxBarSize={viewGranularity === 'monthly' ? 48 : viewGranularity === 'weekly' ? 24 : 16} 
                  />
                  <Bar 
                    yAxisId="left" 
                    dataKey="team" 
                    fill="#38bdf8" 
                    stroke="#0f172a" 
                    strokeWidth={isLargeDataset ? 0.75 : 1.5} 
                    name="Team" 
                    maxBarSize={viewGranularity === 'monthly' ? 48 : viewGranularity === 'weekly' ? 24 : 16} 
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="prod"
                    stroke="#d97706"
                    strokeWidth={2.5}
                    dot={isLargeDataset ? false : { r: 3, fill: '#d97706', stroke: '#0f172a', strokeWidth: 1.5 }}
                    name="Produktivitas"
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Bobot Clearance & Cumulative Pace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Bobot Masuk vs Finish */}
        <div className="neo-card p-5 sm:p-6 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 font-['Space_Grotesk',sans-serif]">
                  <Weight className="w-4 h-4 text-indigo-700 stroke-[2.5]" />
                  CLEARANCE BEBAN KERJA (BOBOT MASUK VS FINISH)
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Perbandingan bobot penugasan masuk dan selesai
                </p>
              </div>

              {/* Inline Legend */}
              <div className="flex items-center gap-3 text-xs font-bold font-mono">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 bg-slate-400 rounded-xs inline-block" />
                  <span>Masuk</span>
                </span>
                <span className="flex items-center gap-1.5 text-indigo-900">
                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded-xs inline-block" />
                  <span>Finish</span>
                </span>
              </div>
            </div>

            <div className="w-full overflow-x-auto pb-2 mt-4">
              <div style={{ minWidth: chartScrollWidthHalf, height: '16rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  {chartDisplayMode === 'fit' && isLargeDataset ? (
                    <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.15}/>
                        </linearGradient>
                        <linearGradient id="colorFinish" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.85}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="day" 
                        stroke="#64748b" 
                        fontSize={11} 
                        fontWeight={600}
                        interval={xAxisInterval}
                      />
                      <YAxis stroke="#64748b" fontSize={11} fontWeight={600} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            const clearance = d.bobotMasuk > 0 ? Math.round((d.bobotFinish / d.bobotMasuk) * 100) : 0;
                            return (
                              <div className="bg-white border-2 border-slate-900 rounded-lg p-3 text-xs shadow-md">
                                <div className="font-black text-slate-900 mb-1 border-b border-slate-200 pb-1">{d.fullDate}</div>
                                <div className="text-slate-700 font-bold font-mono">Bobot Masuk: {d.bobotMasuk}</div>
                                <div className="text-indigo-800 font-bold font-mono">Bobot Finish: {d.bobotFinish}</div>
                                <div className="text-emerald-800 font-black font-mono mt-1">Clearance: {clearance}%</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="bobotMasuk" 
                        stroke="#475569" 
                        strokeWidth={2} 
                        fill="url(#colorMasuk)" 
                        name="Masuk" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="bobotFinish" 
                        stroke="#4338ca" 
                        strokeWidth={2.5} 
                        fill="url(#colorFinish)" 
                        name="Finish" 
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={activeChartData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                      <XAxis 
                        dataKey="day" 
                        stroke="#64748b" 
                        fontSize={11} 
                        fontWeight={600}
                        interval={xAxisInterval}
                      />
                      <YAxis stroke="#64748b" fontSize={11} fontWeight={600} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            const clearance = d.bobotMasuk > 0 ? Math.round((d.bobotFinish / d.bobotMasuk) * 100) : 0;
                            return (
                              <div className="bg-white border-2 border-slate-900 rounded-lg p-3 text-xs shadow-md">
                                <div className="font-black text-slate-900 mb-1 border-b border-slate-200 pb-1">{d.fullDate}</div>
                                <div className="text-slate-700 font-bold font-mono">Bobot Masuk: {d.bobotMasuk}</div>
                                <div className="text-indigo-800 font-bold font-mono">Bobot Finish: {d.bobotFinish}</div>
                                <div className="text-emerald-800 font-black font-mono mt-1">Clearance: {clearance}%</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="bobotMasuk" 
                        fill="#cbd5e1" 
                        stroke="#0f172a" 
                        strokeWidth={isLargeDataset ? 0.75 : 1.5} 
                        name="Masuk" 
                        maxBarSize={viewGranularity === 'monthly' ? 44 : 26} 
                      />
                      <Bar 
                        dataKey="bobotFinish" 
                        fill="#4f46e5" 
                        stroke="#0f172a" 
                        strokeWidth={isLargeDataset ? 0.75 : 1.5} 
                        name="Finish" 
                        maxBarSize={viewGranularity === 'monthly' ? 44 : 26} 
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Cumulative Pacing Target vs Realisasi */}
        <div className="neo-card p-5 sm:p-6 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 font-['Space_Grotesk',sans-serif]">
                  <TrendingUp className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                  KUMULATIF PACING TARGET VS REALISASI DO
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Pencapaian akumulasi instalasi sepanjang periode aktif
                </p>
              </div>

              {/* Inline Legend */}
              <div className="flex items-center gap-3 text-xs font-bold font-mono">
                <span className="flex items-center gap-1.5 text-blue-900">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-xs inline-block" />
                  <span>Target</span>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-900">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs inline-block" />
                  <span>Realisasi</span>
                </span>
              </div>
            </div>

            <div className="w-full overflow-x-auto pb-2 mt-4">
              <div style={{ minWidth: chartScrollWidthHalf, height: '16rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#93c5fd" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#86efac" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#86efac" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="day" 
                      stroke="#64748b" 
                      fontSize={11} 
                      fontWeight={600}
                      interval={xAxisInterval}
                    />
                    <YAxis stroke="#64748b" fontSize={11} fontWeight={600} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-white border-2 border-slate-900 rounded-lg p-3 text-xs shadow-md">
                              <div className="font-black text-slate-900 mb-1 border-b border-slate-200 pb-1">{d.fullDate}</div>
                              <div className="text-blue-700 font-bold font-mono">Kumulatif Target: {d.cumTarget}</div>
                              <div className="text-emerald-800 font-black font-mono">Kumulatif Realisasi: {d.cumReal}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="cumTarget" stroke="#1d4ed8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTarget)" />
                    <Area type="monotone" dataKey="cumReal" stroke="#047857" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Year-over-Year (YoY: 2025 vs 2026) Comparative Analytics Section */}
      <div className="neo-card p-5 sm:p-6 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-5 bg-indigo-600 rounded-xs inline-block" />
              <h3 className="text-base font-black text-slate-900 font-['Space_Grotesk',sans-serif]">
                PERBANDINGAN TAHUNAN: 2025 VS 2026 (YEAR-OVER-YEAR)
              </h3>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Evaluasi komparatif performa operasional DO Pool Singkawang antara tahun 2025 (11 Bulan: Feb - Des) dan 2026
            </p>
          </div>

          {/* Metric Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase font-mono text-slate-500">
              METRIK GRAFIK:
            </span>
            <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg border border-slate-300">
              <button
                type="button"
                id="btn-yoy-metric-jalur"
                onClick={() => setYoyMetric('jalur')}
                className={`text-xs font-black px-2.5 py-1 rounded transition-colors ${
                  yoyMetric === 'jalur'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Total Jalur
              </button>
              <button
                type="button"
                id="btn-yoy-metric-finish"
                onClick={() => setYoyMetric('finish')}
                className={`text-xs font-black px-2.5 py-1 rounded transition-colors ${
                  yoyMetric === 'finish'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Bobot Finish
              </button>
              <button
                type="button"
                id="btn-yoy-metric-masuk"
                onClick={() => setYoyMetric('masuk')}
                className={`text-xs font-black px-2.5 py-1 rounded transition-colors ${
                  yoyMetric === 'masuk'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Bobot Masuk
              </button>
            </div>
          </div>
        </div>

        {/* YoY Side-by-Side Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5 my-5">
          {/* Total Jalur */}
          <div className="neo-card p-3.5 bg-slate-50/70 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider block">
                TOTAL JALUR
              </span>
              <div className="text-xl font-black text-slate-900 font-['Space_Grotesk',sans-serif] mt-1 font-mono tabular-nums">
                {yoyComparison.stats2026.totalJalur.toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] font-mono font-semibold text-slate-500 mt-0.5">
                2025: {yoyComparison.stats2025.totalJalur.toLocaleString('id-ID')}
              </div>
            </div>
            <div className="mt-2.5">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded font-mono inline-flex items-center gap-1 ${
                yoyComparison.jalurGrowth >= 0 
                  ? 'bg-emerald-100 text-emerald-900' 
                  : 'bg-rose-100 text-rose-900'
              }`}>
                {yoyComparison.jalurGrowth >= 0 ? `+${yoyComparison.jalurGrowth}%` : `${yoyComparison.jalurGrowth}%`} YoY
              </span>
            </div>
          </div>

          {/* Bobot Finish */}
          <div className="neo-card p-3.5 bg-slate-50/70 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider block">
                BOBOT FINISH
              </span>
              <div className="text-xl font-black text-slate-900 font-['Space_Grotesk',sans-serif] mt-1 font-mono tabular-nums">
                {yoyComparison.stats2026.totalBobotFinish.toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] font-mono font-semibold text-slate-500 mt-0.5">
                2025: {yoyComparison.stats2025.totalBobotFinish.toLocaleString('id-ID')}
              </div>
            </div>
            <div className="mt-2.5">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded font-mono inline-flex items-center gap-1 ${
                yoyComparison.finishGrowth >= 0 
                  ? 'bg-emerald-100 text-emerald-900' 
                  : 'bg-rose-100 text-rose-900'
              }`}>
                {yoyComparison.finishGrowth >= 0 ? `+${yoyComparison.finishGrowth}%` : `${yoyComparison.finishGrowth}%`} YoY
              </span>
            </div>
          </div>

          {/* Bobot Masuk */}
          <div className="neo-card p-3.5 bg-slate-50/70 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider block">
                BOBOT MASUK
              </span>
              <div className="text-xl font-black text-slate-900 font-['Space_Grotesk',sans-serif] mt-1 font-mono tabular-nums">
                {yoyComparison.stats2026.totalBobotMasuk.toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] font-mono font-semibold text-slate-500 mt-0.5">
                2025: {yoyComparison.stats2025.totalBobotMasuk.toLocaleString('id-ID')}
              </div>
            </div>
            <div className="mt-2.5">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded font-mono inline-flex items-center gap-1 ${
                yoyComparison.masukGrowth >= 0 
                  ? 'bg-emerald-100 text-emerald-900' 
                  : 'bg-rose-100 text-rose-900'
              }`}>
                {yoyComparison.masukGrowth >= 0 ? `+${yoyComparison.masukGrowth}%` : `${yoyComparison.masukGrowth}%`} YoY
              </span>
            </div>
          </div>

          {/* Clearance Rate */}
          <div className="neo-card p-3.5 bg-slate-50/70 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider block">
                CLEARANCE RATE
              </span>
              <div className="text-xl font-black text-slate-900 font-['Space_Grotesk',sans-serif] mt-1 font-mono tabular-nums">
                {yoyComparison.stats2026.completionRate}%
              </div>
              <div className="text-[11px] font-mono font-semibold text-slate-500 mt-0.5">
                2025: {yoyComparison.stats2025.completionRate}%
              </div>
            </div>
            <div className="mt-2.5">
              <span className="text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-300 px-2 py-0.5 rounded">
                Δ {(yoyComparison.stats2026.completionRate - yoyComparison.stats2025.completionRate).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Target Realisasi */}
          <div className="neo-card p-3.5 bg-slate-50/70 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider block">
                TARGET REALISASI
              </span>
              <div className="text-xl font-black text-slate-900 font-['Space_Grotesk',sans-serif] mt-1 font-mono tabular-nums">
                {yoyComparison.stats2026.achvRate}%
              </div>
              <div className="text-[11px] font-mono font-semibold text-slate-500 mt-0.5">
                2025: {yoyComparison.stats2025.achvRate}%
              </div>
            </div>
            <div className="mt-2.5 text-[10px] font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-300">
              {yoyComparison.stats2026.totalRealisasi} / {yoyComparison.stats2026.totalTarget}
            </div>
          </div>

          {/* Rata-Rata Jalur/Hari */}
          <div className="neo-card p-3.5 bg-slate-50/70 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider block">
                RATA JALUR/HARI
              </span>
              <div className="text-xl font-black text-slate-900 font-['Space_Grotesk',sans-serif] mt-1 font-mono tabular-nums">
                {yoyComparison.stats2026.avgJalurPerDay}
              </div>
              <div className="text-[11px] font-mono font-semibold text-slate-500 mt-0.5">
                2025: {yoyComparison.stats2025.avgJalurPerDay}
              </div>
            </div>
            <div className="mt-2.5 text-[10px] font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-300">
              {yoyComparison.stats2026.activeDays} vs {yoyComparison.stats2025.activeDays} hari
            </div>
          </div>
        </div>

        {/* Dual Bar Chart: 2025 vs 2026 Month-by-Month */}
        <div className="mt-5 pt-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3">
            <span className="text-xs font-black text-slate-900 font-mono uppercase">
              GRAFIK PERBANDINGAN {yoyMetric === 'jalur' ? 'TOTAL JALUR' : yoyMetric === 'finish' ? 'BOBOT FINISH' : 'BOBOT MASUK'} PER BULAN
            </span>

            <div className="flex items-center gap-4 text-xs font-bold font-mono">
              <span className="flex items-center gap-1.5 text-indigo-900">
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-xs inline-block" />
                <span>Tahun 2025</span>
              </span>
              <span className="flex items-center gap-1.5 text-blue-900">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs inline-block" />
                <span>Tahun 2026</span>
              </span>
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yoyComparison.chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} fontWeight={600} />
                <YAxis stroke="#64748b" fontSize={11} fontWeight={600} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      const val25 = yoyMetric === 'jalur' ? d.jalur2025 : yoyMetric === 'finish' ? d.finish2025 : d.masuk2025;
                      const val26 = yoyMetric === 'jalur' ? d.jalur2026 : yoyMetric === 'finish' ? d.finish2026 : d.masuk2026;
                      const delta = val26 - val25;
                      const growth = val25 > 0 ? Math.round((delta / val25) * 1000) / 10 : null;
                      return (
                        <div className="bg-white border-2 border-slate-900 rounded-lg p-3 text-xs shadow-md">
                          <div className="font-black text-slate-900 mb-1.5 border-b border-slate-200 pb-1">
                            {d.fullMonth} (2025 vs 2026)
                          </div>
                          <div className="text-indigo-800 font-bold flex items-center justify-between gap-4 font-mono">
                            <span>Tahun 2025:</span>
                            <span className="font-black">{val25.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="text-blue-800 font-bold flex items-center justify-between gap-4 font-mono">
                            <span>Tahun 2026:</span>
                            <span className="font-black">{val26.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between gap-4 font-black font-mono">
                            <span>Selisih (Δ):</span>
                            <span className={delta >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                              {delta >= 0 ? `+${delta.toLocaleString('id-ID')}` : delta.toLocaleString('id-ID')} {growth !== null ? `(${growth >= 0 ? `+${growth}%` : `${growth}%`})` : ''}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey={yoyMetric === 'jalur' ? 'jalur2025' : yoyMetric === 'finish' ? 'finish2025' : 'masuk2025'} 
                  fill="#6366f1" 
                  stroke="#0f172a" 
                  strokeWidth={1.5} 
                  name="2025" 
                  maxBarSize={32} 
                />
                <Bar 
                  dataKey={yoyMetric === 'jalur' ? 'jalur2026' : yoyMetric === 'finish' ? 'finish2026' : 'masuk2026'} 
                  fill="#2563eb" 
                  stroke="#0f172a" 
                  strokeWidth={1.5} 
                  name="2026" 
                  maxBarSize={32} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Toggleable Detailed YoY Month-by-Month Table */}
        <div className="mt-4 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setIsYoyTableOpen(!isYoyTableOpen)}
            className="text-xs font-black text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md px-3 py-1.5 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>{isYoyTableOpen ? 'Tutup Rincian Tabel YoY' : 'Buka Tabel Rincian Perbandingan Per Bulan (2025 vs 2026)'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isYoyTableOpen ? 'rotate-180' : ''}`} />
          </button>

          {isYoyTableOpen && (
            <div className="mt-3 overflow-x-auto border border-slate-300 rounded-lg shadow-xs">
              <table className="w-full text-xs text-left text-slate-900">
                <thead className="bg-slate-900 text-white font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">Bulan</th>
                    <th className="px-3 py-2.5 text-right">Jalur 2025</th>
                    <th className="px-3 py-2.5 text-right">Jalur 2026</th>
                    <th className="px-3 py-2.5 text-right">Δ Jalur</th>
                    <th className="px-3 py-2.5 text-right">Finish 2025</th>
                    <th className="px-3 py-2.5 text-right">Finish 2026</th>
                    <th className="px-3 py-2.5 text-right">Δ Finish</th>
                    <th className="px-3 py-2.5 text-right">Clearance '25</th>
                    <th className="px-3 py-2.5 text-right">Clearance '26</th>
                    <th className="px-3 py-2.5 text-center">Tren</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white font-semibold">
                  {yoyComparison.chartData.map((d) => {
                    const isPositive = d.jalurDelta >= 0;
                    return (
                      <tr key={d.month} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2 font-black text-slate-900 font-mono">{d.fullMonth}</td>
                        <td className="px-3 py-2 text-right font-mono text-indigo-900 tabular-nums">{d.jalur2025.toLocaleString('id-ID')}</td>
                        <td className="px-3 py-2 text-right font-mono text-blue-900 tabular-nums">{d.jalur2026.toLocaleString('id-ID')}</td>
                        <td className={`px-3 py-2 text-right font-mono font-black tabular-nums ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {d.jalurDelta >= 0 ? `+${d.jalurDelta.toLocaleString('id-ID')}` : d.jalurDelta.toLocaleString('id-ID')}
                          {d.jalurGrowth !== null && ` (${d.jalurGrowth >= 0 ? `+${d.jalurGrowth}%` : `${d.jalurGrowth}%`})`}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-700 tabular-nums">{d.finish2025.toLocaleString('id-ID')}</td>
                        <td className="px-3 py-2 text-right font-mono text-indigo-900 tabular-nums">{d.finish2026.toLocaleString('id-ID')}</td>
                        <td className={`px-3 py-2 text-right font-mono font-black tabular-nums ${d.finishDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {d.finishDelta >= 0 ? `+${d.finishDelta.toLocaleString('id-ID')}` : d.finishDelta.toLocaleString('id-ID')}
                          {d.finishGrowth !== null && ` (${d.finishGrowth >= 0 ? `+${d.finishGrowth}%` : `${d.finishGrowth}%`})`}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-600 tabular-nums">{d.clearance2025}%</td>
                        <td className="px-3 py-2 text-right font-mono text-emerald-800 tabular-nums">{d.clearance2026}%</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded font-mono ${
                            isPositive ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                          }`}>
                            {isPositive ? '↑ NAIK' : '↓ TURUN'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Outcome Donut & Operational Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Outcome Donut */}
        <div className="lg:col-span-5 neo-card p-5 bg-white flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-1 font-['Space_Grotesk',sans-serif]">
              <PieIcon className="w-4 h-4 text-blue-700 stroke-[2.5]" />
              KOMPOSISI HASIL DELIVERY ORDER
            </h3>
            <p className="text-xs font-semibold text-slate-500">Perbandingan realisasi selesai vs kendala pending vs cancel</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center my-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="#0f172a"
                  strokeWidth={1.5}
                >
                  {outcomePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} Order`, name]}
                  contentStyle={{ border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-slate-200">
            {outcomePieData.map((item) => (
              <div key={item.name} className="p-2 bg-slate-50 rounded border border-slate-200">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-mono font-bold text-slate-700 truncate">{item.name.split(' ')[0]}</span>
                </div>
                <div className="font-black text-slate-900 text-sm font-mono tabular-nums">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Operational Insights & Milestones */}
        <div className="lg:col-span-7 neo-card p-5 sm:p-6 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-amber-500 stroke-[2.5]" />
              <h3 className="text-base font-black text-slate-900 font-['Space_Grotesk',sans-serif]">
                RINGKASAN ANALITIK OPERASIONAL POOL SINGKAWANG
              </h3>
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-4">
              Evaluasi performa kerja penugasan periode {dateRangeLabel}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-auto">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between text-xs text-blue-900 font-black mb-1">
                <span className="font-mono">PUNCAK BOBOT HARIAN</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="text-lg font-black text-slate-900 font-['Space_Grotesk',sans-serif]">{stats.peakBobotDay.date}</div>
              <p className="text-xs text-slate-600 mt-0.5">
                Bobot tertinggi: <strong className="text-blue-800 font-mono">{stats.peakBobotDay.bobot}</strong> poin.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between text-xs text-emerald-900 font-black mb-1">
                <span className="font-mono">PUNCAK JALUR HARIAN</span>
                <Award className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="text-lg font-black text-slate-900 font-['Space_Grotesk',sans-serif]">{stats.peakJalurDay.date}</div>
              <p className="text-xs text-slate-600 mt-0.5">
                Penugasan maksimal: <strong className="text-emerald-800 font-mono">{stats.peakJalurDay.jalur} jalur</strong>.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-indigo-900 font-black block mb-1 font-mono">EFISIENSI EKSEKUSI</span>
              <div className="text-lg font-black text-slate-900 font-['Space_Grotesk',sans-serif] font-mono tabular-nums">{effectiveSummary.overallCompletionRate}%</div>
              <p className="text-xs text-slate-600 mt-0.5">
                Rasio clearance delivery order menunjukkan tingkat penyelesaian yang konsisten.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-amber-900 font-black block mb-1 font-mono">PENGENDALIAN KENDALA</span>
              <div className="text-lg font-black text-slate-900 font-['Space_Grotesk',sans-serif] font-mono tabular-nums">{stats.pendingRate}% Pending</div>
              <p className="text-xs text-slate-600 mt-0.5">
                Mayoritas kendala terselesaikan cepat melalui tindak lanjut penjadwalan ulang.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Slides Comprehensive Export Modal */}
      <GoogleSlidesExportModal
        isOpen={googleSlidesModalOpen}
        onClose={() => setGoogleSlidesModalOpen(false)}
        reportData={comprehensiveReportData}
        defaultFilename={`${comprehensiveReportData.title.replace(/\s+/g, '_')}_${dateRange.toUpperCase()}_${year}`}
      />
    </div>
  );
};
