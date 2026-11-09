import React, { useState } from 'react';
import { 
  Clock, 
  Home, 
  MessageSquare, 
  Package, 
  Wrench, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  TrendingDown,
  Calendar,
  ListFilter,
  BarChart2,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import { DailyRecord, MonthSummary, DetailPendingItem, UnlistedPendingDo } from '../types';
import { DetailPendingTable } from './DetailPendingTable';
import { AlertTriangle } from 'lucide-react';
import { ExportDropdown } from './ExportDropdown';
import { ExportTableData } from '../services/exportService';

interface PendingMonitoringViewProps {
  records: DailyRecord[];
  summary: MonthSummary;
  monthName: string;
  year: number;
  detailPending?: DetailPendingItem[];
  unlistedPendingDos?: UnlistedPendingDo[];
  onOpenAuditModal?: () => void;
  onSelectRecord: (record: DailyRecord) => void;
}

export const PendingMonitoringView: React.FC<PendingMonitoringViewProps> = ({
  records,
  summary,
  monthName,
  year,
  detailPending = [],
  unlistedPendingDos = [],
  onOpenAuditModal,
  onSelectRecord,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'detail' | 'rekap'>('detail');

  // Aggregate pending categories across all days
  const pendingTotals = React.useMemo(() => {
    let resch = 0;
    let rusong = 0;
    let tungkom = 0;
    let brg = 0;
    let inst = 0;
    let open = 0;
    let lanjutInstall = 0;

    records.forEach((r) => {
      resch += r.pendingResch;
      rusong += r.rusong;
      tungkom += r.tungkom;
      brg += r.brg;
      inst += r.inst;
      open += r.open;
      lanjutInstall += r.lanjutInstall;
    });

    const total = resch + rusong + tungkom + brg + inst;

    return {
      resch,
      rusong,
      tungkom,
      brg,
      inst,
      total,
      open,
      lanjutInstall,
    };
  }, [records]);

  // Distribution chart data
  const categoryChartData = React.useMemo(() => [
    { name: 'Reschedule', count: pendingTotals.resch, color: '#3b82f6' },
    { name: 'Rumah Kosong', count: pendingTotals.rusong, color: '#f59e0b' },
    { name: 'Tunggu Komp', count: pendingTotals.tungkom, color: '#8b5cf6' },
    { name: 'Kendala Barang', count: pendingTotals.brg, color: '#ec4899' },
    { name: 'Kendala Instalasi', count: pendingTotals.inst, color: '#ef4444' },
  ], [pendingTotals]);

  // Daily timeline of pending
  const dailyPendingData = React.useMemo(() => {
    return records
      .filter((r) => r.hasData)
      .map((r) => ({
        tanggal: r.tanggal.split(' ')[0], // e.g. "01"
        fullDate: r.tanggal,
        totalPending: r.totalPending,
        open: r.open,
        lanjutInstall: r.lanjutInstall,
        raw: r,
      }));
  }, [records]);

  // Export provider for Rekap Harian
  const getRekapExportData = React.useCallback((): ExportTableData => ({
    title: `REKAP HARIAN KENDALA PENDING - ${monthName.toUpperCase()} ${year}`,
    periodName: `${monthName} ${year}`,
    poolName: 'Pool Singkawang',
    headers: [
      'Tanggal',
      'Pending Reschedule',
      'Rumah Kosong',
      'Tunggu Komponen',
      'Kendala Barang',
      'Kendala Instalasi',
      'Total Pending',
      'Open',
      'Lanjut Install',
    ],
    rows: records
      .filter((r) => r.hasData)
      .map((r) => [
        r.tanggal,
        r.pendingResch,
        r.rusong,
        r.tungkom,
        r.brg,
        r.inst,
        r.totalPending,
        r.open,
        r.lanjutInstall,
      ]),
    summaryCards: [
      { label: 'Total Pending', value: pendingTotals.total, note: 'Akumulasi Kasus' },
      { label: 'Reschedule', value: pendingTotals.resch, note: 'Jalur Mundur' },
      { label: 'Rumah Kosong', value: pendingTotals.rusong, note: 'Customer Tdk Di Tempat' },
      { label: 'Tunggu Komponen', value: pendingTotals.tungkom, note: 'Material / Sparepart' },
    ],
  }), [monthName, year, records, pendingTotals]);

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Switcher between Detail List & Daily Rekap */}
      <div className="neo-card p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
        <div className="flex items-center gap-2">
          <button
            id="subtab-pending-detail"
            onClick={() => setActiveSubTab('detail')}
            className={`neo-btn text-xs sm:text-sm px-4 py-2 gap-2 ${
              activeSubTab === 'detail'
                ? 'neo-btn-primary'
                : 'neo-btn-white'
            }`}
          >
            <ListFilter className="w-4 h-4 stroke-[2.5]" />
            <span>Detail Order Pending ({detailPending.length} Kasus)</span>
            <span className={`neo-pill text-[10px] px-1.5 py-0 ${
              activeSubTab === 'detail' ? 'bg-white text-slate-900 border-slate-900' : 'bg-blue-100 text-blue-900 border-slate-900'
            }`}>
              LIVE SHEET
            </span>
          </button>

          <button
            id="subtab-pending-rekap"
            onClick={() => setActiveSubTab('rekap')}
            className={`neo-btn text-xs sm:text-sm px-4 py-2 gap-2 ${
              activeSubTab === 'rekap'
                ? 'neo-btn-primary'
                : 'neo-btn-white'
            }`}
          >
            <BarChart2 className="w-4 h-4 stroke-[2.5]" />
            <span>Rekap Harian & Trend Kendala</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {unlistedPendingDos.length > 0 && onOpenAuditModal && (
            <button
              onClick={onOpenAuditModal}
              className="neo-btn bg-amber-300 hover:bg-amber-400 text-slate-950 border-slate-900 text-xs font-black gap-1.5 px-3 py-1.5 shadow-[2px_2px_0px_0px_#0f172a] animate-pulse"
              title="Klik untuk membuka daftar DO sheet tanggal yang belum dicatat di Detail Pending"
            >
              <AlertTriangle className="w-4 h-4 text-rose-700 stroke-[3]" />
              <span>{unlistedPendingDos.length} DO Perlu Dimasukkan ke Detail Pending</span>
            </button>
          )}

          {activeSubTab === 'rekap' && (
            <ExportDropdown
              getData={getRekapExportData}
              defaultFilename={`Rekap_Pending_Pool_Singkawang_${monthName}_${year}`}
              reportTitle={`Rekap Harian Pending - ${monthName} ${year}`}
            />
          )}

          <div className="text-xs font-black text-slate-700 px-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900"></span>
            <span>Tab &ldquo;Detail Pendingan&rdquo; terintegrasi</span>
          </div>
        </div>
      </div>

      {/* Render selected view */}
      {activeSubTab === 'detail' ? (
        <DetailPendingTable
          items={detailPending}
          monthName={monthName}
          year={year}
        />
      ) : (
        <>
          {/* Category Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="neo-card p-4 transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-blue-800 mb-2">
                <span className="text-[10px] font-black uppercase font-mono">Reschedule</span>
                <Clock className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-['Space_Grotesk',sans-serif]">{pendingTotals.resch}</div>
              <span className="text-[11px] font-bold text-slate-500">Jadwal Ulang</span>
            </div>

            <div className="neo-card p-4 transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-amber-700 mb-2">
                <span className="text-[10px] font-black uppercase font-mono">Rumah Kosong</span>
                <Home className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-['Space_Grotesk',sans-serif]">{pendingTotals.rusong}</div>
              <span className="text-[11px] font-bold text-slate-500">Pelanggan Tdk Ada</span>
            </div>

            <div className="neo-card p-4 transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-purple-700 mb-2">
                <span className="text-[10px] font-black uppercase font-mono">Tunggu Konf.</span>
                <MessageSquare className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-['Space_Grotesk',sans-serif]">{pendingTotals.tungkom}</div>
              <span className="text-[11px] font-bold text-slate-500">Konfirmasi Belum</span>
            </div>

            <div className="neo-card p-4 transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-pink-700 mb-2">
                <span className="text-[10px] font-black uppercase font-mono">Kendala Barang</span>
                <Package className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-['Space_Grotesk',sans-serif]">{pendingTotals.brg}</div>
              <span className="text-[11px] font-bold text-slate-500">Kurang / Belum Ada</span>
            </div>

            <div className="neo-card p-4 transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-rose-700 mb-2">
                <span className="text-[10px] font-black uppercase font-mono">Kendala Install</span>
                <Wrench className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-['Space_Grotesk',sans-serif]">{pendingTotals.inst}</div>
              <span className="text-[11px] font-bold text-slate-500">Kemalaman / Jam</span>
            </div>

            <div className="neo-card p-4 bg-blue-100 transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-blue-900 mb-2">
                <span className="text-[10px] font-black uppercase font-mono">Total Pending</span>
                <AlertCircle className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="text-3xl font-black text-blue-950 font-['Space_Grotesk',sans-serif]">{summary.totalPending}</div>
              <span className="text-[11px] font-bold text-blue-800">Akumulasi Bulan</span>
            </div>
          </div>

          {/* Analytics Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Pending Trend Chart */}
            <div className="lg:col-span-8 neo-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2 font-['Space_Grotesk',sans-serif]">
                    <span className="neo-stamp bg-amber-300 text-slate-900 text-[10px]">TREN</span>
                    TREN PENDING DO PER TANGGAL ({monthName.toUpperCase()} {year})
                  </h3>
                  <p className="text-xs font-bold text-slate-600">Pergerakan total pending harian Pool Singkawang</p>
                </div>
                <span className="neo-pill bg-amber-200 text-amber-950 border-slate-900 font-black">
                  TOTAL {summary.totalPending} PENDING
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyPendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="tanggal" stroke="#0f172a" fontSize={11} fontWeight={700} />
                    <YAxis stroke="#0f172a" fontSize={11} allowDecimals={false} fontWeight={700} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="neo-card p-3 rounded-lg text-xs bg-white">
                              <div className="font-black text-slate-900">{data.fullDate}</div>
                              <div className="text-amber-700 font-extrabold mt-1">
                                Total Pending: {data.totalPending}
                              </div>
                              <div className="text-slate-600 font-bold">Open: {data.open}</div>
                              <div className="text-slate-600 font-bold">Lanjut Install: {data.lanjutInstall}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="totalPending" radius={[4, 4, 0, 0]}>
                      {dailyPendingData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.totalPending > 0 ? '#f59e0b' : '#cbd5e1'} 
                          stroke="#0f172a"
                          strokeWidth={2}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Category Distribution */}
            <div className="lg:col-span-4 neo-card p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-1 font-['Space_Grotesk',sans-serif]">
                  <span className="neo-stamp bg-blue-600 text-white text-[10px]">PROPORSI</span>
                  PROPORSI JENIS KENDALA
                </h3>
                <p className="text-xs font-bold text-slate-600 mb-4">Breakdown alasan pending order</p>
              </div>

              <div className="space-y-3 my-auto">
                {categoryChartData.map((cat) => {
                  const pct = pendingTotals.total > 0 ? Math.round((cat.count / pendingTotals.total) * 100) : 0;
                  return (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-black">
                        <span className="text-slate-800 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full border border-slate-900" style={{ backgroundColor: cat.color }}></span>
                          {cat.name}
                        </span>
                        <span className="text-slate-900">
                          {cat.count} <span className="text-slate-500 font-bold">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 border-2 border-slate-900 rounded-md h-2.5 overflow-hidden shadow-[1px_1px_0px_0px_#0f172a]">
                        <div
                          className="h-full border-r border-slate-900 transition-all duration-300"
                          style={{ width: `${pct}%`, backgroundColor: cat.color }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t-2 border-slate-900/20 text-xs text-slate-700 flex items-center justify-between font-bold">
                <span>Status Penanganan:</span>
                <span className="neo-pill bg-emerald-200 text-emerald-950 border-slate-900">
                  Monitoring Aktif
                </span>
              </div>
            </div>
          </div>

          {/* Pending Log Table */}
          <div className="neo-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="neo-stamp bg-blue-600 text-white text-[10px]">LOG</span>
              <h3 className="text-base font-black text-slate-900 font-['Space_Grotesk',sans-serif]">
                DAFTAR TANGGAL DENGAN CATATAN PENDING ({records.filter(r => r.hasData).length} HARI AKTIF)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[780px]">
                <thead>
                  <tr className="border-b-2.5 border-slate-900 text-slate-900 font-black uppercase text-[11px] bg-blue-50">
                    <th className="py-2.5 px-3 border-r border-slate-900/10">Tanggal</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-900/10">Total Pending</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-900/10">Reschedule</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-900/10">Rusong</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-900/10">Tungkom</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-900/10">Kendala Brg</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-900/10">Kendala Inst</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-900/10">Open</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-900/10">Lanjut Install</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-200">
                  {records
                    .filter((r) => r.hasData)
                    .map((r) => (
                      <tr
                        key={r.no}
                        onClick={() => onSelectRecord(r)}
                        className="hover:bg-amber-50 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-3 font-extrabold text-slate-900 border-r border-slate-100">{r.tanggal}</td>
                        <td className="py-2.5 px-3 text-right border-r border-slate-100">
                          {r.totalPending > 0 ? (
                            <span className="neo-pill bg-amber-200 text-amber-950 border-slate-900">
                              {r.totalPending}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-bold">0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-700 border-r border-slate-100">{r.pendingResch || '-'}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-700 border-r border-slate-100">{r.rusong || '-'}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-700 border-r border-slate-100">{r.tungkom || '-'}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-700 border-r border-slate-100">{r.brg || '-'}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-700 border-r border-slate-100">{r.inst || '-'}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-700 border-r border-slate-100">{r.open || '-'}</td>
                        <td className="py-2.5 px-3 text-right font-black text-blue-700 border-r border-slate-100">{r.lanjutInstall || '-'}</td>
                        <td className="py-2.5 px-3 text-center">
                          {r.totalPending === 0 ? (
                            <span className="neo-pill bg-emerald-200 text-emerald-950 border-slate-900">
                              Nihil Pending
                            </span>
                          ) : (
                            <span className="neo-pill bg-amber-200 text-amber-950 border-slate-900">
                              Perlu Tindak Lanjut
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
