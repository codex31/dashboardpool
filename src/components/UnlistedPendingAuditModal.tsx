import React, { useState } from 'react';
import { UnlistedPendingDo } from '../types';
import { 
  AlertTriangle, 
  Check, 
  Copy, 
  ExternalLink, 
  FileSpreadsheet, 
  Info, 
  ShieldAlert, 
  Sparkles, 
  X 
} from 'lucide-react';

interface UnlistedPendingAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlistedDos: UnlistedPendingDo[];
  sheetUrl?: string;
  onRefreshAudit?: () => void;
}

export const UnlistedPendingAuditModal: React.FC<UnlistedPendingAuditModalProps> = ({
  isOpen,
  onClose,
  unlistedDos,
  sheetUrl,
  onRefreshAudit,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen) return null;

  const generateRowText = (item: UnlistedPendingDo) => {
    // Format: NO DO | NAMA CUSTOMER | TGL AWAL | TGL TARGET | STATUS | KONFIRMASI BY | KATEGORI | KETERANGAN
    return `${item.noDo}\t${item.customerName || 'CUSTOMER'}\t${item.tanggal}\t${item.tanggal}\tOPEN\tLANGSUNG DATANG\t${item.status}\t${item.reason || 'Pending dari ' + item.sheetName}`;
  };

  const handleCopySingle = (item: UnlistedPendingDo) => {
    const text = generateRowText(item);
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyAll = () => {
    const allText = unlistedDos.map((item) => generateRowText(item)).join('\n');
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  // Direct link to Detail Pending tab in spreadsheet (gid=216624293 or url)
  const detailPendingLink = sheetUrl ? `${sheetUrl.split('#')[0].split('?')[0]}#gid=216624293` : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white border-3 border-slate-900 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-[8px_8px_0px_0px_#0f172a] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-amber-300 border-b-3 border-slate-900 p-4 sm:p-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-rose-600 border-2 border-slate-900 text-white flex items-center justify-center shadow-[3px_3px_0px_0px_#0f172a]">
              <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="neo-stamp bg-slate-900 text-amber-300 text-[10px] uppercase font-mono font-black">
                  VALIDASI DATABASE GOOGLE SHEETS
                </span>
                <span className="neo-pill bg-white text-rose-950 border-slate-900 text-[10px] font-black">
                  {unlistedDos.length} DO Perlu Dimasukkan
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-950 mt-1 font-['Space_Grotesk',sans-serif]">
                Audit DO Pending di Sheet Tanggal vs Detail Pending
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 border-2 border-slate-900 flex items-center justify-center text-slate-900 font-black shadow-[2px_2px_0px_0px_#0f172a] transition-transform active:translate-y-0.5"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Modal Explainer & Instructions */}
        <div className="bg-blue-50 border-b-2 border-slate-900 p-3.5 sm:px-5 text-xs text-slate-800 space-y-1.5">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Ketentuan Operasional DO Pool Singkawang:</strong>
              <p className="mt-0.5 text-slate-700">
                Setiap DO di sheet harian tanggal (seperti <span className="font-mono font-bold">tgl 1..31</span>) yang memiliki status selain <span className="neo-pill text-[9px] py-0 bg-slate-200">Open</span>, <span className="neo-pill text-[9px] py-0 bg-emerald-200">Finish</span>, <span className="neo-pill text-[9px] py-0 bg-slate-200">Close</span>, <span className="neo-pill text-[9px] py-0 bg-purple-200">LKPB</span>, atau <span className="neo-pill text-[9px] py-0 bg-rose-200">Cancel</span> secara otomatis tergolong <strong>PENDING</strong> (misal: <em>Brg, Resch, Rusong, Tungkom, Inst</em>).
              </p>
              <p className="mt-1 text-slate-900 font-bold">
                ⚠️ DO berikut terdata pending di sheet tanggal namun <u>belum terdaftar</u> di sheet <span className="font-mono underline">Detail Pendingan</span>. Segera masukkan DO ini ke sheet Detail Pending agar SLA dan penanganannya terpantau!
              </p>
            </div>
          </div>
        </div>

        {/* DO List Scroll Area */}
        <div className="p-4 sm:p-5 overflow-y-auto max-h-[50vh] space-y-3 neo-scrollbar">
          {unlistedDos.map((item, index) => (
            <div
              key={item.id}
              className="bg-white border-2.5 border-slate-900 rounded-xl p-3.5 sm:p-4 shadow-[4px_4px_0px_0px_#0f172a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-slate-500">#{index + 1}</span>
                  <span className="font-mono text-base font-black text-slate-950 tracking-wider">
                    {item.noDo}
                  </span>
                  <span className="neo-stamp bg-blue-100 text-blue-950 text-[10px] font-mono border-blue-400">
                    Sheet: {item.sheetName} ({item.tanggal})
                  </span>
                  <span className="neo-pill bg-amber-300 text-slate-950 border-slate-900 text-[10px] font-black">
                    Status: {item.status}
                  </span>
                </div>

                <div className="text-xs text-slate-700 flex items-center gap-3">
                  <span>Tim Jalur: <strong className="text-slate-950">{item.teamName || '-'}</strong></span>
                  {item.reason && (
                    <span>Kendala: <strong className="text-rose-700">{item.reason}</strong></span>
                  )}
                </div>

                <div className="text-[10px] font-mono text-slate-500">
                  Format Siap Salin: <code className="bg-slate-100 px-1 py-0.5 rounded border border-slate-300">{item.noDo} &bull; {item.tanggal} &bull; {item.status} &bull; OPEN</code>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleCopySingle(item)}
                  className="neo-btn neo-btn-primary px-3 py-1.5 text-xs font-black gap-1.5"
                  title="Salin 1 baris format spreadsheet"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300 stroke-[3]" />
                      <span>TERSALIN!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>SALIN BARIS</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t-3 border-slate-900 p-4 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="neo-btn bg-white hover:bg-slate-50 text-slate-900 px-3.5 py-2 text-xs font-black border-slate-900 gap-1.5"
            >
              {copiedAll ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">SEMUA TERSALIN</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>SALIN SEMUA BARIS ({unlistedDos.length})</span>
                </>
              )}
            </button>

            {detailPendingLink && (
              <a
                href={detailPendingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="neo-btn neo-btn-primary px-3.5 py-2 text-xs font-black gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>BUKA DETAIL PENDING</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            className="neo-btn bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 text-xs font-black"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};
