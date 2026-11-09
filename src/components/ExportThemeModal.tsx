import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Check, 
  Download, 
  Presentation, 
  Palette,
  Briefcase
} from 'lucide-react';
import { ExportFormat, ExportTheme } from '../services/exportService';

interface ExportThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  format: ExportFormat;
  reportTitle: string;
  onConfirm: (theme: ExportTheme) => Promise<void> | void;
}

export const ExportThemeModal: React.FC<ExportThemeModalProps> = ({
  isOpen,
  onClose,
  format,
  reportTitle,
  onConfirm,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<ExportTheme>('standard');
  const [isExporting, setIsExporting] = useState(false);

  // Lock background body scroll when modal is active to prevent page scrolling behind it
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onConfirm(selectedTheme);
      onClose();
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatLabel = () => {
    switch (format) {
      case 'pdf':
        return 'Dokumen PDF (.pdf)';
      case 'ppt':
        return 'PowerPoint (.pptx)';
      case 'odp':
        return 'OpenDocument Presentation (.odp)';
      default:
        return format.toUpperCase();
    }
  };

  const getFormatIcon = () => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-600 stroke-[2.5]" />;
      case 'ppt':
      case 'odp':
        return <Presentation className="w-5 h-5 text-amber-600 stroke-[2.5]" />;
      default:
        return <Download className="w-5 h-5 text-blue-600 stroke-[2.5]" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={(e) => {
        // Click backdrop to close
        if (e.target === e.currentTarget && !isExporting) {
          onClose();
        }
      }}
    >
      <div 
        id="modal-export-theme-selector"
        className="neo-card w-full max-w-lg max-h-[90vh] bg-white border-2.5 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] flex flex-col my-auto overflow-hidden"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-b-2.5 border-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center shrink-0">
              {getFormatIcon()}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="neo-stamp bg-amber-300 text-slate-950 text-[9px] font-black uppercase font-mono py-0.5">
                  TEMA EKSPOR
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-300">
                  {getFormatLabel()}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white mt-0.5 font-['Space_Grotesk',sans-serif]">
                Pilih Gaya Tampilan Dokumen
              </h2>
            </div>
          </div>
          <button
            id="btn-close-export-theme-modal"
            onClick={onClose}
            disabled={isExporting}
            className="w-7 h-7 rounded bg-white hover:bg-rose-100 text-slate-900 hover:text-rose-900 border-1.5 border-slate-900 flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_#0f172a] transition-all cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body: Theme Cards with Independent Scroll */}
        <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto overscroll-contain flex-1">
          <p className="text-[11px] text-slate-600 font-bold uppercase tracking-wider font-mono">
            Silakan tentukan visual layout dokumen:
          </p>

          {/* Option 1: Standard Blue-White Gradient */}
          <div
            id="option-theme-standard"
            onClick={() => setSelectedTheme('standard')}
            className={`neo-card p-3 sm:p-3.5 cursor-pointer transition-all border-2 ${
              selectedTheme === 'standard'
                ? 'border-blue-600 bg-blue-50/80 shadow-[4px_4px_0px_0px_#2563eb]'
                : 'border-slate-300 hover:border-slate-800 bg-white shadow-[2px_2px_0px_0px_#cbd5e1]'
            }`}
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-1.5 border-slate-900 shrink-0 ${
                  selectedTheme === 'standard' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Briefcase className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs sm:text-sm text-slate-900 font-['Space_Grotesk',sans-serif]">
                      Standar Formal (Biru-Putih Gradien)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Format korporat formal elegan: gradasi biru royal, tata letak tabel halus, dan kartu KPI bersih standar laporan manajemen.
                  </p>

                  {/* Visual Preview Swatch */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold text-slate-500">Palet:</span>
                    <div className="h-3 w-20 rounded bg-gradient-to-r from-blue-700 via-blue-500 to-sky-100 border border-slate-300"></div>
                    <span className="text-[9px] font-mono text-blue-700 font-bold">Royal Blue / Clean</span>
                  </div>
                </div>
              </div>

              <div className={`w-5 h-5 rounded-full border-1.5 border-slate-900 flex items-center justify-center shrink-0 mt-0.5 ${
                selectedTheme === 'standard' ? 'bg-blue-600 text-white' : 'bg-white'
              }`}>
                {selectedTheme === 'standard' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
          </div>

          {/* Option 2: Neo-Brutalism */}
          <div
            id="option-theme-neo"
            onClick={() => setSelectedTheme('neo')}
            className={`neo-card p-3 sm:p-3.5 cursor-pointer transition-all border-2 ${
              selectedTheme === 'neo'
                ? 'border-slate-950 bg-amber-50/90 shadow-[4px_4px_0px_0px_#0f172a]'
                : 'border-slate-300 hover:border-slate-800 bg-white shadow-[2px_2px_0px_0px_#cbd5e1]'
            }`}
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-1.5 border-slate-900 shrink-0 ${
                  selectedTheme === 'neo' ? 'bg-amber-300 text-slate-950' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Palette className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs sm:text-sm text-slate-900 font-['Space_Grotesk',sans-serif]">
                      Neo Brutalism (Sama Seperti Web)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Format warna & border tegas persis antarmuka web: outline hitam pekat, badge kuning/cyan/hijau, dan bayangan blok 3D.
                  </p>

                  {/* Visual Preview Swatch */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold text-slate-500">Palet:</span>
                    <div className="flex items-center gap-0.5">
                      <span className="w-4 h-3 bg-yellow-300 border border-slate-900"></span>
                      <span className="w-4 h-3 bg-cyan-300 border border-slate-900"></span>
                      <span className="w-4 h-3 bg-emerald-300 border border-slate-900"></span>
                      <span className="w-4 h-3 bg-slate-900 border border-slate-900"></span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-900 font-bold">Neo Web Style</span>
                  </div>
                </div>
              </div>

              <div className={`w-5 h-5 rounded-full border-1.5 border-slate-900 flex items-center justify-center shrink-0 mt-0.5 ${
                selectedTheme === 'neo' ? 'bg-slate-950 text-white' : 'bg-white'
              }`}>
                {selectedTheme === 'neo' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-3.5 bg-slate-100 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <span className="text-[11px] font-mono font-bold text-slate-600">
            Format: <strong className="text-slate-900">{format.toUpperCase()}</strong> | Tema: <strong className="text-slate-900">{selectedTheme === 'standard' ? 'Standar' : 'Neo-Brutalism'}</strong>
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="btn-cancel-theme-export"
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="neo-btn neo-btn-white text-xs px-3.5 py-1.5 flex-1 sm:flex-initial"
            >
              Batal
            </button>
            <button
              id="btn-confirm-theme-export"
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="neo-btn bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs px-4 py-1.5 flex items-center justify-center gap-1.5 border-1.5 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#000] cursor-pointer disabled:opacity-50 flex-1 sm:flex-initial"
            >
              <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Membuat...' : 'Unduh Dokumen'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
