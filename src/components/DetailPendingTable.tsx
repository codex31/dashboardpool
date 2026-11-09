import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Search, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  Home, 
  Wrench, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  PhoneCall,
  Layers,
  MapPin
} from 'lucide-react';
import { DetailPendingItem } from '../types';
import { ExportDropdown } from './ExportDropdown';
import { ExportTableData } from '../services/exportService';

interface DetailPendingTableProps {
  items: DetailPendingItem[];
  monthName: string;
  year: number;
}

export const DetailPendingTable: React.FC<DetailPendingTableProps> = ({
  items,
  monthName,
  year,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'FINISH'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = items.length;
    const openCount = items.filter((i) => i.status === 'OPEN').length;
    const finishCount = items.filter((i) => i.status === 'FINISH').length;
    const locationNotReadyCount = items.filter(
      (i) => i.status === 'OPEN' && (i.kategori.includes('LOKASI') || i.keterangan.includes('BELUM SIAP') || i.keterangan.includes('RENOV'))
    ).length;
    const ljiCount = items.filter(
      (i) => i.status === 'OPEN' && (i.kategori.includes('LJI') || i.kategori.includes('LANJUT'))
    ).length;

    return { total, openCount, finishCount, locationNotReadyCount, ljiCount };
  }, [items]);

  // Unique categories for filter dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.kategori) set.add(i.kategori);
    });
    return Array.from(set);
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.noDo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaCustomer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.konfirmasiBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL' || item.status.toUpperCase() === statusFilter;

      const matchCategory =
        categoryFilter === 'ALL' || item.kategori === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [items, searchTerm, statusFilter, categoryFilter]);

  // Copy WhatsApp Follow-Up Message
  const handleCopyPending = (item: DetailPendingItem) => {
    const text = `*📋 KONFIRMASI PENDING ORDER - POOL SINGKAWANG*\n\n` +
      `• *No DO:* ${item.noDo}\n` +
      `• *Customer:* ${item.namaCustomer}\n` +
      `• *Kategori:* ${item.kategori}\n` +
      `• *Keterangan Lapangan:* ${item.keterangan}\n` +
      `• *Tgl Jalur Awal:* ${item.tglJalurAwal}\n` +
      `• *Target Jalur Ulang:* ${item.tglTarget}\n` +
      `• *Metode Konfirmasi:* ${item.konfirmasiBy}\n` +
      `• *Status:* ${item.status}\n\n` +
      `*Rekomendasi Tindak Lanjut:*\n${item.recommendation}\n\n` +
      `_Mohon koordinasi segera dengan tim installer dan customer. Terima kasih._`;

    navigator.clipboard.writeText(text);
    setCopiedId(item.noDo);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Multi-format export data provider
  const getExportData = (): ExportTableData => ({
    title: `DETAIL PENDING ORDER - POOL SINGKAWANG (${monthName.toUpperCase()} ${year})`,
    periodName: `${monthName} ${year}`,
    poolName: 'Pool Singkawang',
    headers: [
      'No',
      'No DO',
      'Customer',
      'Tgl Awal',
      'Target Ulang',
      'Status',
      'Konfirmasi',
      'Kategori',
      'Keterangan Lapangan',
      'Rekomendasi Tindakan',
      'Store Follow Up',
    ],
    rows: filteredItems.map((i) => [
      i.no,
      i.noDo,
      i.namaCustomer,
      i.tglJalurAwal,
      i.tglTarget,
      i.status,
      i.konfirmasiBy,
      i.kategori,
      i.keterangan,
      i.recommendation,
      i.needsStoreFollowUp ? 'YA' : 'TIDAK',
    ]),
    summaryCards: [
      { label: 'Total Pending', value: stats.total, note: `${filteredItems.length} Kasus Ditampilkan` },
      { label: 'Status OPEN', value: stats.openCount, note: 'Memerlukan Follow Up' },
      { label: 'Status FINISH', value: stats.finishCount, note: 'Terpasang di Jalur Ulang' },
      { label: 'Lokasi Blm Siap', value: stats.locationNotReadyCount, note: 'Renovasi / Toko' },
    ],
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="neo-card p-4 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider font-mono">TOTAL KASUS PENDING</span>
            <Layers className="w-4 h-4 text-blue-700 stroke-[2.5]" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-1 font-['Space_Grotesk',sans-serif]">
            {stats.total} <span className="text-xs font-bold text-slate-500 font-sans">DO</span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 mt-1">Daftar sheet Detail Pendingan</p>
        </div>

        <div className="neo-card p-4 bg-amber-50 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider font-mono">PENDING MASIH OPEN</span>
            <Clock className="w-4 h-4 text-amber-700 stroke-[2.5]" />
          </div>
          <div className="text-3xl font-black text-amber-950 mt-1 font-['Space_Grotesk',sans-serif]">
            {stats.openCount} <span className="text-xs font-bold text-amber-800 font-sans">DO</span>
          </div>
          <p className="text-[11px] font-bold text-amber-800 mt-1">Perlu dijadwalkan ulang</p>
        </div>

        <div className="neo-card p-4 bg-blue-50 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider font-mono">KESIAPAN LOKASI</span>
            <Home className="w-4 h-4 text-blue-700 stroke-[2.5]" />
          </div>
          <div className="text-3xl font-black text-blue-950 mt-1 font-['Space_Grotesk',sans-serif]">
            {stats.locationNotReadyCount} <span className="text-xs font-bold text-blue-800 font-sans">DO</span>
          </div>
          <p className="text-[11px] font-bold text-blue-800 mt-1">Renovasi / Toko Konstruksi</p>
        </div>

        <div className="neo-card p-4 bg-emerald-50 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider font-mono">TUNTAS SELESAI</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
          </div>
          <div className="text-3xl font-black text-emerald-950 mt-1 font-['Space_Grotesk',sans-serif]">
            {stats.finishCount} <span className="text-xs font-bold text-emerald-800 font-sans">DO</span>
          </div>
          <p className="text-[11px] font-bold text-emerald-800 mt-1">Selesai terpasang di jalur ulang</p>
        </div>
      </div>

      {/* Action Banner for Location Preparation Notice */}
      {stats.locationNotReadyCount > 0 && (
        <div className="neo-card p-4 bg-amber-100 flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-slate-900 text-amber-300 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] flex-shrink-0">
            <MapPin className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2 font-['Space_Grotesk',sans-serif]">
              <span>REKOMENDASI PROAKTIF: {stats.locationNotReadyCount} LOKASI BELUM SIAP (RENOVASI / TOKO KONSTRUKSI)</span>
            </h4>
            <p className="text-xs font-bold text-slate-700 mt-0.5 leading-relaxed">
              Terdapat pesanan pending karena ruangan/rooftop belum siap dipasang. Lakukan konfirmasi telepon/chat minimal H-2 sebelum tanggal target jalur ulang agar installer tidak datang sia-sia ke lokasi kosong.
            </p>
          </div>
        </div>
      )}

      {/* Control Bar: Search & Filters */}
      <div className="neo-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
          <input
            type="text"
            placeholder="Cari No DO, Customer, Keterangan Pending..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="neo-input w-full pl-9 pr-4 py-2 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`neo-btn text-xs px-3 py-1.5 ${
                statusFilter === 'ALL' ? 'neo-btn-primary' : 'neo-btn-white'
              }`}
            >
              Semua ({items.length})
            </button>
            <button
              onClick={() => setStatusFilter('OPEN')}
              className={`neo-btn text-xs px-3 py-1.5 ${
                statusFilter === 'OPEN' ? 'bg-amber-300 text-slate-900' : 'neo-btn-white'
              }`}
            >
              OPEN ({stats.openCount})
            </button>
            <button
              onClick={() => setStatusFilter('FINISH')}
              className={`neo-btn text-xs px-3 py-1.5 ${
                statusFilter === 'FINISH' ? 'bg-emerald-300 text-slate-900' : 'neo-btn-white'
              }`}
            >
              FINISH ({stats.finishCount})
            </button>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="neo-input text-xs font-black text-slate-900 px-3 py-1.5 cursor-pointer"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* Multi-Format Export Dropdown (XLSX, ODS, PDF, PPT, ODP) */}
          <ExportDropdown
            getData={getExportData}
            defaultFilename={`Detail_Pendingan_Pool_Singkawang_${monthName}_${year}`}
            reportTitle={`Detail Pendingan - ${monthName} ${year}`}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="neo-card p-0 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[900px]">
            <thead>
              <tr className="border-b-2.5 border-slate-900 bg-blue-50 text-slate-900 font-black uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 sm:px-4 border-r border-slate-900/10">No & DO</th>
                <th className="py-3 px-3 sm:px-4 border-r border-slate-900/10">Customer</th>
                <th className="py-3 px-3 sm:px-4 border-r border-slate-900/10">Jadwal (Awal &rarr; Target)</th>
                <th className="py-3 px-3 sm:px-4 border-r border-slate-900/10">Status & Konfirmasi</th>
                <th className="py-3 px-3 sm:px-4 border-r border-slate-900/10">Kategori & Keterangan</th>
                <th className="py-3 px-3 sm:px-4 border-r border-slate-900/10">Rekomendasi Tindak Lanjut</th>
                <th className="py-3 px-3 sm:px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-black">Tidak ada data Pending yang sesuai kriteria filter.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isCopied = copiedId === item.noDo;
                  const isLocationIssue =
                    item.kategori.includes('LOKASI') ||
                    item.keterangan.includes('BELUM SIAP') ||
                    item.keterangan.includes('RENOV');

                  return (
                    <tr
                      key={item.noDo + item.no}
                      className={`hover:bg-amber-50/60 transition-colors ${
                        item.status === 'OPEN'
                          ? isLocationIssue
                            ? 'bg-amber-50/40'
                            : ''
                          : 'bg-emerald-50/30'
                      }`}
                    >
                      {/* No & DO */}
                      <td className="py-3.5 px-3 sm:px-4 font-mono border-r border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="neo-stamp bg-slate-100 text-slate-800 text-[10px]">
                            #{item.no}
                          </span>
                          <span className="font-black text-slate-900">{item.noDo}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-3 sm:px-4 border-r border-slate-100">
                        <span className="font-extrabold text-slate-900">{item.namaCustomer}</span>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap border-r border-slate-100">
                        <div className="text-xs space-y-0.5">
                          <div className="text-slate-600 flex items-center gap-1 font-bold">
                            <span className="text-[10px] uppercase text-slate-500 font-mono">Awal:</span>
                            <span>{item.tglJalurAwal || '-'}</span>
                          </div>
                          <div className="text-blue-900 flex items-center gap-1 font-black">
                            <span className="text-[10px] uppercase text-blue-700 font-mono">Target:</span>
                            <span className="neo-pill bg-blue-100 text-blue-950 border-slate-900">{item.tglTarget || '-'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status & Konfirmasi By */}
                      <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap border-r border-slate-100">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`neo-pill w-fit font-black ${
                              item.status === 'OPEN'
                                ? 'bg-amber-200 text-amber-950 border-slate-900'
                                : 'bg-emerald-200 text-emerald-950 border-slate-900'
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className="text-[11px] text-slate-600 font-bold flex items-center gap-1">
                            <PhoneCall className="w-3 h-3 text-slate-700 stroke-[2.5]" />
                            {item.konfirmasiBy}
                          </span>
                        </div>
                      </td>

                      {/* Kategori & Keterangan */}
                      <td className="py-3.5 px-3 sm:px-4 max-w-xs border-r border-slate-100">
                        <div className="space-y-1">
                          <span className="neo-pill bg-blue-100 text-blue-900 border-slate-900 text-[10px]">
                            {item.kategori}
                          </span>
                          <p className="text-xs text-slate-800 font-bold leading-relaxed">
                            {item.keterangan}
                          </p>
                        </div>
                      </td>

                      {/* Recommendation & Action Logic */}
                      <td className="py-3.5 px-3 sm:px-4 max-w-sm border-r border-slate-100">
                        <div className="space-y-1">
                          <span
                            className={`neo-pill text-[10px] ${
                              item.actionLevel === 'critical'
                                ? 'bg-rose-200 text-rose-950 border-slate-900'
                                : item.actionLevel === 'location_prep'
                                ? 'bg-indigo-200 text-indigo-950 border-slate-900'
                                : item.actionLevel === 'resolved'
                                ? 'bg-emerald-200 text-emerald-950 border-slate-900'
                                : 'bg-blue-200 text-blue-950 border-slate-900'
                            }`}
                          >
                            {item.actionTag}
                          </span>
                          <p className="text-xs font-semibold text-slate-700 leading-snug">
                            {item.recommendation}
                          </p>
                        </div>
                      </td>

                      {/* Copy Action Button */}
                      <td className="py-3.5 px-3 sm:px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleCopyPending(item)}
                          title="Salin pesan WhatsApp konfirmasi jadwal customer/store"
                          className={`neo-btn text-xs px-2.5 py-1 gap-1 ${
                            isCopied
                              ? 'bg-emerald-400 text-slate-900'
                              : 'neo-btn-white'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Salin WA</span>
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
        <div className="p-3 bg-blue-50/50 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-700 gap-2 font-bold">
          <span>
            Menampilkan <strong className="text-slate-900 font-black">{filteredItems.length}</strong> dari{' '}
            <strong className="text-slate-900 font-black">{items.length}</strong> kasus Pending
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Google Spreadsheet &gt; Tab &ldquo;Detail Pendingan&rdquo; (Pool Singkawang)
          </span>
        </div>
      </div>
    </div>
  );
};
