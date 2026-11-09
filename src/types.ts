export interface DailyRecord {
  no: number;
  poolName: string;
  achv: string;
  tanggal: string; // e.g. "01 Sep 2026"
  rawDate?: string;
  dayNumber: number;
  totalJalur: number;
  totalTeam: number;
  prod: number;
  bobotMasuk: number;
  bobotFinish: number;
  // Pending breakdown
  pendingResch: number;
  rusong: number;
  tungkom: number;
  brg: number;
  inst: number;
  totalPending: number;
  // Status breakdown
  open: number;
  lanjutInstall: number;
  cancel: number;
  lkpb: number;
  na?: number;
  // Instalasi
  target: number;
  realisasi: number;
  // Calculated helpers
  hasData: boolean;
  completionRate: number; // % finish vs masuk
  achievementRate: number; // % real vs target
  canceledDos?: CancelledDoItem[];
}

export interface CancelledDoItem {
  id: string;
  dayNumber: number;
  tanggal: string; // e.g. "25 Sep 2026"
  noDo: string;
  kategori: string;
  teamName: string;
  bobot: number;
  status: string; // "CANCEL"
  reason?: string;
}

export interface DetailLkpbItem {
  no: number;
  noDo: string;
  namaCustomer: string;
  tglJalurAwal: string; // e.g. "13 Jul 2026"
  tglTarget: string; // e.g. "12 Agu 2026"
  agingDays: number; // e.g. 64
  status: 'OPEN' | 'FINISH' | string;
  kategori: string; // e.g. "CACAT VENDOR", "CACAT"
  reason: string; // e.g. "TIDAK ADA CANTOLAN UNTUK AMBALAN BAWAH DI PART A"
  // Smart follow-up logic properties
  actionLevel: 'critical' | 'warning' | 'moderate' | 'ontrack' | 'resolved';
  actionTag: string; // e.g. "Follow Up ke Store & Vendor", "Selesai & Arsip"
  recommendation: string; // Detailed actionable recommendation
  needsStoreFollowUp: boolean;
}

export interface DetailPendingItem {
  no: number;
  noDo: string;
  namaCustomer: string;
  tglJalurAwal: string; // e.g. "7 Agustus 2026"
  tglTarget: string; // e.g. "6 Sep 2026"
  agingDays: number;
  status: 'OPEN' | 'FINISH' | string;
  konfirmasiBy: string; // e.g. "LANGSUNG DATANG", "CHAT/PHONE PRIBADI"
  kategori: string; // e.g. "LJI", "LOKASI BELUM SIAP"
  keterangan: string; // e.g. "ROOFTOP BELUM SIAP", "KAMAR MASIH RENOV"
  // Smart follow-up logic properties
  actionLevel: 'critical' | 'location_prep' | 'reschedule' | 'revisit' | 'resolved';
  actionTag: string;
  recommendation: string;
  needsStoreFollowUp: boolean;
}

export interface MonthSummary {
  totalJalur: number;
  totalDo?: number;
  totalTeam: number;
  avgProd: number;
  totalBobotMasuk: number;
  totalBobotFinish: number;
  totalPending: number;
  totalCancel: number;
  totalLkpb: number;
  totalTarget: number;
  totalRealisasi: number;
  overallAchvRate: number;
  overallAchievementRate?: number;
  overallCompletionRate: number;
  activeDaysCount: number;
}

export interface MonthlyDataset {
  id: string; // e.g. "2026-09"
  monthName: string; // "September"
  monthNumber: number; // 1-12
  year: number; // 2026
  sheetUrl: string;
  gid: string;
  lastUpdated: string;
  records: DailyRecord[];
  summary: MonthSummary;
  detailLkpb?: DetailLkpbItem[];
  detailPending?: DetailPendingItem[];
  unlistedPendingDos?: UnlistedPendingDo[];
  canceledDos?: CancelledDoItem[];
  isDefault?: boolean;
}

export interface StatusChangeNotification {
  id: string;
  timestamp: string;
  type?: 'status_change' | 'spreadsheet_change' | 'sync_success' | 'sync_error';
  title?: string;
  message?: string;
  changes?: string[];
  durationMs?: number;
  isAutoSync?: boolean;
  stats?: {
    totalDo?: number;
    totalPending?: number;
    totalLkpb?: number;
    clearanceRate?: string;
  };
  noDo: string;
  oldStatus: string;
  newStatus: string;
  sheetName: string;
  customerName?: string;
  teamName?: string;
  dateStr?: string;
}

export interface UnlistedPendingDo {
  id: string;
  sheetName: string;
  tanggal: string;
  dayNumber: number;
  noDo: string;
  customerName?: string;
  teamName?: string;
  status: string; // e.g. "Brg", "Resch", "Rusong", "Tungkom", "Inst"
  reason?: string;
  detectedAt: string;
}

export interface LiveAuditSummary {
  unlistedPendingCount: number;
  unlistedPendingList: UnlistedPendingDo[];
  lastAuditTime: string;
}

export interface ContainerSyncInfo {
  status: 'synced' | 'syncing' | 'idle' | 'error';
  peerUrl: string;
  lastSyncTime: string;
  message: string;
  version?: string;
}

export type TabType = 'overview' | 'pending' | 'lkpb' | 'individual' | 'schedule' | 'analytics' | 'admin';

