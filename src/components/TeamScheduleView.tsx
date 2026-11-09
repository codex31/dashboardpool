import React, { useState, useMemo } from 'react';
import { 
  MonthScheduleDataset, 
  TechnicianSchedule, 
  SCHEDULE_SPREADSHEET_URL,
  TEAM_MEMBERS_INFO
} from '../data/teamScheduleData';
import { 
  getStoredSchedules, 
  syncMonthFromGoogleSheet, 
  exportScheduleMonthToCSV,
  calculateYearlyStats
} from '../services/scheduleService';
import { 
  Calendar, 
  Users, 
  Briefcase, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  Download, 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Info, 
  UserCheck, 
  CalendarDays, 
  ChevronRight,
  Plane,
  Sun,
  Coffee,
  X
} from 'lucide-react';

interface TeamScheduleViewProps {
  onNotify?: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const TeamScheduleView: React.FC<TeamScheduleViewProps> = ({ onNotify }) => {
  const [schedules, setSchedules] = useState<MonthScheduleDataset[]>(() => getStoredSchedules());
  
  // Default to the latest month (Oktober 2026 or last in array)
  const [selectedMonthId, setSelectedMonthId] = useState<string>(() => {
    const list = getStoredSchedules();
    return list.find(m => m.id === '2026-10')?.id || list.find(m => m.id === '2026-09')?.id || list[list.length - 1]?.id || '2026-10';
  });

  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'technicians' | 'yearly'>('matrix');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [selectedDayDetail, setSelectedDayDetail] = useState<{ day: number; dayName: string } | null>(null);

  // Currently selected month dataset
  const currentMonth = useMemo(() => {
    return schedules.find(m => m.id === selectedMonthId) || schedules[schedules.length - 1];
  }, [schedules, selectedMonthId]);

  // Filtered members based on search
  const filteredMembers = useMemo(() => {
    if (!currentMonth) return [];
    if (!searchTerm.trim()) return currentMonth.members;
    const q = searchTerm.toLowerCase();
    return currentMonth.members.filter(m => 
      m.nama.toLowerCase().includes(q) || 
      m.nip.toLowerCase().includes(q) ||
      m.jobTitle.toLowerCase().includes(q)
    );
  }, [currentMonth, searchTerm]);

  // Aggregate KPI stats for selected month
  const monthKpi = useMemo(() => {
    if (!currentMonth) {
      return { totalTech: 0, totalWorkShifts: 0, totalOffShifts: 0, totalLeaveShifts: 0, totalAgendas: 0 };
    }

    let totalWork = 0;
    let totalOff = 0;
    let totalLeave = 0;

    currentMonth.members.forEach(m => {
      if (m.summary['M0067']) totalWork += parseInt(m.summary['M0067'], 10) || 0;
      if (m.summary['O']) totalOff += parseInt(m.summary['O'], 10) || 0;
      if (m.summary['AL']) totalLeave += parseInt(m.summary['AL'], 10) || 0;
    });

    // Fallback if summary numbers were 0: count from shifts dict
    if (totalWork === 0 && totalOff === 0) {
      currentMonth.members.forEach(m => {
        (Object.values(m.shifts) as string[]).forEach(s => {
          const up = s.toUpperCase();
          if (up === 'M0067') totalWork++;
          else if (up === 'O') totalOff++;
          else if (up === 'AL') totalLeave++;
        });
      });
    }

    const agendaCount = Object.keys(currentMonth.notes || {}).length;

    return {
      totalTech: currentMonth.members.length,
      totalWorkShifts: totalWork,
      totalOffShifts: totalOff,
      totalLeaveShifts: totalLeave,
      totalAgendas: agendaCount
    };
  }, [currentMonth]);

  // Full year stats
  const yearlyStats = useMemo(() => {
    return calculateYearlyStats(schedules);
  }, [schedules]);

  // Handle live re-sync from Google Sheets
  const handleLiveSync = async () => {
    if (!currentMonth) return;
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const updated = await syncMonthFromGoogleSheet(currentMonth);
      setSchedules(prev => {
        const idx = prev.findIndex(m => m.id === updated.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [...prev, updated];
      });
      setSyncStatus(`Berhasil sinkronisasi jadwal ${currentMonth.monthName} dari Google Sheets!`);
      if (onNotify) onNotify(`Jadwal ${currentMonth.monthName} diperbarui langsung dari Google Sheets!`, 'success');
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err: any) {
      console.error('Error syncing schedule:', err);
      setSyncStatus(`Gagal sinkronisasi: ${err.message || 'Koneksi lembar kerja bermasalah'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Export current month
  const handleExportCSV = () => {
    if (!currentMonth) return;
    exportScheduleMonthToCSV(currentMonth);
    if (onNotify) onNotify(`File CSV jadwal ${currentMonth.monthName} siap diunduh.`, 'info');
  };

  // Helper for shift badge rendering
  const renderShiftBadge = (val: string) => {
    const clean = val.trim().toUpperCase();
    if (!clean) {
      return <span className="text-slate-300 font-mono text-xs">-</span>;
    }
    if (clean === 'M0067') {
      return (
        <span 
          className="inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-black font-mono rounded bg-sky-100 text-sky-950 border border-sky-600 shadow-[1px_1px_0px_0px_#0369a1]"
          title="Shift Utama Masuk Kerja (M0067)"
        >
          M0067
        </span>
      );
    }
    if (clean === 'O') {
      return (
        <span 
          className="inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-black font-mono rounded bg-amber-100 text-amber-950 border border-amber-500 shadow-[1px_1px_0px_0px_#d97706]"
          title="Libur Giliran (OFF)"
        >
          OFF
        </span>
      );
    }
    if (clean === 'AL') {
      return (
        <span 
          className="inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-black font-mono rounded bg-emerald-100 text-emerald-950 border border-emerald-600 shadow-[1px_1px_0px_0px_#059669]"
          title="Cuti Tahunan (Annual Leave)"
        >
          AL
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center px-1 py-0.5 text-[10px] font-bold rounded bg-purple-100 text-purple-900 border border-purple-400">
        {clean}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header Controls */}
      <div className="bg-white border-2.5 border-slate-900 rounded-2xl p-4 sm:p-6 shadow-[5px_5px_0px_0px_#0f172a] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="neo-stamp bg-amber-400 text-slate-950 text-[10px] uppercase font-mono">
                OPS//SCHEDULE-TIM
              </span>
              <span className="neo-stamp bg-slate-900 text-white text-[10px] uppercase font-mono">
                POOL SINGKAWANG
              </span>
              <span className="neo-stamp bg-blue-100 text-blue-900 border-blue-400 text-[10px] font-mono">
                ROSTER 2026
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-blue-600 stroke-[2.5]" />
              Schedule & Roster Tim Teknisi
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-3xl">
              Jadwal kerja operasional harian teknisi installer Pool Singkawang. Dilengkapi integrasi sheet multi-bulan (Januari s/d Oktober 2026), pemantauan shift kerja (<span className="text-sky-800 font-bold">M0067</span>), libur (<span className="text-amber-800 font-bold">OFF</span>), cuti (<span className="text-emerald-800 font-bold">AL</span>), dan agenda dinas khusus.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              id="btn-sync-schedule-sheet"
              onClick={handleLiveSync}
              disabled={isSyncing}
              className="neo-btn bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center gap-1.5 px-3 py-2 disabled:opacity-50"
              title="Sinkronkan data jadwal terbaru dari Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkron Live Sheet'}</span>
            </button>

            <button
              id="btn-export-schedule-csv"
              onClick={handleExportCSV}
              className="neo-btn bg-white hover:bg-slate-100 text-slate-900 text-xs font-black flex items-center gap-1.5 px-3 py-2"
              title="Unduh jadwal bulan ini ke format CSV"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Unduh CSV</span>
            </button>

            <a
              id="link-open-google-sheet"
              href={`${SCHEDULE_SPREADSHEET_URL}#gid=${currentMonth?.gid || '0'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="neo-btn bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1.5 px-3 py-2"
              title="Buka dokumen sumber di Google Spreadsheet asli"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.5] text-emerald-400" />
              <span>Buka Google Sheet</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </a>
          </div>
        </div>

        {/* Sync Status Banner */}
        {syncStatus && (
          <div className={`mt-4 p-3 rounded-xl border-2 border-slate-900 text-xs font-bold flex items-center justify-between shadow-[3px_3px_0px_0px_#0f172a] ${
            syncStatus.includes('Gagal') ? 'bg-rose-100 text-rose-950' : 'bg-emerald-100 text-emerald-950'
          }`}>
            <div className="flex items-center gap-2">
              {syncStatus.includes('Gagal') ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{syncStatus}</span>
            </div>
            <button 
              onClick={() => setSyncStatus(null)}
              className="font-mono text-xs hover:underline cursor-pointer ml-3 font-black"
            >
              [Tutup]
            </button>
          </div>
        )}

        {/* Month Selector Carousel / Tabs */}
        <div className="mt-5 pt-5 border-t-2 border-slate-200">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-500 font-mono flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Pilih Bulan Roster (Januari - Oktober 2026):
            </span>
            <span className="text-[11px] font-black text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              Bulan Terpilih: {currentMonth?.monthName} {currentMonth?.year} ({currentMonth?.totalDays} Hari)
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {schedules.map((m) => {
              const isSelected = m.id === selectedMonthId;
              const hasNotes = Object.keys(m.notes || {}).length > 0;
              return (
                <button
                  key={m.id}
                  id={`btn-select-month-${m.id}`}
                  onClick={() => setSelectedMonthId(m.id)}
                  className={`neo-btn px-3 py-1.5 text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-[3px_3px_0px_0px_#0f172a] -translate-y-0.5'
                      : 'bg-white hover:bg-slate-100 text-slate-800 shadow-[2px_2px_0px_0px_#0f172a]'
                  }`}
                >
                  <span>{m.monthName}</span>
                  {hasNotes && (
                    <span 
                      className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-300 ring-2 ring-white' : 'bg-blue-600'}`}
                      title="Terdapat agenda khusus / Perdin di bulan ini"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Schedule Specific KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Total Teknisi */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-3.5 sm:p-4 shadow-[3px_3px_0px_0px_#0f172a]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase font-mono text-slate-500">Personel Teknisi</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">{monthKpi.totalTech}</span>
            <span className="text-xs font-bold text-slate-600">Teknisi Installer</span>
          </div>
          <p className="text-[11px] font-semibold text-slate-500 mt-1 truncate">
            Kemas, Doni, Jupi
          </p>
        </div>

        {/* Card 2: Total Shift Masuk */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-3.5 sm:p-4 shadow-[3px_3px_0px_0px_#0f172a]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase font-mono text-slate-500">Shift Kerja Masuk</span>
            <Briefcase className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-sky-700 font-mono">{monthKpi.totalWorkShifts}</span>
            <span className="text-xs font-bold text-slate-600">Hari Masuk</span>
          </div>
          <p className="text-[11px] font-semibold text-sky-700 mt-1">
            Kode Shift: M0067
          </p>
        </div>

        {/* Card 3: Total Hari Off */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-3.5 sm:p-4 shadow-[3px_3px_0px_0px_#0f172a]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase font-mono text-slate-500">Total Hari Off</span>
            <Coffee className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-700 font-mono">{monthKpi.totalOffShifts}</span>
            <span className="text-xs font-bold text-slate-600">Hari Libur</span>
          </div>
          <p className="text-[11px] font-semibold text-amber-700 mt-1">
            Giliran Libur Rutin
          </p>
        </div>

        {/* Card 4: Cuti / AL */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-3.5 sm:p-4 shadow-[3px_3px_0px_0px_#0f172a]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase font-mono text-slate-500">Cuti Tahunan (AL)</span>
            <Sun className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-700 font-mono">{monthKpi.totalLeaveShifts}</span>
            <span className="text-xs font-bold text-slate-600">Hari Cuti</span>
          </div>
          <p className="text-[11px] font-semibold text-emerald-700 mt-1">
            Annual Leave
          </p>
        </div>

        {/* Card 5: Agenda & Perdin */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-3.5 sm:p-4 shadow-[3px_3px_0px_0px_#0f172a] col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase font-mono text-slate-500">Agenda Khusus</span>
            <Plane className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-purple-700 font-mono">{monthKpi.totalAgendas}</span>
            <span className="text-xs font-bold text-slate-600">Catatan Agenda</span>
          </div>
          <p className="text-[11px] font-semibold text-purple-700 mt-1 truncate">
            {monthKpi.totalAgendas > 0 ? 'Perdin / Outing / Acara' : 'Operasional Normal'}
          </p>
        </div>
      </div>

      {/* Sub-Tabs View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a]">
        <div className="flex items-center gap-1.5">
          <button
            id="tab-view-matrix"
            onClick={() => setActiveSubTab('matrix')}
            className={`neo-btn px-3 py-1.5 text-xs font-black flex items-center gap-1.5 ${
              activeSubTab === 'matrix'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Matriks Tabel Roster</span>
          </button>

          <button
            id="tab-view-technicians"
            onClick={() => setActiveSubTab('technicians')}
            className={`neo-btn px-3 py-1.5 text-xs font-black flex items-center gap-1.5 ${
              activeSubTab === 'technicians'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Profil & Rekap Teknisi</span>
          </button>

          <button
            id="tab-view-yearly"
            onClick={() => setActiveSubTab('yearly')}
            className={`neo-btn px-3 py-1.5 text-xs font-black flex items-center gap-1.5 ${
              activeSubTab === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Akumulasi Tahunan (9 Bulan)</span>
          </button>
        </div>

        {/* Quick Search */}
        {activeSubTab === 'matrix' && (
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari teknisi / NIP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-bold pl-8 pr-3 py-1.5 rounded-lg border-2 border-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>
        )}
      </div>

      {/* VIEW 1: MATRIX TABEL ROSTER BULANAN */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          {/* Roster Table Card */}
          <div className="bg-white border-2.5 border-slate-900 rounded-2xl shadow-[5px_5px_0px_0px_#0f172a] overflow-hidden">
            {/* Table Header Bar */}
            <div className="p-4 bg-slate-50 border-b-2 border-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="neo-stamp bg-slate-900 text-white text-[10px] font-mono">
                  {currentMonth.monthName.toUpperCase()} {currentMonth.year}
                </span>
                <span className="text-xs font-black text-slate-800">
                  Tabel Roster Operasional ({currentMonth.totalDays} Hari)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-sky-200 border border-sky-600" />
                  M0067: Masuk
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-200 border border-amber-600" />
                  OFF: Libur
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-200 border border-emerald-600" />
                  AL: Cuti
                </span>
                <span className="flex items-center gap-1 text-slate-400">| Klik kolom tanggal untuk detail</span>
              </div>
            </div>

            {/* Scrollable Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  {/* Row 1: Day Numbers */}
                  <tr className="bg-slate-900 text-white border-b-2 border-slate-900">
                    <th className="sticky left-0 z-20 bg-slate-900 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-slate-300 w-10 text-center border-r border-slate-800">
                      NO
                    </th>
                    <th className="sticky left-10 z-20 bg-slate-900 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-slate-300 w-24 border-r border-slate-800 font-mono">
                      NIP
                    </th>
                    <th className="sticky left-34 z-20 bg-slate-900 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-white min-w-[150px] border-r-2 border-slate-900">
                      NAMA TEKNISI
                    </th>
                    <th className="px-2 py-2 text-[10px] font-black uppercase tracking-wider text-slate-300 text-center w-14 border-r border-slate-800">
                      JABATAN
                    </th>
                    <th className="px-2 py-2 text-[10px] font-black uppercase tracking-wider text-slate-300 text-center w-14 border-r-2 border-slate-900 font-mono">
                      HARI
                    </th>

                    {/* Day Number Columns (1..31) */}
                    {currentMonth.days.map((d) => {
                      const isWeekend = d.dayName === 'SB' || d.dayName === 'MG';
                      const hasNote = Boolean(currentMonth.notes?.[String(d.day)]);
                      return (
                        <th
                          key={d.day}
                          onClick={() => setSelectedDayDetail(d)}
                          className={`px-1 py-1.5 text-center min-w-[42px] max-w-[42px] border-r border-slate-700 cursor-pointer transition-colors ${
                            isWeekend ? 'bg-slate-800 text-amber-300' : 'text-white'
                          } hover:bg-blue-800`}
                          title={`Klik untuk inspeksi hari ke-${d.day} (${d.dayName})`}
                        >
                          <div className="flex flex-col items-center">
                            <span className="font-mono text-xs font-black">{d.day}</span>
                            {hasNote && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" title={currentMonth.notes[String(d.day)]} />
                            )}
                          </div>
                        </th>
                      );
                    })}

                    {/* Trailing Summary Headers */}
                    <th className="px-2.5 py-2 text-[10px] font-black uppercase tracking-wider text-amber-300 text-center w-14 border-l-2 border-slate-900 bg-slate-900">
                      OFF (O)
                    </th>
                    <th className="px-2.5 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-300 text-center w-14 border-r border-slate-800 bg-slate-900">
                      CUTI (AL)
                    </th>
                    <th className="px-2.5 py-2 text-[10px] font-black uppercase tracking-wider text-sky-300 text-center w-16 bg-slate-900">
                      M0067
                    </th>
                  </tr>

                  {/* Row 2: Day Names (SN, SL, RB, KM, JM, SB, MG) */}
                  <tr className="bg-slate-100 text-slate-700 border-b-2 border-slate-900 font-mono text-[10px]">
                    <th className="sticky left-0 z-20 bg-slate-100 px-3 py-1 border-r border-slate-300 text-center">-</th>
                    <th className="sticky left-10 z-20 bg-slate-100 px-3 py-1 border-r border-slate-300">-</th>
                    <th className="sticky left-34 z-20 bg-slate-100 px-3 py-1 border-r-2 border-slate-900 font-sans font-bold">HARI DALAM MINGGU</th>
                    <th className="px-2 py-1 text-center border-r border-slate-300">INST</th>
                    <th className="px-2 py-1 text-center border-r-2 border-slate-900 font-bold">TGL</th>

                    {currentMonth.days.map((d) => {
                      const isWeekend = d.dayName === 'SB' || d.dayName === 'MG';
                      return (
                        <th
                          key={`name-${d.day}`}
                          onClick={() => setSelectedDayDetail(d)}
                          className={`px-1 py-1 text-center border-r border-slate-300 cursor-pointer ${
                            isWeekend ? 'bg-amber-100 text-amber-900 font-black' : 'font-bold text-slate-600'
                          } hover:bg-blue-100`}
                        >
                          {d.dayName}
                        </th>
                      );
                    })}

                    <th className="px-2 py-1 text-center border-l-2 border-slate-900 bg-amber-50 font-bold text-amber-900">O</th>
                    <th className="px-2 py-1 text-center border-r border-slate-300 bg-emerald-50 font-bold text-emerald-900">AL</th>
                    <th className="px-2 py-1 text-center bg-sky-50 font-bold text-sky-900">M</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {/* Technician Rows */}
                  {filteredMembers.map((mem, memIdx) => {
                    return (
                      <tr 
                        key={mem.nip}
                        className={`hover:bg-blue-50/70 transition-colors ${memIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}
                      >
                        {/* No */}
                        <td className="sticky left-0 z-10 bg-inherit px-3 py-2.5 text-center font-bold text-slate-500 border-r border-slate-200">
                          {mem.no || memIdx + 1}
                        </td>
                        {/* NIP */}
                        <td className="sticky left-10 z-10 bg-inherit px-3 py-2.5 font-mono font-bold text-slate-800 border-r border-slate-200">
                          {mem.nip}
                        </td>
                        {/* Nama */}
                        <td className="sticky left-34 z-10 bg-inherit px-3 py-2.5 font-black text-slate-900 border-r-2 border-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                            <span>{mem.nama}</span>
                          </div>
                        </td>
                        {/* Job */}
                        <td className="px-2 py-2.5 text-center font-bold text-slate-600 border-r border-slate-200">
                          <span className="neo-badge bg-slate-100 text-slate-800 text-[10px] px-1.5 py-0.5">
                            {mem.jobTitle}
                          </span>
                        </td>
                        {/* Total Hari */}
                        <td className="px-2 py-2.5 text-center font-mono font-black text-slate-800 border-r-2 border-slate-900">
                          {mem.totalHariKerja}
                        </td>

                        {/* Shift Badges for each day */}
                        {currentMonth.days.map((d) => {
                          const shift = mem.shifts[String(d.day)] || '';
                          const isWeekend = d.dayName === 'SB' || d.dayName === 'MG';
                          return (
                            <td
                              key={`${mem.nip}-${d.day}`}
                              className={`px-1 py-2 text-center border-r border-slate-200 ${
                                isWeekend ? 'bg-amber-50/30' : ''
                              }`}
                            >
                              {renderShiftBadge(shift)}
                            </td>
                          );
                        })}

                        {/* Summary Numbers */}
                        <td className="px-2.5 py-2 text-center font-mono font-black text-amber-900 border-l-2 border-slate-900 bg-amber-50/50">
                          {mem.summary['O'] || (Object.values(mem.shifts) as string[]).filter(s => s.toUpperCase() === 'O').length}
                        </td>
                        <td className="px-2.5 py-2 text-center font-mono font-black text-emerald-900 border-r border-slate-200 bg-emerald-50/50">
                          {mem.summary['AL'] || (Object.values(mem.shifts) as string[]).filter(s => s.toUpperCase() === 'AL').length}
                        </td>
                        <td className="px-2.5 py-2 text-center font-mono font-black text-sky-900 bg-sky-50/50">
                          {mem.summary['M0067'] || (Object.values(mem.shifts) as string[]).filter(s => s.toUpperCase() === 'M0067').length}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Summary Rows (Matching Google Sheet) */}
                  {/* Row 1: Total M0067 Per Day */}
                  <tr className="bg-sky-50 border-t-2 border-slate-900 font-mono font-black text-sky-950">
                    <td className="sticky left-0 z-10 bg-sky-50 px-3 py-2 text-center border-r border-slate-300">-</td>
                    <td className="sticky left-10 z-10 bg-sky-50 px-3 py-2 border-r border-slate-300">-</td>
                    <td className="sticky left-34 z-10 bg-sky-50 px-3 py-2 border-r-2 border-slate-900 font-sans uppercase">
                      TOTAL MASUK (M0067)
                    </td>
                    <td className="px-2 py-2 text-center border-r border-slate-300">SHF</td>
                    <td className="px-2 py-2 text-center border-r-2 border-slate-900">-</td>

                    {currentMonth.days.map((d) => {
                      const count = currentMonth.dailyStats.m0067[String(d.day)] ?? 
                        currentMonth.members.filter(m => (m.shifts[String(d.day)] || '').toUpperCase() === 'M0067').length;
                      return (
                        <td key={`m0067-total-${d.day}`} className="px-1 py-2 text-center border-r border-slate-300 font-black">
                          <span className={`text-xs ${Number(count) >= 3 ? 'text-sky-800' : 'text-slate-700'}`}>
                            {count}
                          </span>
                        </td>
                      );
                    })}

                    <td className="px-2 py-2 text-center border-l-2 border-slate-900">-</td>
                    <td className="px-2 py-2 text-center border-r border-slate-300">-</td>
                    <td className="px-2 py-2 text-center text-sky-900">{monthKpi.totalWorkShifts}</td>
                  </tr>

                  {/* Row 2: Total OFF Per Day */}
                  <tr className="bg-amber-50 border-t border-slate-300 font-mono font-black text-amber-950">
                    <td className="sticky left-0 z-10 bg-amber-50 px-3 py-2 text-center border-r border-slate-300">-</td>
                    <td className="sticky left-10 z-10 bg-amber-50 px-3 py-2 border-r border-slate-300">-</td>
                    <td className="sticky left-34 z-10 bg-amber-50 px-3 py-2 border-r-2 border-slate-900 font-sans uppercase">
                      TOTAL OFF (LIBUR)
                    </td>
                    <td className="px-2 py-2 text-center border-r border-slate-300">OFF</td>
                    <td className="px-2 py-2 text-center border-r-2 border-slate-900">-</td>

                    {currentMonth.days.map((d) => {
                      const count = currentMonth.dailyStats.off[String(d.day)] ?? 
                        currentMonth.members.filter(m => (m.shifts[String(d.day)] || '').toUpperCase() === 'O').length;
                      return (
                        <td key={`off-total-${d.day}`} className="px-1 py-2 text-center border-r border-slate-300 font-black">
                          <span className={`text-xs ${Number(count) > 0 ? 'text-amber-800' : 'text-slate-400'}`}>
                            {count}
                          </span>
                        </td>
                      );
                    })}

                    <td className="px-2 py-2 text-center border-l-2 border-slate-900 text-amber-900">{monthKpi.totalOffShifts}</td>
                    <td className="px-2 py-2 text-center border-r border-slate-300">-</td>
                    <td className="px-2 py-2 text-center">-</td>
                  </tr>

                  {/* Row 3: Total AL Per Day */}
                  <tr className="bg-emerald-50 border-t border-slate-300 font-mono font-black text-emerald-950">
                    <td className="sticky left-0 z-10 bg-emerald-50 px-3 py-2 text-center border-r border-slate-300">-</td>
                    <td className="sticky left-10 z-10 bg-emerald-50 px-3 py-2 border-r border-slate-300">-</td>
                    <td className="sticky left-34 z-10 bg-emerald-50 px-3 py-2 border-r-2 border-slate-900 font-sans uppercase">
                      TOTAL CUTI (AL)
                    </td>
                    <td className="px-2 py-2 text-center border-r border-slate-300">AL</td>
                    <td className="px-2 py-2 text-center border-r-2 border-slate-900">-</td>

                    {currentMonth.days.map((d) => {
                      const count = currentMonth.dailyStats.al[String(d.day)] ?? 
                        currentMonth.members.filter(m => (m.shifts[String(d.day)] || '').toUpperCase() === 'AL').length;
                      return (
                        <td key={`al-total-${d.day}`} className="px-1 py-2 text-center border-r border-slate-300 font-black">
                          <span className={`text-xs ${Number(count) > 0 ? 'text-emerald-800' : 'text-slate-400'}`}>
                            {count}
                          </span>
                        </td>
                      );
                    })}

                    <td className="px-2 py-2 text-center border-l-2 border-slate-900">-</td>
                    <td className="px-2 py-2 text-center border-r border-slate-300 text-emerald-900">{monthKpi.totalLeaveShifts}</td>
                    <td className="px-2 py-2 text-center">-</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom Legend & Guidance */}
            <div className="p-3 bg-slate-100 border-t-2 border-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-extrabold text-slate-700">Panduan Kode:</span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block px-1.5 py-0.5 text-[10px] font-black rounded bg-sky-100 text-sky-950 border border-sky-600">M0067</span>
                  <span className="text-slate-600">Shift Kerja Masuk Rutin Installer</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block px-1.5 py-0.5 text-[10px] font-black rounded bg-amber-100 text-amber-950 border border-amber-600">OFF</span>
                  <span className="text-slate-600">Libur Giliran Teknisi (O)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block px-1.5 py-0.5 text-[10px] font-black rounded bg-emerald-100 text-emerald-950 border border-emerald-600">AL</span>
                  <span className="text-slate-600">Cuti Tahunan (Annual Leave)</span>
                </span>
              </div>
              <span className="font-mono text-slate-500 font-bold text-[11px]">
                Total Hari: {currentMonth.totalDays} | Personel: {currentMonth.members.length} Orang
              </span>
            </div>
          </div>

          {/* Notes & Agendas Section */}
          {Object.keys(currentMonth.notes || {}).length > 0 && (
            <div className="bg-white border-2 border-slate-900 rounded-xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_#0f172a]">
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight flex items-center gap-2 mb-3">
                <Plane className="w-4 h-4 text-purple-600" />
                Catatan & Agenda Khusus ({currentMonth.monthName} {currentMonth.year})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(currentMonth.notes).map(([day, note]) => (
                  <div 
                    key={day}
                    className="p-3 rounded-lg border-2 border-slate-900 bg-purple-50/70 shadow-[2px_2px_0px_0px_#0f172a] flex items-start gap-2.5"
                  >
                    <span className="neo-stamp bg-purple-700 text-white text-[10px] font-mono px-2 py-0.5 shrink-0 mt-0.5">
                      TGL {day}
                    </span>
                    <div>
                      <strong className="text-xs font-black text-purple-950 block">{note}</strong>
                      <span className="text-[11px] font-semibold text-slate-600">
                        Agenda tercatat pada lembar kerja sumber
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: PROFIL & REKAP TEKNISI */}
      {activeSubTab === 'technicians' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TEAM_MEMBERS_INFO.map((info, idx) => {
              const memberInCurrentMonth = currentMonth.members.find(m => m.nip === info.nip);
              const yearlyStat = yearlyStats.find(y => y.nip === info.nip);
              
              const currentWork = memberInCurrentMonth?.summary['M0067'] || 
                (memberInCurrentMonth ? (Object.values(memberInCurrentMonth.shifts) as string[]).filter(s => s.toUpperCase() === 'M0067').length : 0);
              const currentOff = memberInCurrentMonth?.summary['O'] || 
                (memberInCurrentMonth ? (Object.values(memberInCurrentMonth.shifts) as string[]).filter(s => s.toUpperCase() === 'O').length : 0);
              const currentAL = memberInCurrentMonth?.summary['AL'] || 
                (memberInCurrentMonth ? (Object.values(memberInCurrentMonth.shifts) as string[]).filter(s => s.toUpperCase() === 'AL').length : 0);

              return (
                <div 
                  key={info.nip}
                  className="bg-white border-2.5 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-4"
                >
                  {/* Header Profile */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="neo-stamp bg-blue-600 text-white text-[9px] font-mono">
                        NIP: {info.nip}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-1.5">{info.nama}</h3>
                      <p className="text-xs font-bold text-slate-500">{info.role} ({info.jobTitle})</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-black text-sm border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]">
                      0{idx + 1}
                    </div>
                  </div>

                  {/* Monthly Recap Box */}
                  <div className="p-3 bg-slate-50 rounded-xl border-2 border-slate-900 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Bulan Ini ({currentMonth.monthName}):</span>
                      <span className="font-mono text-blue-700">{memberInCurrentMonth?.totalHariKerja || currentMonth.totalDays} Hari</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-200">
                      <div className="bg-sky-100 p-1.5 rounded border border-sky-300">
                        <span className="text-[10px] font-black text-sky-900 block font-mono">KERJA</span>
                        <strong className="text-sm font-mono font-black text-sky-950">{currentWork}</strong>
                      </div>
                      <div className="bg-amber-100 p-1.5 rounded border border-amber-300">
                        <span className="text-[10px] font-black text-amber-900 block font-mono">OFF</span>
                        <strong className="text-sm font-mono font-black text-amber-950">{currentOff}</strong>
                      </div>
                      <div className="bg-emerald-100 p-1.5 rounded border border-emerald-300">
                        <span className="text-[10px] font-black text-emerald-900 block font-mono">CUTI</span>
                        <strong className="text-sm font-mono font-black text-emerald-950">{currentAL}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Full Year Accumulation */}
                  {yearlyStat && (
                    <div className="p-3 bg-blue-50/60 rounded-xl border-2 border-blue-900/40 space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-blue-900 font-mono flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        Akumulasi 9 Bulan (Jan - Sep):
                      </span>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600">Total Hari Kerja:</span>
                        <span className="font-mono font-black text-slate-900">{yearlyStat.totalWorkingDays} Hari</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600">Total Hari Off:</span>
                        <span className="font-mono font-black text-amber-800">{yearlyStat.totalOffDays} Hari</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600">Total Cuti (AL):</span>
                        <span className="font-mono font-black text-emerald-800">{yearlyStat.totalLeaveDays} Hari</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: AKUMULASI TAHUNAN (JAN - SEP) */}
      {activeSubTab === 'yearly' && (
        <div className="bg-white border-2.5 border-slate-900 rounded-2xl shadow-[5px_5px_0px_0px_#0f172a] p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b-2 border-slate-900 pb-4">
            <div>
              <span className="neo-stamp bg-slate-900 text-white text-[10px] font-mono">
                REKAPITULASI TAHUN 2026
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-1">
                Komparasi Shift & Kehadiran Teknisi ({schedules.length} Bulan Terdaftar)
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                Data komparatif hari kerja, libur rutin, dan cuti tahunan teknisi installer dari bulan {schedules[0]?.monthName || 'Januari'} hingga {schedules[schedules.length - 1]?.monthName || 'Oktober'} 2026.
              </p>
            </div>
            <div className="text-right">
              <span className="neo-badge bg-emerald-100 text-emerald-900 text-xs font-bold">
                {schedules.length} Bulan Terverifikasi
              </span>
            </div>
          </div>

          {/* Detailed Multi-Month Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-white border-b-2 border-slate-900">
                  <th className="px-3 py-2.5 font-black uppercase tracking-wider text-slate-300 w-24">NIP</th>
                  <th className="px-3 py-2.5 font-black uppercase tracking-wider text-white">NAMA TEKNISI</th>
                  <th className="px-2 py-2.5 font-black uppercase tracking-wider text-slate-300 text-center">JABATAN</th>
                  {schedules.map(m => (
                    <th key={m.id} className="px-2 py-2.5 font-black uppercase tracking-wider text-center text-slate-200 border-l border-slate-800">
                      {m.monthName.slice(0, 3)}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 font-black uppercase tracking-wider text-center bg-sky-900 text-sky-200 border-l-2 border-slate-900">
                    TOTAL KERJA
                  </th>
                  <th className="px-3 py-2.5 font-black uppercase tracking-wider text-center bg-amber-900 text-amber-200 border-l border-slate-800">
                    TOTAL OFF
                  </th>
                  <th className="px-3 py-2.5 font-black uppercase tracking-wider text-center bg-emerald-900 text-emerald-200 border-l border-slate-800">
                    TOTAL AL
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {yearlyStats.map((stat, idx) => (
                  <tr key={stat.nip} className={`hover:bg-slate-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="px-3 py-3 font-mono font-bold text-slate-800">{stat.nip}</td>
                    <td className="px-3 py-3 font-black text-slate-900 whitespace-nowrap">{stat.nama}</td>
                    <td className="px-2 py-3 text-center">
                      <span className="neo-badge bg-slate-100 text-slate-800 text-[10px]">{stat.jobTitle}</span>
                    </td>
                    {schedules.map(m => {
                      const breakdown = stat.monthBreakdowns.find(b => b.monthName.toLowerCase() === m.monthName.toLowerCase());
                      return (
                        <td key={m.id} className="px-2 py-3 text-center font-mono border-l border-slate-200">
                          <span className="font-bold text-sky-900 text-[11px]">
                            {breakdown?.workingDays || 0}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal ml-0.5">
                            /{breakdown?.offDays || 0}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-center font-mono font-black text-sky-950 bg-sky-50 border-l-2 border-slate-900">
                      {stat.totalWorkingDays} Hari
                    </td>
                    <td className="px-3 py-3 text-center font-mono font-black text-amber-950 bg-amber-50 border-l border-slate-200">
                      {stat.totalOffDays} Hari
                    </td>
                    <td className="px-3 py-3 text-center font-mono font-black text-emerald-950 bg-emerald-50 border-l border-slate-200">
                      {stat.totalLeaveDays} Hari
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] font-semibold text-slate-500 font-mono">
            * Format kolom bulan: [Hari Masuk / Hari Off]
          </p>
        </div>
      )}

      {/* MODAL: DETAIL DAY INSPECTION */}
      {selectedDayDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border-3 border-slate-900 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-[8px_8px_0px_0px_#0f172a] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <span className="neo-stamp bg-blue-600 text-white text-[10px] font-mono">
                  DETAIL HARIAN
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Tanggal {selectedDayDetail.day} ({selectedDayDetail.dayName}) {currentMonth.monthName} {currentMonth.year}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="neo-btn p-1 bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Note on this day if any */}
            {currentMonth.notes?.[String(selectedDayDetail.day)] && (
              <div className="p-3 bg-purple-50 border-2 border-purple-800 rounded-xl text-xs font-bold text-purple-950 flex items-start gap-2">
                <Plane className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <span className="block uppercase font-black text-[10px] text-purple-700">Agenda / Catatan Khusus:</span>
                  {currentMonth.notes[String(selectedDayDetail.day)]}
                </div>
              </div>
            )}

            {/* Status of each technician on this day */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase text-slate-500 font-mono block">
                Status Penugasan Personel ({currentMonth.members.length} Teknisi):
              </span>
              {currentMonth.members.map((mem) => {
                const shift = (mem.shifts[String(selectedDayDetail.day)] || '').trim().toUpperCase();
                const isWorking = shift === 'M0067';
                const isOff = shift === 'O';
                const isLeave = shift === 'AL';

                return (
                  <div 
                    key={mem.nip}
                    className="p-3 rounded-xl border-2 border-slate-900 flex items-center justify-between shadow-[2px_2px_0px_0px_#0f172a] bg-slate-50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs sm:text-sm font-black text-slate-900">{mem.nama}</strong>
                        <span className="text-[10px] font-mono text-slate-500">({mem.nip})</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600">{mem.jobTitle} - Installer</span>
                    </div>
                    <div>
                      {isWorking && (
                        <span className="neo-pill bg-sky-200 text-sky-950 border-slate-900 font-black text-xs px-2.5 py-1">
                          Masuk Kerja (M0067)
                        </span>
                      )}
                      {isOff && (
                        <span className="neo-pill bg-amber-200 text-amber-950 border-slate-900 font-black text-xs px-2.5 py-1">
                          Libur (OFF)
                        </span>
                      )}
                      {isLeave && (
                        <span className="neo-pill bg-emerald-200 text-emerald-950 border-slate-900 font-black text-xs px-2.5 py-1">
                          Cuti (AL)
                        </span>
                      )}
                      {!isWorking && !isOff && !isLeave && (
                        <span className="neo-pill bg-slate-200 text-slate-800 border-slate-900 font-black text-xs px-2 py-0.5">
                          {shift || '-'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="neo-btn px-4 py-1.5 text-xs font-black bg-slate-900 text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
