import React, { useEffect, useState } from 'react';
import { StatusChangeNotification } from '../types';
import { ArrowRight, Check, Copy, FileSpreadsheet, RefreshCw, Sparkles, X, Zap } from 'lucide-react';

interface LiveToastNotificationProps {
  notification: StatusChangeNotification | null;
  onDismiss: () => void;
  onViewDo?: (noDo: string, sheetName: string) => void;
}

export const LiveToastNotification: React.FC<LiveToastNotificationProps> = ({
  notification,
  onDismiss,
  onViewDo,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!notification) return;
    // Auto-dismiss after 10 seconds for diffs, 7s for standard
    const dismissDuration = notification.type === 'spreadsheet_change' ? 10000 : 7000;
    const timer = setTimeout(() => {
      onDismiss();
    }, dismissDuration);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const handleCopy = () => {
    if (notification.noDo) {
      navigator.clipboard.writeText(notification.noDo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes('FINISH')) return 'bg-emerald-400 text-slate-950 border-slate-900';
    if (s.includes('CANCEL')) return 'bg-rose-400 text-slate-950 border-slate-900';
    if (s.includes('OPEN')) return 'bg-blue-300 text-slate-950 border-slate-900';
    if (s.includes('CLOSE')) return 'bg-slate-300 text-slate-950 border-slate-900';
    return 'bg-amber-300 text-slate-950 border-slate-900';
  };

  const timeFormatted = (() => {
    try {
      return new Date(notification.timestamp).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return 'Baru saja';
    }
  })();

  const isSpreadsheetChange =
    notification.type === 'spreadsheet_change' ||
    (notification.changes && notification.changes.length > 0);
  const isSyncSuccess = notification.type === 'sync_success';

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] transition-all animate-bounce-short"
    >
      <div
        className={`border-3 border-slate-900 rounded-xl p-4 shadow-[6px_6px_0px_0px_#0f172a] text-slate-900 relative ${
          isSpreadsheetChange
            ? 'bg-amber-100'
            : isSyncSuccess
            ? 'bg-emerald-100'
            : 'bg-amber-100'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b-2 border-slate-900">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-md border border-slate-900 text-white flex items-center justify-center ${
                isSyncSuccess ? 'bg-emerald-600' : 'bg-blue-600'
              }`}
            >
              {isSyncSuccess ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : isSpreadsheetChange ? (
                <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <Zap className="w-3.5 h-3.5 fill-white stroke-[2.5]" />
              )}
            </span>
            <span className="neo-stamp bg-slate-900 text-amber-300 text-[10px] font-mono uppercase tracking-wider">
              {isSyncSuccess
                ? 'SYNC COMPLETE'
                : isSpreadsheetChange
                ? 'SPREADSHEET UPDATED'
                : 'LIVE WS UPDATE'}
            </span>
            <span className="text-[11px] font-mono text-slate-600 font-bold">
              {timeFormatted}
            </span>
          </div>

          <button
            onClick={onDismiss}
            className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 border-1.5 border-slate-900 flex items-center justify-center text-slate-900 font-black text-xs transition-colors cursor-pointer"
            title="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

        {/* 1. SPREADSHEET CHANGE VARIANT */}
        {isSpreadsheetChange && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-950 uppercase tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                {notification.title || 'Perubahan Data Terdeteksi'}
              </span>
              {notification.durationMs && (
                <span className="neo-pill text-[9px] bg-white border-slate-900 font-mono font-bold">
                  ⚡ {notification.durationMs}ms
                </span>
              )}
            </div>

            <div className="bg-white border-2 border-slate-900 rounded-lg p-3 shadow-[2px_2px_0px_0px_#0f172a] space-y-1.5">
              <div className="text-[11px] font-mono font-black text-slate-700 uppercase">
                Rincian Perubahan Google Sheets:
              </div>
              <ul className="space-y-1 text-xs">
                {(notification.changes || []).slice(0, 5).map((change, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-slate-900 font-semibold leading-tight">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>{change}</span>
                  </li>
                ))}
                {(notification.changes?.length || 0) > 5 && (
                  <li className="text-[10px] font-mono font-bold text-slate-500 italic pl-3">
                    +{(notification.changes?.length || 0) - 5} perubahan lainnya
                  </li>
                )}
              </ul>
            </div>

            {/* Quick Metrics Bar if available */}
            {notification.stats && (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="neo-pill text-[10px] bg-white border-slate-900 font-bold">
                  Total DO: <strong>{notification.stats.totalDo?.toLocaleString()}</strong>
                </span>
                <span className="neo-pill text-[10px] bg-amber-200 border-slate-900 font-bold">
                  Pending: <strong>{notification.stats.totalPending}</strong>
                </span>
                <span className="neo-pill text-[10px] bg-blue-200 border-slate-900 font-bold">
                  LKPB: <strong>{notification.stats.totalLkpb}</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {/* 2. SYNC SUCCESS CONFIRMATION VARIANT */}
        {isSyncSuccess && (
          <div className="space-y-2.5">
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-950 uppercase tracking-tight flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                {notification.title || 'Sinkronisasi Selesai'}
              </h4>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                {notification.message || 'Data telah sinkron 100% dengan Google Spreadsheet.'}
              </p>
            </div>

            {/* Metric Chips */}
            {notification.stats && (
              <div className="bg-white border-2 border-slate-900 rounded-lg p-2.5 shadow-[2px_2px_0px_0px_#0f172a] grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 border border-slate-300 rounded p-1">
                  <div className="text-[9px] font-mono text-slate-500 font-bold">TOTAL DO</div>
                  <div className="text-xs font-black text-slate-950 font-mono">
                    {notification.stats.totalDo?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-300 rounded p-1">
                  <div className="text-[9px] font-mono text-amber-800 font-bold">PENDING</div>
                  <div className="text-xs font-black text-amber-950 font-mono">
                    {notification.stats.totalPending ?? '0'}
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-300 rounded p-1">
                  <div className="text-[9px] font-mono text-blue-800 font-bold">LKPB</div>
                  <div className="text-xs font-black text-blue-950 font-mono">
                    {notification.stats.totalLkpb ?? '0'}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 pt-1">
              <span>Status: <strong className="text-emerald-800">Sinkron & Aktif</strong></span>
              {notification.durationMs && (
                <span>Kecepatan: <strong>{notification.durationMs}ms</strong></span>
              )}
            </div>
          </div>
        )}

        {/* 3. DO STATUS CHANGE VARIANT (DEFAULT / WEBSOCKET) */}
        {!isSpreadsheetChange && !isSyncSuccess && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase font-mono text-slate-700">
                Perubahan Status DO:
              </span>
              <span className="neo-pill text-[10px] bg-white border-slate-900 font-mono">
                Lokasi: <strong className="font-extrabold text-blue-700 ml-1">{notification.sheetName}</strong>
              </span>
            </div>

            <div className="flex items-center justify-between bg-white border-2 border-slate-900 rounded-lg p-2.5 shadow-[2px_2px_0px_0px_#0f172a]">
              <div>
                <div className="text-[10px] text-slate-500 font-mono font-bold uppercase">NO DELIVERY ORDER</div>
                <div className="font-mono text-sm sm:text-base font-black text-slate-950 tracking-wider">
                  {notification.noDo}
                </div>
              </div>
              <button
                onClick={handleCopy}
                className="neo-btn px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-900 cursor-pointer"
                title="Salin No DO"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            {/* Transition Pill: Status A -> Status B */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-slate-50 rounded-lg border-2 border-slate-900">
                <span className={`neo-pill text-[11px] font-extrabold ${getStatusColor(notification.oldStatus)}`}>
                  {notification.oldStatus || 'NONE'}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-900 stroke-[3]" />
                <span className={`neo-pill text-[11px] font-black ${getStatusColor(notification.newStatus)}`}>
                  {notification.newStatus}
                </span>
              </div>
            </div>

            {notification.teamName && (
              <div className="text-[11px] font-bold text-slate-700">
                Tim Jalur: <span className="font-extrabold text-slate-950">{notification.teamName}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Bar Footer */}
        <div className="mt-3 pt-2.5 border-t-2 border-slate-900 flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-slate-600">
            {notification.isAutoSync ? '⚡ Auto-sync aktif' : 'Google Sheets Live'}
          </span>
          <div className="flex items-center gap-1.5">
            {notification.noDo && notification.sheetName && onViewDo && (
              <button
                onClick={() => {
                  onViewDo(notification.noDo, notification.sheetName);
                  onDismiss();
                }}
                className="neo-btn neo-btn-primary px-3 py-1 text-[11px] font-black cursor-pointer"
              >
                LIHAT DO
              </button>
            )}
            <button
              onClick={onDismiss}
              className="neo-btn bg-white hover:bg-slate-100 text-slate-900 px-3 py-1 text-[11px] font-black cursor-pointer"
            >
              OKE
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

