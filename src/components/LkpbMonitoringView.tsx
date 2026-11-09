import React, { useState } from 'react';
import { 
  FileCheck2, 
  XCircle, 
  PlayCircle, 
  FolderOpen, 
  Calendar, 
  TrendingDown, 
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ListFilter,
  BarChart2,
  Eye,
  Clock,
  ArrowUpRight,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { DailyRecord, MonthSummary, DetailLkpbItem, CancelledDoItem } from '../types';
import { DEFAULT_SEPTEMBER_CANCELED_DOS, DEFAULT_OCTOBER_CANCELED_DOS, getCanceledDosForDate } from '../data/defaultCanceledDos';
import { DetailLkpbTable } from './DetailLkpbTable';
import { ExportDropdown } from './ExportDropdown';
import { ExportTableData } from '../services/exportService';

interface LkpbMonitoringViewProps {
  records: DailyRecord[];
  summary: MonthSummary;
  monthName: string;
  year: number;
  detailLkpb?: DetailLkpbItem[];
  canceledDos?: CancelledDoItem[];
  onSelectRecord: (record: DailyRecord) => void;
}

export const LkpbMonitoringView: React.FC<LkpbMonitoringViewProps> = ({
  records,
  summary,
  monthName,
  year,
  detailLkpb = [],
  canceledDos = [],
  onSelectRecord,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'detail' | 'rekap'>('detail');

  // Unified list of all canceled DOs (from prop or default October/September)
  const allCanceledDos = React.useMemo(() => {
    if (canceledDos && canceledDos.length > 0) return canceledDos;
    const lower = (monthName || '').toLowerCase();
    if (lower.includes('okt') || lower.includes('oct')) return DEFAULT_OCTOBER_CANCELED_DOS;
    if (lower.includes('sep')) return DEFAULT_SEPTEMBER_CANCELED_DOS;
    return canceledDos || [];
  }, [canceledDos, monthName]);

  // Requirement: "DO cancel terbaru" menampilkan latest DO yang cancel dari yang terbaru sampai terlama, 5 data aja
  const latestFiveCanceledDos = React.useMemo(() => {
    return [...allCanceledDos]
      .sort((a, b) => b.dayNumber - a.dayNumber)
      .slice(0, 5);
  }, [allCanceledDos]);

  // Handler to open date detail for a clicked date string
  const handleOpenDateDetail = (dateStr: string) => {
    const found = records.find(
      (r) => r.tanggal.toLowerCase().trim() === dateStr.toLowerCase().trim()
    ) || records.find((r) => {
      const match = dateStr.match(/^0?(\d+)/);
      return match ? r.no === parseInt(match[1], 10) : false;
    });

    if (found) {
      onSelectRecord(found);
    }
  };

  // Compute LKPB & Cancel stats
  const lkpbStats = React.useMemo(() => {
    let daysWithCancel = 0;
    let maxCancelDay = { date: '-', count: 0 };
    let daysWithLkpb = 0;

    records.forEach((r) => {
      if (r.cancel > 0) {
        daysWithCancel++;
        if (r.cancel > maxCancelDay.count) {
          maxCancelDay = { date: r.tanggal, count: r.cancel };
        }
      }
      if (r.lkpb > 0) {
        daysWithLkpb++;
      }
    });

    const cancelRatio = summary.totalJalur > 0 
      ? Math.round((summary.totalCancel / summary.totalJalur) * 1000) / 10 
      : 0;

    return {
      daysWithCancel,
      maxCancelDay,
      daysWithLkpb,
      cancelRatio,
    };
  }, [records, summary]);

  const cancelChartData = React.useMemo(() => {
    return records
      .filter((r) => r.hasData)
      .map((r) => ({
        day: r.tanggal.split(' ')[0],
        fullDate: r.tanggal,
        cancel: r.cancel,
        lkpb: r.lkpb,
        jalur: r.totalJalur,
      }));
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Switcher between Detail LKPB & Rekap */}
      <div className="neo-card p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
        <div className="flex items-center gap-2">
          <button
            id="subtab-lkpb-detail"
            onClick={() => setActiveSubTab('detail')}
            className={`neo-btn text-xs sm:text-sm px-4 py-2 gap-2 ${
              activeSubTab === 'detail'
                ? 'neo-btn-primary'
                : 'neo-btn-white'
            }`}
          >
            <ListFilter className="w-4 h-4 stroke-[2.5]" />
            <span>Detail Kasus LKPB ({detailLkpb.length} DO)</span>
            <span className={`neo-pill text-[10px] px-1.5 py-0 ${
              activeSubTab === 'detail' ? 'bg-white text-slate-900 border-slate-900' : 'bg-blue-100 text-blue-900 border-slate-900'
            }`}>
              LIVE SHEET
            </span>
          </button>

          <button
            id="subtab-lkpb-rekap"
            onClick={() => setActiveSubTab('rekap')}
            className={`neo-btn text-xs sm:text-sm px-4 py-2 gap-2 ${
              activeSubTab === 'rekap'
                ? 'neo-btn-primary'
                : 'neo-btn-white'
            }`}
          >
            <BarChart2 className="w-4 h-4 stroke-[2.5]" />
            <span>Rekap Harian & Trend LKPB/Cancel</span>
          </button>
        </div>

        <div className="text-xs font-black text-slate-700 px-2 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900"></span>
          <span>Tab &ldquo;Detail LKPB&rdquo; terintegrasi langsung</span>
        </div>
      </div>

      {/* Render selected view */}
      {activeSubTab === 'detail' ? (
        <DetailLkpbTable
          items={detailLkpb}
          monthName={monthName}
          year={year}
        />
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total LKPB */}
            <div className="neo-card p-4 sm:p-5 transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 font-mono">TOTAL LKPB TERBIT</span>
                  <div className="text-4xl font-black text-slate-900 mt-1 font-['Space_Grotesk',sans-serif]">{summary.totalLkpb}</div>
                </div>
                <div className="w-11 h-11 rounded-md bg-blue-100 text-blue-900 border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]">
                  <FileCheck2 className="w-6 h-6 stroke-[2.5]" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t-2 border-slate-900/15 text-xs text-slate-600 font-bold">
                Terbit pada <strong className="text-slate-900">{lkpbStats.daysWithLkpb}</strong> hari kerja
              </div>
            </div>

            {/* Total Cancel */}
            <div className="neo-card p-4 sm:p-5 bg-rose-50 transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 font-mono">TOTAL CANCEL ORDER</span>
                  <div className="text-4xl font-black text-rose-600 mt-1 font-['Space_Grotesk',sans-serif]">{summary.totalCancel}</div>
                </div>
                <div className="w-11 h-11 rounded-md bg-rose-200 text-rose-900 border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]">
                  <XCircle className="w-6 h-6 stroke-[2.5]" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t-2 border-slate-900/15 text-xs text-slate-700 font-bold flex justify-between">
                <span>Rasio Cancel:</span>
                <span className="neo-pill bg-rose-200 text-rose-950 border-slate-900 font-black">{lkpbStats.cancelRatio}% JALUR</span>
              </div>
            </div>

            {/* Hari Cancel Tertinggi */}
            <div className="neo-card p-4 sm:p-5 bg-amber-50 transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 font-mono">CANCEL TERTINGGI</span>
                  <div className="text-2xl font-black text-slate-900 mt-1 font-['Space_Grotesk',sans-serif]">{lkpbStats.maxCancelDay.date}</div>
                </div>
                <div className="w-11 h-11 rounded-md bg-amber-200 text-amber-900 border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]">
                  <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t-2 border-slate-900/15 text-xs text-slate-700 font-bold">
                Sebanyak <strong className="text-slate-900 font-black">{lkpbStats.maxCancelDay.count} order</strong> dibatalkan
              </div>
            </div>

            {/* Realisasi Instalasi vs Target */}
            <div className="neo-card p-4 sm:p-5 bg-emerald-50 transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 font-mono">PENYELESAIAN DO</span>
                  <div className="text-4xl font-black text-emerald-800 mt-1 font-['Space_Grotesk',sans-serif]">
                    {(summary.overallAchvRate || 0).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%
                  </div>
                </div>
                <div className="w-11 h-11 rounded-md bg-emerald-200 text-emerald-900 border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t-2 border-slate-900/15 text-xs text-slate-700 font-bold">
                {summary.totalRealisasi} Selesai dari {summary.totalTarget} Target
              </div>
            </div>
          </div>

          {/* DO Cancel Terbaru (5 data terakhir dari terbaru sampai terlama) */}
          <div className="neo-card p-5 bg-white border-2 border-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3.5 mb-4 border-b-2.5 border-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-rose-600 text-white border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]">
                  <XCircle className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="neo-stamp bg-rose-600 text-white text-[10px]">TERBARU</span>
                    <h3 className="text-base font-black text-slate-900 uppercase font-['Space_Grotesk',sans-serif]">
                      DO CANCEL TERBARU (5 DATA TERAKHIR)
                    </h3>
                  </div>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">
                    Menampilkan 5 order pembatalan DO paling baru hingga terlama
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="neo-pill bg-rose-200 text-rose-950 border-slate-900 text-xs font-black">
                  5 DATA TERAKHIR
                </span>
                <span className="neo-pill bg-slate-100 text-slate-800 border-slate-900 text-xs font-bold">
                  Total Bulan: {summary.totalCancel} Cancel
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-rose-50 text-slate-900 border-b-2.5 border-slate-900 font-black uppercase text-[11px]">
                    <th className="py-2.5 px-3 border-r border-slate-900/10">Tanggal</th>
                    <th className="py-2.5 px-3 border-r border-slate-900/10">No. DO</th>
                    <th className="py-2.5 px-3 border-r border-slate-900/10">Nama Team yang Jalur</th>
                    <th className="py-2.5 px-3 border-r border-slate-900/10">Kategori</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-900/10">Bobot</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-900/10">Status</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-200">
                  {latestFiveCanceledDos.map((item, idx) => (
                    <tr 
                      key={item.id || idx}
                      onClick={() => handleOpenDateDetail(item.tanggal)}
                      className="hover:bg-rose-50/70 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3 font-extrabold text-slate-900 border-r border-slate-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{item.tanggal}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-black text-rose-800 border-r border-slate-100 text-sm">
                        {item.noDo}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800 border-r border-slate-100">
                        {item.teamName}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-600 border-r border-slate-100">
                        <span className="neo-pill bg-slate-100 text-slate-800 border-slate-400 text-[10px]">
                          {item.kategori || 'REGULER'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-900 border-r border-slate-100">
                        {item.bobot} Bobot
                      </td>
                      <td className="py-3 px-3 text-center border-r border-slate-100">
                        <span className="neo-pill bg-rose-200 text-rose-950 border-slate-900 font-black text-[10px]">
                          CANCEL
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDateDetail(item.tanggal);
                          }}
                          className="neo-btn neo-btn-white py-1 px-3 text-xs font-black inline-flex items-center gap-1.5 hover:bg-rose-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cancel Timeline Chart */}
          <div className="neo-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2 font-['Space_Grotesk',sans-serif]">
                  <span className="neo-stamp bg-rose-500 text-white text-[10px]">GRAFIK</span>
                  DISTRIBUSI CANCEL ORDER PER TANGGAL ({monthName.toUpperCase()} {year})
                </h3>
                <p className="text-xs font-bold text-slate-600">Analisis tanggal-tanggal yang mengalami pembatalan DO</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="neo-pill bg-rose-200 text-rose-950 border-slate-900 flex items-center gap-1.5 font-black">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block border border-slate-900"></span>
                  Cancel
                </span>
                <span className="neo-pill bg-blue-100 text-blue-950 border-slate-900 flex items-center gap-1.5 font-black">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block border border-slate-900"></span>
                  Total Jalur
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cancelChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#0f172a" fontSize={11} fontWeight={700} />
                  <YAxis stroke="#0f172a" fontSize={11} allowDecimals={false} fontWeight={700} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="neo-card p-3 text-xs bg-white">
                            <div className="font-black text-slate-900">{data.fullDate}</div>
                            <div className="text-rose-600 font-extrabold mt-1">Cancel: {data.cancel}</div>
                            <div className="text-blue-700 font-bold">Total Jalur: {data.jalur}</div>
                            <div className="text-slate-600 font-bold">LKPB: {data.lkpb}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="cancel" fill="#f43f5e" radius={[4, 4, 0, 0]}>
                    {cancelChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-cancel-${index}`} 
                        fill={entry.cancel > 0 ? '#f43f5e' : '#e2e8f0'} 
                        stroke="#0f172a"
                        strokeWidth={entry.cancel > 0 ? 2 : 1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Status Table */}
          <div className="neo-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="neo-stamp bg-blue-600 text-white text-[10px]">DATA</span>
                <h3 className="text-base font-black text-slate-900 font-['Space_Grotesk',sans-serif]">
                  RINCIAN HARIAN LKPB, STATUS LANJUT INSTALL, DAN CANCEL
                </h3>
              </div>

              {/* Multi-Format Export Dropdown (XLSX, ODS, PDF, PPT, ODP) */}
              <ExportDropdown
                getData={() => ({
                  title: `REKAPITULASI LKPB & CANCEL ORDER (${monthName.toUpperCase()} ${year})`,
                  periodName: `${monthName} ${year}`,
                  poolName: 'Pool Singkawang',
                  headers: [
                    'Tanggal',
                    'Total Jalur',
                    'Target',
                    'Realisasi',
                    'LKPB',
                    'Lanjut Install',
                    'Open',
                    'Cancel',
                    'Rasio Cancel %',
                  ],
                  rows: records
                    .filter((r) => r.hasData)
                    .map((r) => {
                      const cancelRate = r.totalJalur > 0 ? `${Math.round((r.cancel / r.totalJalur) * 100)}%` : '0%';
                      return [
                        r.tanggal,
                        r.totalJalur,
                        r.target,
                        r.realisasi,
                        r.lkpb,
                        r.lanjutInstall,
                        r.open,
                        r.cancel,
                        cancelRate,
                      ];
                    }),
                  summaryCards: [
                    { label: 'Total LKPB Terbit', value: summary.totalLkpb, note: `Pada ${lkpbStats.daysWithLkpb} hari kerja` },
                    { label: 'Total Cancel DO', value: summary.totalCancel, note: `${lkpbStats.cancelRatio}% dari total jalur` },
                    { label: 'Hari Cancel Tertinggi', value: lkpbStats.maxCancelDay.date, note: `${lkpbStats.maxCancelDay.count} Cancel Order` },
                    { label: 'Hari Kerja Bebas Cancel', value: `${records.filter((r) => r.hasData && r.cancel === 0).length} Hari`, note: 'Zero-Cancel Performance' },
                  ],
                })}
                defaultFilename={`Rekap_LKPB_Cancel_${monthName}_${year}`}
                reportTitle={`Rekap LKPB & Cancel - ${monthName} ${year}`}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[780px]">
                <thead>
                  <tr className="border-b-2.5 border-slate-900 bg-blue-50 text-slate-900 font-black uppercase text-[11px]">
                    <th className="py-2.5 px-3 border-r border-slate-900/10">Tanggal</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-900/10">Total Jalur</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-900/10">Target</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-900/10">Realisasi</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-900/10">LKPB</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-900/10">Lanjut Install</th>
                    <th className="py-2.5 px-3 text-right border-r border-slate-900/10">Open</th>
                    <th className="py-2.5 px-3 text-right text-rose-700 font-black border-r border-slate-900/10">Cancel</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-900/10">Tingkat Cancel</th>
                    <th className="py-2.5 px-3 text-center">Detail & DO Cancel</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-200">
                  {records
                    .filter((r) => r.hasData)
                    .map((r) => {
                      const dayCancelRate = r.totalJalur > 0 
                        ? Math.round((r.cancel / r.totalJalur) * 100) 
                        : 0;

                      return (
                        <tr
                          key={r.no}
                          onClick={() => onSelectRecord(r)}
                          className="hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                          <td className="py-2.5 px-3 font-extrabold text-slate-900 border-r border-slate-100">{r.tanggal}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-800 border-r border-slate-100">{r.totalJalur}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-500 border-r border-slate-100">{r.target}</td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-800 border-r border-slate-100">{r.realisasi}</td>
                          <td className="py-2.5 px-3 text-right text-blue-800 font-bold border-r border-slate-100">{r.lkpb || '-'}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-700 border-r border-slate-100">{r.lanjutInstall || '-'}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-700 border-r border-slate-100">{r.open || '-'}</td>
                          <td className="py-2.5 px-3 text-right border-r border-slate-100">
                            {r.cancel > 0 ? (
                              <span className="neo-pill bg-rose-200 text-rose-950 border-slate-900 font-black">
                                {r.cancel}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-bold">0</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center border-r border-slate-100">
                            {r.cancel === 0 ? (
                              <span className="neo-pill bg-emerald-200 text-emerald-950 border-slate-900">
                                0% Cancel
                              </span>
                            ) : (
                              <span className="neo-pill bg-rose-200 text-rose-950 border-slate-900">
                                {dayCancelRate}% Cancel
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectRecord(r);
                              }}
                              className={`neo-btn py-1 px-2.5 text-[11px] font-black inline-flex items-center gap-1.5 transition-all ${
                                r.cancel > 0
                                  ? 'bg-rose-100 hover:bg-rose-200 text-rose-950'
                                  : 'neo-btn-white hover:bg-blue-100 text-slate-900'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{r.cancel > 0 ? `Lihat ${r.cancel} Cancel` : 'Detail'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
