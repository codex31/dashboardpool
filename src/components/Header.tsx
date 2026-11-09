import React from 'react';
import { 
  Building2, 
  Calendar, 
  RefreshCw, 
  BarChart3, 
  Clock, 
  FileText, 
  Settings, 
  Activity, 
  ChevronDown,
  ExternalLink,
  Layers,
  Zap,
  Bell,
  CheckCheck,
  AlertTriangle,
  Tag,
  CalendarDays,
  Trophy
} from 'lucide-react';
import { TabType, ContainerSyncInfo } from '../types';
import { RegisteredMonthConfig } from '../services/sheetService';
import { ConnectionStatus } from '../services/liveSyncService';
import { CURRENT_APP_VERSION } from '../data/versionHistory';

interface HeaderProps {
  currentMonthConfig: RegisteredMonthConfig;
  registeredMonths: RegisteredMonthConfig[];
  onSelectMonth: (config: RegisteredMonthConfig) => void;
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdatedText: string;
  detailPendingCount?: number;
  detailLkpbCount?: number;
  connectionStatus?: ConnectionStatus;
  recentNotificationCount?: number;
  unlistedPendingCount?: number;
  containerSync?: ContainerSyncInfo | null;
  onOpenNotifications?: () => void;
  onClearNotifications?: () => void;
  onOpenAuditModal?: () => void;
  onOpenVersionModal?: () => void;
  onTriggerContainerSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonthConfig,
  registeredMonths,
  onSelectMonth,
  activeTab,
  onSelectTab,
  onRefresh,
  isRefreshing,
  lastUpdatedText,
  detailPendingCount,
  detailLkpbCount,
  connectionStatus = 'connected',
  recentNotificationCount = 0,
  unlistedPendingCount = 0,
  containerSync,
  onOpenNotifications,
  onClearNotifications,
  onOpenAuditModal,
  onOpenVersionModal,
  onTriggerContainerSync,
}) => {
  const tabs = [
    { id: 'overview' as TabType, label: 'Monitoring DO', icon: Layers, count: null },
    { 
      id: 'pending' as TabType, 
      label: 'Monitoring Pending', 
      icon: Clock, 
      count: detailPendingCount ? `${detailPendingCount}` : null 
    },
    { 
      id: 'lkpb' as TabType, 
      label: 'Monitoring LKPB & Cancel', 
      icon: FileText, 
      count: detailLkpbCount ? `${detailLkpbCount}` : null 
    },
    { 
      id: 'individual' as TabType, 
      label: 'Summary Individu', 
      icon: Trophy, 
      count: '3 Tim' 
    },
    { 
      id: 'schedule' as TabType, 
      label: 'Schedule Tim', 
      icon: CalendarDays, 
      count: '9 Bln' 
    },
    { id: 'analytics' as TabType, label: 'Data Analytic', icon: BarChart3, count: null },
    { id: 'admin' as TabType, label: 'Admin & Tambah Bulan', icon: Settings, count: registeredMonths.length },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2.5 border-slate-900 shadow-[0px_3px_0px_0px_#0f172a] px-3.5 sm:px-5 lg:px-6 py-2.5 sm:py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Pool Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center text-white shrink-0">
            <Building2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="neo-stamp bg-blue-600 text-white text-[10px] uppercase font-mono">
                Pool Singkawang
              </span>

              {/* Version Badge (SemVer) */}
              <button
                id="btn-header-version-badge"
                onClick={onOpenVersionModal}
                className="neo-pill bg-indigo-100 hover:bg-indigo-200 text-indigo-950 border-slate-900 text-[9px] font-mono font-black cursor-pointer transition-transform hover:-translate-y-0.5 flex items-center gap-1 shadow-[1px_1px_0px_0px_#0f172a]"
                title={`Versi SemVer v${CURRENT_APP_VERSION}. Klik untuk riwayat pembaruan & changelog.`}
              >
                <Tag className="w-2.5 h-2.5 text-indigo-700 stroke-[2.5]" />
                <span>v{CURRENT_APP_VERSION}</span>
              </button>

              {/* Multi-Container Auto-Sync Pill */}
              <button
                id="btn-header-container-sync-pill"
                onClick={onTriggerContainerSync}
                className={`neo-pill text-[9px] font-black border-slate-900 cursor-pointer transition-transform hover:-translate-y-0.5 flex items-center gap-1 ${
                  containerSync?.status === 'syncing'
                    ? 'bg-amber-200 text-amber-950'
                    : containerSync?.status === 'error'
                    ? 'bg-rose-200 text-rose-950'
                    : 'bg-cyan-200 text-cyan-950'
                }`}
                title={`Sinkronisasi Otomatis Antar-Kontainer: ${containerSync?.message || 'Aktif'}. Klik untuk paksa sinkronisasi sekarang.`}
              >
                <RefreshCw className={`w-2 h-2 stroke-[2.5] ${containerSync?.status === 'syncing' ? 'animate-spin' : ''}`} />
                <span>
                  {containerSync?.status === 'syncing'
                    ? 'SYNCING...'
                    : containerSync?.status === 'error'
                    ? 'SYNC ERR'
                    : 'CONTAINER SYNC'}
                </span>
              </button>

              {/* WebSocket Status Indicator Pill */}
              <button
                id="btn-open-live-ws-drawer"
                onClick={onOpenNotifications}
                className={`neo-pill text-[9px] font-black border-slate-900 cursor-pointer transition-transform hover:-translate-y-0.5 ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-300 text-slate-950'
                    : 'bg-rose-300 text-slate-950'
                }`}
                title="Buka panel real-time WebSocket & simulasi"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-950 animate-ping' : 'bg-rose-950'}`}></span>
                <span>{connectionStatus === 'connected' ? 'LIVE WS' : 'RECONNECTING...'}</span>
              </button>

              {/* Unlisted Pending Audit Warning Chip */}
              {unlistedPendingCount > 0 && (
                <button
                  id="btn-header-audit-warning"
                  onClick={onOpenAuditModal}
                  className="neo-pill bg-amber-300 hover:bg-amber-400 text-slate-950 border-slate-900 text-[9px] font-black cursor-pointer animate-pulse"
                  title="Ada DO pending di sheet tanggal yang belum diinput ke Detail Pending"
                >
                  <AlertTriangle className="w-2.5 h-2.5 text-rose-700 stroke-[3]" />
                  <span>{unlistedPendingCount} AUDIT PENDING</span>
                </button>
              )}
              {/* Year indicator chip if 2025 */}
              {currentMonthConfig.year === 2025 && (
                <span className="neo-pill bg-indigo-200 text-indigo-950 border-slate-900 text-[9px] font-black">
                  TAHUN 2025
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-0.5 font-['Space_Grotesk',sans-serif]">
              MONITORING DELIVERY ORDER (DO)
            </h1>
          </div>
        </div>

        {/* Action Controls & Month Selector */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Notification Bell & Mark as Read Trigger */}
          <div className="flex items-center gap-1">
            {onOpenNotifications && (
              <button
                id="btn-notification-bell"
                onClick={onOpenNotifications}
                className="neo-btn bg-white hover:bg-slate-100 text-slate-900 px-2.5 py-1.5 text-xs font-black border-slate-900 relative shadow-[1.5px_1.5px_0px_0px_#0f172a]"
                title="Lihat riwayat notifikasi real-time & tes simulasi"
              >
                <Bell className="w-3.5 h-3.5 stroke-[2.5]" />
                {recentNotificationCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-mono font-black flex items-center justify-center border border-slate-900">
                    {recentNotificationCount > 9 ? '9+' : recentNotificationCount}
                  </span>
                )}
              </button>
            )}

            {recentNotificationCount > 0 && onClearNotifications && (
              <button
                id="btn-mark-all-read-header"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearNotifications();
                }}
                className="neo-btn bg-rose-100 hover:bg-rose-200 text-rose-950 border-slate-900 px-2 py-1.5 text-[10px] sm:text-[11px] font-black shadow-[1.5px_1.5px_0px_0px_#0f172a] flex items-center gap-1 cursor-pointer transition-all whitespace-nowrap"
                title="Tandai semua notifikasi sudah dibaca (hapus badge angka)"
              >
                <CheckCheck className="w-3.5 h-3.5 stroke-[2.5] text-rose-700" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Month Selector Dropdown */}
          <div className="relative group">
            <label className="text-[9px] uppercase font-black tracking-wider text-slate-700 block -mb-0.5 px-1 font-mono">
              PERIODE AKTIF
            </label>
            <div className="relative inline-flex items-center">
              <select
                id="month-selector-dropdown"
                value={currentMonthConfig.id}
                onChange={(e) => {
                  const target = registeredMonths.find((m) => m.id === e.target.value);
                  if (target) onSelectMonth(target);
                }}
                className="appearance-none neo-input bg-white text-slate-900 font-extrabold text-xs pl-2.5 pr-7 py-1.5 rounded-lg cursor-pointer"
              >
                {/* Year 2026 */}
                {registeredMonths.some((m) => m.year === 2026) && (
                  <optgroup label="─── TAHUN 2026 ───" className="font-black text-blue-900 bg-blue-50">
                    {registeredMonths
                      .filter((m) => m.year === 2026)
                      .map((m) => (
                        <option key={m.id} value={m.id} className="text-slate-900 bg-white font-bold">
                          {m.monthName} {m.year} {m.isDefault ? '(Default)' : ''}
                        </option>
                      ))}
                  </optgroup>
                )}
                {/* Year 2025 */}
                {registeredMonths.some((m) => m.year === 2025) && (
                  <optgroup label="─── TAHUN 2025 ───" className="font-black text-indigo-900 bg-indigo-50">
                    {registeredMonths
                      .filter((m) => m.year === 2025)
                      .map((m) => (
                        <option key={m.id} value={m.id} className="text-slate-900 bg-white font-bold">
                          {m.monthName} {m.year} {m.isDefault ? '(Default)' : ''}
                        </option>
                      ))}
                  </optgroup>
                )}
                {/* Other years if any */}
                {registeredMonths.some((m) => m.year !== 2026 && m.year !== 2025) && (
                  <optgroup label="─── LAINNYA ───" className="font-black text-slate-900 bg-slate-50">
                    {registeredMonths
                      .filter((m) => m.year !== 2026 && m.year !== 2025)
                      .map((m) => (
                        <option key={m.id} value={m.id} className="text-slate-900 bg-white font-bold">
                          {m.monthName} {m.year} {m.isDefault ? '(Default)' : ''}
                        </option>
                      ))}
                  </optgroup>
                )}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-900 pointer-events-none absolute right-2 stroke-[3]" />
            </div>
          </div>

          {/* Refresh Data Button */}
          <button
            id="btn-refresh-sheet-data"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Tarik data terbaru dari Google Spreadsheet"
            className="neo-btn neo-btn-primary px-3 py-1.5 mt-2.5 sm:mt-0 text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'MENYINKRONKAN...' : 'SYNC SHEET'}</span>
          </button>

          {/* Open Google Sheet Link */}
          {currentMonthConfig.sheetUrl && (
            <a
              id="link-open-google-sheet"
              href={currentMonthConfig.sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="neo-btn neo-btn-white px-2.5 py-1.5 mt-2.5 sm:mt-0 text-xs gap-1.5"
              title="Buka Spreadsheet Asli di Tab Baru"
            >
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">BUKA SHEET</span>
            </a>
          )}
        </div>
      </div>

      {/* Tab Navigation Neo Brutalism Pill Bar */}
      <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t-2 border-slate-900 flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
        <nav className="flex items-center gap-1 sm:gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-nav-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg whitespace-nowrap transition-all duration-100 ${
                  isActive
                    ? 'bg-blue-600 text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] -translate-y-0.5'
                    : 'bg-white text-slate-800 border-2 border-transparent hover:border-slate-900 hover:bg-blue-50 hover:shadow-[1.5px_1.5px_0px_0px_#0f172a]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 stroke-[2.5] ${isActive ? 'text-white' : 'text-slate-900'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`neo-pill text-[9px] py-0 px-1.5 ${
                      isActive 
                        ? 'bg-white text-slate-900 border-white shadow-none' 
                        : 'bg-blue-100 text-blue-900 border-slate-900'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Last updated indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-700 whitespace-nowrap pl-3">
          <Activity className="w-3 h-3 text-blue-600 stroke-[3]" />
          <span>UPDATE: {lastUpdatedText}</span>
        </div>
      </div>
    </header>
  );
};
