import React, { useState } from 'react';
import { 
  PlusCircle, 
  Database, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Calendar, 
  Link as LinkIcon,
  Layers,
  Sparkles,
  ArrowRight,
  Server,
  Tag,
  ShieldCheck,
  Star,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MONTH_NAMES } from '../data/defaultSeptemberData';
import { RegisteredMonthConfig, fetchMonthDataset } from '../services/sheetService';
import { extractGoogleSheetInfo } from '../utils/csvParser';
import { MonthlyDataset, ContainerSyncInfo } from '../types';
import { CURRENT_APP_VERSION } from '../data/versionHistory';

interface AdminDashboardProps {
  registeredMonths: RegisteredMonthConfig[];
  currentMonthId: string;
  onSaveMonth: (config: RegisteredMonthConfig, dataset?: MonthlyDataset) => void;
  onDeleteMonth: (id: string) => void;
  onSelectMonth: (config: RegisteredMonthConfig) => void;
  onRefreshMonth: (config: RegisteredMonthConfig) => void;
  containerSync?: ContainerSyncInfo | null;
  onTriggerContainerSync?: () => Promise<any>;
  onOpenVersionModal?: () => void;
  onSetDefaultMonth?: (monthId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  registeredMonths,
  currentMonthId,
  onSaveMonth,
  onDeleteMonth,
  onSelectMonth,
  onRefreshMonth,
  containerSync,
  onTriggerContainerSync,
  onOpenVersionModal,
  onSetDefaultMonth,
}) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('Agustus');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [customGid, setCustomGid] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<MonthlyDataset | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSyncingContainer, setIsSyncingContainer] = useState(false);

  // Auto detect GID when sheetUrl changes
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSheetUrl(val);
    setPreviewError(null);
    setPreviewData(null);

    // Keep customGid clear by default so intelligent automatic tab resolution
    // (Centralize, Detail Pendingan, Detail LKPB) is used, preventing accidental
    // assignment of daily sheet GIDs like tgl 1.
  };

  const handleTestAndPreview = async () => {
    if (!sheetUrl.trim()) {
      setPreviewError('Harap masukkan link Google Spreadsheet terlebih dahulu.');
      return;
    }

    setIsLoadingPreview(true);
    setPreviewError(null);
    setPreviewData(null);

    const monthIndex = MONTH_NAMES.indexOf(selectedMonth) + 1;
    const tempId = `${selectedYear}-${String(monthIndex).padStart(2, '0')}`;

    const config: RegisteredMonthConfig = {
      id: tempId,
      monthName: selectedMonth,
      monthNumber: monthIndex,
      year: selectedYear,
      sheetUrl: sheetUrl.trim(),
      gid: customGid.trim() || (tempId === '2026-09' ? '808257444' : '0'),
      lastUpdated: new Date().toISOString(),
    };

    try {
      const dataset = await fetchMonthDataset(config, true);
      setPreviewData(dataset);
    } catch (err: any) {
      console.error('Preview error:', err);
      setPreviewError(
        err.message ||
          'Gagal mengambil data. Pastikan link Google Spreadsheet disetel ke "Siapa saja yang memiliki link dapat melihat".'
      );
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleSave = () => {
    if (!sheetUrl.trim()) {
      setPreviewError('Harap masukkan URL Google Spreadsheet.');
      return;
    }

    const monthIndex = MONTH_NAMES.indexOf(selectedMonth) + 1;
    const id = `${selectedYear}-${String(monthIndex).padStart(2, '0')}`;

    const config: RegisteredMonthConfig = {
      id,
      monthName: selectedMonth,
      monthNumber: monthIndex,
      year: selectedYear,
      sheetUrl: sheetUrl.trim(),
      gid: customGid || '0',
      lastUpdated: new Date().toISOString(),
    };

    onSaveMonth(config, previewData || undefined);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    setSuccessMessage(`Berhasil menambahkan data periode ${selectedMonth} ${selectedYear}!`);
    setTimeout(() => setSuccessMessage(null), 5000);

    // Reset form
    setSheetUrl('');
    setCustomGid('');
    setPreviewData(null);
  };

  const handleForceContainerSync = async () => {
    if (!onTriggerContainerSync) return;
    setIsSyncingContainer(true);
    try {
      await onTriggerContainerSync();
      setSuccessMessage('Sinkronisasi database antar-kontainer berhasil diselesaikan.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch {
      // ignore
    } finally {
      setIsSyncingContainer(false);
    }
  };

  const handleSetDefault = (monthId: string) => {
    if (onSetDefaultMonth) {
      onSetDefaultMonth(monthId);
    }
    const targetMonth = registeredMonths.find((m) => m.id === monthId);
    setSuccessMessage(`Bulan ${targetMonth?.monthName || monthId} ${targetMonth?.year || ''} berhasil disetel sebagai Default Sheet saat awal visit.`);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {successMessage && (
        <div className="neo-card p-4 bg-emerald-100 border-emerald-950 text-emerald-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-800 stroke-[2.5] flex-shrink-0" />
            <span className="font-black text-sm">{successMessage}</span>
          </div>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="neo-btn neo-btn-white text-xs px-2.5 py-1"
          >
            TUTUP
          </button>
        </div>
      )}

      {/* Auto Cross-Container Database Synchronization & SemVer Card */}
      <div className="neo-card p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="neo-stamp bg-cyan-400 text-slate-950 text-[10px] uppercase font-mono font-black">
                AUTO-SYNC MULTI-CONTAINER
              </span>
              <span className="neo-stamp bg-indigo-400 text-slate-950 text-[10px] font-mono font-black">
                SEMVER v{CURRENT_APP_VERSION}
              </span>
              <span className={`neo-pill text-[10px] font-black border-slate-950 ${
                containerSync?.status === 'syncing' || isSyncingContainer
                  ? 'bg-amber-300 text-slate-950'
                  : containerSync?.status === 'error'
                  ? 'bg-rose-300 text-slate-950'
                  : 'bg-emerald-300 text-slate-950'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  containerSync?.status === 'syncing' || isSyncingContainer
                    ? 'bg-amber-950 animate-ping'
                    : containerSync?.status === 'error'
                    ? 'bg-rose-950'
                    : 'bg-emerald-950 animate-ping'
                }`}></span>
                <span>
                  {containerSync?.status === 'syncing' || isSyncingContainer
                    ? 'SINKRONISASI BERJALAN...'
                    : containerSync?.status === 'error'
                    ? 'PERIKSA KONEKSI PEER'
                    : 'DATABASE TERHUBUNG & SINKRON'}
                </span>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black tracking-tight font-['Space_Grotesk',sans-serif] text-slate-100 flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400 stroke-[2.5]" />
              Sinkronisasi Otomatis Antara Kontainer Preview & Kontainer Terbit
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-3xl leading-relaxed">
              Setiap kali Anda menambahkan bulan spreadsheet baru di dashboard admin, sistem secara otomatis mereplikasi konfigurasi bulan ke URL terbit (<span className="text-cyan-300 font-mono font-bold">https://dashboardpool.ai.studio</span>) dan melakukan auto-sinkronisasi dua arah setiap 8 detik.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
              <div>
                <span className="text-slate-500 font-bold">Target Kontainer:</span>{' '}
                <span className="text-cyan-300 font-semibold">{containerSync?.peerUrl || 'https://dashboardpool.ai.studio'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Terakhir Sinkron:</span>{' '}
                <span className="text-slate-200">
                  {containerSync?.lastSyncTime
                    ? new Date(containerSync.lastSyncTime).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : 'Baru saja'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Total Periode:</span>{' '}
                <span className="text-emerald-400 font-bold">{registeredMonths.length} Bulan Aktif</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 flex-shrink-0">
            <button
              id="btn-force-container-sync"
              onClick={handleForceContainerSync}
              disabled={isSyncingContainer}
              className="neo-btn bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs px-4 py-2.5 flex items-center justify-center gap-2 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#000] cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingContainer ? 'animate-spin' : ''}`} />
              <span>{isSyncingContainer ? 'Menyinkronkan...' : 'Paksa Sinkron Sekarang'}</span>
            </button>

            {onOpenVersionModal && (
              <button
                id="btn-open-version-modal-admin"
                onClick={onOpenVersionModal}
                className="neo-btn bg-white hover:bg-slate-100 text-slate-950 font-black text-xs px-4 py-2 flex items-center justify-center gap-2 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#000] cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5 text-indigo-700 stroke-[2.5]" />
                <span>Riwayat SemVer & Changelog</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Add Month Form & Registered List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Add Monthly Data */}
        <div className="lg:col-span-6 neo-card p-5 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b-2.5 border-slate-900">
              <div className="w-10 h-10 rounded-md bg-blue-100 text-blue-900 border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]">
                <PlusCircle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 font-['Space_Grotesk',sans-serif]">
                  TAMBAH DATA PERBULAN BARU
                </h3>
                <p className="text-xs font-bold text-slate-600">
                  Input tautan spreadsheet, pilih bulan dan tahun untuk monitoring DO
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {/* Select Bulan & Select Tahun */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5 font-mono">
                    PILIH BULAN *
                  </label>
                  <select
                    id="select-admin-month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="neo-input w-full px-3 py-2 text-sm font-bold text-slate-900 cursor-pointer"
                  >
                    {MONTH_NAMES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5 font-mono">
                    PILIH TAHUN *
                  </label>
                  <select
                    id="select-admin-year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="neo-input w-full px-3 py-2 text-sm font-bold text-slate-900 cursor-pointer"
                  >
                    {[2024, 2025, 2026, 2027, 2028].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Link Spreadsheet */}
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5 font-mono">
                  LINK GOOGLE SPREADSHEET *
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                  <input
                    id="input-admin-sheet-url"
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit?gid=..."
                    value={sheetUrl}
                    onChange={handleUrlChange}
                    className="neo-input w-full pl-10 pr-4 py-2 text-xs sm:text-sm font-bold placeholder:text-slate-400"
                  />
                </div>
                <p className="text-[11px] font-bold text-slate-600 mt-1">
                  Contoh: Tautan spreadsheet bulan Agustus atau bulan lainnya dengan format kolom CENTRALIZED MANUAL.
                </p>
              </div>

              {/* GID (Sheet ID) Optional */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider font-mono">
                    SHEET GID (OPSIONAL / AUTO-RESOLVE)
                  </label>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                    Otomatis Deteksi Tab
                  </span>
                </div>
                <input
                  id="input-admin-gid"
                  type="text"
                  placeholder="Kosongkan untuk deteksi otomatis tab Centralize, Pendingan, & LKPB"
                  value={customGid}
                  onChange={(e) => setCustomGid(e.target.value)}
                  className="neo-input w-full px-3 py-2 text-xs sm:text-sm font-bold placeholder:text-slate-400"
                />
                <p className="text-[11px] font-semibold text-slate-600 mt-1">
                  💡 Biarkan kosong agar sistem otomatis mencocokkan tab <strong>Centralize</strong>, <strong>Detail Pendingan</strong>, dan <strong>Detail LKPB</strong> dari tautan spreadsheet Anda.
                </p>
              </div>

              {/* Preview Error Message */}
              {previewError && (
                <div className="neo-card p-3.5 bg-rose-100 border-rose-950 text-rose-950 text-xs flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-700 stroke-[2.5] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-black">Gagal Mengambil Data:</strong> {previewError}
                  </div>
                </div>
              )}

              {/* Preview Success Box */}
              {previewData && (
                <div className="neo-card p-4 bg-blue-50 border-blue-950 space-y-3">
                  <div className="flex items-center justify-between text-xs font-black text-blue-950">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                      DATA BERHASIL TERHUBUNG & TERSINKRON
                    </span>
                    <span className="neo-pill bg-blue-200 text-blue-950 border-slate-900 text-[10px]">
                      {previewData.summary.activeDaysCount} HARI AKTIF TERVALIDASI
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="neo-card p-2 bg-white">
                      <span className="text-[10px] font-mono text-slate-600 font-bold block">Total Jalur</span>
                      <strong className="text-slate-900 text-base font-black">{previewData.summary.totalJalur}</strong>
                    </div>
                    <div className="neo-card p-2 bg-white">
                      <span className="text-[10px] font-mono text-slate-600 font-bold block">Bobot Masuk</span>
                      <strong className="text-blue-800 text-base font-black">{previewData.summary.totalBobotMasuk}</strong>
                    </div>
                    <div className="neo-card p-2 bg-white">
                      <span className="text-[10px] font-mono text-slate-600 font-bold block">Realisasi</span>
                      <strong className="text-emerald-800 text-base font-black">{previewData.summary.totalRealisasi}</strong>
                    </div>
                  </div>

                  {/* Detected Tabs Breakdown */}
                  <div className="pt-1 text-[11px] border-t border-blue-200 flex flex-wrap items-center justify-between gap-2 text-slate-700 font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Tab Centralize: <strong>{previewData.records.length} Hari</strong>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Detail Pending: <strong>{(previewData.detailPending || []).length} DO</strong>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      Detail LKPB: <strong>{(previewData.detailLkpb || []).length} DO</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t-2.5 border-slate-900 flex flex-col sm:flex-row gap-2.5">
            <button
              id="btn-test-sheet-preview"
              type="button"
              onClick={handleTestAndPreview}
              disabled={isLoadingPreview || !sheetUrl.trim()}
              className="neo-btn neo-btn-white flex-1 py-2.5 px-4 text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 stroke-[2.5] ${isLoadingPreview ? 'animate-spin' : ''}`} />
              <span>{isLoadingPreview ? 'MEMVERIFIKASI...' : 'TEST & TARIK PREVIEW'}</span>
            </button>

            <button
              id="btn-save-month-data"
              type="button"
              onClick={handleSave}
              disabled={!sheetUrl.trim()}
              className="neo-btn neo-btn-primary flex-1 py-2.5 px-4 text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>SIMPAN DATA BULAN</span>
            </button>
          </div>
        </div>

        {/* Right: Registered Months List */}
        <div className="lg:col-span-6 neo-card p-5 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b-2.5 border-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-md bg-blue-100 text-blue-900 border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]">
                  <Database className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-['Space_Grotesk',sans-serif]">
                    DAFTAR PERIODE BULAN TERDAFTAR
                  </h3>
                  <p className="text-xs font-bold text-slate-600">
                    {registeredMonths.length} periode terhubung ke Google Spreadsheet
                  </p>
                </div>
              </div>
            </div>

            {/* List of Months */}
            <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {registeredMonths.map((m) => {
                const isActive = m.id === currentMonthId;
                const isDefaultMonth = Boolean(
                  m.isDefault || 
                  (typeof window !== 'undefined' && localStorage.getItem('preferred_default_month_id') === m.id)
                );
                return (
                  <div
                    key={m.id}
                    id={`registered-month-card-${m.id}`}
                    className={`neo-card p-4 transition-all ${
                      isActive
                        ? 'bg-blue-100 border-slate-950 ring-2 ring-blue-600'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-slate-900 font-['Space_Grotesk',sans-serif]">
                            {m.monthName} {m.year}
                          </h4>
                          {isDefaultMonth && (
                            <span className="neo-pill bg-amber-300 text-amber-950 border-slate-900 text-[10px] font-black flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-950 stroke-[1.5]" />
                              DEFAULT VISIT
                            </span>
                          )}
                          {isActive && (
                            <span className="neo-pill bg-emerald-200 text-emerald-950 border-slate-900 text-[10px] flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-600 border border-slate-900"></span>
                              AKTIF DILIHAT
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono font-bold text-slate-600 mt-1 truncate max-w-[280px] sm:max-w-xs">
                          GID: <strong className="text-slate-900">{m.gid || '0'}</strong>
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        {/* External sheet link */}
                        <a
                          href={m.sheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Buka Spreadsheet Asli"
                          className="w-8 h-8 rounded bg-white hover:bg-blue-100 text-slate-800 border-2 border-slate-900 flex items-center justify-center shadow-[1px_1px_0px_0px_#0f172a] transition-all"
                        >
                          <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                        </a>

                        {/* Re-sync button */}
                        <button
                          onClick={() => onRefreshMonth(m)}
                          title="Sinkronkan data terbaru dari spreadsheet ini"
                          className="w-8 h-8 rounded bg-white hover:bg-blue-100 text-slate-800 border-2 border-slate-900 flex items-center justify-center shadow-[1px_1px_0px_0px_#0f172a] transition-all"
                        >
                          <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        {/* Delete button (only if not default) */}
                        {!isDefaultMonth && (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus periode ${m.monthName} ${m.year}?`)) {
                                onDeleteMonth(m.id);
                              }
                            }}
                            title="Hapus periode ini"
                            className="w-8 h-8 rounded bg-rose-100 hover:bg-rose-200 text-rose-900 border-2 border-slate-900 flex items-center justify-center shadow-[1px_1px_0px_0px_#0f172a] transition-all"
                          >
                            <Trash2 className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Action footer: Set as Default & Buka di Dashboard */}
                    <div className="mt-3 pt-2.5 border-t-2 border-slate-900/15 flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        {isDefaultMonth ? (
                          <span className="neo-pill bg-amber-200 text-amber-950 border-slate-900 text-xs font-black flex items-center gap-1.5 py-1 px-2.5">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-900 stroke-[2]" />
                            <span>Sheet Default Aktif</span>
                          </span>
                        ) : (
                          <button
                            id={`btn-set-default-${m.id}`}
                            onClick={() => handleSetDefault(m.id)}
                            className="neo-btn bg-amber-300 hover:bg-amber-200 text-slate-950 text-xs px-2.5 py-1 font-black flex items-center gap-1.5 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#0f172a] cursor-pointer transition-transform hover:-translate-y-0.5"
                            title={`Jadikan bulan ${m.monthName} ${m.year} sebagai default saat awal aplikasi dibuka`}
                          >
                            <Star className="w-3.5 h-3.5 stroke-[2.5] text-slate-950" />
                            <span>Set as Default</span>
                          </button>
                        )}
                      </div>

                      {!isActive && (
                        <button
                          onClick={() => onSelectMonth(m)}
                          className="neo-btn neo-btn-primary text-xs px-3 py-1 flex items-center gap-1"
                        >
                          <span>Buka di Dashboard</span>
                          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guide / Hint */}
          <div className="mt-4 p-3 neo-card bg-blue-50 text-xs text-slate-800 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-blue-700 stroke-[2.5] flex-shrink-0 mt-0.5" />
            <div className="font-bold">
              <strong className="font-black">Catatan Berbagi:</strong> Pastikan spreadsheet Google Anda sudah disetel ke akses <em>&ldquo;Siapa saja yang memiliki link dapat melihat&rdquo;</em> agar server dapat menarik data secara instan tanpa login berulang.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
