import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Sparkles, 
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Calendar,
  Layers,
  Wrench,
  Package
} from 'lucide-react';
import { DetailLkpbItem } from '../types';
import { ExportDropdown } from './ExportDropdown';
import { ExportTableData } from '../services/exportService';

interface DetailLkpbTableProps {
  items: DetailLkpbItem[];
  monthName: string;
  year: number;
}

export const DetailLkpbTable: React.FC<DetailLkpbTableProps> = ({
  items,
  monthName,
  year,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'FINISH'>('ALL');
  const [agingFilter, setAgingFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'ONTRACK'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = items.length;
    const openCount = items.filter((i) => i.status === 'OPEN').length;
    const finishCount = items.filter((i) => i.status === 'FINISH').length;
    const criticalCount = items.filter((i) => i.status === 'OPEN' && i.agingDays >= 60).length;
    const warningCount = items.filter((i) => i.status === 'OPEN' && i.agingDays >= 30 && i.agingDays < 60).length;
    const sparepartCount = items.filter(
      (i) =>
        i.kategori.toUpperCase().includes('SPAREPART') ||
        i.kategori.toUpperCase().includes('PART') ||
        (i.reason && i.reason.toUpperCase().includes('SPAREPART'))
    ).length;
    const avgAging = total > 0 
      ? Math.round(items.reduce((acc, curr) => acc + curr.agingDays, 0) / total) 
      : 0;

    return { total, openCount, finishCount, criticalCount, warningCount, sparepartCount, avgAging };
  }, [items]);

  // Unique categories for filter dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.kategori) set.add(i.kategori.trim());
    });
    return Array.from(set);
  }, [items]);

  // Critical item highlight (e.g. 5A.XG.000053 GESIA 1)
  const criticalItems = useMemo(() => {
    return items.filter((i) => i.status === 'OPEN' && i.agingDays >= 60);
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      const matchSearch =
        item.noDo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaCustomer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchStatus =
        statusFilter === 'ALL' || item.status.toUpperCase() === statusFilter;

      // Category filter
      const matchCategory =
        categoryFilter === 'ALL' || item.kategori === categoryFilter;

      // Aging filter
      let matchAging = true;
      if (agingFilter === 'CRITICAL') matchAging = item.agingDays >= 60;
      else if (agingFilter === 'WARNING') matchAging = item.agingDays >= 30 && item.agingDays < 60;
      else if (agingFilter === 'ONTRACK') matchAging = item.agingDays < 30;

      return matchSearch && matchStatus && matchCategory && matchAging;
    });
  }, [items, searchTerm, statusFilter, categoryFilter, agingFilter]);

  // Copy WhatsApp Follow-Up Message
  const handleCopyFollowUp = (item: DetailLkpbItem) => {
    const text = `*🚨 FOLLOW UP LKPB - POOL SINGKAWANG*\n\n` +
      `• *No DO:* ${item.noDo}\n` +
      `• *Customer:* ${item.namaCustomer}\n` +
      `• *Kategori:* ${item.kategori}\n` +
      `• *Kendala/Cacat:* ${item.reason}\n` +
      `• *Tgl Jalur Awal:* ${item.tglJalurAwal}\n` +
      `• *Target Jalur Ulang:* ${item.tglTarget}\n` +
      `• *Durasi:* *${item.agingDays} Hari* sejak jalur awal\n` +
      `• *Status:* ${item.status}\n\n` +
      `*Rekomendasi Tindakan:*\n${item.recommendation}\n\n` +
      `_Mohon tindak lanjut segera ke Store Singkawang / Vendor terkait pengadaan part pengganti. Terima kasih._`;

    navigator.clipboard.writeText(text);
    setCopiedId(item.noDo);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Multi-format export data provider for Detail LKPB
  const getExportData = (): ExportTableData => ({
    title: `DETAIL LKPB & KENDALA CACAT BARANG (${monthName.toUpperCase()} ${year})`,
    periodName: `${monthName} ${year}`,
    poolName: 'Pool Singkawang',
    headers: [
      'No',
      'No DO',
      'Customer',
      'Tgl Awal',
      'Tgl Target',
      'Aging (Hari)',
      'Status',
      'Kategori LKPB',
      'Kendala Cacat',
      'Rekomendasi Tindakan',
      'Store Follow Up',
    ],
    rows: filteredItems.map((i) => [
      i.no,
      i.noDo,
      i.namaCustomer,
      i.tglJalurAwal,
      i.tglTarget,
      `${i.agingDays} Hari`,
      i.status,
      i.kategori,
      i.reason,
      i.recommendation,
      i.needsStoreFollowUp ? 'YA' : 'TIDAK',
    ]),
    summaryCards: [
      { label: 'Total Kasus LKPB', value: stats.total, note: `${filteredItems.length} Kasus Ditampilkan` },
      { label: 'Status OPEN', value: stats.openCount, note: 'Pending Solusi Cacat' },
      { label: 'Aging Kritis (>60 Hr)', value: stats.criticalCount, note: 'Perlu Eskalasi Cepat' },
      { label: 'Status FINISH', value: stats.finishCount, note: 'Telah Selesai Jalur Ulang' },
    ],
  });

  return (
    <div className="space-y-6">
      {/* Top Banner for Critical Cases */}
      {criticalItems.length > 0 && (
        <div className="neo-card p-4 sm:p-5 bg-rose-100 border-rose-950">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-md bg-rose-600 text-white border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a] flex-shrink-0 animate-pulse">
                <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-rose-950 flex items-center gap-2 font-['Space_Grotesk',sans-serif]">
                  <span>PERINGATAN SLA KASUS KRITIS ({criticalItems.length} DO &gt; 60 HARI)</span>
                  <span className="neo-stamp bg-rose-600 text-white text-[10px]">
                    ACTION REQUIRED
                  </span>
                </h4>
                <p className="text-xs text-slate-800 font-bold mt-0.5">
                  Ditemukan order cacat dengan durasi melebihi 60 hari sejak jalur awal, termasuk{' '}
                  <span className="font-black text-rose-900 bg-rose-200/80 px-1 border border-rose-900">
                    {criticalItems.map((c) => `${c.noDo} (${c.namaCustomer} - ${c.agingDays} Hari)`).join(', ')}
                  </span>
                  . Memerlukan tindak lanjut koordinasi langsung ke Store & Vendor!
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setStatusFilter('OPEN');
                setAgingFilter('CRITICAL');
              }}
              className="neo-btn neo-btn-white text-xs px-3.5 py-1.5 flex items-center gap-1.5 flex-shrink-0"
            >
              <span>Tampilkan Kasus Kritis</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="neo-card p-4 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider font-mono">TOTAL KASUS LKPB</span>
            <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-900 border-2 border-slate-900 flex items-center justify-center shadow-[1px_1px_0px_0px_#0f172a]">
              <Layers className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-1 font-['Space_Grotesk',sans-serif]">{stats.total} <span className="text-xs font-bold text-slate-500 font-mono">DO</span></div>
          <div className="flex items-center justify-between mt-1 text-[11px] font-bold text-slate-600">
            <span>Rekap sheet Detail LKPB</span>
            {stats.sparepartCount > 0 && (
              <span className="neo-pill bg-purple-100 text-purple-900 border-slate-900 text-[9px] font-black" title="Kasus Kurang Sparepart / Part">
                {stats.sparepartCount} Sparepart
              </span>
            )}
          </div>
        </div>

        <div className="neo-card p-4 bg-amber-50 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider font-mono">KASUS OPEN</span>
            <div className="w-8 h-8 rounded-md bg-amber-200 text-amber-900 border-2 border-slate-900 flex items-center justify-center shadow-[1px_1px_0px_0px_#0f172a]">
              <Clock className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-900 mt-1 font-['Space_Grotesk',sans-serif]">{stats.openCount} <span className="text-xs font-bold text-amber-700 font-mono">DO AKTIF</span></div>
          <p className="text-[11px] font-bold text-amber-800 mt-1">Menunggu part / jalur ulang</p>
        </div>

        <div className="neo-card p-4 bg-rose-50 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-rose-900 uppercase tracking-wider font-mono">FOLLOW UP STORE (&gt;30H)</span>
            <div className="w-8 h-8 rounded-md bg-rose-200 text-rose-900 border-2 border-slate-900 flex items-center justify-center shadow-[1px_1px_0px_0px_#0f172a]">
              <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-700 mt-1 font-['Space_Grotesk',sans-serif]">{stats.criticalCount + stats.warningCount} <span className="text-xs font-bold text-rose-600 font-mono">DO</span></div>
          <p className="text-[11px] font-bold text-rose-800 mt-1">{stats.criticalCount} Kritis (&gt;60h), {stats.warningCount} Warning</p>
        </div>

        <div className="neo-card p-4 bg-emerald-50 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider font-mono">KASUS SELESAI</span>
            <div className="w-8 h-8 rounded-md bg-emerald-200 text-emerald-900 border-2 border-slate-900 flex items-center justify-center shadow-[1px_1px_0px_0px_#0f172a]">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-800 mt-1 font-['Space_Grotesk',sans-serif]">{stats.finishCount} <span className="text-xs font-bold text-emerald-700 font-mono">DO</span></div>
          <p className="text-[11px] font-bold text-emerald-800 mt-1">Tuntas terpasang (Finish)</p>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Export */}
      <div className="neo-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
          <input
            type="text"
            placeholder="Cari No DO, Customer, Kerusakan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="neo-input w-full pl-9 pr-4 py-2 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center bg-blue-50 p-1 border-2 border-slate-900 rounded-md shadow-[2px_2px_0px_0px_#0f172a] text-xs font-black">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded transition-all ${
                statusFilter === 'ALL' ? 'bg-blue-600 text-white border border-slate-900 shadow-[1px_1px_0px_0px_#0f172a]' : 'text-slate-700 hover:text-blue-900'
              }`}
            >
              Semua ({items.length})
            </button>
            <button
              onClick={() => setStatusFilter('OPEN')}
              className={`px-2.5 py-1 rounded transition-all ${
                statusFilter === 'OPEN' ? 'bg-amber-500 text-slate-950 border border-slate-900 shadow-[1px_1px_0px_0px_#0f172a]' : 'text-slate-700 hover:text-amber-900'
              }`}
            >
              OPEN ({stats.openCount})
            </button>
            <button
              onClick={() => setStatusFilter('FINISH')}
              className={`px-2.5 py-1 rounded transition-all ${
                statusFilter === 'FINISH' ? 'bg-emerald-500 text-slate-950 border border-slate-900 shadow-[1px_1px_0px_0px_#0f172a]' : 'text-slate-700 hover:text-emerald-900'
              }`}
            >
              FINISH ({stats.finishCount})
            </button>
          </div>

          {/* Aging Filter */}
          <div className="flex items-center bg-slate-100 p-1 border-2 border-slate-900 rounded-md shadow-[2px_2px_0px_0px_#0f172a] text-xs font-black">
            <button
              onClick={() => setAgingFilter('ALL')}
              className={`px-2 py-1 rounded transition-all ${
                agingFilter === 'ALL' ? 'bg-slate-800 text-white border border-slate-900 shadow-[1px_1px_0px_0px_#0f172a]' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Semua SLA
            </button>
            <button
              onClick={() => setAgingFilter('CRITICAL')}
              className={`px-2 py-1 rounded transition-all ${
                agingFilter === 'CRITICAL' ? 'bg-rose-600 text-white border border-slate-900 shadow-[1px_1px_0px_0px_#0f172a]' : 'text-slate-700 hover:text-rose-900'
              }`}
            >
              &gt; 60 Hari ({stats.criticalCount})
            </button>
            <button
              onClick={() => setAgingFilter('WARNING')}
              className={`px-2 py-1 rounded transition-all ${
                agingFilter === 'WARNING' ? 'bg-amber-500 text-slate-950 border border-slate-900 shadow-[1px_1px_0px_0px_#0f172a]' : 'text-slate-700 hover:text-amber-900'
              }`}
            >
              30-59 Hari ({stats.warningCount})
            </button>
          </div>

          {/* Kategori Kendala / Cacat Filter Dropdown */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="neo-input text-xs font-black text-slate-900 px-3 py-1.5 cursor-pointer bg-white"
                title="Filter berdasarkan Kategori Kendala / Cacat LKPB (Cacat, Kurang Sparepart, dll)"
              >
                <option value="ALL">Semua Kategori LKPB</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Multi-Format Export Dropdown (XLSX, ODS, PDF, PPT, ODP) */}
          <ExportDropdown
            getData={getExportData}
            defaultFilename={`Detail_LKPB_Pool_Singkawang_${monthName}_${year}`}
            reportTitle={`Detail LKPB - ${monthName} ${year}`}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="neo-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[850px]">
            <thead>
              <tr className="bg-blue-50 border-b-2.5 border-slate-900 text-slate-900 font-black uppercase text-[11px]">
                <th className="py-3 px-3 sm:px-4 border-r border-slate-900/10">No & DO</th>
                <th className="py-3 px-3 sm:px-4 border-r border-slate-900/10">Customer</th>
                <th className="py-3 px-3 sm:px-4 border-r border-slate-900/10">Jadwal (Awal &rarr; Target)</th>
                <th className="py-3 px-3 sm:px-4 border-r border-slate-900/10">Durasi Aging</th>
                <th className="py-3 px-3 sm:px-4 border-r border-slate-900/10">Status & Kategori</th>
                <th className="py-3 px-3 sm:px-4 border-r border-slate-900/10">Kendala / Cacat</th>
                <th className="py-3 px-3 sm:px-4 border-r border-slate-900/10">Rekomendasi Tindak Lanjut</th>
                <th className="py-3 px-3 sm:px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-black">Tidak ada data LKPB yang sesuai kriteria filter.</p>
                    <p className="text-xs font-bold mt-1">Coba sesuaikan kata kunci pencarian atau reset filter.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isCopied = copiedId === item.noDo;
                  const isCritical = item.status === 'OPEN' && item.agingDays >= 60;
                  const isWarning = item.status === 'OPEN' && item.agingDays >= 30 && item.agingDays < 60;

                  return (
                    <tr
                      key={item.noDo + item.no}
                      className={`hover:bg-blue-50 transition-colors ${
                        isCritical
                          ? 'bg-rose-50/70'
                          : isWarning
                          ? 'bg-amber-50/70'
                          : item.status === 'FINISH'
                          ? 'bg-emerald-50/40'
                          : ''
                      }`}
                    >
                      {/* No & DO */}
                      <td className="py-3 px-3 sm:px-4 font-mono border-r border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded bg-slate-200 text-slate-800 border border-slate-900 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                            {item.no}
                          </span>
                          <span className="font-black text-slate-900">{item.noDo}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-3 sm:px-4 border-r border-slate-100">
                        <span className="font-extrabold text-slate-900">{item.namaCustomer}</span>
                      </td>

                      {/* Dates */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap border-r border-slate-100">
                        <div className="text-xs">
                          <div className="text-slate-600 flex items-center gap-1 font-bold">
                            <span className="text-[10px] uppercase font-black text-slate-500 font-mono">AWAL:</span>
                            <span>{item.tglJalurAwal || '-'}</span>
                          </div>
                          <div className="text-blue-900 flex items-center gap-1 mt-0.5 font-bold">
                            <span className="text-[10px] uppercase font-black text-blue-700 font-mono">TARGET:</span>
                            <span>{item.tglTarget || '-'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Aging */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap border-r border-slate-100">
                        <div className="flex items-center gap-1.5">
                          {isCritical ? (
                            <span className="neo-pill bg-rose-200 text-rose-950 border-slate-900 font-black flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
                              {item.agingDays} Hari
                            </span>
                          ) : isWarning ? (
                            <span className="neo-pill bg-amber-200 text-amber-950 border-slate-900 font-black flex items-center gap-1">
                              <Clock className="w-3 h-3 stroke-[2.5]" />
                              {item.agingDays} Hari
                            </span>
                          ) : item.status === 'FINISH' ? (
                            <span className="neo-pill bg-emerald-200 text-emerald-950 border-slate-900 font-black flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                              {item.agingDays} Hari
                            </span>
                          ) : (
                            <span className="neo-pill bg-blue-100 text-blue-950 border-slate-900 font-black flex items-center gap-1">
                              <Clock className="w-3 h-3 stroke-[2.5]" />
                              {item.agingDays} Hari
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status & Kategori */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap border-r border-slate-100">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`neo-pill w-fit text-[10px] font-black ${
                              item.status === 'OPEN'
                                ? 'bg-amber-300 text-amber-950 border-slate-900'
                                : 'bg-emerald-300 text-emerald-950 border-slate-900'
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className={`text-[11px] font-black px-1.5 py-0.5 rounded border border-slate-900 w-fit flex items-center gap-1 ${
                            item.kategori.toUpperCase().includes('SPAREPART')
                              ? 'bg-purple-200 text-purple-950'
                              : item.kategori.toUpperCase().includes('VENDOR')
                              ? 'bg-orange-200 text-orange-950'
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {item.kategori.toUpperCase().includes('SPAREPART') && (
                              <Wrench className="w-3 h-3 text-purple-900 stroke-[2.5]" />
                            )}
                            {item.kategori}
                          </span>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="py-3 px-3 sm:px-4 max-w-xs border-r border-slate-100">
                        <p className="text-xs text-slate-800 font-bold leading-relaxed break-words">
                          {item.reason}
                        </p>
                      </td>

                      {/* Recommendation & Action Logic */}
                      <td className="py-3 px-3 sm:px-4 max-w-sm border-r border-slate-100">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span
                              className={`neo-pill text-[10px] font-black ${
                                item.actionLevel === 'critical'
                                  ? 'bg-rose-200 text-rose-950 border-slate-900'
                                  : item.actionLevel === 'warning'
                                  ? 'bg-amber-200 text-amber-950 border-slate-900'
                                  : item.actionLevel === 'resolved'
                                  ? 'bg-emerald-200 text-emerald-950 border-slate-900'
                                  : 'bg-blue-100 text-blue-950 border-slate-900'
                              }`}
                            >
                              {item.actionTag}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 font-bold leading-snug">
                            {item.recommendation}
                          </p>
                        </div>
                      </td>

                      {/* Copy Action Button */}
                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleCopyFollowUp(item)}
                          title="Salin template pesan WhatsApp follow-up untuk Store/Vendor"
                          className={`neo-btn text-xs px-2.5 py-1.5 ${
                            isCopied
                              ? 'neo-btn-primary'
                              : 'neo-btn-white'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>TERSALIN!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>SALIN WA</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-3 bg-slate-100 border-t-2.5 border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-700 font-bold gap-2">
          <span>
            Menampilkan <strong className="text-slate-950 font-black">{filteredItems.length}</strong> dari{' '}
            <strong className="text-slate-950 font-black">{items.length}</strong> kasus LKPB
          </span>
          <span className="text-[11px] text-slate-600 font-mono">
            Sumber Data: Google Spreadsheet &gt; Tab &ldquo;Detail LKPB&rdquo; (Pool Singkawang)
          </span>
        </div>
      </div>
    </div>
  );
};
