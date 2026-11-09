import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Presentation, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  LogOut, 
  BarChart3, 
  Layers, 
  FileText,
  Calendar
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getCurrentUser, 
  getCachedToken 
} from '../services/googleAuthService';
import { 
  ComprehensiveReportData, 
  exportDirectlyToGoogleSlides, 
  downloadPowerPointFile 
} from '../services/googleSlidesExportService';

interface GoogleSlidesExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ComprehensiveReportData;
  defaultFilename: string;
}

export const GoogleSlidesExportModal: React.FC<GoogleSlidesExportModalProps> = ({
  isOpen,
  onClose,
  reportData,
  defaultFilename,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [createdPresentation, setCreatedPresentation] = useState<{
    id: string;
    url: string;
    title: string;
  } | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'page1' | 'page2'>('page1');

  useEffect(() => {
    if (!isOpen) return;

    // Listen to auth state
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
      },
      () => {
        setCurrentUser(null);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      setExportError(null);
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setExportError(err.message || 'Gagal masuk dengan Google. Silakan coba lagi.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setCreatedPresentation(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  const handleExportToGoogleSlides = async () => {
    try {
      setIsExporting(true);
      setExportError(null);
      setCreatedPresentation(null);

      const result = await exportDirectlyToGoogleSlides(reportData, defaultFilename);
      setCreatedPresentation({
        id: result.presentationId,
        url: result.webViewLink,
        title: result.title,
      });
    } catch (err: any) {
      console.error('Export Google Slides error:', err);
      setExportError(err.message || 'Terjadi kesalahan saat mengekspor ke Google Slides.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPptx = async () => {
    try {
      setIsExporting(true);
      setExportError(null);
      await downloadPowerPointFile(reportData, defaultFilename);
    } catch (err: any) {
      console.error('Download PPTX error:', err);
      setExportError(err.message || 'Gagal mengunduh file presentasi.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="neo-card bg-white w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border-3 border-slate-900 shadow-[8px_8px_0px_0px_#0f172a]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-amber-400 border-b-2.5 border-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-slate-900 text-amber-400 flex items-center justify-center font-black border border-slate-900 shadow-[1.5px_1.5px_0px_0px_#ffffff]">
              <Presentation className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="neo-stamp bg-slate-900 text-white text-[9px] uppercase font-mono">
                  GOOGLE WORKSPACE
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-800">
                  {reportData.periodName}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tight font-['Space_Grotesk',sans-serif]">
                EKSPOR KE GOOGLE SLIDES
              </h3>
            </div>
          </div>
          <button
            id="btn-close-google-slides-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-900 flex items-center justify-center border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#0f172a] cursor-pointer transition-transform hover:scale-105"
            title="Tutup Modal"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          {/* Status / Error Banner */}
          {exportError && (
            <div className="neo-card bg-rose-50 border-2 border-rose-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[2px_2px_0px_0px_#991b1b]">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-700 stroke-[2.5] shrink-0 mt-0.5" />
                <div className="text-xs text-rose-950">
                  <span className="font-black block uppercase font-mono">Pemberitahuan:</span>
                  <span className="font-semibold">{exportError}</span>
                  <p className="text-[11px] text-rose-700 mt-1 font-medium">
                    Anda juga dapat mengunduh presentasi .PPTX secara langsung atau mencoba masuk ulang dengan akun Google.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={handleExportToGoogleSlides}
                  disabled={isExporting}
                  className="neo-btn bg-white hover:bg-slate-100 text-slate-900 text-xs px-3 py-1.5 font-black border border-slate-900"
                >
                  <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${isExporting ? 'animate-spin' : ''}`} />
                  <span>Coba Lagi</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPptx}
                  disabled={isExporting}
                  className="neo-btn bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs px-3 py-1.5 font-black border border-slate-900"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Unduh .PPTX</span>
                </button>
              </div>
            </div>
          )}

          {/* Success Banner when Presentation is Created */}
          {createdPresentation && (
            <div className="neo-card bg-emerald-100 border-3 border-emerald-900 p-4 shadow-[4px_4px_0px_0px_#065f46] animate-bounce-short">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]">
                    <CheckCircle2 className="w-6 h-6 stroke-[3]" />
                  </div>
                  <div>
                    <span className="neo-stamp bg-emerald-700 text-white text-[9px] uppercase font-mono">
                      BERHASIL DIBUAT DI GOOGLE DRIVE
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                      {createdPresentation.title}
                    </h4>
                    <p className="text-xs text-slate-600 font-bold">
                      Slide rangkuman komprehensif telah tersimpan di akun Google Anda.
                    </p>
                  </div>
                </div>

                <a
                  id="link-open-google-slides-doc"
                  href={createdPresentation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neo-btn bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 text-xs font-black border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5"
                >
                  <Presentation className="w-4 h-4 stroke-[2.5]" />
                  <span>BUKA DI GOOGLE SLIDES</span>
                  <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                </a>
              </div>
            </div>
          )}

          {/* Google Auth Status Bar */}
          <div className="neo-card bg-white p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 border-slate-900">
            {currentUser ? (
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-9 h-9 rounded-full border-2 border-slate-900 shadow-[1px_1px_0px_0px_#0f172a]"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center border-2 border-slate-900">
                    {currentUser.displayName ? currentUser.displayName[0] : 'G'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="neo-stamp bg-emerald-600 text-white text-[8px] uppercase font-mono">
                      TERHUBUNG KE GOOGLE
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      {currentUser.displayName || 'Akun Google'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-600 font-mono font-bold block">
                    {currentUser.email}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center border-2 border-slate-900">
                  <Presentation className="w-4 h-4 text-slate-700 stroke-[2.5]" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900">
                    Akun Google Belum Terhubung
                  </h5>
                  <p className="text-[11px] text-slate-600 font-bold">
                    Masuk dengan Google agar dapat menyimpan presentasi langsung ke Google Slides Anda.
                  </p>
                </div>
              </div>
            )}

            <div>
              {currentUser ? (
                <button
                  id="btn-google-signout"
                  onClick={handleLogout}
                  className="neo-btn bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold px-3 py-1.5 border border-slate-900 flex items-center gap-1.5"
                >
                  <LogOut className="w-3 h-3 stroke-[2.5]" />
                  <span>Ganti Akun</span>
                </button>
              ) : (
                <button
                  id="btn-google-signin"
                  onClick={handleSignIn}
                  disabled={isAuthenticating}
                  className="neo-btn bg-white hover:bg-slate-50 text-slate-900 text-xs font-black px-4 py-2 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] flex items-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5"
                >
                  {/* Official Google G Logo */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isAuthenticating ? 'Menghubungkan...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Slide Preview Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900 uppercase font-mono">
                  PRATINJAU STRUKTUR SLIDE:
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-200 p-1 rounded border-2 border-slate-900">
                <button
                  id="tab-preview-slide1"
                  onClick={() => setActivePreviewTab('page1')}
                  className={`px-3 py-1 text-xs font-black rounded transition-all cursor-pointer ${
                    activePreviewTab === 'page1'
                      ? 'bg-blue-600 text-white shadow-[1px_1px_0px_0px_#0f172a]'
                      : 'text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Page 1 (Dashboard)
                </button>
                <button
                  id="tab-preview-slide2"
                  onClick={() => setActivePreviewTab('page2')}
                  className={`px-3 py-1 text-xs font-black rounded transition-all cursor-pointer ${
                    activePreviewTab === 'page2'
                      ? 'bg-blue-600 text-white shadow-[1px_1px_0px_0px_#0f172a]'
                      : 'text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Page 2 (Tabel Data & Rekap)
                </button>
              </div>
            </div>

            {/* Slide 1 Preview Container */}
            {activePreviewTab === 'page1' && (
              <div className="neo-card bg-slate-900 p-4 text-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] rounded-none">
                <div className="bg-slate-50 text-slate-900 p-4 border-2 border-slate-900">
                  {/* Slide Top Banner */}
                  <div className="bg-slate-900 text-white p-3 border border-slate-900 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black tracking-wide font-['Space_Grotesk',sans-serif]">
                        {reportData.title.toUpperCase()}
                      </h4>
                      <p className="text-[10px] text-blue-200 font-mono">
                        UNIT: {reportData.poolName.toUpperCase()} | PERIODE: {reportData.periodName.toUpperCase()}
                      </p>
                    </div>
                    <span className="neo-stamp bg-amber-400 text-slate-950 text-[8px] font-bold">
                      SLIDE 1
                    </span>
                  </div>

                  {/* 5 Mini KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-2.5">
                    <div className="bg-yellow-200 border border-slate-900 p-2 shadow-[1px_1px_0px_0px_#0f172a]">
                      <span className="text-[8px] font-mono font-bold text-slate-700 block uppercase">AVG JALUR / HARI</span>
                      <span className="text-xs font-black text-slate-900">{reportData.summary.avgJalur} Jalur</span>
                    </div>
                    <div className="bg-cyan-200 border border-slate-900 p-2 shadow-[1px_1px_0px_0px_#0f172a]">
                      <span className="text-[8px] font-mono font-bold text-slate-700 block uppercase">AVG BOBOT / HARI</span>
                      <span className="text-xs font-black text-slate-900">{reportData.summary.avgBobot}</span>
                    </div>
                    <div className="bg-emerald-200 border border-slate-900 p-2 shadow-[1px_1px_0px_0px_#0f172a]">
                      <span className="text-[8px] font-mono font-bold text-slate-700 block uppercase">CLEARANCE BOBOT</span>
                      <span className="text-xs font-black text-slate-900">{reportData.summary.clearanceRate}%</span>
                    </div>
                    <div className="bg-orange-200 border border-slate-900 p-2 shadow-[1px_1px_0px_0px_#0f172a]">
                      <span className="text-[8px] font-mono font-bold text-slate-700 block uppercase">PENDING / CANCEL</span>
                      <span className="text-xs font-black text-slate-900">{reportData.summary.totalPending} / {reportData.summary.totalCancel} DO</span>
                    </div>
                    <div className="bg-purple-200 border border-slate-900 p-2 shadow-[1px_1px_0px_0px_#0f172a]">
                      <span className="text-[8px] font-mono font-bold text-slate-700 block uppercase">ACHIEVEMENT DO</span>
                      <span className="text-xs font-black text-slate-900">{reportData.summary.achievementRate}%</span>
                    </div>
                  </div>

                  {/* EXACT MANDATORY NARRATIVE TEXT BOX */}
                  <div className="bg-blue-50 border-2 border-blue-600 p-2.5 my-2.5 shadow-[2px_2px_0px_0px_#1d4ed8]">
                    <span className="text-[9px] font-black uppercase text-blue-800 font-mono block">
                      RANGKUMAN EKSEKUTIF OPERASIONAL:
                    </span>
                    <p className="text-xs font-black text-slate-950 mt-0.5 font-['Space_Grotesk',sans-serif]">
                      "{reportData.summary.narrativeText}"
                    </p>
                  </div>

                  {/* Two Charts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2.5">
                    <div className="bg-white border-2 border-slate-900 p-2.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                        <span className="text-[10px] font-black uppercase text-slate-900">
                          Chart Trend Jalur & Produktivitas
                        </span>
                      </div>
                      <div className="h-32 bg-slate-100 border border-slate-300 flex items-center justify-center p-1 text-center">
                        <span className="text-[10px] font-bold text-slate-600 font-mono">
                          [Grafik Batang Total Jalur, Total Team & Garis Produktivitas sesuai range {reportData.periodName}]
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border-2 border-slate-900 p-2.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
                        <span className="text-[10px] font-black uppercase text-slate-900">
                          Chart Clearance (Bobot Masuk vs Finish)
                        </span>
                      </div>
                      <div className="h-32 bg-slate-100 border border-slate-300 flex items-center justify-center p-1 text-center">
                        <span className="text-[10px] font-bold text-slate-600 font-mono">
                          [Grafik Perbandingan Bobot Masuk ({reportData.summary.totalBobotMasuk.toLocaleString('id-ID')}) vs Bobot Finish ({reportData.summary.totalBobotFinish.toLocaleString('id-ID')})]
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 2 Preview Container */}
            {activePreviewTab === 'page2' && (
              <div className="neo-card bg-slate-900 p-4 text-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] rounded-none">
                <div className="bg-slate-50 text-slate-900 p-4 border-2 border-slate-900">
                  <div className="bg-slate-900 text-white p-3 border border-slate-900 flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black tracking-wide">
                        TABEL RINCIAN PERFORMA OPERASIONAL & BARIS REKAP TOTAL
                      </h4>
                      <p className="text-[10px] text-blue-200 font-mono">
                        {reportData.records.length} Hari Catatan Operasional • Termasuk Baris Akumulasi Total
                      </p>
                    </div>
                    <span className="neo-stamp bg-amber-400 text-slate-950 text-[8px] font-bold">
                      SLIDE 2
                    </span>
                  </div>

                  {/* Sample Table Preview */}
                  <div className="overflow-x-auto border border-slate-300">
                    <table className="w-full text-[9px] text-center">
                      <thead className="bg-blue-600 text-white font-bold">
                        <tr>
                          <th className="p-1">Tgl</th>
                          <th className="p-1">Jalur</th>
                          <th className="p-1">Team</th>
                          <th className="p-1">Prod</th>
                          <th className="p-1">Bobot Masuk</th>
                          <th className="p-1">Bobot Finish</th>
                          <th className="p-1">Clearance</th>
                          <th className="p-1">Pending</th>
                          <th className="p-1">Cancel</th>
                          <th className="p-1">Achv %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono">
                        {reportData.records.slice(0, 7).map((r, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="p-1 font-bold">{r.tanggal || `Tgl ${r.dayNumber}`}</td>
                            <td className="p-1">{r.totalJalur}</td>
                            <td className="p-1">{r.totalTeam}</td>
                            <td className="p-1">{r.totalTeam > 0 ? (r.totalJalur / r.totalTeam).toFixed(1) : '-'}</td>
                            <td className="p-1">{r.bobotMasuk.toLocaleString('id-ID')}</td>
                            <td className="p-1">{r.bobotFinish.toLocaleString('id-ID')}</td>
                            <td className="p-1 font-bold text-emerald-700">
                              {r.bobotMasuk > 0 ? `${Math.round((r.bobotFinish / r.bobotMasuk) * 100)}%` : '-'}
                            </td>
                            <td className="p-1 text-amber-700">{r.totalPending} DO</td>
                            <td className="p-1 text-rose-700">{r.cancel} DO</td>
                            <td className="p-1 font-bold">{r.achv || `${r.achievementRate}%`}</td>
                          </tr>
                        ))}
                        {/* Highlighted Total / Rekap row */}
                        <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-900">
                          <td className="p-1 text-amber-300">TOTAL / REKAP</td>
                          <td className="p-1">{reportData.records.reduce((acc, r) => acc + (r.totalJalur || 0), 0)}</td>
                          <td className="p-1">{reportData.records.reduce((acc, r) => acc + (r.totalTeam || 0), 0)}</td>
                          <td className="p-1">{reportData.summary.avgJalur} avg</td>
                          <td className="p-1">{reportData.summary.totalBobotMasuk.toLocaleString('id-ID')}</td>
                          <td className="p-1">{reportData.summary.totalBobotFinish.toLocaleString('id-ID')}</td>
                          <td className="p-1 text-emerald-300">{reportData.summary.clearanceRate}%</td>
                          <td className="p-1 text-rose-300">{reportData.summary.totalPending} DO</td>
                          <td className="p-1 text-rose-300">{reportData.summary.totalCancel} DO</td>
                          <td className="p-1 text-amber-300">{reportData.summary.achievementRate}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-2 text-center">
                    Sistem Monitoring DO Pool Singkawang • Data Terintegrasi Otomatis dari Spreadsheet Operasional
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-5 py-3.5 bg-white border-t-2.5 border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-600 font-bold">
            Format: Widescreen 16:9 • Termasuk 2 Visual Chart & Ringkasan Naratif Otomatis
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Download PPTX compatible file */}
            <button
              id="btn-download-pptx-file"
              type="button"
              onClick={handleDownloadPptx}
              disabled={isExporting}
              className="neo-btn bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 border border-slate-900 flex items-center gap-1.5 cursor-pointer"
              title="Unduh file presentasi .pptx yang dapat dibuka di Google Slides atau PowerPoint"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Unduh File (.pptx)</span>
            </button>

            {/* Primary Google Slides Live Export Button */}
            <button
              id="btn-confirm-export-google-slides"
              type="button"
              onClick={handleExportToGoogleSlides}
              disabled={isExporting || isAuthenticating}
              className="neo-btn bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-4 py-2 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] flex items-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 stroke-[2.5] animate-spin" />
                  <span>MENGUNGGAH KE GOOGLE DRIVE...</span>
                </>
              ) : (
                <>
                  <Presentation className="w-4 h-4 stroke-[2.5] text-slate-900" />
                  <span>EKSPOR KE GOOGLE SLIDES</span>
                  <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
