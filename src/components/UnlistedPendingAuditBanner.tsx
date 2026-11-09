import React, { useState } from 'react';
import { UnlistedPendingDo } from '../types';
import { AlertTriangle, ChevronRight, Copy, Check, ExternalLink, ShieldAlert, Sparkles, X } from 'lucide-react';

interface UnlistedPendingAuditBannerProps {
  unlistedDos: UnlistedPendingDo[];
  onOpenAuditModal: () => void;
  spreadsheetUrl?: string;
}

export const UnlistedPendingAuditBanner: React.FC<UnlistedPendingAuditBannerProps> = ({
  unlistedDos,
  onOpenAuditModal,
  spreadsheetUrl,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!unlistedDos || unlistedDos.length === 0 || isDismissed) {
    return null;
  }

  const handleCopyQuick = (doItem: UnlistedPendingDo, e: React.MouseEvent) => {
    e.stopPropagation();
    const templateText = `${doItem.noDo}\t${doItem.customerName || 'CUSTOMER'}\t${doItem.tanggal}\t${doItem.tanggal}\tOPEN\tLANGSUNG DATANG\t${doItem.status}\t${doItem.reason || 'Pending dari Sheet ' + doItem.sheetName}`;
    navigator.clipboard.writeText(templateText);
    setCopiedId(doItem.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
      <div className="bg-amber-300 border-3 border-slate-900 rounded-xl p-4 shadow-[4px_4px_0px_0px_#0f172a] text-slate-950 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left Title & Badge */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-600 border-2 border-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_#0f172a]">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="neo-stamp bg-rose-600 text-white text-[10px] font-mono font-black uppercase">
                  AUDIT SHEET TANGGAL VS DETAIL PENDING
                </span>
                <span className="neo-pill bg-white text-rose-900 border-slate-900 text-[10px] font-extrabold">
                  {unlistedDos.length} DO PERLU DIINPUT
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-950 mt-1 font-['Space_Grotesk',sans-serif]">
                Ditemukan DO Berstatus Pending di Sheet Tanggal yang Belum Dicatat di Sheet "Detail Pending"
              </h3>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-open-audit-modal"
              onClick={onOpenAuditModal}
              className="neo-btn neo-btn-primary px-3.5 py-2 text-xs font-black gap-1.5 shadow-[2px_2px_0px_0px_#0f172a]"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>TINJAU & SALIN DATA ({unlistedDos.length})</span>
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="neo-btn bg-white hover:bg-slate-100 text-slate-900 px-2.5 py-2 text-xs font-black border-slate-900"
              title="Sembunyikan peringatan sementara"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List of unlisted DOs quick preview pill bar */}
        <div className="mt-3 pt-3 border-t-2 border-slate-900 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-mono font-bold text-slate-800 uppercase">
            Daftar DO:
          </span>
          {unlistedDos.slice(0, 4).map((d) => (
            <div
              key={d.id}
              className="inline-flex items-center gap-2 bg-white border-2 border-slate-900 rounded-lg px-2.5 py-1 text-xs shadow-[2px_2px_0px_0px_#0f172a]"
            >
              <span className="font-mono font-black text-slate-900">{d.noDo}</span>
              <span className="neo-stamp bg-slate-100 text-slate-800 text-[9px] border-slate-400">
                {d.sheetName} ({d.tanggal})
              </span>
              <span className="neo-pill bg-amber-200 text-slate-950 text-[9px] border-slate-900">
                Status: {d.status}
              </span>
              <button
                onClick={(e) => handleCopyQuick(d, e)}
                className="neo-btn px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-900 hover:bg-blue-100"
                title="Salin baris untuk sheet Detail Pending"
              >
                {copiedId === d.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          ))}

          {unlistedDos.length > 4 && (
            <span className="text-[11px] font-extrabold text-slate-800 font-mono">
              +{unlistedDos.length - 4} DO lainnya...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
