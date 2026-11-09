import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  ChevronDown, 
  FileSpreadsheet, 
  FileText, 
  Presentation, 
  FileCheck,
  TableProperties
} from 'lucide-react';
import { 
  ExportFormat, 
  ExportTheme, 
  ExportTableData,
  exportToXLSX,
  exportToODS,
  exportToPDF,
  exportToPPT,
  exportToODP 
} from '../services/exportService';
import { ExportThemeModal } from './ExportThemeModal';

interface ExportDropdownProps {
  getData: () => ExportTableData;
  defaultFilename: string;
  reportTitle: string;
  className?: string;
  onExportGoogleSlides?: () => void;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  getData,
  defaultFilename,
  reportTitle,
  className = '',
  onExportGoogleSlides,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<ExportFormat>('pdf');
  const [isProcessing, setIsProcessing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectFormat = async (format: ExportFormat) => {
    setIsOpen(false);

    if (format === 'xlsx') {
      try {
        const data = getData();
        await exportToXLSX(data, defaultFilename);
      } catch (err) {
        console.error('Export XLSX error:', err);
      }
    } else if (format === 'ods') {
      try {
        const data = getData();
        await exportToODS(data, defaultFilename);
      } catch (err) {
        console.error('Export ODS error:', err);
      }
    } else {
      // PDF, PPT, ODP -> show Theme Selection Modal
      setPendingFormat(format);
      setThemeModalOpen(true);
    }
  };

  const handleConfirmTheme = async (theme: ExportTheme) => {
    setIsProcessing(true);
    try {
      const data = getData();
      if (pendingFormat === 'pdf') {
        await exportToPDF(data, defaultFilename, theme);
      } else if (pendingFormat === 'ppt') {
        await exportToPPT(data, defaultFilename, theme);
      } else if (pendingFormat === 'odp') {
        await exportToODP(data, defaultFilename, theme);
      }
    } catch (err) {
      console.error(`Export ${pendingFormat} error:`, err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        id="btn-export-dropdown-trigger"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isProcessing}
        className="neo-btn bg-white hover:bg-slate-50 text-slate-900 font-black text-xs px-3.5 py-2 flex items-center gap-2 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer"
        title="Ekspor laporan dalam berbagai format (XLSX, ODS, PDF, PPT, ODP)"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5] text-blue-700" />
        <span>Ekspor</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-60 bg-white border-3 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] rounded-none z-40 py-1.5 animate-fade-in divide-y divide-slate-100">
          <div className="px-3 py-1.5 bg-slate-100/80 border-b-2 border-slate-900">
            <span className="text-[10px] font-black uppercase font-mono text-slate-600 block">
              PILIH FORMAT FILE
            </span>
          </div>

          <div className="py-1">
            {/* Google Slides Direct Export */}
            {onExportGoogleSlides && (
              <button
                id="export-option-google-slides"
                onClick={() => {
                  setIsOpen(false);
                  onExportGoogleSlides();
                }}
                className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-800 bg-amber-50/70 hover:bg-amber-100 hover:text-amber-950 flex items-center justify-between group cursor-pointer border-b border-amber-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-amber-500 text-slate-950 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                    <Presentation className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">Google Slides</span>
                    <span className="text-[10px] text-amber-900 font-bold block">Cloud Deck & 2 Visual Chart</span>
                  </div>
                </div>
                <span className="neo-pill bg-amber-200 text-amber-950 text-[9px] font-mono font-black border-slate-900">
                  SLIDES
                </span>
              </button>
            )}

            {/* XLSX */}
            <button
              id="export-option-xlsx"
              onClick={() => handleSelectFormat('xlsx')}
              className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-950 flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-extrabold text-slate-900">Excel Spreadsheet</span>
                  <span className="text-[10px] text-slate-500 font-mono block">.xlsx (Format Office)</span>
                </div>
              </div>
              <span className="neo-pill bg-emerald-100 text-emerald-900 text-[9px] font-mono">XLSX</span>
            </button>

            {/* ODS */}
            <button
              id="export-option-ods"
              onClick={() => handleSelectFormat('ods')}
              className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-teal-50 hover:text-teal-950 flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <TableProperties className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-extrabold text-slate-900">OpenDocument Sheet</span>
                  <span className="text-[10px] text-slate-500 font-mono block">.ods (OpenOffice / Libre)</span>
                </div>
              </div>
              <span className="neo-pill bg-teal-100 text-teal-900 text-[9px] font-mono">ODS</span>
            </button>
          </div>

          <div className="py-1">
            {/* PDF with Theme Modal */}
            <button
              id="export-option-pdf"
              onClick={() => handleSelectFormat('pdf')}
              className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-rose-50 hover:text-rose-950 flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-extrabold text-slate-900">Dokumen PDF</span>
                  <span className="text-[10px] text-slate-500 font-mono block">.pdf (Pilihan Tema)</span>
                </div>
              </div>
              <span className="neo-pill bg-rose-100 text-rose-900 text-[9px] font-mono">PDF</span>
            </button>

            {/* PPT with Theme Modal */}
            <button
              id="export-option-ppt"
              onClick={() => handleSelectFormat('ppt')}
              className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-amber-50 hover:text-amber-950 flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Presentation className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-extrabold text-slate-900">PowerPoint Slide</span>
                  <span className="text-[10px] text-slate-500 font-mono block">.pptx / .ppt (Slide Presentasi)</span>
                </div>
              </div>
              <span className="neo-pill bg-amber-100 text-amber-900 text-[9px] font-mono">PPT</span>
            </button>

            {/* ODP with Theme Modal */}
            <button
              id="export-option-odp"
              onClick={() => handleSelectFormat('odp')}
              className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-950 flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-extrabold text-slate-900">OpenDocument Pres.</span>
                  <span className="text-[10px] text-slate-500 font-mono block">.odp (Libre Impress)</span>
                </div>
              </div>
              <span className="neo-pill bg-indigo-100 text-indigo-900 text-[9px] font-mono">ODP</span>
            </button>
          </div>

          <div className="p-2 bg-slate-50 text-[10px] text-slate-500 text-center font-mono">
            PDF, PPT, & ODP dilengkapi pilihan gaya tema
          </div>
        </div>
      )}

      {/* Theme Choice Modal */}
      <ExportThemeModal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        format={pendingFormat}
        reportTitle={reportTitle}
        onConfirm={handleConfirmTheme}
      />
    </div>
  );
};
