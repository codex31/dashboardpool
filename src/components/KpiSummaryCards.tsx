import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Weight, 
  Users, 
  TrendingUp, 
  Target, 
  FileCheck2,
  AlertTriangle
} from 'lucide-react';
import { MonthSummary } from '../types';

interface KpiSummaryCardsProps {
  summary: MonthSummary;
  monthName: string;
  year: number;
}

export const KpiSummaryCards: React.FC<KpiSummaryCardsProps> = ({ summary: rawSummary, monthName, year }) => {
  const summary: MonthSummary = rawSummary || {
    totalJalur: 0,
    totalTeam: 0,
    avgProd: 0,
    totalBobotMasuk: 0,
    totalBobotFinish: 0,
    totalPending: 0,
    totalCancel: 0,
    totalLkpb: 0,
    totalTarget: 0,
    totalRealisasi: 0,
    overallAchvRate: 0,
    overallCompletionRate: 0,
    activeDaysCount: 0,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5">
      {/* Card 1: Total Jalur & Team */}
      <div 
        id="kpi-card-total-jalur"
        className="neo-card p-3.5 sm:p-4 relative transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#0f172a]"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="neo-stamp bg-blue-100 text-blue-900 text-[9px] uppercase font-mono">
              TOTAL JALUR & TEAM
            </span>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-['Space_Grotesk',sans-serif]">
                {(summary.totalJalur || 0).toLocaleString()}
              </span>
              <span className="text-[11px] font-black uppercase text-slate-500">Jalur</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white border-1.5 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#0f172a] flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="mt-3 pt-2 border-t-1.5 border-slate-900/15 flex items-center justify-between text-[11px] font-bold">
          <span className="text-slate-700">Team Aktif: <strong className="text-slate-900 font-black">{summary.totalTeam}</strong></span>
          <span className="neo-pill bg-blue-100 text-blue-950 border-slate-900">
            Prod: {summary.avgProd}
          </span>
        </div>
      </div>

      {/* Card 2: Bobot Masuk vs Bobot Finish */}
      <div 
        id="kpi-card-bobot-clearance"
        className="neo-card p-3.5 sm:p-4 relative transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#0f172a]"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="neo-stamp bg-sky-100 text-sky-950 text-[9px] uppercase font-mono">
              BOBOT CLEARANCE
            </span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-['Space_Grotesk',sans-serif]">
                {summary.totalBobotFinish}
              </span>
              <span className="text-[11px] font-black text-slate-500">/ {summary.totalBobotMasuk}</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-sky-300 text-slate-900 border-1.5 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#0f172a] flex items-center justify-center shrink-0">
            <Weight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-[11px] font-black">
            <span className="text-slate-700">Clearance Rate</span>
            <span className="text-blue-700">{summary.overallCompletionRate}%</span>
          </div>
          <div className="w-full bg-slate-200 border-1.5 border-slate-900 rounded-md h-2.5 overflow-hidden shadow-[1px_1px_0px_0px_#0f172a]">
            <div 
              className="bg-blue-600 h-full border-r-1.5 border-slate-900 transition-all duration-300"
              style={{ width: `${Math.min(100, summary.overallCompletionRate)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Card 3: Target vs Realisasi */}
      <div 
        id="kpi-card-target-realisasi"
        className="neo-card p-3.5 sm:p-4 relative transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#0f172a]"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="neo-stamp bg-emerald-100 text-emerald-950 text-[9px] uppercase font-mono">
              TARGET VS REALISASI
            </span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-['Space_Grotesk',sans-serif]">
                {summary.totalRealisasi}
              </span>
              <span className="text-[11px] font-bold text-slate-500">/ {summary.totalTarget} Target</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-300 text-slate-900 border-1.5 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#0f172a] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="mt-3 pt-2 border-t-1.5 border-slate-900/15 flex items-center justify-between text-[11px] font-bold">
          <span className="text-slate-700" title="Realisasi = Target Open dikurangi Pending, LKPB & Cancel">Pencapaian:</span>
          <span className="neo-pill bg-emerald-200 text-emerald-950 border-slate-900 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3 stroke-[2.5]" />
            {(summary.overallAchvRate || 0).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}% ACHV
          </span>
        </div>
      </div>

      {/* Card 4: Monitoring Pending & Cancel */}
      <div 
        id="kpi-card-pending-cancel"
        className="neo-card p-3.5 sm:p-4 relative transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#0f172a]"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="neo-stamp bg-amber-100 text-amber-950 text-[9px] uppercase font-mono">
              PENDING & CANCEL
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-600 font-['Space_Grotesk',sans-serif]">
                  {summary.totalPending}
                </span>
                <span className="text-[10px] font-black uppercase text-amber-700">PND</span>
              </div>
              <span className="text-slate-900 font-black text-base">/</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-rose-600 font-['Space_Grotesk',sans-serif]">
                  {summary.totalCancel}
                </span>
                <span className="text-[10px] font-black uppercase text-rose-700">CNC</span>
              </div>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-300 text-slate-900 border-1.5 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#0f172a] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="mt-3 pt-2 border-t-1.5 border-slate-900/15 flex items-center justify-between text-[11px] font-bold">
          <span className="text-slate-700">Total LKPB:</span>
          <span className="neo-pill bg-white text-slate-900 border-slate-900 flex items-center gap-1">
            <FileCheck2 className="w-3 h-3 text-blue-600 stroke-[2.5]" />
            {summary.totalLkpb} Terbit
          </span>
        </div>
      </div>
    </div>
  );
};
