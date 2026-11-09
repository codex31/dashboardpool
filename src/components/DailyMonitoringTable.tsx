import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Layers,
  ChevronRight
} from 'lucide-react';
import { DailyRecord, MonthSummary } from '../types';
import { ExportDropdown } from './ExportDropdown';
import { ExportTableData } from '../services/exportService';

interface DailyMonitoringTableProps {
  records: DailyRecord[];
  summary: MonthSummary;
  monthName: string;
  year: number;
  onSelectRecord: (record: DailyRecord) => void;
}

type FilterPreset = 'all' | 'active' | 'has-cancel' | 'has-pending' | 'full-complete' | 'open-zero';

export const DailyMonitoringTable: React.FC<DailyMonitoringTableProps> = ({
  records,
  summary,
  monthName,
  year,
  onSelectRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPreset, setFilterPreset] = useState<FilterPreset>('all');
  const [sortField, setSortField] = useState<keyof DailyRecord>('no');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter & Sort
  const safeRecords = Array.isArray(records) ? records : [];
  const filteredRecords = useMemo(() => {
    return safeRecords
      .filter((rec) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDate = rec.tanggal.toLowerCase().includes(q);
          const matchPool = rec.poolName.toLowerCase().includes(q);
          if (!matchDate && !matchPool) return false;
        }

        // Preset filter
        if (filterPreset === 'active') return rec.hasData;
        if (filterPreset === 'has-cancel') return rec.cancel > 0;
        if (filterPreset === 'has-pending') return rec.totalPending > 0;
        if (filterPreset === 'open-zero') return rec.hasData && rec.completionRate === 0;
        if (filterPreset === 'full-complete') return rec.hasData && rec.bobotFinish >= rec.bobotMasuk;

        return true;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        return sortOrder === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [records, searchQuery, filterPreset, sortField, sortOrder]);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterPreset, sortField, sortOrder, pageSize]);

  const totalPages = pageSize === 0 ? 1 : Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = useMemo(() => {
    if (pageSize === 0) return filteredRecords;
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const handleSort = (field: keyof DailyRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getExportTableData = React.useCallback((): ExportTableData => ({
    title: `MONITORING DO & CLEARANCE - ${monthName.toUpperCase()} ${year}`,
    periodName: `${monthName} ${year}`,
    poolName: 'Pool Singkawang',
    headers: [
      'No',
      'Tanggal',
      'Total Jalur',
      'Total Team',
      'Prod',
      'Bobot Masuk',
      'Bobot Finish',
      'Clearance %',
      'Pending Resch',
      'Rusong',
      'Tungkom',
      'Brg',
      'Inst',
      'Total Pending',
      'Open',
      'Lanjut Install',
      'Cancel',
      'LKPB',
      'Target',
      'Realisasi',
      'Achv',
      'Status',
    ],
    rows: filteredRecords.map((r) => [
      r.no,
      r.tanggal,
      r.totalJalur,
      r.totalTeam,
      r.prod,
      r.bobotMasuk,
      r.bobotFinish,
      `${r.completionRate}%`,
      r.pendingResch,
      r.rusong,
      r.tungkom,
      r.brg,
      r.inst,
      r.totalPending,
      r.open,
      r.lanjutInstall,
      r.cancel,
      r.lkpb,
      r.target,
      r.realisasi,
      r.achv || `${r.achievementRate}%`,
      !r.hasData
        ? 'Kosong'
        : r.cancel > 0
        ? 'Ada Cancel'
        : r.totalPending > 0
        ? 'Pending'
        : r.completionRate === 0
        ? 'OPEN'
        : 'Clear',
    ]),
    summaryCards: [
      { label: 'Total Jalur', value: summary.totalJalur, note: `${summary.totalTeam} Team Aktif` },
      { label: 'Bobot Clearance', value: `${summary.totalBobotFinish} / ${summary.totalBobotMasuk}`, note: `${summary.overallCompletionRate}% Selesai` },
      { label: 'Pending / Cancel', value: `${summary.totalPending} / ${summary.totalCancel}`, note: 'Akumulasi' },
      { label: 'Realisasi Target', value: `${summary.totalRealisasi} / ${summary.totalTarget}`, note: `${(summary.overallAchievementRate ?? summary.overallAchvRate ?? 0).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}% Tercapai` },
    ],
  }), [monthName, year, filteredRecords, summary]);

  return (
    <div className="neo-card p-3.5 sm:p-5">
      {/* Table Top Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3.5 border-b-2 border-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="neo-stamp bg-blue-600 text-white text-[10px] uppercase font-mono">
              TABEL HARIAN
            </span>
            <h2 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
              MONITORING DO & CLEARANCE - {monthName.toUpperCase()} {year}
            </h2>
          </div>
          <p className="text-[11px] text-slate-600 font-bold mt-0.5">
            Klik baris tanggal untuk melihat audit rincian kendala Pending & LKPB.
          </p>
        </div>

        {/* Filter Pills, Search & Multi-format Export */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-900 absolute left-2.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
            <input
              id="input-search-monitoring-table"
              type="text"
              placeholder="Cari tgl..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="neo-input text-xs pl-8 pr-2.5 py-1 w-full sm:w-36 focus:w-48"
            />
          </div>

          {/* Quick Filter Presets */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'all', label: 'Semua' },
                { id: 'active', label: 'Aktif' },
                { id: 'open-zero', label: 'OPEN (0%)' },
                { id: 'has-pending', label: 'Pending' },
                { id: 'has-cancel', label: 'Cancel' },
                { id: 'full-complete', label: '100% Finish' },
              ] as { id: FilterPreset; label: string }[]
            ).map((preset) => (
              <button
                key={preset.id}
                onClick={() => setFilterPreset(preset.id)}
                className={`neo-btn text-[11px] px-2 py-0.5 ${
                  filterPreset === preset.id
                    ? 'neo-btn-primary'
                    : 'neo-btn-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Multi-Format Export Dropdown (XLSX, ODS, PDF, PPT, ODP) */}
          <ExportDropdown
            getData={getExportTableData}
            defaultFilename={`Monitoring_DO_Singkawang_${monthName}_${year}`}
            reportTitle={`Monitoring DO & Clearance - ${monthName} ${year}`}
            className="ml-auto"
          />
        </div>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="mt-3 overflow-x-auto -mx-3.5 sm:-mx-5 px-3.5 sm:px-5">
        <table className="w-full text-left text-xs border-collapse min-w-[960px]">
          <thead>
            <tr className="border-b-2 border-slate-900 text-slate-900 font-black uppercase text-[10px] tracking-wider bg-blue-50">
              <th className="py-2 px-2.5 w-10 text-center border-r border-slate-900/10">No</th>
              <th 
                className="py-2 px-2.5 cursor-pointer hover:bg-blue-100 border-r border-slate-900/10"
                onClick={() => handleSort('tanggal')}
              >
                <div className="flex items-center gap-1">
                  <span>Tanggal</span>
                  <ArrowUpDown className="w-3 h-3 stroke-[2.5]" />
                </div>
              </th>
              <th 
                className="py-2 px-2.5 text-right cursor-pointer hover:bg-blue-100 border-r border-slate-900/10"
                onClick={() => handleSort('totalJalur')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Jalur</span>
                  <ArrowUpDown className="w-3 h-3 stroke-[2.5]" />
                </div>
              </th>
              <th className="py-2 px-2.5 text-right border-r border-slate-900/10">Team</th>
              <th className="py-2 px-2.5 text-right border-r border-slate-900/10">Prod</th>
              <th 
                className="py-2 px-2.5 text-right cursor-pointer hover:bg-blue-100 border-r border-slate-900/10"
                onClick={() => handleSort('bobotMasuk')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Masuk</span>
                  <ArrowUpDown className="w-3 h-3 stroke-[2.5]" />
                </div>
              </th>
              <th 
                className="py-2 px-2.5 text-right cursor-pointer hover:bg-blue-100 border-r border-slate-900/10"
                onClick={() => handleSort('bobotFinish')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Finish</span>
                  <ArrowUpDown className="w-3 h-3 stroke-[2.5]" />
                </div>
              </th>
              <th className="py-2 px-2.5 text-center border-r border-slate-900/10">Clearance %</th>
              <th 
                className="py-2 px-2.5 text-right cursor-pointer hover:bg-blue-100 border-r border-slate-900/10"
                onClick={() => handleSort('totalPending')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Pending</span>
                  <ArrowUpDown className="w-3 h-3 stroke-[2.5]" />
                </div>
              </th>
              <th 
                className="py-2 px-2.5 text-right cursor-pointer hover:bg-rose-100 border-r border-slate-900/10"
                onClick={() => handleSort('cancel')}
              >
                <div className="flex items-center justify-end gap-1 text-rose-700">
                  <span>Cancel</span>
                  <ArrowUpDown className="w-3 h-3 stroke-[2.5]" />
                </div>
              </th>
              <th className="py-2 px-2.5 text-right border-r border-slate-900/10">LKPB</th>
              <th className="py-2 px-2.5 text-right border-r border-slate-900/10" title="Target: Total DO (Status Open)">Target</th>
              <th className="py-2 px-2.5 text-right font-black text-slate-900 border-r border-slate-900/10" title="Realisasi: Finish dikurangi Pending, LKPB & Cancel">Real.</th>
              <th className="py-2 px-2.5 text-center border-r border-slate-900/10">Status</th>
              <th className="py-2 px-2 text-center w-9">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-6 text-center text-slate-500 font-bold text-xs">
                  Tidak ada data yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((rec) => {
                const isCleared = rec.hasData && rec.bobotFinish >= rec.bobotMasuk && rec.bobotMasuk > 0;
                const isPartiallyCleared = rec.hasData && rec.bobotFinish > 0 && rec.bobotFinish < rec.bobotMasuk;
                const hasPending = rec.totalPending > 0;
                const hasCancel = rec.cancel > 0;

                return (
                  <tr
                    key={rec.no}
                    id={`table-row-date-${rec.dayNumber}`}
                    onClick={() => onSelectRecord(rec)}
                    className={`hover:bg-blue-100/60 transition-colors cursor-pointer group ${
                      !rec.hasData ? 'opacity-35 hover:opacity-100' : ''
                    }`}
                  >
                    <td className="py-1.5 px-2.5 text-center font-bold text-slate-500 border-r border-slate-100">
                      {rec.no}
                    </td>
                    <td className="py-1.5 px-2.5 font-extrabold text-slate-900 border-r border-slate-100">
                      <span>{rec.tanggal}</span>
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-black text-slate-800 border-r border-slate-100">
                      {rec.totalJalur > 0 ? rec.totalJalur : '-'}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-bold text-slate-700 border-r border-slate-100">
                      {rec.totalTeam > 0 ? rec.totalTeam : '-'}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-bold text-slate-700 border-r border-slate-100">
                      {rec.prod > 0 ? rec.prod : '-'}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-bold text-slate-700 border-r border-slate-100">
                      {rec.bobotMasuk > 0 ? rec.bobotMasuk : '-'}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-black text-slate-900 border-r border-slate-100">
                      {rec.bobotFinish > 0 ? rec.bobotFinish : '-'}
                    </td>
                    <td className="py-1.5 px-2.5 text-center border-r border-slate-100">
                      {rec.hasData ? (
                        <span
                          className={`neo-pill ${
                            isCleared
                              ? 'bg-emerald-200 text-emerald-950 border-slate-900'
                              : isPartiallyCleared
                              ? 'bg-amber-200 text-amber-950 border-slate-900'
                              : 'bg-slate-100 text-slate-700 border-slate-900'
                          }`}
                        >
                          {rec.completionRate}%
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-1.5 px-2.5 text-right border-r border-slate-100">
                      {rec.totalPending > 0 ? (
                        <span className="neo-pill bg-amber-200 text-amber-950 border-slate-900">
                          {rec.totalPending}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold">-</span>
                      )}
                    </td>
                    <td className="py-1.5 px-2.5 text-right border-r border-slate-100">
                      {rec.cancel > 0 ? (
                        <span className="neo-pill bg-rose-200 text-rose-950 border-slate-900">
                          {rec.cancel}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold">-</span>
                      )}
                    </td>
                    <td className="py-1.5 px-2.5 text-right text-blue-800 font-black border-r border-slate-100">
                      {rec.lkpb > 0 ? rec.lkpb : '-'}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-bold text-slate-600 border-r border-slate-100" title="Target: Total DO (Open)">
                      {rec.target > 0 ? rec.target : '-'}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-black text-emerald-700 border-r border-slate-100" title={`Realisasi: ${rec.realisasi} dari ${rec.target} DO (${rec.achv})`}>
                      {rec.target > 0 ? rec.realisasi : '-'}
                    </td>
                    <td className="py-1.5 px-2.5 text-center border-r border-slate-100">
                      {!rec.hasData ? (
                        <span className="text-[9px] font-black uppercase text-slate-400">Kosong</span>
                      ) : hasCancel ? (
                        <span className="neo-pill bg-rose-300 text-rose-950 border-slate-900">
                          Ada Cancel
                        </span>
                      ) : hasPending ? (
                        <span className="neo-pill bg-amber-200 text-amber-950 border-slate-900">
                          Pending
                        </span>
                      ) : rec.completionRate === 0 ? (
                        <span className="neo-pill bg-blue-100 text-blue-950 border-slate-900 font-black">
                          OPEN
                        </span>
                      ) : (
                        <span className="neo-pill bg-emerald-200 text-emerald-950 border-slate-900">
                          Clear
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 px-2 text-center text-slate-400 group-hover:text-slate-900">
                      <ChevronRight className="w-3.5 h-3.5 mx-auto stroke-[2.5]" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Summary Footer */}
          <tfoot>
            <tr className="border-t-2.5 border-slate-900 bg-blue-100 font-black text-slate-900 text-xs">
              <td colSpan={2} className="py-2.5 px-2.5 uppercase tracking-wider font-['Space_Grotesk',sans-serif] border-r border-slate-900/20">
                TOTAL {monthName.toUpperCase()}
              </td>
              <td className="py-2.5 px-2.5 text-right text-slate-900 border-r border-slate-900/20">{summary.totalJalur}</td>
              <td className="py-2.5 px-2.5 text-right text-slate-900 border-r border-slate-900/20">{summary.totalTeam}</td>
              <td className="py-2.5 px-2.5 text-right text-slate-900 border-r border-slate-900/20">{summary.avgProd}</td>
              <td className="py-2.5 px-2.5 text-right text-slate-900 border-r border-slate-900/20">{summary.totalBobotMasuk}</td>
              <td className="py-2.5 px-2.5 text-right text-slate-900 font-black border-r border-slate-900/20">{summary.totalBobotFinish}</td>
              <td className="py-2.5 px-2.5 text-center border-r border-slate-900/20">
                <span className="neo-pill bg-blue-600 text-white border-slate-900">
                  {summary.overallCompletionRate}%
                </span>
              </td>
              <td className="py-2.5 px-2.5 text-right text-amber-800 border-r border-slate-900/20">{summary.totalPending}</td>
              <td className="py-2.5 px-2.5 text-right text-rose-700 border-r border-slate-900/20">{summary.totalCancel}</td>
              <td className="py-2.5 px-2.5 text-right text-blue-900 border-r border-slate-900/20">{summary.totalLkpb}</td>
              <td className="py-2.5 px-2.5 text-right text-slate-800 border-r border-slate-900/20">{summary.totalTarget}</td>
              <td className="py-2.5 px-2.5 text-right text-emerald-800 font-black border-r border-slate-900/20">{summary.totalRealisasi}</td>
              <td className="py-2.5 px-2.5 text-center text-xs font-black border-r border-slate-900/20">
                <span className="neo-pill bg-emerald-200 text-emerald-950 border-slate-900 font-mono">
                  {(summary.overallAchievementRate ?? summary.overallAchvRate ?? 0).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}% ACHV
                </span>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="mt-3 pt-2.5 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-600">
            Menampilkan <strong className="text-slate-900">{paginatedRecords.length}</strong> dari{' '}
            <strong className="text-slate-900">{filteredRecords.length}</strong> tanggal
          </span>
          <div className="flex items-center gap-1 ml-1 sm:ml-3">
            <span className="text-slate-500 font-bold">Tampilkan:</span>
            {[10, 20, 30, 0].map((sz) => (
              <button
                key={sz}
                onClick={() => setPageSize(sz)}
                className={`px-2 py-0.5 rounded font-black border border-slate-900 transition-all ${
                  pageSize === sz
                    ? 'bg-blue-600 text-white shadow-[1px_1px_0px_0px_#0f172a]'
                    : 'bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                {sz === 0 ? 'Semua' : sz}
              </button>
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded bg-white border border-slate-900 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 shadow-[1px_1px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5"
            >
              &larr; Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded font-black border border-slate-900 text-xs transition-all ${
                  currentPage === pg
                    ? 'bg-blue-600 text-white shadow-[1.5px_1.5px_0px_0px_#0f172a]'
                    : 'bg-white hover:bg-slate-100 text-slate-700 shadow-[1px_1px_0px_0px_#0f172a]'
                }`}
              >
                {pg}
              </button>
            ))}
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded bg-white border border-slate-900 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 shadow-[1px_1px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5"
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
