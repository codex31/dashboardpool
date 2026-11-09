import React from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  Layers, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  ArrowRight,
  TrendingUp,
  MapPin,
  XCircle,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { DailyRecord, CancelledDoItem } from '../types';
import { DEFAULT_SEPTEMBER_CANCELED_DOS, getCanceledDosForDate } from '../data/defaultCanceledDos';

interface DateDetailModalProps {
  record: DailyRecord | null;
  canceledDos?: CancelledDoItem[];
  onClose: () => void;
}

export const DateDetailModal: React.FC<DateDetailModalProps> = ({ 
  record, 
  canceledDos = DEFAULT_SEPTEMBER_CANCELED_DOS,
  onClose 
}) => {
  if (!record) return null;

  // Retrieve canceled DOs for this date
  const dateCanceledList = (record.canceledDos && record.canceledDos.length > 0)
    ? record.canceledDos
    : getCanceledDosForDate(canceledDos, record.tanggal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="modal-date-detail"
        className="neo-card bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 relative shadow-[8px_8px_0px_0px_#0f172a]"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b-2.5 border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-md bg-blue-600 text-white border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]">
              <Calendar className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="neo-pill bg-blue-100 text-blue-950 border-slate-900 text-xs font-black flex items-center gap-1">
                  <MapPin className="w-3 h-3 stroke-[2.5]" />
                  {record.poolName}
                </span>
                <span className={`neo-pill text-xs font-black ${
                  record.hasData 
                    ? 'bg-emerald-200 text-emerald-950 border-slate-900' 
                    : 'bg-slate-200 text-slate-700 border-slate-900'
                }`}>
                  {record.hasData ? `ACHV: ${record.achv || '100%'}` : 'TIDAK ADA AKTIVITAS'}
                </span>
                {record.hasData && (
                  <span className={`neo-pill text-xs font-black ${
                    record.cancel > 0
                      ? 'bg-rose-300 text-rose-950 border-slate-900'
                      : record.totalPending > 0
                      ? 'bg-amber-200 text-amber-950 border-slate-900'
                      : record.completionRate === 0
                      ? 'bg-blue-100 text-blue-950 border-slate-900 font-black'
                      : 'bg-emerald-200 text-emerald-950 border-slate-900'
                  }`}>
                    {record.cancel > 0
                      ? 'STATUS: ADA CANCEL'
                      : record.totalPending > 0
                      ? 'STATUS: PENDING'
                      : record.completionRate === 0
                      ? 'STATUS: OPEN'
                      : 'STATUS: CLEAR'}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1 font-['Space_Grotesk',sans-serif]">
                DETAIL TANGGAL: {record.tanggal.toUpperCase()}
              </h2>
            </div>
          </div>
          <button
            id="btn-close-date-modal"
            onClick={onClose}
            className="w-9 h-9 rounded bg-white hover:bg-rose-100 text-slate-900 hover:text-rose-900 border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a] transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5">
          {/* Main Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="neo-card p-3.5 bg-blue-50">
              <span className="text-[10px] font-black text-blue-900 uppercase font-mono block">TOTAL JALUR</span>
              <div className="text-3xl font-black text-slate-900 mt-1 font-['Space_Grotesk',sans-serif]">{record.totalJalur}</div>
              <span className="text-[11px] font-bold text-slate-600">Jalur order</span>
            </div>
            <div className="neo-card p-3.5 bg-indigo-50">
              <span className="text-[10px] font-black text-indigo-900 uppercase font-mono block">TOTAL TEAM</span>
              <div className="text-3xl font-black text-slate-900 mt-1 font-['Space_Grotesk',sans-serif]">{record.totalTeam}</div>
              <span className="text-[11px] font-bold text-slate-600">Prod: {record.prod}</span>
            </div>
            <div className="neo-card p-3.5 bg-emerald-50">
              <span className="text-[10px] font-black text-emerald-900 uppercase font-mono block">BOBOT SELESAI</span>
              <div className="text-3xl font-black text-emerald-800 mt-1 font-['Space_Grotesk',sans-serif]">
                {record.bobotFinish} <span className="text-xs font-bold text-slate-500 font-mono">/ {record.bobotMasuk}</span>
              </div>
              <span className="text-[11px] text-emerald-800 font-black">
                Clearance: {record.completionRate}%
              </span>
            </div>
            <div className="neo-card p-3.5 bg-teal-50">
              <span className="text-[10px] font-black text-teal-900 uppercase font-mono block">INSTALASI REAL</span>
              <div className="text-3xl font-black text-teal-900 mt-1 font-['Space_Grotesk',sans-serif]">
                {record.realisasi} <span className="text-xs font-bold text-slate-500 font-mono">/ {record.target} Tgt</span>
              </div>
              <span className="text-[11px] text-teal-800 font-black block font-mono">
                Tercapai: {record.achv || `${record.achievementRate}%`}
              </span>
              <span className="text-[9px] text-teal-700 block font-medium mt-0.5 font-mono">
                Realisasi = Target Open - Pending - LKPB - Cancel
              </span>
            </div>
          </div>

          {/* Pending Details Card */}
          <div className="neo-card p-4 bg-amber-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-900 stroke-[2.5]" />
                <h3 className="text-sm font-black text-slate-900 font-['Space_Grotesk',sans-serif]">RINCIAN PENDING ORDER</h3>
              </div>
              <span className="neo-pill bg-amber-200 text-amber-950 border-slate-900 font-black text-xs">
                TOTAL: {record.totalPending}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="neo-card p-2 bg-white">
                <span className="text-slate-600 block text-[10px] font-mono font-bold">Reschedule</span>
                <span className="font-black text-slate-900 text-lg">{record.pendingResch}</span>
              </div>
              <div className="neo-card p-2 bg-white">
                <span className="text-slate-600 block text-[10px] font-mono font-bold">Rumah Kosong</span>
                <span className="font-black text-slate-900 text-lg">{record.rusong}</span>
              </div>
              <div className="neo-card p-2 bg-white">
                <span className="text-slate-600 block text-[10px] font-mono font-bold">Tunggu Komp</span>
                <span className="font-black text-slate-900 text-lg">{record.tungkom}</span>
              </div>
              <div className="neo-card p-2 bg-white">
                <span className="text-slate-600 block text-[10px] font-mono font-bold">Kendala Brg</span>
                <span className="font-black text-slate-900 text-lg">{record.brg}</span>
              </div>
              <div className="neo-card p-2 bg-white">
                <span className="text-slate-600 block text-[10px] font-mono font-bold">Kendala Inst</span>
                <span className="font-black text-slate-900 text-lg">{record.inst}</span>
              </div>
            </div>
          </div>

          {/* LKPB, Status & Cancel Card */}
          <div className="neo-card p-4 bg-slate-50">
            <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2 font-['Space_Grotesk',sans-serif]">
              <FileText className="w-5 h-5 text-blue-700 stroke-[2.5]" />
              STATUS TINDAK LANJUT & LKPB
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
              <div className="neo-card p-2.5 bg-white">
                <span className="text-slate-600 block text-[10px] font-mono font-bold">Open</span>
                <span className="font-black text-slate-900 text-lg">{record.open}</span>
              </div>
              <div className="neo-card p-2.5 bg-white">
                <span className="text-slate-600 block text-[10px] font-mono font-bold">Lanjut Install</span>
                <span className="font-black text-blue-800 text-lg">{record.lanjutInstall}</span>
              </div>
              <div className="neo-card p-2.5 bg-rose-100">
                <span className="text-rose-900 block text-[10px] font-mono font-black">Cancel</span>
                <span className="font-black text-rose-700 text-lg">{record.cancel}</span>
              </div>
              <div className="neo-card p-2.5 bg-blue-100">
                <span className="text-blue-900 block text-[10px] font-mono font-black">LKPB</span>
                <span className="font-black text-blue-900 text-lg">{record.lkpb}</span>
              </div>
            </div>
          </div>

          {/* DO Cancel Detail Section */}
          <div className="neo-card p-4 bg-white border-2 border-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-md border-2 border-slate-900 flex items-center justify-center ${
                  dateCanceledList.length > 0 ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {dateCanceledList.length > 0 ? (
                    <XCircle className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase font-['Space_Grotesk',sans-serif]">
                    DO CANCEL PADA TANGGAL {record.tanggal.toUpperCase()}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-600">
                    Rincian nomor DO dan teknisi/tim terkait pembatalan
                  </p>
                </div>
              </div>

              <div>
                {dateCanceledList.length > 0 ? (
                  <span className="neo-pill bg-rose-200 text-rose-950 border-slate-900 font-black text-xs">
                    {dateCanceledList.length} DO CANCEL
                  </span>
                ) : (
                  <span className="neo-pill bg-emerald-200 text-emerald-950 border-slate-900 font-black text-xs flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    0 CANCEL (100% CLEAR)
                  </span>
                )}
              </div>
            </div>

            {dateCanceledList.length > 0 ? (
              <div className="space-y-2.5">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-rose-50 text-slate-900 border-b-2 border-slate-900 font-black uppercase text-[10px]">
                        <th className="py-2 px-2.5 border-r border-slate-900/10">No. DO</th>
                        <th className="py-2 px-2.5 border-r border-slate-900/10">Tim yang Jalur</th>
                        <th className="py-2 px-2.5 border-r border-slate-900/10">Kategori</th>
                        <th className="py-2 px-2.5 text-right border-r border-slate-900/10">Bobot</th>
                        <th className="py-2 px-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {dateCanceledList.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-rose-50/50">
                          <td className="py-2.5 px-2.5 font-mono font-black text-slate-900 border-r border-slate-100">
                            {item.noDo}
                          </td>
                          <td className="py-2.5 px-2.5 font-bold text-slate-800 border-r border-slate-100">
                            {item.teamName}
                          </td>
                          <td className="py-2.5 px-2.5 font-bold text-slate-600 border-r border-slate-100">
                            <span className="neo-pill bg-slate-100 text-slate-800 border-slate-400 text-[10px]">
                              {item.kategori || 'REGULER'}
                            </span>
                          </td>
                          <td className="py-2.5 px-2.5 text-right font-black text-slate-900 border-r border-slate-100">
                            {item.bobot} Bobot
                          </td>
                          <td className="py-2.5 px-2.5 text-center">
                            <span className="neo-pill bg-rose-200 text-rose-950 border-slate-900 font-black text-[10px]">
                              CANCEL
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 rounded border-2 border-emerald-300 text-emerald-950 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
                <div className="text-xs font-bold leading-relaxed">
                  Tidak ada DO Cancel pada tanggal <strong>{record.tanggal}</strong> (0 Order dibatalkan). Seluruh order berjalan tanpa catatan cancel.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t-2.5 border-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="neo-btn neo-btn-white text-xs px-5 py-2"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};
