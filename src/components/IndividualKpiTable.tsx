import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  User, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  Award,
  ChevronDown,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  TechnicianSummary, 
  IndividualDailyAssignment, 
  IndividualMonthlyKpi 
} from '../data/defaultSummaryIndividuData';
import { buildIndividualMonthlyKpi } from '../services/individualSummaryService';
import { RegisteredMonthConfig, fetchMonthDataset } from '../services/sheetService';
import { DailyRecord } from '../types';

interface IndividualKpiTableProps {
  technicians: TechnicianSummary[];
  currentMonth: RegisteredMonthConfig;
  registeredMonths?: RegisteredMonthConfig[];
  onSelectMonth?: (config: RegisteredMonthConfig) => void;
  selectedTechName?: string;
  onSelectTechName?: (name: string) => void;
  monthlyRecords?: DailyRecord[];
}

export const IndividualKpiTable: React.FC<IndividualKpiTableProps> = ({
  technicians,
  currentMonth,
  registeredMonths = [],
  onSelectMonth,
  selectedTechName,
  onSelectTechName,
  monthlyRecords,
}) => {
  const [internalSelectedTech, setInternalSelectedTech] = useState<string>(
    selectedTechName || technicians[0]?.nama || 'KEMAS HIDAYAT'
  );
  const [viewAllTechs, setViewAllTechs] = useState<boolean>(false);
  const [isCompactView, setIsCompactView] = useState<boolean>(false);

  const activeTechName = selectedTechName || internalSelectedTech;

  const [internalMonthlyRecords, setInternalMonthlyRecords] = useState<DailyRecord[]>([]);

  useEffect(() => {
    if (monthlyRecords && monthlyRecords.length > 0) {
      setInternalMonthlyRecords(monthlyRecords);
      return;
    }
    let isCancelled = false;
    fetchMonthDataset(currentMonth)
      .then((ds) => {
        if (!isCancelled && ds && ds.records && ds.records.length > 0) {
          setInternalMonthlyRecords(ds.records);
        }
      })
      .catch((e) => console.warn('Could not load month dataset in IndividualKpiTable:', e));

    return () => {
      isCancelled = true;
    };
  }, [currentMonth, monthlyRecords]);

  const activeMonthlyRecords = (monthlyRecords && monthlyRecords.length > 0) ? monthlyRecords : internalMonthlyRecords;

  const handleSelectTech = (name: string) => {
    setInternalSelectedTech(name);
    if (onSelectTechName) onSelectTechName(name);
  };

  // Build KPI data for active technician or all technicians (sourced dynamically from Centralize records if available)
  const currentKpiData: IndividualMonthlyKpi = useMemo(() => {
    const tech = technicians.find((t) => t.nama.toUpperCase() === activeTechName.toUpperCase()) || technicians[0];
    return buildIndividualMonthlyKpi(
      tech?.nama || activeTechName,
      currentMonth.monthName,
      currentMonth.year,
      tech?.dailyAssignments || [],
      activeMonthlyRecords
    );
  }, [technicians, activeTechName, currentMonth, activeMonthlyRecords]);

  // Build KPI for all technicians if in "View All" mode
  const allKpis: IndividualMonthlyKpi[] = useMemo(() => {
    return technicians.map((tech) => 
      buildIndividualMonthlyKpi(
        tech.nama,
        currentMonth.monthName,
        currentMonth.year,
        tech.dailyAssignments || [],
        activeMonthlyRecords
      )
    );
  }, [technicians, currentMonth, activeMonthlyRecords]);

  // Export to Excel (.xlsx) matching exact spreadsheet structure
  const handleExportXlsx = () => {
    const wb = XLSX.utils.book_new();

    const targets = viewAllTechs ? allKpis : [currentKpiData];

    targets.forEach((kpi) => {
      const daysCount = kpi.dailyData.length;
      const headersRow1 = ['BULAN', 'DESCRIPTION', 'TOTAL', 'PROD BOBOT', ...Array(daysCount).fill('TANGGAL')];
      const headersRow2 = ['', '', '', '', ...kpi.dailyData.map((d) => d.dayNumber)];

      const rowHariKerja = [
        kpi.bulan,
        'JUMLAH HARI KERJA',
        kpi.totalHariKerja,
        kpi.prodBobot,
        ...kpi.dailyData.map((d) => d.hariKerja)
      ];

      const rowDoFinish = [
        '',
        'DO FINISH',
        kpi.totalDoFinish,
        '',
        ...kpi.dailyData.map((d) => d.doFinish)
      ];

      const rowPendingCustomer = [
        '',
        'PENDING CUSTOMER',
        kpi.totalPendingCustomer,
        'Total Jalur',
        ...kpi.dailyData.map((d) => d.pendingCustomer)
      ];

      const rowPendingBarang = [
        '',
        'PENDING BARANG',
        kpi.totalPendingBarang,
        kpi.totalJalur,
        ...kpi.dailyData.map((d) => d.pendingBarang)
      ];

      const rowPendingStaff = [
        '',
        'PENDING STAFF',
        kpi.totalPendingStaff,
        'QO',
        ...kpi.dailyData.map((d) => d.pendingStaff)
      ];

      const rowLkpb = [
        '',
        'LKPB',
        kpi.totalLkpb,
        '',
        ...kpi.dailyData.map((d) => d.lkpb)
      ];

      const rowBobotFinish = [
        '',
        'Bobot Finish',
        kpi.totalBobotFinish,
        kpi.qoRate || '100%',
        ...kpi.dailyData.map((d) => d.bobotFinish)
      ];

      const rowKualitas = [
        '',
        'Kualitas Hasil Service & installasi',
        kpi.kualitasHasil || 0,
        '',
        ...kpi.dailyData.map((d) => d.kualitasHasil || 0)
      ];

      const rowKelengkapan = [
        '',
        'Kelengkapan Alat Service Solution Pribadi & Team',
        kpi.kelengkapanAlat || '103.95%',
        '',
        ...kpi.dailyData.map((d) => d.kelengkapanAlat || '103.95%')
      ];

      const wsData = [
        headersRow1,
        headersRow2,
        rowHariKerja,
        rowDoFinish,
        rowPendingCustomer,
        rowPendingBarang,
        rowPendingStaff,
        rowLkpb,
        rowBobotFinish,
        rowKualitas,
        rowKelengkapan,
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const sheetName = kpi.technicianName.slice(0, 25).replace(/[\\/?*[\]]/g, '');
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, `KPI_Individu_${currentMonth.monthName}_${currentMonth.year}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderSingleKpiTable = (kpi: IndividualMonthlyKpi, isStacked: boolean = false) => {
    const days = kpi.dailyData;

    return (
      <div 
        key={kpi.technicianName}
        className="neo-card p-4 sm:p-5 bg-white border-3 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] overflow-hidden space-y-3"
      >
        {/* Table Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b-2.5 border-slate-900 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 border-2 border-slate-900 text-white flex items-center justify-center font-black text-sm shadow-[1.5px_1.5px_0px_0px_#0f172a]">
              {kpi.technicianName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="neo-stamp bg-slate-900 text-amber-300 text-[10px] font-mono">
                  KPI INDIVIDU
                </span>
                <span className="neo-pill bg-blue-100 text-blue-950 border-slate-900 text-[10px] font-black">
                  {kpi.bulan} {kpi.year}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
                {kpi.technicianName}
              </h3>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="neo-pill bg-slate-100 text-slate-900 border-slate-900 flex items-center gap-1 font-mono">
              <span className="text-slate-500 font-bold">Kerja:</span>
              <strong className="text-blue-700">{kpi.totalHariKerja} Hari</strong>
            </div>
            <div className="neo-pill bg-emerald-100 text-emerald-950 border-slate-900 flex items-center gap-1 font-mono">
              <span className="text-slate-500 font-bold">Finish:</span>
              <strong className="text-emerald-700">{kpi.totalDoFinish} DO</strong>
            </div>
            <div className="neo-pill bg-cyan-100 text-cyan-950 border-slate-900 flex items-center gap-1 font-mono">
              <span className="text-slate-500 font-bold">Total Jalur:</span>
              <strong className="text-cyan-900">{kpi.totalJalur} DO</strong>
            </div>
            <div className="neo-pill bg-amber-100 text-amber-950 border-slate-900 flex items-center gap-1 font-mono">
              <span className="text-slate-500 font-bold">Bobot:</span>
              <strong className="text-amber-800">{kpi.totalBobotFinish} Pts</strong>
            </div>
          </div>
        </div>

        {/* Scrollable Container with exact spreadsheet styling */}
        <div className="overflow-x-auto border-2.5 border-slate-900 rounded-lg shadow-[2px_2px_0px_0px_#0f172a] neo-scrollbar">
          <table className="w-full text-center border-collapse text-xs select-text">
            {/* Header Rows */}
            <thead>
              {/* Super Header: BULAN, DESCRIPTION, TOTAL, PROD BOBOT, and spanned TANGGAL */}
              <tr className="bg-slate-300 text-slate-900 font-black border-b-2 border-slate-900">
                <th 
                  rowSpan={2} 
                  className="py-2.5 px-3 min-w-[90px] border-r-2 border-slate-900 uppercase tracking-wider text-[11px] align-middle font-['Space_Grotesk',sans-serif]"
                >
                  BULAN
                </th>
                <th 
                  rowSpan={2} 
                  className="py-2.5 px-3.5 min-w-[220px] text-left border-r-2 border-slate-900 uppercase tracking-wider text-[11px] align-middle font-['Space_Grotesk',sans-serif]"
                >
                  DESCRIPTION
                </th>
                <th 
                  rowSpan={2} 
                  className="py-2.5 px-2.5 min-w-[65px] border-r-2 border-slate-900 uppercase tracking-wider text-[11px] align-middle font-['Space_Grotesk',sans-serif]"
                >
                  TOTAL
                </th>
                <th 
                  rowSpan={2} 
                  className="py-2.5 px-2.5 min-w-[85px] border-r-2 border-slate-900 uppercase tracking-wider text-[11px] align-middle font-['Space_Grotesk',sans-serif]"
                >
                  PROD<br />BOBOT
                </th>
                <th 
                  colSpan={days.length} 
                  className="py-1.5 px-2 border-b-1.5 border-slate-900 uppercase tracking-widest text-[11px] font-black font-mono bg-slate-300"
                >
                  TANGGAL
                </th>
              </tr>

              {/* Sub-Header: Day Numbers 1..31 */}
              <tr className="bg-slate-200 text-slate-900 font-black border-b-2.5 border-slate-900 font-mono text-[10px]">
                {days.map((d) => (
                  <th 
                    key={d.dayNumber} 
                    className="py-1 px-1.5 min-w-[32px] sm:min-w-[34px] border-r border-slate-400 last:border-r-0 hover:bg-blue-100 transition-colors"
                  >
                    {d.dayNumber}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body (9 Rows exactly matching user's image) */}
            <tbody className="divide-y divide-dashed divide-slate-300 bg-white font-mono text-[11px] font-bold text-slate-900">
              {/* Row 1: JUMLAH HARI KERJA */}
              <tr className="hover:bg-slate-50 transition-colors">
                {/* Merged BULAN cell vertically spanning rows 1-9 */}
                <td 
                  rowSpan={9} 
                  className="py-4 px-2 border-r-2.5 border-slate-900 bg-white font-['Space_Grotesk',sans-serif] font-black text-sm sm:text-base text-slate-950 align-middle text-center shadow-[inset_0px_0px_10px_rgba(0,0,0,0.03)]"
                >
                  <div className="w-full flex items-center justify-center p-2 rounded border-2 border-blue-600 bg-blue-50/70 text-blue-950 shadow-[1.5px_1.5px_0px_0px_#2563eb]">
                    <span className="tracking-tight font-extrabold">{kpi.bulan}</span>
                  </div>
                </td>

                <td className="py-2 px-3 text-left font-sans font-black text-slate-900 border-r-2 border-slate-900">
                  JUMLAH HARI KERJA
                </td>
                <td className="py-2 px-2 text-center font-black text-slate-950 border-r border-slate-400 bg-slate-50">
                  {kpi.totalHariKerja}
                </td>
                <td className="py-2 px-2 text-center font-black text-slate-900 border-r-2 border-slate-900">
                  {kpi.prodBobot}
                </td>
                {days.map((d) => (
                  <td 
                    key={d.dayNumber} 
                    className={`py-2 px-1 border-r border-dashed border-slate-200 last:border-r-0 text-center ${
                      d.hariKerja > 0 ? 'text-slate-900 font-black' : 'text-slate-400 font-normal'
                    }`}
                  >
                    {d.hariKerja}
                  </td>
                ))}
              </tr>

              {/* Row 2: DO FINISH */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-2 px-3 text-left font-sans font-black text-slate-900 border-r-2 border-slate-900">
                  DO FINISH
                </td>
                <td className="py-2 px-2 text-center font-black text-emerald-700 border-r border-slate-400 bg-slate-50">
                  {kpi.totalDoFinish}
                </td>
                <td className="py-2 px-2 text-center border-r-2 border-slate-900">
                  {/* Empty cell as in image */}
                </td>
                {days.map((d) => (
                  <td 
                    key={d.dayNumber} 
                    className={`py-2 px-1 border-r border-dashed border-slate-200 last:border-r-0 text-center ${
                      d.doFinish > 0 ? 'text-emerald-700 font-black bg-emerald-50/40' : 'text-slate-400 font-normal'
                    }`}
                  >
                    {d.doFinish}
                  </td>
                ))}
              </tr>

              {/* Row 3: PENDING CUSTOMER (with 'Total Jalur' cyan badge in PROD BOBOT) */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-2 px-3 text-left font-sans font-black text-slate-900 border-r-2 border-slate-900">
                  PENDING CUSTOMER
                </td>
                <td className="py-2 px-2 text-center font-black text-amber-800 border-r border-slate-400 bg-slate-50">
                  {kpi.totalPendingCustomer}
                </td>
                <td className="py-1 px-1.5 text-center border-r-2 border-slate-900 bg-cyan-400 text-slate-950 font-black text-[10px] font-sans">
                  Total Jalur
                </td>
                {days.map((d) => (
                  <td 
                    key={d.dayNumber} 
                    className={`py-2 px-1 border-r border-dashed border-slate-200 last:border-r-0 text-center ${
                      d.pendingCustomer > 0 ? 'text-amber-800 font-black bg-amber-50/50' : 'text-slate-400 font-normal'
                    }`}
                  >
                    {d.pendingCustomer}
                  </td>
                ))}
              </tr>

              {/* Row 4: PENDING BARANG (with total jalur DOs in PROD BOBOT) */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-2 px-3 text-left font-sans font-black text-slate-900 border-r-2 border-slate-900">
                  PENDING BARANG
                </td>
                <td className="py-2 px-2 text-center font-black text-slate-800 border-r border-slate-400 bg-slate-50">
                  {kpi.totalPendingBarang}
                </td>
                <td className="py-2 px-2 text-center font-black text-slate-950 border-r-2 border-slate-900 bg-slate-100">
                  {kpi.totalJalur}
                </td>
                {days.map((d) => (
                  <td 
                    key={d.dayNumber} 
                    className="py-2 px-1 border-r border-dashed border-slate-200 last:border-r-0 text-center text-slate-400 font-normal"
                  >
                    {d.pendingBarang}
                  </td>
                ))}
              </tr>

              {/* Row 5: PENDING STAFF (with 'QO' cyan badge in PROD BOBOT) */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-2 px-3 text-left font-sans font-black text-slate-900 border-r-2 border-slate-900">
                  PENDING STAFF
                </td>
                <td className="py-2 px-2 text-center font-black text-slate-800 border-r border-slate-400 bg-slate-50">
                  {kpi.totalPendingStaff}
                </td>
                <td className="py-1 px-1.5 text-center border-r-2 border-slate-900 bg-cyan-400 text-slate-950 font-black text-[10px] font-sans">
                  QO
                </td>
                {days.map((d) => (
                  <td 
                    key={d.dayNumber} 
                    className="py-2 px-1 border-r border-dashed border-slate-200 last:border-r-0 text-center text-slate-400 font-normal"
                  >
                    {d.pendingStaff}
                  </td>
                ))}
              </tr>

              {/* Row 6: LKPB */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-2 px-3 text-left font-sans font-black text-slate-900 border-r-2 border-slate-900">
                  LKPB
                </td>
                <td className="py-2 px-2 text-center font-black text-blue-800 border-r border-slate-400 bg-slate-50">
                  {kpi.totalLkpb}
                </td>
                <td className="py-2 px-2 text-center border-r-2 border-slate-900">
                  {/* Empty cell as in image */}
                </td>
                {days.map((d) => (
                  <td 
                    key={d.dayNumber} 
                    className={`py-2 px-1 border-r border-dashed border-slate-200 last:border-r-0 text-center ${
                      d.lkpb > 0 ? 'text-blue-800 font-black bg-blue-50/50' : 'text-slate-400 font-normal'
                    }`}
                  >
                    {d.lkpb}
                  </td>
                ))}
              </tr>

              {/* Row 7: Bobot Finish (with 100% in PROD BOBOT) */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-2 px-3 text-left font-sans font-black text-slate-900 border-r-2 border-slate-900">
                  Bobot Finish
                </td>
                <td className="py-2 px-2 text-center font-black text-emerald-800 border-r border-slate-400 bg-slate-50">
                  {kpi.totalBobotFinish}
                </td>
                <td className="py-2 px-2 text-center font-black text-slate-900 border-r-2 border-slate-900">
                  {kpi.qoRate || '100%'}
                </td>
                {days.map((d) => (
                  <td 
                    key={d.dayNumber} 
                    className={`py-2 px-1 border-r border-dashed border-slate-200 last:border-r-0 text-center ${
                      d.bobotFinish > 0 ? 'text-emerald-800 font-black bg-emerald-50/30' : 'text-slate-400 font-normal'
                    }`}
                  >
                    {d.bobotFinish}
                  </td>
                ))}
              </tr>

              {/* Row 8: Kualitas Hasil Service & installasi */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-2 px-3 text-left font-sans font-black text-slate-900 border-r-2 border-slate-900">
                  Kualitas Hasil Service & installasi
                </td>
                <td className="py-2 px-2 text-center font-black text-slate-900 border-r border-slate-400 bg-slate-50">
                  {kpi.kualitasHasil}
                </td>
                <td className="py-2 px-2 text-center border-r-2 border-slate-900">
                  {/* Empty cell */}
                </td>
                {days.map((d) => (
                  <td 
                    key={d.dayNumber} 
                    className="py-2 px-1 border-r border-dashed border-slate-200 last:border-r-0 text-center text-slate-400 font-normal"
                  >
                    {d.kualitasHasil}
                  </td>
                ))}
              </tr>

              {/* Row 9: Kelengkapan Alat Service Solution Pribadi & Team (HIGHLIGHTED YELLOW ENTIRE ROW) */}
              <tr className="bg-[#fef08a] text-slate-950 font-black border-t-2 border-slate-900">
                <td className="py-2 px-3 text-left font-sans font-black text-slate-950 border-r-2 border-slate-900 bg-[#fde047]">
                  Kelengkapan Alat Service Solution Pribadi & Team
                </td>
                <td className="py-2 px-2 text-center font-black text-slate-950 border-r border-yellow-500 bg-[#fde047]">
                  {kpi.kelengkapanAlat}
                </td>
                <td className="py-2 px-2 text-center font-black text-slate-950 border-r-2 border-slate-900 bg-[#fde047]">
                  {kpi.kelengkapanAlat}
                </td>
                {days.map((d) => (
                  <td 
                    key={d.dayNumber} 
                    className="py-2 px-1 border-r border-dashed border-yellow-400 last:border-r-0 text-center text-[10px] font-black text-slate-900"
                  >
                    {d.kelengkapanAlat}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Legend / Table Footer */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-slate-600 font-mono">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3 h-3 rounded bg-cyan-400 border border-slate-900"></span>
              <span>Total Jalur & QO: Indikator kapasitas alokasi</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3 h-3 rounded bg-[#fef08a] border border-slate-900"></span>
              <span>Baris Kuning: Kelengkapan alat 103.95%</span>
            </span>
          </div>
          <span className="font-bold text-slate-500">
            Sumber: Spreadsheet {currentMonth.monthName} {currentMonth.year}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* KPI Controls Header */}
      <div className="neo-card p-4 sm:p-5 bg-gradient-to-r from-blue-50 via-white to-amber-50 border-3 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="neo-stamp bg-blue-600 text-white text-[10px] font-mono">
                TEMPLATE KHUSUS
              </span>
              <span className="neo-pill bg-amber-200 text-amber-950 border-slate-900 text-xs font-black">
                FORMAT STANDAR SPREADSHEET
              </span>
              <span className="neo-pill bg-emerald-100 text-emerald-950 border-slate-900 text-xs font-black">
                {currentMonth.monthName} {currentMonth.year}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-['Space_Grotesk',sans-serif]">
              Tabel Khusus KPI per Individu Teknisi
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Tabel matriks harian perorangan lengkap dengan rincian hari kerja, DO finish, pending customer, pending barang, pending staff, LKPB, bobot, dan kelengkapan alat sesuai format template spreadsheet.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportXlsx}
              className="neo-btn bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-2 flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#0f172a]"
              title="Download file Excel (.xlsx) dengan format tabel persis seperti di gambar"
            >
              <FileSpreadsheet className="w-4 h-4 stroke-[2.5]" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              onClick={handlePrint}
              className="neo-btn bg-white hover:bg-slate-100 text-slate-900 text-xs px-3 py-2 flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#0f172a]"
              title="Cetak atau simpan sebagai PDF"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Filter Controls: Technician Selector & Month Selector */}
        <div className="mt-4 pt-4 border-t-2 border-slate-900/15 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 flex-wrap">
          {/* Technician Selector Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-700 font-mono mr-1">
              PILIH TEKNISI:
            </span>
            {technicians.map((t) => {
              const isSelected = !viewAllTechs && activeTechName.toUpperCase() === t.nama.toUpperCase();
              return (
                <button
                  key={t.nama}
                  onClick={() => {
                    setViewAllTechs(false);
                    handleSelectTech(t.nama);
                  }}
                  className={`neo-pill text-xs font-black px-3.5 py-1.5 cursor-pointer transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]'
                      : 'bg-white text-slate-800 border-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-slate-400'}`}></span>
                  <span>{t.alias || t.nama}</span>
                </button>
              );
            })}

            <button
              onClick={() => setViewAllTechs(true)}
              className={`neo-pill text-xs font-black px-3.5 py-1.5 cursor-pointer transition-all flex items-center gap-1.5 ${
                viewAllTechs
                  ? 'bg-amber-400 text-slate-950 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]'
                  : 'bg-white text-slate-800 border-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Semua Teknisi (Semua Tabel)</span>
            </button>
          </div>

          {/* Month Selector Dropdown (Sesuai Spreadsheet yang Ada di Pengaturan) */}
          {registeredMonths.length > 0 && onSelectMonth && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-700 font-mono">
                BULAN SPREADSHEET:
              </span>
              <div className="relative inline-flex items-center">
                <select
                  value={currentMonth.id}
                  onChange={(e) => {
                    const target = registeredMonths.find((m) => m.id === e.target.value);
                    if (target) onSelectMonth(target);
                  }}
                  className="bg-white border-2 border-slate-900 rounded-lg text-xs font-black text-slate-900 px-3 py-1.5 pr-8 appearance-none shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {registeredMonths.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.monthName} {m.year} {m.isDefault ? '★ (Default)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 stroke-[3] text-slate-900 absolute right-2 pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render Table(s) */}
      {viewAllTechs ? (
        <div className="space-y-6">
          {allKpis.map((kpi) => renderSingleKpiTable(kpi, true))}
        </div>
      ) : (
        renderSingleKpiTable(currentKpiData, false)
      )}
    </div>
  );
};
