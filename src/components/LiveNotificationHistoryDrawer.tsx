import React, { useState } from 'react';
import { StatusChangeNotification } from '../types';
import { ConnectionStatus } from '../services/liveSyncService';
import { 
  ArrowRight, 
  Bell, 
  Check, 
  CheckCheck,
  Copy, 
  History, 
  Radio, 
  RefreshCw, 
  Sparkles, 
  Volume2, 
  X, 
  Zap 
} from 'lucide-react';
import { playNotificationSound } from '../services/liveSyncService';

interface LiveNotificationHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: StatusChangeNotification[];
  connectionStatus: ConnectionStatus;
  lastHeartbeat: string;
  onTriggerPoll: () => void;
  onSimulateUpdate: (noDo?: string, oldStatus?: string, newStatus?: string, sheetName?: string) => void;
  onViewDo?: (noDo: string, sheetName: string) => void;
  onClearAllNotifications?: () => void;
}

export const LiveNotificationHistoryDrawer: React.FC<LiveNotificationHistoryDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  connectionStatus,
  lastHeartbeat,
  onTriggerPoll,
  onSimulateUpdate,
  onViewDo,
  onClearAllNotifications,
}) => {
  const [testDo, setTestDo] = useState('5A.XH.000058');
  const [testOld, setTestOld] = useState('Finish');
  const [testNew, setTestNew] = useState('Brg (Pending)');
  const [testSheet, setTestSheet] = useState('tgl 15');
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setIsSimulating(true);
    await onSimulateUpdate(testDo, testOld, testNew, testSheet);
    setTimeout(() => setIsSimulating(false), 500);
  };

  const getStatusBadgeColor = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes('FINISH')) return 'bg-emerald-300 text-slate-950 border-slate-900';
    if (s.includes('CANCEL')) return 'bg-rose-300 text-slate-950 border-slate-900';
    if (s.includes('OPEN')) return 'bg-blue-300 text-slate-950 border-slate-900';
    if (s.includes('CLOSE')) return 'bg-slate-300 text-slate-950 border-slate-900';
    return 'bg-amber-300 text-slate-950 border-slate-900';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white border-l-3 border-slate-900 w-full max-w-md h-full flex flex-col shadow-[-8px_0px_0px_0px_#0f172a] overflow-hidden">
        {/* Drawer Header */}
        <div className="bg-blue-600 text-white p-4 sm:p-5 border-b-3 border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-400 border-2 border-slate-900 text-slate-950 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]">
              <Zap className="w-5 h-5 fill-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="neo-stamp bg-slate-950 text-amber-300 text-[10px] font-mono">
                  REAL-TIME ENGINE
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black border border-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-950 animate-ping" />
                  LIVE WS
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5 font-['Space_Grotesk',sans-serif]">
                Aktivitas Live & Notifikasi
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 border-2 border-slate-900 flex items-center justify-center text-slate-900 font-black shadow-[2px_2px_0px_0px_#0f172a]"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Live Status Bar */}
        <div className="bg-slate-100 border-b-2 border-slate-900 p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-600 font-bold">Status:</span>
            <span
              className={`neo-pill text-[10px] font-black ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-300 text-slate-950 border-slate-900'
                  : 'bg-rose-300 text-slate-950 border-slate-900'
              }`}
            >
              {connectionStatus === 'connected' ? '● TERHUBUNG' : '○ RECONNECTING...'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => playNotificationSound()}
              className="neo-btn px-2 py-1 text-[10px] bg-white border-slate-900 text-slate-800"
              title="Tes Bunyi Notifikasi"
            >
              <Volume2 className="w-3 h-3" />
            </button>
            <button
              onClick={onTriggerPoll}
              className="neo-btn px-2.5 py-1 text-[10px] bg-white hover:bg-slate-100 border-slate-900 text-slate-900 font-bold gap-1"
              title="Sinkronkan ulang sekarang"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Test Simulator Widget */}
        <div className="bg-amber-100 border-b-2 border-slate-900 p-3.5 text-xs text-slate-900 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono font-extrabold uppercase text-[11px] text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              Simulasi Live Update (Uji Toast)
            </span>
            <span className="text-[10px] font-mono text-slate-600">Simulasi WebSocket</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-600">No. DO</label>
              <input
                type="text"
                value={testDo}
                onChange={(e) => setTestDo(e.target.value)}
                className="w-full mt-0.5 px-2 py-1 bg-white border-2 border-slate-900 rounded font-mono font-bold text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-600">Sheet Tanggal</label>
              <input
                type="text"
                value={testSheet}
                onChange={(e) => setTestSheet(e.target.value)}
                className="w-full mt-0.5 px-2 py-1 bg-white border-2 border-slate-900 rounded font-mono font-bold text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-600">Status Lama</label>
              <select
                value={testOld}
                onChange={(e) => setTestOld(e.target.value)}
                className="w-full mt-0.5 px-2 py-1 bg-white border-2 border-slate-900 rounded font-bold text-xs"
              >
                <option value="Open">Open</option>
                <option value="Finish">Finish</option>
                <option value="Close">Close</option>
                <option value="LKPB">LKPB</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-600">Status Baru</label>
              <select
                value={testNew}
                onChange={(e) => setTestNew(e.target.value)}
                className="w-full mt-0.5 px-2 py-1 bg-white border-2 border-slate-900 rounded font-bold text-xs"
              >
                <option value="Brg (Pending)">Brg (Pending)</option>
                <option value="Resch (Pending)">Resch (Pending)</option>
                <option value="Rusong (Pending)">Rusong (Pending)</option>
                <option value="Finish">Finish</option>
                <option value="Cancel">Cancel</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="w-full neo-btn neo-btn-primary py-1.5 text-xs font-black justify-center shadow-[2px_2px_0px_0px_#0f172a]"
          >
            {isSimulating ? 'Mengirim Sinyal...' : '🚀 KIRIM SIMULASI UPDATE STATUS DO'}
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 neo-scrollbar">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-600 pb-1 border-b border-slate-200">
            <span>RIWAYAT UPDATE SESI INI ({notifications.length})</span>
            {notifications.length > 0 && onClearAllNotifications && (
              <button
                id="btn-mark-all-read-drawer"
                onClick={onClearAllNotifications}
                className="neo-btn bg-rose-100 hover:bg-rose-200 text-rose-950 text-xs px-2.5 py-1 font-black border-slate-900 flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_0px_#0f172a] cursor-pointer transition-transform hover:-translate-y-0.5"
                title="Hapus semua notifikasi dan bersihkan badge angka"
              >
                <CheckCheck className="w-3.5 h-3.5 stroke-[2.5] text-rose-700" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border-2 border-slate-900 mx-auto flex items-center justify-center">
                <Bell className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-xs font-bold">Belum ada perubahan status DO selama sesi ini</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Dashboard memantau spreadsheet otomatis. Bila status DO berubah di spreadsheet sumber, notifikasi akan langsung tampil di sini.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isSpreadsheetChange = notif.type === 'spreadsheet_change' || (notif.changes && notif.changes.length > 0);
              const isSyncSuccess = notif.type === 'sync_success';

              return (
                <div
                  key={notif.id}
                  className={`border-2.5 border-slate-900 rounded-xl p-3.5 shadow-[3px_3px_0px_0px_#0f172a] space-y-2 ${
                    isSpreadsheetChange ? 'bg-amber-50' : isSyncSuccess ? 'bg-emerald-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-black text-slate-950 flex items-center gap-1.5">
                      {isSyncSuccess ? (
                        <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                      ) : isSpreadsheetChange ? (
                        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      ) : null}
                      {notif.title || (notif.noDo ? notif.noDo : 'Sinkronisasi Spreadsheet')}
                    </span>
                    <span className="neo-stamp bg-slate-900 text-amber-300 text-[9px] font-mono">
                      {isSyncSuccess ? 'SYNC 100%' : isSpreadsheetChange ? 'SHEET UPDATE' : notif.sheetName || 'LIVE'}
                    </span>
                  </div>

                  {/* Diff Changes or Message */}
                  {isSpreadsheetChange && notif.changes && notif.changes.length > 0 ? (
                    <div className="bg-white border border-slate-900 rounded-lg p-2 text-xs space-y-1">
                      {notif.changes.slice(0, 4).map((chg, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-900 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                          <span>{chg}</span>
                        </div>
                      ))}
                    </div>
                  ) : isSyncSuccess ? (
                    <p className="text-[11px] font-semibold text-slate-700">
                      {notif.message || 'Data berhasil disinkronkan langsung dari Google Spreadsheet.'}
                    </p>
                  ) : notif.oldStatus || notif.newStatus ? (
                    <div className="flex items-center justify-center gap-1.5 p-1.5 bg-slate-50 border border-slate-900 rounded-lg">
                      <span className={`neo-pill text-[10px] font-black ${getStatusBadgeColor(notif.oldStatus)}`}>
                        {notif.oldStatus}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-900 stroke-[3]" />
                      <span className={`neo-pill text-[10px] font-black ${getStatusBadgeColor(notif.newStatus)}`}>
                        {notif.newStatus}
                      </span>
                    </div>
                  ) : null}

                  {/* Footer Bar */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200">
                    <span>{new Date(notif.timestamp).toLocaleTimeString('id-ID')}</span>
                    {notif.durationMs && (
                      <span className="font-bold text-slate-700">⏱️ {notif.durationMs}ms</span>
                    )}
                    {notif.noDo && onViewDo && (
                      <button
                        onClick={() => {
                          onViewDo(notif.noDo, notif.sheetName);
                          onClose();
                        }}
                        className="text-blue-700 font-bold hover:underline cursor-pointer"
                      >
                        Buka DO &rarr;
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t-2 border-slate-900 text-center">
          <button
            onClick={onClose}
            className="neo-btn bg-white hover:bg-slate-100 text-slate-900 border-slate-900 px-6 py-1.5 text-xs font-black"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};
