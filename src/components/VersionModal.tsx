import React, { useEffect } from 'react';
import {
  Tag,
  Calendar,
  CheckCircle2,
  X,
  Sparkles,
  GitCommit,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { VERSION_HISTORY, CURRENT_APP_VERSION, VersionRecord } from '../data/versionHistory';

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionModal: React.FC<VersionModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeBadge = (type: VersionRecord['type']) => {
    switch (type) {
      case 'major':
        return (
          <span className="px-2 py-0.5 text-[10px] font-black font-mono uppercase bg-purple-100 text-purple-900 border border-purple-900 rounded">
            MAJOR
          </span>
        );
      case 'minor':
        return (
          <span className="px-2 py-0.5 text-[10px] font-black font-mono uppercase bg-blue-100 text-blue-900 border border-blue-900 rounded">
            MINOR
          </span>
        );
      case 'patch':
        return (
          <span className="px-2 py-0.5 text-[10px] font-black font-mono uppercase bg-emerald-100 text-emerald-900 border border-emerald-900 rounded">
            PATCH
          </span>
        );
    }
  };

  return (
    <div
      id="version-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="version-modal-card"
        className="neo-card bg-white w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border-2.5 border-slate-950"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white border-b-2.5 border-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-white text-blue-900 border-2 border-slate-950 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]">
              <Tag className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-['Space_Grotesk',sans-serif] tracking-tight">
                  Riwayat Versi & Changelog
                </h2>
                <span className="px-2 py-0.5 text-xs font-mono font-black bg-amber-300 text-slate-950 border border-slate-950 rounded shadow-[1px_1px_0px_0px_#0f172a]">
                  v{CURRENT_APP_VERSION}
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium">
                Penerapan Semantic Versioning (SemVer) sistematis
              </p>
            </div>
          </div>
          <button
            id="btn-close-version-modal"
            onClick={onClose}
            className="w-9 h-9 rounded-md bg-white/10 hover:bg-white text-white hover:text-slate-900 border-2 border-transparent hover:border-slate-950 flex items-center justify-center transition-all cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* SemVer Guide Banner */}
        <div className="bg-slate-100 p-3 sm:px-5 border-b-2 border-slate-900 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold">
            <Layers className="w-4 h-4 text-blue-700" />
            <span>Format SemVer:</span>
            <span className="px-1.5 py-0.5 bg-purple-200 text-purple-950 rounded border border-purple-400">
              MAJOR
            </span>
            <span>.</span>
            <span className="px-1.5 py-0.5 bg-blue-200 text-blue-950 rounded border border-blue-400">
              MINOR
            </span>
            <span>.</span>
            <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-950 rounded border border-emerald-400">
              PATCH
            </span>
          </div>
          <div className="text-[11px] font-medium text-slate-600 hidden sm:block">
            Terhubung & disinkronkan otomatis antar-kontainer
          </div>
        </div>

        {/* Versions Timeline List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {VERSION_HISTORY.map((ver, idx) => {
            return (
              <div
                key={ver.version}
                id={`changelog-item-${ver.version}`}
                className={`neo-card p-4 transition-all ${
                  ver.isCurrent
                    ? 'bg-blue-50/80 border-blue-950 ring-2 ring-blue-500 shadow-[3px_3px_0px_0px_#1e3a8a]'
                    : 'bg-white hover:bg-slate-50 border-slate-900'
                }`}
              >
                {/* Version Title & Meta */}
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-base sm:text-lg text-slate-900">
                      v{ver.version}
                    </span>
                    {getTypeBadge(ver.type)}
                    {ver.isCurrent && (
                      <span className="px-2 py-0.5 text-[10px] font-black font-mono uppercase bg-emerald-400 text-emerald-950 border border-slate-950 rounded shadow-[1px_1px_0px_0px_#0f172a] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> VERSI AKTIF
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{ver.releaseDate}</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base font-['Space_Grotesk',sans-serif] mb-1">
                  {ver.title}
                </h3>

                <p className="text-xs text-slate-700 font-medium mb-3 leading-relaxed">
                  {ver.summary}
                </p>

                {/* Change Points */}
                <div className="bg-white/80 p-3 rounded border border-slate-200 space-y-1.5 text-xs text-slate-800">
                  <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <GitCommit className="w-3 h-3 text-blue-600" />
                    DAFTAR PEMBARUAN:
                  </div>
                  {ver.changes.map((change, cIdx) => (
                    <div key={cIdx} className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                      <span className="font-medium text-slate-800 leading-snug">{change}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t-2.5 border-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            <span>Versi terverifikasi & kompatibel antar-kontainer</span>
          </div>
          <button
            id="btn-close-version-modal-bottom"
            onClick={onClose}
            className="neo-btn neo-btn-primary py-1.5 px-4 text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
