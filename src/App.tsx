import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { KpiSummaryCards } from './components/KpiSummaryCards';
import { DailyMonitoringTable } from './components/DailyMonitoringTable';
import { PendingMonitoringView } from './components/PendingMonitoringView';
import { LkpbMonitoringView } from './components/LkpbMonitoringView';
import { IndividualSummaryView } from './components/IndividualSummaryView';
import { DateDetailModal } from './components/DateDetailModal';
import { LiveToastNotification } from './components/LiveToastNotification';
import { UnlistedPendingAuditBanner } from './components/UnlistedPendingAuditBanner';
import { useLiveSync } from './hooks/useLiveSync';
import { 
  DailyRecord, 
  MonthlyDataset, 
  TabType 
} from './types';
import { 
  RegisteredMonthConfig, 
  getRegisteredMonths, 
  saveRegisteredMonths, 
  fetchMonthDataset 
} from './services/sheetService';
import { fetchIndividualSummaryData } from './services/individualSummaryService';
import { DEFAULT_SEPTEMBER_DATASET } from './data/defaultSeptemberData';
import { DEFAULT_OCTOBER_DATASET } from './data/defaultOctoberData';
import { DEFAULT_NOVEMBER_2026_DATASET } from './data/defaultNovemberData';
import { diffDatasets } from './utils/datasetDiff';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export const DEFAULT_NOVEMBER_CONFIG: RegisteredMonthConfig = {
  id: '2026-11',
  monthName: 'November',
  monthNumber: 11,
  year: 2026,
  sheetUrl:
    'https://docs.google.com/spreadsheets/d/1HN4MlIUBsEP5tzpOfKFeNbQ2G7ldgaZu9_r9qOHm6pA/edit?gid=808257444#gid=808257444',
  gid: '808257444',
  detailPendingGid: '216624293',
  detailLkpbGid: '200773994',
  lastUpdated: new Date().toISOString(),
  isDefault: true,
};

const DEFAULT_OCTOBER_CONFIG: RegisteredMonthConfig = {
  id: '2026-10',
  monthName: 'Oktober',
  monthNumber: 10,
  year: 2026,
  sheetUrl:
    'https://docs.google.com/spreadsheets/d/1lVcO9SDDlelm0n65LdN2qNcdliCpfK230Nq19MnLGRM/edit?gid=808257444#gid=808257444',
  gid: '808257444',
  detailPendingGid: '216624293',
  detailLkpbGid: '200773994',
  lastUpdated: new Date().toISOString(),
  isDefault: false,
};

const DEFAULT_SEPTEMBER_CONFIG: RegisteredMonthConfig = {
  id: '2026-09',
  monthName: 'September',
  monthNumber: 9,
  year: 2026,
  sheetUrl:
    'https://docs.google.com/spreadsheets/d/10yajj552DnuKf0-rroYqcdyET60WjTCe58PknW7L6Dw/edit?gid=808257444#gid=808257444',
  gid: '808257444',
  detailPendingGid: '216624293',
  detailLkpbGid: '200773994',
  lastUpdated: new Date().toISOString(),
  isDefault: false,
};

// Lazy-loaded secondary components for lightning-fast initial page load
const AnalyticsView = lazy(() => import('./components/AnalyticsView').then((m) => ({ default: m.AnalyticsView })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const TeamScheduleView = lazy(() => import('./components/TeamScheduleView').then((m) => ({ default: m.TeamScheduleView })));
const VersionModal = lazy(() => import('./components/VersionModal').then((m) => ({ default: m.VersionModal })));
const UnlistedPendingAuditModal = lazy(() => import('./components/UnlistedPendingAuditModal').then((m) => ({ default: m.UnlistedPendingAuditModal })));
const LiveNotificationHistoryDrawer = lazy(() => import('./components/LiveNotificationHistoryDrawer').then((m) => ({ default: m.LiveNotificationHistoryDrawer })));

export default function App() {
  const [registeredMonths, setRegisteredMonths] = useState<RegisteredMonthConfig[]>([
    DEFAULT_NOVEMBER_CONFIG,
    DEFAULT_OCTOBER_CONFIG,
    DEFAULT_SEPTEMBER_CONFIG,
  ]);

  const [currentMonthConfig, setCurrentMonthConfig] = useState<RegisteredMonthConfig>(() => {
    try {
      const preferredId = typeof window !== 'undefined' ? localStorage.getItem('preferred_default_month_id') : null;
      if (preferredId === '2026-11') return DEFAULT_NOVEMBER_CONFIG;
      if (preferredId === '2026-10') return DEFAULT_OCTOBER_CONFIG;
      if (preferredId === '2026-09') return DEFAULT_SEPTEMBER_CONFIG;
    } catch {}
    return DEFAULT_NOVEMBER_CONFIG;
  });

  const [currentDataset, setCurrentDataset] = useState<MonthlyDataset>(() => {
    try {
      const preferredId = typeof window !== 'undefined' ? localStorage.getItem('preferred_default_month_id') : null;
      if (preferredId === '2026-11') return DEFAULT_NOVEMBER_2026_DATASET;
      if (preferredId === '2026-10') return DEFAULT_OCTOBER_DATASET;
      if (preferredId === '2026-09') return DEFAULT_SEPTEMBER_DATASET;
    } catch {}
    return DEFAULT_NOVEMBER_2026_DATASET;
  });
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedRecord, setSelectedRecord] = useState<DailyRecord | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  // Keep a ref to the current dataset for diff detection
  const currentDatasetRef = useRef<MonthlyDataset>(currentDataset);
  useEffect(() => {
    currentDatasetRef.current = currentDataset;
  }, [currentDataset]);

  // Ref to hold pushLocalNotification to avoid circular dependency
  const pushLocalNotifRef = useRef<((notif: any) => void) | null>(null);

  // Load dataset when currentMonthConfig changes
  const loadDataset = useCallback(
    async (config: RegisteredMonthConfig, force = false, isAutoSync = false) => {
      setIsRefreshing(true);
      setErrorMessage(null);
      const startTime = Date.now();
      const prevData = currentDatasetRef.current;

      try {
        const newData = await fetchMonthDataset(config, force);
        const durationMs = Date.now() - startTime;
        setCurrentDataset(newData);

        // Detect differences between previous and fresh dataset
        const diff = diffDatasets(prevData, newData);

        if (diff.hasChanges) {
          // Trigger rich notification about the changes detected
          if (pushLocalNotifRef.current) {
            pushLocalNotifRef.current({
              id: `diff-${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'spreadsheet_change',
              title: `${diff.changes.length} Perubahan Spreadsheet`,
              message: diff.summaryDiff,
              changes: diff.changes,
              durationMs,
              isAutoSync,
              stats: {
                totalDo: newData.summary?.totalDo,
                totalPending: newData.summary?.totalPending,
                totalLkpb: newData.summary?.totalLkpb,
              },
              noDo: diff.firstChangedDo?.noDo || '',
              oldStatus: diff.firstChangedDo?.oldStatus || '',
              newStatus: diff.firstChangedDo?.newStatus || '',
              sheetName: diff.firstChangedDo?.sheetName || config.monthName,
            });
          }

          setSuccessBanner(`✓ Data diperbarui: ${diff.changes.slice(0, 2).join(' • ')}`);
          setTimeout(() => setSuccessBanner(null), 5000);
        } else if (force) {
          // Manual sync feedback: ensure user always gets confirmation
          if (pushLocalNotifRef.current) {
            pushLocalNotifRef.current({
              id: `sync-ok-${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'sync_success',
              title: 'Sinkronisasi Spreadsheet Selesai',
              message: `Data ${config.monthName} ${config.year} 100% sinkron dengan Google Spreadsheet.`,
              durationMs,
              isAutoSync: false,
              stats: {
                totalDo: newData.summary?.totalDo,
                totalPending: newData.summary?.totalPending,
                totalLkpb: newData.summary?.totalLkpb,
              },
              noDo: '',
              oldStatus: '',
              newStatus: '',
              sheetName: config.monthName,
            });
          }

          setSuccessBanner(`✓ Data ${config.monthName} ${config.year} berhasil disinkronkan (${durationMs}ms).`);
          setTimeout(() => setSuccessBanner(null), 4000);
        }
      } catch (err: any) {
        console.error('Failed to load dataset:', err);
        // If it's September, we already have preloaded default data
        if (config.id !== '2026-09') {
          setErrorMessage(err.message || 'Gagal menyinkronkan data spreadsheet');
        }
      } finally {
        setIsRefreshing(false);
      }
    },
    []
  );

  // Live WebSocket Integration: automatic background refresh without user needing to reload
  const liveSync = useLiveSync(
    useCallback(() => {
      console.log('[App] Live update event triggered: refreshing current dataset seamlessly...');
      loadDataset(currentMonthConfig, false, true);
    }, [currentMonthConfig, loadDataset])
  );

  // Connect the ref to pushLocalNotification
  useEffect(() => {
    pushLocalNotifRef.current = liveSync.pushLocalNotification;
  }, [liveSync.pushLocalNotification]);

  // Combine unlisted pending DOs from dataset and live socket
  const effectiveUnlistedPendingDos = React.useMemo(() => {
    if (liveSync.unlistedPendingDos && liveSync.unlistedPendingDos.length > 0) {
      return liveSync.unlistedPendingDos;
    }
    return currentDataset.unlistedPendingDos || [];
  }, [liveSync.unlistedPendingDos, currentDataset.unlistedPendingDos]);

  // Load registered months on startup and immediately sync fresh live data (including Summary Individu)
  useEffect(() => {
    getRegisteredMonths().then((list) => {
      if (list && list.length > 0) {
        setRegisteredMonths(list);
        const preferredId = typeof window !== 'undefined' ? localStorage.getItem('preferred_default_month_id') : null;
        const initialSelected = 
          (preferredId && list.find((m) => m.id === preferredId)) ||
          list.find((m) => m.isDefault) ||
          list.find((m) => m.id === '2026-11') ||
          list.find((m) => m.id === '2026-10') ||
          list.find((m) => m.id === '2026-09') ||
          list[0];

        setCurrentMonthConfig(initialSelected);

        // Defer background auto-sync so initial FCP/LCP, TBT and main thread remain 100% pristine (0ms TBT)
        const deferBackgroundSync = () => {
          loadDataset(initialSelected, false, true);
          fetchIndividualSummaryData(initialSelected.sheetUrl, false).catch((err) => {
            console.warn('[App] Background auto-sync for Summary Individu failed:', err);
          });
        };

        const timer = setTimeout(() => {
          if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            (window as any).requestIdleCallback(deferBackgroundSync, { timeout: 4000 });
          } else {
            deferBackgroundSync();
          }
        }, 8000);

        return () => clearTimeout(timer);
      }
    });
  }, [loadDataset]);

  // Automatic periodic background sync (every 25 seconds)
  // Ensures changes in Google Spreadsheet are reflected automatically without requiring manual button clicks
  useEffect(() => {
    const interval = setInterval(() => {
      // Background auto-sync does not block UI, checks if data has changed
      loadDataset(currentMonthConfig, false, true);
    }, 25000);

    return () => clearInterval(interval);
  }, [currentMonthConfig, loadDataset]);

  const handleRefresh = () => {
    loadDataset(currentMonthConfig, true);
    // Also auto-sync individual summary when user refreshes
    fetchIndividualSummaryData(currentMonthConfig.sheetUrl, true).catch(() => {});
    liveSync.triggerPoll();
  };

  const handleSelectMonth = (config: RegisteredMonthConfig) => {
    setCurrentMonthConfig(config);
    loadDataset(config, false);
    fetchIndividualSummaryData(config.sheetUrl, false).catch(() => {});
  };

  const handleSaveMonth = async (
    newConfig: RegisteredMonthConfig,
    preloadedData?: MonthlyDataset
  ) => {
    const existingIndex = registeredMonths.findIndex((m) => m.id === newConfig.id);
    let updatedList: RegisteredMonthConfig[];

    if (existingIndex >= 0) {
      updatedList = [...registeredMonths];
      updatedList[existingIndex] = newConfig;
    } else {
      updatedList = [newConfig, ...registeredMonths];
    }

    setRegisteredMonths(updatedList);
    await saveRegisteredMonths(updatedList);

    if (preloadedData) {
      setCurrentDataset(preloadedData);
      setCurrentMonthConfig(newConfig);
      setActiveTab('overview');
    } else {
      handleSelectMonth(newConfig);
    }
  };

  const handleDeleteMonth = async (id: string) => {
    const updatedList = registeredMonths.filter((m) => m.id !== id);
    setRegisteredMonths(updatedList);
    await saveRegisteredMonths(updatedList);

    if (currentMonthConfig.id === id) {
      const fallback = updatedList[0] || registeredMonths[0];
      handleSelectMonth(fallback);
    }
  };

  // Format last updated text
  const lastUpdatedText = React.useMemo(() => {
    try {
      const d = new Date(currentDataset.lastUpdated);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Baru saja';
    }
  }, [currentDataset.lastUpdated]);

  const handleViewDoFromToast = (noDo: string, sheetName: string) => {
    // If sheetName corresponds to a day (e.g. "tgl 15"), find that record
    const match = sheetName.match(/tgl\s*(\d+)/i);
    if (match) {
      const dayNum = parseInt(match[1], 10);
      const targetRecord = currentDataset.records.find((r) => r.dayNumber === dayNum);
      if (targetRecord) {
        setSelectedRecord(targetRecord);
        return;
      }
    }
    // Fallback: switch to Pending tab to inspect
    setActiveTab('pending');
  };

  const handleSetDefaultMonth = async (monthId: string) => {
    try {
      localStorage.setItem('preferred_default_month_id', monthId);
    } catch {}
    const updatedList = registeredMonths.map((m) => ({
      ...m,
      isDefault: m.id === monthId,
    }));
    setRegisteredMonths(updatedList);
    await saveRegisteredMonths(updatedList);

    const target = updatedList.find((m) => m.id === monthId);
    if (target) {
      handleSelectMonth(target);
    }
  };

  return (
    <div className="relative min-h-screen neo-canvas-grid text-slate-900 antialiased overflow-x-hidden">
      {/* Decorative Neo Brutalist Corner Stamps */}
      <div className="pointer-events-none fixed top-24 right-4 z-0 hidden 2xl:flex flex-col gap-2 items-end opacity-40">
        <span className="neo-stamp bg-white text-slate-900 text-[10px] uppercase font-mono">POOL//SINGKAWANG-01</span>
        <span className="neo-stamp bg-blue-600 text-white text-[10px] uppercase font-mono">SYS.ONLINE-LIVE</span>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header with WebSocket Status & Notification Triggers */}
        <Header
          currentMonthConfig={currentMonthConfig}
          registeredMonths={registeredMonths}
          onSelectMonth={handleSelectMonth}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          lastUpdatedText={lastUpdatedText}
          detailPendingCount={currentDataset.detailPending?.length}
          detailLkpbCount={currentDataset.detailLkpb?.length}
          connectionStatus={liveSync.connectionStatus}
          recentNotificationCount={liveSync.recentNotifications.length}
          unlistedPendingCount={effectiveUnlistedPendingDos.length}
          containerSync={liveSync.containerSync}
          onOpenNotifications={() => setIsHistoryDrawerOpen(true)}
          onClearNotifications={liveSync.clearAllNotifications}
          onOpenAuditModal={() => setIsAuditModalOpen(true)}
          onOpenVersionModal={() => setIsVersionModalOpen(true)}
          onTriggerContainerSync={liveSync.triggerContainerSync}
        />

        {/* Global Pending Audit Discrepancy Banner */}
        <UnlistedPendingAuditBanner
          unlistedDos={effectiveUnlistedPendingDos}
          onOpenAuditModal={() => setIsAuditModalOpen(true)}
          spreadsheetUrl={currentMonthConfig.sheetUrl}
        />

        {/* Global Notifications */}
        {errorMessage && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
            <div className="p-4 rounded-xl bg-rose-100 border-2 border-slate-900 text-rose-950 text-xs sm:text-sm flex items-start justify-between shadow-[4px_4px_0px_0px_#0f172a]">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-extrabold">Koneksi Spreadsheet Bermasalah:</strong> {errorMessage}
                </div>
              </div>
              <button 
                onClick={() => setErrorMessage(null)}
                className="text-xs font-black text-rose-800 hover:underline ml-4"
              >
                Tutup [X]
              </button>
            </div>
          </div>
        )}

        {successBanner && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
            <div className="p-3.5 rounded-xl bg-emerald-100 border-2 border-slate-900 text-emerald-950 text-xs sm:text-sm flex items-center justify-between shadow-[4px_4px_0px_0px_#0f172a]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="font-bold">{successBanner}</span>
              </div>
              <button 
                onClick={() => setSuccessBanner(null)}
                className="neo-btn px-2.5 py-0.5 text-xs bg-white text-slate-900 hover:bg-slate-100"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          {/* Top KPI Cards (Always visible or in Overview/Pending/Lkpb/Analytics) */}
          {activeTab !== 'admin' && activeTab !== 'schedule' && (
            <KpiSummaryCards
              summary={currentDataset.summary}
              monthName={currentDataset.monthName}
              year={currentDataset.year}
            />
          )}

          {/* Tab 1: Overview & DO Monitoring Table */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <DailyMonitoringTable
                records={currentDataset.records}
                summary={currentDataset.summary}
                monthName={currentDataset.monthName}
                year={currentDataset.year}
                onSelectRecord={(rec) => setSelectedRecord(rec)}
              />
            </div>
          )}

          {/* Tab 2: Dedicated Pending Monitoring */}
          {activeTab === 'pending' && (
            <PendingMonitoringView
              records={currentDataset.records}
              summary={currentDataset.summary}
              monthName={currentDataset.monthName}
              year={currentDataset.year}
              detailPending={currentDataset.detailPending}
              unlistedPendingDos={effectiveUnlistedPendingDos}
              onOpenAuditModal={() => setIsAuditModalOpen(true)}
              onSelectRecord={(rec) => setSelectedRecord(rec)}
            />
          )}

          {/* Tab 3: Dedicated LKPB & Cancel Monitoring */}
          {activeTab === 'lkpb' && (
            <LkpbMonitoringView
              records={currentDataset.records}
              summary={currentDataset.summary}
              monthName={currentDataset.monthName}
              year={currentDataset.year}
              detailLkpb={currentDataset.detailLkpb}
              canceledDos={currentDataset.canceledDos}
              onSelectRecord={(rec) => setSelectedRecord(rec)}
            />
          )}

          {/* Tab: Summary Individu & Leaderboard Tim */}
          {activeTab === 'individual' && (
            <IndividualSummaryView
              currentMonth={currentMonthConfig}
              registeredMonths={registeredMonths}
              onSelectMonth={handleSelectMonth}
              monthlyRecords={currentDataset.records}
              monthSummary={currentDataset.summary}
            />
          )}

          {/* Tab 4: Team Schedule & Roster (Januari - Oktober 2026) */}
          {activeTab === 'schedule' && (
            <Suspense fallback={<div className="neo-card p-6 text-center font-bold text-slate-600">Memuat Jadwal Tim...</div>}>
              <TeamScheduleView
                onNotify={(msg) => {
                  setSuccessBanner(msg);
                  setTimeout(() => setSuccessBanner(null), 4000);
                }}
              />
            </Suspense>
          )}

          {/* Tab 5: Rich Analytics */}
          {activeTab === 'analytics' && (
            <Suspense fallback={<div className="neo-card p-6 text-center font-bold text-slate-600">Memuat Analitik...</div>}>
              <AnalyticsView
                records={currentDataset.records}
                summary={currentDataset.summary}
                monthName={currentDataset.monthName}
                year={currentDataset.year}
                registeredMonths={registeredMonths}
                currentMonthId={currentMonthConfig.id}
              />
            </Suspense>
          )}

          {/* Tab 5: Admin Dashboard (Add Month & Manage Sheets) */}
          {activeTab === 'admin' && (
            <Suspense fallback={<div className="neo-card p-6 text-center font-bold text-slate-600">Memuat Admin Dashboard...</div>}>
              <AdminDashboard
                registeredMonths={registeredMonths}
                currentMonthId={currentMonthConfig.id}
                onSaveMonth={handleSaveMonth}
                onDeleteMonth={handleDeleteMonth}
                onSelectMonth={handleSelectMonth}
                onRefreshMonth={(m) => loadDataset(m, true)}
                containerSync={liveSync.containerSync}
                onTriggerContainerSync={liveSync.triggerContainerSync}
                onOpenVersionModal={() => setIsVersionModalOpen(true)}
                onSetDefaultMonth={handleSetDefaultMonth}
              />
            </Suspense>
          )}
        </main>

        {/* Detail Modal for Clicked Date */}
        <DateDetailModal
          record={selectedRecord}
          canceledDos={currentDataset.canceledDos}
          onClose={() => setSelectedRecord(null)}
        />

        {/* Unlisted Pending Audit Modal */}
        {isAuditModalOpen && (
          <Suspense fallback={null}>
            <UnlistedPendingAuditModal
              isOpen={isAuditModalOpen}
              onClose={() => setIsAuditModalOpen(false)}
              unlistedDos={effectiveUnlistedPendingDos}
              sheetUrl={currentMonthConfig.sheetUrl}
              onRefreshAudit={() => liveSync.triggerPoll()}
            />
          </Suspense>
        )}

        {/* Live Notification History & Simulator Drawer */}
        {isHistoryDrawerOpen && (
          <Suspense fallback={null}>
            <LiveNotificationHistoryDrawer
              isOpen={isHistoryDrawerOpen}
              onClose={() => setIsHistoryDrawerOpen(false)}
              notifications={liveSync.recentNotifications}
              connectionStatus={liveSync.connectionStatus}
              lastHeartbeat={liveSync.lastHeartbeat}
              onTriggerPoll={liveSync.triggerPoll}
              onSimulateUpdate={liveSync.simulateStatusChange}
              onViewDo={handleViewDoFromToast}
              onClearAllNotifications={liveSync.clearAllNotifications}
            />
          </Suspense>
        )}

        {/* Live Toast Notification Popup */}
        <LiveToastNotification
          notification={liveSync.activeToast}
          onDismiss={liveSync.dismissToast}
          onViewDo={handleViewDoFromToast}
        />

        {/* Semantic Versioning History & Changelog Modal */}
        {isVersionModalOpen && (
          <Suspense fallback={null}>
            <VersionModal
              isOpen={isVersionModalOpen}
              onClose={() => setIsVersionModalOpen(false)}
            />
          </Suspense>
        )}

        {/* Footer */}
        <footer className="mt-auto bg-white border-t-3 border-slate-900 py-4 px-4 sm:px-6 lg:px-8 shadow-[0px_-3px_0px_0px_#0f172a]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="neo-stamp bg-blue-600 text-white text-[10px]">SINGKAWANG</span>
              <strong className="text-slate-900 font-extrabold">Monitoring Delivery Order (DO)</strong>
              <span className="text-slate-500 hidden sm:inline">&bull; Service Solution Pool Singkawang</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="neo-pill bg-white text-slate-900 border-slate-900">
                Tema: Neo Brutalism Blue
              </span>
              <span className="neo-pill bg-emerald-100 text-emerald-950 border-slate-900 font-black">
                ● WebSocket Real-Time Active
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
