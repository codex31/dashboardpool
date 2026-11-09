// Default Summary Individu dataset for Pool Singkawang (September 2026)
// Sourced directly from sheet "Summary Individu" & daily date sheets

export interface RawSummaryIndividuRow {
  namaStaff: string;
  finish: number;
  resch: number;
  rusong: number;
  tungkom: number;
  brg: number;
  lji: number;
  inst: number;
  cancel: number;
  lkpb: number;
  totalDo: number;
  totalPending: number;
  persentaseFinish: number;
  bobotFinish: number;
  bobotDibawa: number;
}

export interface IndividualDailyAssignment {
  date: string; // e.g. "01 Sep 2026"
  dayNumber: number;
  teamString: string;
  isProjectTeam: boolean;
  totalDo: number;
  finishDo: number;
  pendingDo: number;
  cancelDo: number;
  bobotDibawa: number;
  bobotFinish: number;
  pendingCustomerDo?: number;
  pendingBarangDo?: number;
  pendingStaffDo?: number;
  lkpbDo?: number;
  hariKerja?: number;
  isOff?: boolean;
  isoDate?: string;
}

export interface IndividualMonthlyKpi {
  bulan: string; // e.g. "Januari"
  year: number;
  technicianName: string;
  totalHariKerja: number;
  prodBobot: number;
  totalDoFinish: number;
  totalJalur: number;
  totalPendingCustomer: number;
  totalPendingBarang: number;
  totalPendingStaff: number;
  totalLkpb: number;
  totalBobotFinish: number;
  qoRate: string; // e.g. "100%"
  kualitasHasil: number;
  kelengkapanAlat: string; // e.g. "103.95%"
  dailyData: {
    dayNumber: number;
    hariKerja: number;
    doFinish: number;
    pendingCustomer: number;
    pendingBarang: number;
    pendingStaff: number;
    lkpb: number;
    bobotFinish: number;
    kualitasHasil: number;
    kelengkapanAlat: string;
  }[];
}

// Baseline data for Januari 2026 directly from user's KPI spreadsheet screenshot
export const JANUARI_BASELINE_KPI_DATA: IndividualMonthlyKpi = {
  bulan: 'Januari',
  year: 2026,
  technicianName: 'KEMAS HIDAYAT',
  totalHariKerja: 29,
  prodBobot: 42,
  totalDoFinish: 172,
  totalJalur: 194,
  totalPendingCustomer: 14,
  totalPendingBarang: 0,
  totalPendingStaff: 0,
  totalLkpb: 8,
  totalBobotFinish: 658,
  qoRate: '100%',
  kualitasHasil: 0,
  kelengkapanAlat: '103.95%',
  dailyData: [
    { dayNumber: 1, hariKerja: 0, doFinish: 0, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 0, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 2, hariKerja: 1, doFinish: 2, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 3, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 3, hariKerja: 1, doFinish: 7, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 12, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 4, hariKerja: 1, doFinish: 6, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 2, bobotFinish: 12, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 5, hariKerja: 1, doFinish: 7, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 18, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 6, hariKerja: 1, doFinish: 12, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 30, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 7, hariKerja: 1, doFinish: 5, pendingCustomer: 1, pendingBarang: 0, pendingStaff: 0, lkpb: 1, bobotFinish: 36, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 8, hariKerja: 1, doFinish: 7, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 46, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 9, hariKerja: 1, doFinish: 2, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 71, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 10, hariKerja: 1, doFinish: 5, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 17, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 11, hariKerja: 1, doFinish: 6, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 18, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 12, hariKerja: 1, doFinish: 9, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 33, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 13, hariKerja: 1, doFinish: 3, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 16, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 14, hariKerja: 1, doFinish: 2, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 2, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 15, hariKerja: 1, doFinish: 6, pendingCustomer: 4, pendingBarang: 0, pendingStaff: 0, lkpb: 3, bobotFinish: 20, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 16, hariKerja: 1, doFinish: 4, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 11, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 17, hariKerja: 1, doFinish: 5, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 15, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 18, hariKerja: 1, doFinish: 1, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 10, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 19, hariKerja: 1, doFinish: 2, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 1, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 20, hariKerja: 1, doFinish: 13, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 42, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 21, hariKerja: 1, doFinish: 8, pendingCustomer: 1, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 17, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 22, hariKerja: 1, doFinish: 1, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 17, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 23, hariKerja: 1, doFinish: 9, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 1, bobotFinish: 9, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 24, hariKerja: 1, doFinish: 5, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 20, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 25, hariKerja: 0, doFinish: 0, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 0, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 26, hariKerja: 1, doFinish: 2, pendingCustomer: 0, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 100, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 27, hariKerja: 1, doFinish: 10, pendingCustomer: 1, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 17, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 28, hariKerja: 1, doFinish: 7, pendingCustomer: 1, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 6, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 29, hariKerja: 1, doFinish: 11, pendingCustomer: 1, pendingBarang: 0, pendingStaff: 0, lkpb: 1, bobotFinish: 34, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 30, hariKerja: 1, doFinish: 8, pendingCustomer: 4, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 9, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
    { dayNumber: 31, hariKerja: 1, doFinish: 7, pendingCustomer: 1, pendingBarang: 0, pendingStaff: 0, lkpb: 0, bobotFinish: 16, kualitasHasil: 0, kelengkapanAlat: '103.95%' },
  ],
};

export interface TechnicianSummary {
  nama: string;
  alias: string;
  role: string;
  color: string;
  avatarBg: string;
  // With Project Team rule (Project Team finish added to all 3 technicians)
  withProjectTeam: {
    finish: number;
    pending: number;
    cancel: number;
    lkpb: number;
    open: number;
    totalDo: number;
    bobotDibawa: number;
    bobotFinish: number;
    finishPercent: number;
    clearancePercent: number;
  };
  // Standalone individual (excluding Project Team)
  standalone: {
    finish: number;
    pending: number;
    cancel: number;
    lkpb: number;
    open: number;
    totalDo: number;
    bobotDibawa: number;
    bobotFinish: number;
    finishPercent: number;
    clearancePercent: number;
  };
  dailyAssignments: IndividualDailyAssignment[];
}

export const DEFAULT_RAW_SUMMARY_INDIVIDU_CSV = `"NAMA STAFF","Finish","Resch","Rusong","Tungkom","Brg","Lji","Inst","Cancel","Lkpb","TOTAL DO","TOTAL PENDING","%","Bobot Finish","RANK","FINISH TERBANYAK","","","RANK","PENDING TERBANYAK","","","RANK"," PERSENTASE FINISH","","TOTAL DO","","",""
"","","","","","","","","","","","","","","1","DONI ASHARI","46","","1","DONI ASHARI","2","","1","MUHAMMAD JUPI","90,70%","43","","",""
"KEMAS HIDAYAT","44","0","0","0","0","0","0","7","0","51","0","86,27%","97","2","KEMAS HIDAYAT","44","","2","MUHAMMAD JUPI","2","","2","DONI ASHARI","88,46%","52","","",""
"DONI ASHARI","46","1","1","0","0","0","0","4","0","52","2","88,46%","212","3","MUHAMMAD JUPI","39","","3","","0","","3","KEMAS HIDAYAT","86,27%","51","","",""
"MUHAMMAD JUPI","39","1","1","0","0","0","0","2","0","43","2","90,70%","127","4","PROJECT TEAM","25","","4","","0","","4","PROJECT TEAM","83,33%","30","","",""
"PROJECT TEAM","25","0","0","0","0","0","0","5","0","30","0","83,33%","483","","","","","","","","","","","","","",""`;

// Default computed metrics across September 2026
export const DEFAULT_TECHNICIANS_DATA: TechnicianSummary[] = [
  {
    nama: 'DONI ASHARI',
    alias: 'Doni',
    role: 'Teknisi Operasional & Delivery',
    color: '#2563eb', // Blue
    avatarBg: 'bg-blue-600',
    withProjectTeam: {
      finish: 90,
      pending: 4,
      cancel: 21,
      lkpb: 0,
      open: 1,
      totalDo: 116,
      bobotDibawa: 646,
      bobotFinish: 570,
      finishPercent: 77.6,
      clearancePercent: 88.2,
    },
    standalone: {
      finish: 46,
      pending: 2,
      cancel: 4,
      lkpb: 0,
      open: 0,
      totalDo: 52,
      bobotDibawa: 240,
      bobotFinish: 212,
      finishPercent: 88.5,
      clearancePercent: 88.3,
    },
    dailyAssignments: [
      { date: '01 Sep 2026', dayNumber: 1, teamString: 'Project Team', isProjectTeam: true, totalDo: 9, finishDo: 7, pendingDo: 0, cancelDo: 2, bobotDibawa: 57, bobotFinish: 46 },
      { date: '02 Sep 2026', dayNumber: 2, teamString: 'Project Team', isProjectTeam: true, totalDo: 7, finishDo: 4, pendingDo: 0, cancelDo: 3, bobotDibawa: 23, bobotFinish: 15 },
      { date: '03 Sep 2026', dayNumber: 3, teamString: 'Project Team', isProjectTeam: true, totalDo: 4, finishDo: 4, pendingDo: 0, cancelDo: 0, bobotDibawa: 11, bobotFinish: 11 },
      { date: '04 Sep 2026', dayNumber: 4, teamString: 'Project Team', isProjectTeam: true, totalDo: 6, finishDo: 5, pendingDo: 0, cancelDo: 1, bobotDibawa: 26, bobotFinish: 11 },
      { date: '05 Sep 2026', dayNumber: 5, teamString: 'Kemas Hidayat & Doni Ashari', isProjectTeam: false, totalDo: 2, finishDo: 2, pendingDo: 0, cancelDo: 0, bobotDibawa: 10, bobotFinish: 10 },
      { date: '06 Sep 2026', dayNumber: 6, teamString: 'Doni Ashari & Muhammad Jupi', isProjectTeam: false, totalDo: 5, finishDo: 4, pendingDo: 0, cancelDo: 1, bobotDibawa: 6, bobotFinish: 4 },
      { date: '07 Sep 2026', dayNumber: 7, teamString: 'Project Team', isProjectTeam: true, totalDo: 2, finishDo: 2, pendingDo: 0, cancelDo: 0, bobotDibawa: 203, bobotFinish: 203 },
      { date: '08 Sep 2026', dayNumber: 8, teamString: 'Project Team', isProjectTeam: true, totalDo: 8, finishDo: 7, pendingDo: 0, cancelDo: 1, bobotDibawa: 63, bobotFinish: 62 },
      { date: '09 Sep 2026', dayNumber: 9, teamString: 'Project Team', isProjectTeam: true, totalDo: 5, finishDo: 5, pendingDo: 0, cancelDo: 0, bobotDibawa: 36, bobotFinish: 36 },
      { date: '10 Sep 2026', dayNumber: 10, teamString: 'Project Team', isProjectTeam: true, totalDo: 3, finishDo: 3, pendingDo: 0, cancelDo: 0, bobotDibawa: 8, bobotFinish: 8 },
      { date: '11 Sep 2026', dayNumber: 11, teamString: 'Project Team', isProjectTeam: true, totalDo: 1, finishDo: 1, pendingDo: 0, cancelDo: 0, bobotDibawa: 1, bobotFinish: 1 },
      { date: '12 Sep 2026', dayNumber: 12, teamString: 'Project Team', isProjectTeam: true, totalDo: 9, finishDo: 8, pendingDo: 0, cancelDo: 1, bobotDibawa: 36, bobotFinish: 35 },
      { date: '13 Sep 2026', dayNumber: 13, teamString: 'Kemas Hidayat & Doni Ashari', isProjectTeam: false, totalDo: 4, finishDo: 4, pendingDo: 0, cancelDo: 0, bobotDibawa: 8, bobotFinish: 8 },
      { date: '15 Sep 2026', dayNumber: 15, teamString: 'Project Team', isProjectTeam: true, totalDo: 10, finishDo: 8, pendingDo: 2, cancelDo: 0, bobotDibawa: 34, bobotFinish: 26 },
      { date: '16 Sep 2026', dayNumber: 16, teamString: 'Project Team', isProjectTeam: true, totalDo: 5, finishDo: 4, pendingDo: 0, cancelDo: 1, bobotDibawa: 14, bobotFinish: 11 },
      { date: '17 Sep 2026', dayNumber: 17, teamString: 'Project Team', isProjectTeam: true, totalDo: 6, finishDo: 5, pendingDo: 0, cancelDo: 1, bobotDibawa: 18, bobotFinish: 15 },
      { date: '18 Sep 2026', dayNumber: 18, teamString: 'Kemas Hidayat & Doni Ashari', isProjectTeam: false, totalDo: 5, finishDo: 4, pendingDo: 0, cancelDo: 1, bobotDibawa: 20, bobotFinish: 17 },
      { date: '19 Sep 2026', dayNumber: 19, teamString: 'Doni Ashari & Muhammad Jupi', isProjectTeam: false, totalDo: 4, finishDo: 3, pendingDo: 0, cancelDo: 1, bobotDibawa: 8, bobotFinish: 6 },
      { date: '20 Sep 2026', dayNumber: 20, teamString: 'Project Team', isProjectTeam: true, totalDo: 4, finishDo: 3, pendingDo: 0, cancelDo: 1, bobotDibawa: 8, bobotFinish: 6 },
      { date: '22 Sep 2026', dayNumber: 22, teamString: 'Project Team', isProjectTeam: true, totalDo: 5, finishDo: 4, pendingDo: 0, cancelDo: 1, bobotDibawa: 13, bobotFinish: 11 },
      { date: '23 Sep 2026', dayNumber: 23, teamString: 'Project Team', isProjectTeam: true, totalDo: 3, finishDo: 2, pendingDo: 0, cancelDo: 1, bobotDibawa: 11, bobotFinish: 9 },
      { date: '24 Sep 2026', dayNumber: 24, teamString: 'Kemas Hidayat & Doni Ashari', isProjectTeam: false, totalDo: 4, finishDo: 3, pendingDo: 0, cancelDo: 1, bobotDibawa: 7, bobotFinish: 5 },
      { date: '25 Sep 2026', dayNumber: 25, teamString: 'Project Team', isProjectTeam: true, totalDo: 10, finishDo: 9, pendingDo: 0, cancelDo: 1, bobotDibawa: 24, bobotFinish: 21 },
      { date: '26 Sep 2026', dayNumber: 26, teamString: 'Project Team', isProjectTeam: true, totalDo: 5, finishDo: 4, pendingDo: 0, cancelDo: 1, bobotDibawa: 12, bobotFinish: 10 },
      { date: '27 Sep 2026', dayNumber: 27, teamString: 'Doni Ashari & Muhammad Jupi', isProjectTeam: false, totalDo: 5, finishDo: 4, pendingDo: 0, cancelDo: 1, bobotDibawa: 12, bobotFinish: 10 },
      { date: '29 Sep 2026', dayNumber: 29, teamString: 'Project Team', isProjectTeam: true, totalDo: 4, finishDo: 3, pendingDo: 0, cancelDo: 1, bobotDibawa: 5, bobotFinish: 4 },
      { date: '30 Sep 2026', dayNumber: 30, teamString: 'Project Team', isProjectTeam: true, totalDo: 4, finishDo: 3, pendingDo: 0, cancelDo: 1, bobotDibawa: 16, bobotFinish: 14 },
    ],
  },
  {
    nama: 'KEMAS HIDAYAT',
    alias: 'Kemas',
    role: 'Teknisi Operasional & Delivery',
    color: '#059669', // Emerald
    avatarBg: 'bg-emerald-600',
    withProjectTeam: {
      finish: 113,
      pending: 0,
      cancel: 18,
      lkpb: 0,
      open: 1,
      totalDo: 131,
      bobotDibawa: 630,
      bobotFinish: 570,
      finishPercent: 86.3,
      clearancePercent: 90.5,
    },
    standalone: {
      finish: 44,
      pending: 0,
      cancel: 7,
      lkpb: 0,
      open: 0,
      totalDo: 51,
      bobotDibawa: 112,
      bobotFinish: 97,
      finishPercent: 86.3,
      clearancePercent: 86.6,
    },
    dailyAssignments: [
      { date: '01 Sep 2026', dayNumber: 1, teamString: 'Project Team', isProjectTeam: true, totalDo: 9, finishDo: 7, pendingDo: 0, cancelDo: 2, bobotDibawa: 57, bobotFinish: 46 },
      { date: '02 Sep 2026', dayNumber: 2, teamString: 'Project Team', isProjectTeam: true, totalDo: 7, finishDo: 4, pendingDo: 0, cancelDo: 3, bobotDibawa: 23, bobotFinish: 15 },
      { date: '03 Sep 2026', dayNumber: 3, teamString: 'Project Team', isProjectTeam: true, totalDo: 4, finishDo: 4, pendingDo: 0, cancelDo: 0, bobotDibawa: 11, bobotFinish: 11 },
      { date: '04 Sep 2026', dayNumber: 4, teamString: 'Project Team', isProjectTeam: true, totalDo: 6, finishDo: 5, pendingDo: 0, cancelDo: 1, bobotDibawa: 26, bobotFinish: 11 },
      { date: '05 Sep 2026', dayNumber: 5, teamString: 'Kemas Hidayat & Doni Ashari', isProjectTeam: false, totalDo: 2, finishDo: 2, pendingDo: 0, cancelDo: 0, bobotDibawa: 10, bobotFinish: 10 },
      { date: '07 Sep 2026', dayNumber: 7, teamString: 'Project Team', isProjectTeam: true, totalDo: 2, finishDo: 2, pendingDo: 0, cancelDo: 0, bobotDibawa: 203, bobotFinish: 203 },
      { date: '08 Sep 2026', dayNumber: 8, teamString: 'Project Team', isProjectTeam: true, totalDo: 8, finishDo: 7, pendingDo: 0, cancelDo: 1, bobotDibawa: 63, bobotFinish: 62 },
      { date: '09 Sep 2026', dayNumber: 9, teamString: 'Project Team', isProjectTeam: true, totalDo: 5, finishDo: 5, pendingDo: 0, cancelDo: 0, bobotDibawa: 36, bobotFinish: 36 },
      { date: '10 Sep 2026', dayNumber: 10, teamString: 'Project Team', isProjectTeam: true, totalDo: 3, finishDo: 3, pendingDo: 0, cancelDo: 0, bobotDibawa: 8, bobotFinish: 8 },
      { date: '11 Sep 2026', dayNumber: 11, teamString: 'Project Team', isProjectTeam: true, totalDo: 1, finishDo: 1, pendingDo: 0, cancelDo: 0, bobotDibawa: 1, bobotFinish: 1 },
      { date: '12 Sep 2026', dayNumber: 12, teamString: 'Project Team', isProjectTeam: true, totalDo: 9, finishDo: 8, pendingDo: 0, cancelDo: 1, bobotDibawa: 36, bobotFinish: 35 },
      { date: '13 Sep 2026', dayNumber: 13, teamString: 'Kemas Hidayat & Doni Ashari', isProjectTeam: false, totalDo: 4, finishDo: 4, pendingDo: 0, cancelDo: 0, bobotDibawa: 8, bobotFinish: 8 },
      { date: '14 Sep 2026', dayNumber: 14, teamString: 'Kemas Hidayat & Muhammad Jupi', isProjectTeam: false, totalDo: 2, finishDo: 2, pendingDo: 0, cancelDo: 0, bobotDibawa: 5, bobotFinish: 5 },
      { date: '15 Sep 2026', dayNumber: 15, teamString: 'Project Team', isProjectTeam: true, totalDo: 10, finishDo: 8, pendingDo: 2, cancelDo: 0, bobotDibawa: 34, bobotFinish: 26 },
      { date: '16 Sep 2026', dayNumber: 16, teamString: 'Project Team', isProjectTeam: true, totalDo: 5, finishDo: 4, pendingDo: 0, cancelDo: 1, bobotDibawa: 14, bobotFinish: 11 },
      { date: '17 Sep 2026', dayNumber: 17, teamString: 'Project Team', isProjectTeam: true, totalDo: 6, finishDo: 5, pendingDo: 0, cancelDo: 1, bobotDibawa: 18, bobotFinish: 15 },
      { date: '18 Sep 2026', dayNumber: 18, teamString: 'Kemas Hidayat & Doni Ashari', isProjectTeam: false, totalDo: 5, finishDo: 4, pendingDo: 0, cancelDo: 1, bobotDibawa: 20, bobotFinish: 17 },
      { date: '20 Sep 2026', dayNumber: 20, teamString: 'Project Team', isProjectTeam: true, totalDo: 4, finishDo: 3, pendingDo: 0, cancelDo: 1, bobotDibawa: 8, bobotFinish: 6 },
      { date: '21 Sep 2026', dayNumber: 21, teamString: 'Kemas Hidayat & Muhammad Jupi', isProjectTeam: false, totalDo: 4, finishDo: 3, pendingDo: 0, cancelDo: 1, bobotDibawa: 7, bobotFinish: 5 },
      { date: '22 Sep 2026', dayNumber: 22, teamString: 'Project Team', isProjectTeam: true, totalDo: 5, finishDo: 4, pendingDo: 0, cancelDo: 1, bobotDibawa: 13, bobotFinish: 11 },
      { date: '23 Sep 2026', dayNumber: 23, teamString: 'Project Team', isProjectTeam: true, totalDo: 3, finishDo: 2, pendingDo: 0, cancelDo: 1, bobotDibawa: 11, bobotFinish: 9 },
      { date: '24 Sep 2026', dayNumber: 24, teamString: 'Kemas Hidayat & Doni Ashari', isProjectTeam: false, totalDo: 4, finishDo: 3, pendingDo: 0, cancelDo: 1, bobotDibawa: 7, bobotFinish: 5 },
      { date: '25 Sep 2026', dayNumber: 25, teamString: 'Project Team', isProjectTeam: true, totalDo: 10, finishDo: 9, pendingDo: 0, cancelDo: 1, bobotDibawa: 24, bobotFinish: 21 },
      { date: '26 Sep 2026', dayNumber: 26, teamString: 'Project Team', isProjectTeam: true, totalDo: 5, finishDo: 4, pendingDo: 0, cancelDo: 1, bobotDibawa: 12, bobotFinish: 10 },
      { date: '28 Sep 2026', dayNumber: 28, teamString: 'Kemas Hidayat & Muhammad Jupi', isProjectTeam: false, totalDo: 5, finishDo: 4, pendingDo: 0, cancelDo: 1, bobotDibawa: 12, bobotFinish: 10 },
      { date: '29 Sep 2026', dayNumber: 29, teamString: 'Project Team', isProjectTeam: true, totalDo: 4, finishDo: 3, pendingDo: 0, cancelDo: 1, bobotDibawa: 5, bobotFinish: 4 },
      { date: '30 Sep 2026', dayNumber: 30, teamString: 'Project Team', isProjectTeam: true, totalDo: 4, finishDo: 3, pendingDo: 0, cancelDo: 1, bobotDibawa: 16, bobotFinish: 14 },
    ],
  },
  {
    nama: 'MUHAMMAD JUPI',
    alias: 'Jupi',
    role: 'Teknisi Operasional & Delivery',
    color: '#7c3aed', // Purple
    avatarBg: 'bg-purple-600',
    withProjectTeam: {
      finish: 83,
      pending: 4,
      cancel: 19,
      lkpb: 0,
      open: 0,
      totalDo: 106,
      bobotDibawa: 613,
      bobotFinish: 543,
      finishPercent: 78.3,
      clearancePercent: 88.6,
    },
    standalone: {
      finish: 39,
      pending: 2,
      cancel: 2,
      lkpb: 0,
      open: 0,
      totalDo: 43,
      bobotDibawa: 140,
      bobotFinish: 127,
      finishPercent: 90.7,
      clearancePercent: 90.7,
    },
    dailyAssignments: [
      { date: '01 Sep 2026', dayNumber: 1, teamString: 'Project Team', isProjectTeam: true, totalDo: 9, finishDo: 7, pendingDo: 0, cancelDo: 2, bobotDibawa: 57, bobotFinish: 46 },
      { date: '02 Sep 2026', dayNumber: 2, teamString: 'Project Team', isProjectTeam: true, totalDo: 7, finishDo: 4, pendingDo: 0, cancelDo: 3, bobotDibawa: 23, bobotFinish: 15 },
      { date: '03 Sep 2026', dayNumber: 3, teamString: 'Project Team', isProjectTeam: true, totalDo: 4, finishDo: 4, pendingDo: 0, cancelDo: 0, bobotDibawa: 11, bobotFinish: 11 },
      { date: '04 Sep 2026', dayNumber: 4, teamString: 'Project Team', isProjectTeam: true, totalDo: 6, finishDo: 5, pendingDo: 0, cancelDo: 1, bobotDibawa: 26, bobotFinish: 11 },
      { date: '06 Sep 2026', dayNumber: 6, teamString: 'Doni Ashari & Muhammad Jupi', isProjectTeam: false, totalDo: 5, finishDo: 4, pendingDo: 0, cancelDo: 1, bobotDibawa: 6, bobotFinish: 4 },
      { date: '07 Sep 2026', dayNumber: 7, teamString: 'Project Team', isProjectTeam: true, totalDo: 2, finishDo: 2, pendingDo: 0, cancelDo: 0, bobotDibawa: 203, bobotFinish: 203 },
      { date: '08 Sep 2026', dayNumber: 8, teamString: 'Project Team', isProjectTeam: true, totalDo: 8, finishDo: 7, pendingDo: 0, cancelDo: 1, bobotDibawa: 63, bobotFinish: 62 },
      { date: '09 Sep 2026', dayNumber: 9, teamString: 'Project Team', isProjectTeam: true, totalDo: 5, finishDo: 5, pendingDo: 0, cancelDo: 0, bobotDibawa: 36, bobotFinish: 36 },
      { date: '10 Sep 2026', dayNumber: 10, teamString: 'Project Team', isProjectTeam: true, totalDo: 3, finishDo: 3, pendingDo: 0, cancelDo: 0, bobotDibawa: 8, bobotFinish: 8 },
      { date: '11 Sep 2026', dayNumber: 11, teamString: 'Project Team', isProjectTeam: true, totalDo: 1, finishDo: 1, pendingDo: 0, cancelDo: 0, bobotDibawa: 1, bobotFinish: 1 },
      { date: '12 Sep 2026', dayNumber: 12, teamString: 'Project Team', isProjectTeam: true, totalDo: 9, finishDo: 8, pendingDo: 0, cancelDo: 1, bobotDibawa: 36, bobotFinish: 35 },
      { date: '14 Sep 2026', dayNumber: 14, teamString: 'Kemas Hidayat & Muhammad Jupi', isProjectTeam: false, totalDo: 2, finishDo: 2, pendingDo: 0, cancelDo: 0, bobotDibawa: 5, bobotFinish: 5 },
      { date: '15 Sep 2026', dayNumber: 15, teamString: 'Project Team', isProjectTeam: true, totalDo: 10, finishDo: 8, pendingDo: 2, cancelDo: 0, bobotDibawa: 34, bobotFinish: 26 },
      { date: '16 Sep 2026', dayNumber: 16, teamString: 'Project Team', isProjectTeam: true, totalDo: 5, finishDo: 4, pendingDo: 0, cancelDo: 1, bobotDibawa: 14, bobotFinish: 11 },
      { date: '17 Sep 2026', dayNumber: 17, teamString: 'Project Team', isProjectTeam: true, totalDo: 6, finishDo: 5, pendingDo: 0, cancelDo: 1, bobotDibawa: 18, bobotFinish: 15 },
      { date: '18 Sep 2026', dayNumber: 18, teamString: 'Muhammad Jupi & Doni Ashari', isProjectTeam: false, totalDo: 5, finishDo: 4, pendingDo: 0, cancelDo: 1, bobotDibawa: 20, bobotFinish: 17 },
      { date: '19 Sep 2026', dayNumber: 19, teamString: 'Doni Ashari & Muhammad Jupi', isProjectTeam: false, totalDo: 4, finishDo: 3, pendingDo: 0, cancelDo: 1, bobotDibawa: 8, bobotFinish: 6 },
      { date: '21 Sep 2026', dayNumber: 21, teamString: 'Kemas Hidayat & Muhammad Jupi', isProjectTeam: false, totalDo: 4, finishDo: 3, pendingDo: 0, cancelDo: 1, bobotDibawa: 7, bobotFinish: 5 },
      { date: '22 Sep 2026', dayNumber: 22, teamString: 'Project Team', isProjectTeam: true, totalDo: 5, finishDo: 4, pendingDo: 0, cancelDo: 1, bobotDibawa: 13, bobotFinish: 11 },
      { date: '23 Sep 2026', dayNumber: 23, teamString: 'Project Team', isProjectTeam: true, totalDo: 3, finishDo: 2, pendingDo: 0, cancelDo: 1, bobotDibawa: 11, bobotFinish: 9 },
      { date: '24 Sep 2026', dayNumber: 24, teamString: 'Muhammad Jupi & Kemas Hidayat', isProjectTeam: false, totalDo: 4, finishDo: 3, pendingDo: 0, cancelDo: 1, bobotDibawa: 7, bobotFinish: 5 },
      { date: '25 Sep 2026', dayNumber: 25, teamString: 'Project Team', isProjectTeam: true, totalDo: 10, finishDo: 9, pendingDo: 0, cancelDo: 1, bobotDibawa: 24, bobotFinish: 21 },
      { date: '27 Sep 2026', dayNumber: 27, teamString: 'Doni Ashari & Muhammad Jupi', isProjectTeam: false, totalDo: 5, finishDo: 4, pendingDo: 0, cancelDo: 1, bobotDibawa: 12, bobotFinish: 10 },
      { date: '28 Sep 2026', dayNumber: 28, teamString: 'Kemas Hidayat & Muhammad Jupi', isProjectTeam: false, totalDo: 5, finishDo: 4, pendingDo: 0, cancelDo: 1, bobotDibawa: 12, bobotFinish: 10 },
      { date: '29 Sep 2026', dayNumber: 29, teamString: 'Project Team', isProjectTeam: true, totalDo: 4, finishDo: 3, pendingDo: 0, cancelDo: 1, bobotDibawa: 5, bobotFinish: 4 },
      { date: '30 Sep 2026', dayNumber: 30, teamString: 'Project Team', isProjectTeam: true, totalDo: 4, finishDo: 3, pendingDo: 0, cancelDo: 1, bobotDibawa: 16, bobotFinish: 14 },
    ],
  },
];

export const PROJECT_TEAM_STANDALONE = {
  nama: 'PROJECT TEAM',
  alias: 'Project Team',
  role: 'Tim Kolaborasi Bersama (Kemas, Doni, Jupi)',
  finish: 69,
  pending: 3,
  cancel: 16,
  lkpb: 0,
  open: 0,
  totalDo: 88,
  bobotDibawa: 575,
  bobotFinish: 520,
  finishPercent: 78.4,
  clearancePercent: 90.4,
};
