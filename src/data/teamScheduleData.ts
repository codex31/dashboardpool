// Auto-generated & verified team schedule dataset
// Source: https://docs.google.com/spreadsheets/d/1101QQSscdso_p8-VM0mtnpn7ERN6Ih_86UoLqxoAw1g/edit

export interface DayColumnInfo {
  day: number;
  dayName: string; // "SN", "SL", "RB", "KM", "JM", "SB", "MG"
  colIndex?: number;
}

export interface TechnicianSchedule {
  no: string;
  nip: string;
  nama: string;
  jobTitle: string;
  totalHariKerja: string;
  shifts: Record<string, string>; // day string -> "M0067" | "O" | "AL" | string
  summary: Record<string, string>; // "O": "5", "AL": "0", "M0067": "26"
}

export interface DailyTotals {
  m0067: Record<string, string>;
  off: Record<string, string>;
  al: Record<string, string>;
}

export interface MonthScheduleDataset {
  id: string; // "2026-01" .. "2026-09"
  monthName: string; // "Januari" .. "September"
  year: number; // 2026
  gid: string;
  totalDays: number;
  days: DayColumnInfo[];
  members: TechnicianSchedule[];
  dailyStats: DailyTotals;
  notes: Record<string, string>;
}

export const SCHEDULE_SPREADSHEET_ID = "1101QQSscdso_p8-VM0mtnpn7ERN6Ih_86UoLqxoAw1g";
export const SCHEDULE_SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1101QQSscdso_p8-VM0mtnpn7ERN6Ih_86UoLqxoAw1g/edit";

export const TEAM_MEMBERS_INFO = [
  {
    nip: "185849",
    nama: "KEMAS HIDAYAT",
    jobTitle: "INST",
    role: "Technician Installer",
    phone: "0812-XXXX-849",
    status: "Active"
  },
  {
    nip: "194445",
    nama: "DONI ASHARI",
    jobTitle: "INST",
    role: "Technician Installer",
    phone: "0813-XXXX-445",
    status: "Active"
  },
  {
    nip: "194455",
    nama: "MUHAMMAD JUPI",
    jobTitle: "INST",
    role: "Technician Installer",
    phone: "0815-XXXX-455",
    status: "Active"
  }
];

export const MONTH_SCHEDULES: MonthScheduleDataset[] = [
  {
    "id": "2026-01",
    "monthName": "Januari",
    "year": 2026,
    "gid": "0",
    "totalDays": 31,
    "days": [
      {
        "day": 1,
        "dayName": "KM",
        "colIndex": 5
      },
      {
        "day": 2,
        "dayName": "JM",
        "colIndex": 6
      },
      {
        "day": 3,
        "dayName": "SB",
        "colIndex": 7
      },
      {
        "day": 4,
        "dayName": "MG",
        "colIndex": 8
      },
      {
        "day": 5,
        "dayName": "SN",
        "colIndex": 9
      },
      {
        "day": 6,
        "dayName": "SL",
        "colIndex": 10
      },
      {
        "day": 7,
        "dayName": "RB",
        "colIndex": 11
      },
      {
        "day": 8,
        "dayName": "KM",
        "colIndex": 12
      },
      {
        "day": 9,
        "dayName": "JM",
        "colIndex": 13
      },
      {
        "day": 10,
        "dayName": "SB",
        "colIndex": 14
      },
      {
        "day": 11,
        "dayName": "MG",
        "colIndex": 15
      },
      {
        "day": 12,
        "dayName": "SN",
        "colIndex": 16
      },
      {
        "day": 13,
        "dayName": "SL",
        "colIndex": 17
      },
      {
        "day": 14,
        "dayName": "RB",
        "colIndex": 18
      },
      {
        "day": 15,
        "dayName": "KM",
        "colIndex": 19
      },
      {
        "day": 16,
        "dayName": "JM",
        "colIndex": 20
      },
      {
        "day": 17,
        "dayName": "SB",
        "colIndex": 21
      },
      {
        "day": 18,
        "dayName": "MG",
        "colIndex": 22
      },
      {
        "day": 19,
        "dayName": "SN",
        "colIndex": 23
      },
      {
        "day": 20,
        "dayName": "SL",
        "colIndex": 24
      },
      {
        "day": 21,
        "dayName": "RB",
        "colIndex": 25
      },
      {
        "day": 22,
        "dayName": "KM",
        "colIndex": 26
      },
      {
        "day": 23,
        "dayName": "JM",
        "colIndex": 27
      },
      {
        "day": 24,
        "dayName": "SB",
        "colIndex": 28
      },
      {
        "day": 25,
        "dayName": "MG",
        "colIndex": 29
      },
      {
        "day": 26,
        "dayName": "SN",
        "colIndex": 30
      },
      {
        "day": 27,
        "dayName": "SL",
        "colIndex": 31
      },
      {
        "day": 28,
        "dayName": "RB",
        "colIndex": 32
      },
      {
        "day": 29,
        "dayName": "KM",
        "colIndex": 33
      },
      {
        "day": 30,
        "dayName": "JM",
        "colIndex": 34
      },
      {
        "day": 31,
        "dayName": "SB",
        "colIndex": 35
      }
    ],
    "members": [
      {
        "no": "1",
        "nip": "185849",
        "nama": "KEMAS HIDAYAT",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "O",
          "2": "M0067",
          "3": "M0067",
          "4": "M0067",
          "5": "M0067",
          "6": "M0067",
          "7": "M0067",
          "8": "M0067",
          "9": "M0067",
          "10": "O",
          "11": "M0067",
          "12": "M0067",
          "13": "M0067",
          "14": "M0067",
          "15": "M0067",
          "16": "M0067",
          "17": "O",
          "18": "M0067",
          "19": "M0067",
          "20": "M0067",
          "21": "M0067",
          "22": "M0067",
          "23": "M0067",
          "24": "M0067",
          "25": "M0067",
          "26": "M0067",
          "27": "M0067",
          "28": "M0067",
          "29": "M0067",
          "30": "AL",
          "31": "AL"
        },
        "summary": {
          "O": "5",
          "AL": "0",
          "M0067": "26"
        }
      },
      {
        "no": "3",
        "nip": "194445",
        "nama": "DONI ASHARI",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "O",
          "2": "M0067",
          "3": "M0067",
          "4": "M0067",
          "5": "M0067",
          "6": "M0067",
          "7": "O",
          "8": "M0067",
          "9": "M0067",
          "10": "M0067",
          "11": "M0067",
          "12": "O",
          "13": "M0067",
          "14": "M0067",
          "15": "M0067",
          "16": "M0067",
          "17": "M0067",
          "18": "O",
          "19": "M0067",
          "20": "M0067",
          "21": "M0067",
          "22": "M0067",
          "23": "M0067",
          "24": "M0067",
          "25": "M0067",
          "26": "O",
          "27": "M0067",
          "28": "M0067",
          "29": "M0067",
          "30": "M0067",
          "31": "M0067"
        },
        "summary": {
          "O": "5",
          "AL": "0",
          "M0067": "26"
        }
      },
      {
        "no": "4",
        "nip": "194455",
        "nama": "MUHAMMAD JUPI",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "O",
          "2": "M0067",
          "3": "M0067",
          "4": "M0067",
          "5": "M0067",
          "6": "O",
          "7": "M0067",
          "8": "M0067",
          "9": "M0067",
          "10": "M0067",
          "11": "M0067",
          "12": "M0067",
          "13": "O",
          "14": "M0067",
          "15": "M0067",
          "16": "M0067",
          "17": "M0067",
          "18": "M0067",
          "19": "M0067",
          "20": "O",
          "21": "M0067",
          "22": "M0067",
          "23": "M0067",
          "24": "M0067",
          "25": "M0067",
          "26": "M0067",
          "27": "O",
          "28": "M0067",
          "29": "M0067",
          "30": "M0067",
          "31": "M0067"
        },
        "summary": {
          "O": "5",
          "AL": "0",
          "M0067": "26"
        }
      }
    ],
    "dailyStats": {
      "m0067": {
        "1": "0",
        "2": "3",
        "3": "3",
        "4": "3",
        "5": "3",
        "6": "2",
        "7": "2",
        "8": "3",
        "9": "3",
        "10": "2",
        "11": "3",
        "12": "2",
        "13": "2",
        "14": "3",
        "15": "3",
        "16": "3",
        "17": "2",
        "18": "2",
        "19": "3",
        "20": "2",
        "21": "3",
        "22": "3",
        "23": "3",
        "24": "2",
        "25": "3",
        "26": "2",
        "27": "2",
        "28": "3",
        "29": "3",
        "30": "3",
        "31": "2"
      },
      "off": {
        "1": "3",
        "2": "0",
        "3": "0",
        "4": "0",
        "5": "0",
        "6": "1",
        "7": "1",
        "8": "0",
        "9": "0",
        "10": "1",
        "11": "0",
        "12": "1",
        "13": "1",
        "14": "0",
        "15": "0",
        "16": "0",
        "17": "1",
        "18": "1",
        "19": "0",
        "20": "1",
        "21": "0",
        "22": "0",
        "23": "0",
        "24": "1",
        "25": "0",
        "26": "1",
        "27": "1",
        "28": "0",
        "29": "0",
        "30": "0",
        "31": "1"
      },
      "al": {
        "1": "0",
        "2": "0",
        "3": "0",
        "4": "0",
        "5": "0",
        "6": "0",
        "7": "0",
        "8": "0",
        "9": "0",
        "10": "0",
        "11": "0",
        "12": "0",
        "13": "0",
        "14": "0",
        "15": "0",
        "16": "0",
        "17": "0",
        "18": "0",
        "19": "0",
        "20": "0",
        "21": "0",
        "22": "0",
        "23": "0",
        "24": "0",
        "25": "0",
        "26": "0",
        "27": "0",
        "28": "0",
        "29": "0",
        "30": "0",
        "31": "0"
      }
    },
    "notes": {}
  },
  {
    "id": "2026-02",
    "monthName": "Februari",
    "year": 2026,
    "gid": "1871463486",
    "totalDays": 28,
    "days": [
      {
        "day": 1,
        "dayName": "MG",
        "colIndex": 5
      },
      {
        "day": 2,
        "dayName": "SN",
        "colIndex": 6
      },
      {
        "day": 3,
        "dayName": "SL",
        "colIndex": 7
      },
      {
        "day": 4,
        "dayName": "RB",
        "colIndex": 8
      },
      {
        "day": 5,
        "dayName": "KM",
        "colIndex": 9
      },
      {
        "day": 6,
        "dayName": "JM",
        "colIndex": 10
      },
      {
        "day": 7,
        "dayName": "SB",
        "colIndex": 11
      },
      {
        "day": 8,
        "dayName": "MG",
        "colIndex": 12
      },
      {
        "day": 9,
        "dayName": "SN",
        "colIndex": 13
      },
      {
        "day": 10,
        "dayName": "SL",
        "colIndex": 14
      },
      {
        "day": 11,
        "dayName": "RB",
        "colIndex": 15
      },
      {
        "day": 12,
        "dayName": "KM",
        "colIndex": 16
      },
      {
        "day": 13,
        "dayName": "JM",
        "colIndex": 17
      },
      {
        "day": 14,
        "dayName": "SB",
        "colIndex": 18
      },
      {
        "day": 15,
        "dayName": "MG",
        "colIndex": 19
      },
      {
        "day": 16,
        "dayName": "SN",
        "colIndex": 20
      },
      {
        "day": 17,
        "dayName": "SL",
        "colIndex": 21
      },
      {
        "day": 18,
        "dayName": "RB",
        "colIndex": 22
      },
      {
        "day": 19,
        "dayName": "KM",
        "colIndex": 23
      },
      {
        "day": 20,
        "dayName": "JM",
        "colIndex": 24
      },
      {
        "day": 21,
        "dayName": "SB",
        "colIndex": 25
      },
      {
        "day": 22,
        "dayName": "MG",
        "colIndex": 26
      },
      {
        "day": 23,
        "dayName": "SN",
        "colIndex": 27
      },
      {
        "day": 24,
        "dayName": "SL",
        "colIndex": 28
      },
      {
        "day": 25,
        "dayName": "RB",
        "colIndex": 29
      },
      {
        "day": 26,
        "dayName": "KM",
        "colIndex": 30
      },
      {
        "day": 27,
        "dayName": "JM",
        "colIndex": 31
      },
      {
        "day": 28,
        "dayName": "SB",
        "colIndex": 32
      }
    ],
    "members": [
      {
        "no": "1",
        "nip": "185849",
        "nama": "KEMAS HIDAYAT",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "O",
          "2": "M0067",
          "3": "M0067",
          "4": "M0067",
          "5": "M0067",
          "6": "M0067",
          "7": "M0067",
          "8": "O",
          "9": "M0067",
          "10": "M0067",
          "11": "M0067",
          "12": "M0067",
          "13": "M0067",
          "14": "M0067",
          "15": "O",
          "16": "M0067",
          "17": "M0067",
          "18": "O",
          "19": "M0067",
          "20": "M0067",
          "21": "M0067",
          "22": "O",
          "23": "M0067",
          "24": "M0067",
          "25": "M0067",
          "26": "M0067",
          "27": "O",
          "28": "M0067"
        },
        "summary": {
          "O": "6",
          "AL": "0",
          "M0067": "26"
        }
      },
      {
        "no": "3",
        "nip": "194445",
        "nama": "DONI ASHARI",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "M0067",
          "2": "O",
          "3": "M0067",
          "4": "M0067",
          "5": "M0067",
          "6": "M0067",
          "7": "O",
          "8": "M0067",
          "9": "M0067",
          "10": "M0067",
          "11": "M0067",
          "12": "O",
          "13": "M0067",
          "14": "M0067",
          "15": "M0067",
          "16": "M0067",
          "17": "M0067",
          "18": "M0067",
          "19": "O",
          "20": "M0067",
          "21": "O",
          "22": "M0067",
          "23": "M0067",
          "24": "M0067",
          "25": "M0067",
          "26": "O",
          "27": "M0067",
          "28": "M0067"
        },
        "summary": {
          "O": "6",
          "AL": "0",
          "M0067": "26"
        }
      },
      {
        "no": "4",
        "nip": "194455",
        "nama": "MUHAMMAD JUPI",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "M0067",
          "2": "M0067",
          "3": "O",
          "4": "M0067",
          "5": "M0067",
          "6": "M0067",
          "7": "M0067",
          "8": "M0067",
          "9": "M0067",
          "10": "O",
          "11": "M0067",
          "12": "M0067",
          "13": "M0067",
          "14": "O",
          "15": "M0067",
          "16": "M0067",
          "17": "O",
          "18": "M0067",
          "19": "M0067",
          "20": "M0067",
          "21": "M0067",
          "22": "M0067",
          "23": "M0067",
          "24": "O",
          "25": "M0067",
          "26": "M0067",
          "27": "M0067",
          "28": "O"
        },
        "summary": {
          "O": "6",
          "AL": "0",
          "M0067": "26"
        }
      }
    ],
    "dailyStats": {
      "m0067": {
        "1": "2",
        "2": "2",
        "3": "2",
        "4": "3",
        "5": "3",
        "6": "3",
        "7": "2",
        "8": "2",
        "9": "3",
        "10": "2",
        "11": "3",
        "12": "2",
        "13": "3",
        "14": "2",
        "15": "2",
        "16": "3",
        "17": "2",
        "18": "2",
        "19": "2",
        "20": "3",
        "21": "2",
        "22": "2",
        "23": "3",
        "24": "2",
        "25": "3",
        "26": "2",
        "27": "2",
        "28": "2"
      },
      "off": {
        "1": "1",
        "2": "1",
        "3": "1",
        "4": "0",
        "5": "0",
        "6": "0",
        "7": "1",
        "8": "1",
        "9": "0",
        "10": "1",
        "11": "0",
        "12": "1",
        "13": "0",
        "14": "1",
        "15": "1",
        "16": "0",
        "17": "1",
        "18": "1",
        "19": "1",
        "20": "0",
        "21": "1",
        "22": "1",
        "23": "0",
        "24": "1",
        "25": "0",
        "26": "1",
        "27": "1",
        "28": "1"
      },
      "al": {
        "1": "0",
        "2": "0",
        "3": "0",
        "4": "0",
        "5": "0",
        "6": "0",
        "7": "0",
        "8": "0",
        "9": "0",
        "10": "0",
        "11": "0",
        "12": "0",
        "13": "0",
        "14": "0",
        "15": "0",
        "16": "0",
        "17": "0",
        "18": "0",
        "19": "0",
        "20": "0",
        "21": "0",
        "22": "0",
        "23": "0",
        "24": "0",
        "25": "0",
        "26": "0",
        "27": "0",
        "28": "0"
      }
    },
    "notes": {
      "5": "PERDIN"
    }
  },
  {
    "id": "2026-03",
    "monthName": "Maret",
    "year": 2026,
    "gid": "764226213",
    "totalDays": 31,
    "days": [
      {
        "day": 1,
        "dayName": "MG",
        "colIndex": 5
      },
      {
        "day": 2,
        "dayName": "SN",
        "colIndex": 6
      },
      {
        "day": 3,
        "dayName": "SL",
        "colIndex": 7
      },
      {
        "day": 4,
        "dayName": "RB",
        "colIndex": 8
      },
      {
        "day": 5,
        "dayName": "KM",
        "colIndex": 9
      },
      {
        "day": 6,
        "dayName": "JM",
        "colIndex": 10
      },
      {
        "day": 7,
        "dayName": "SB",
        "colIndex": 11
      },
      {
        "day": 8,
        "dayName": "MG",
        "colIndex": 12
      },
      {
        "day": 9,
        "dayName": "SN",
        "colIndex": 13
      },
      {
        "day": 10,
        "dayName": "SL",
        "colIndex": 14
      },
      {
        "day": 11,
        "dayName": "RB",
        "colIndex": 15
      },
      {
        "day": 12,
        "dayName": "KM",
        "colIndex": 16
      },
      {
        "day": 13,
        "dayName": "JM",
        "colIndex": 17
      },
      {
        "day": 14,
        "dayName": "SB",
        "colIndex": 18
      },
      {
        "day": 15,
        "dayName": "MG",
        "colIndex": 19
      },
      {
        "day": 16,
        "dayName": "SN",
        "colIndex": 20
      },
      {
        "day": 17,
        "dayName": "SL",
        "colIndex": 21
      },
      {
        "day": 18,
        "dayName": "RB",
        "colIndex": 22
      },
      {
        "day": 19,
        "dayName": "KM",
        "colIndex": 23
      },
      {
        "day": 20,
        "dayName": "JM",
        "colIndex": 24
      },
      {
        "day": 21,
        "dayName": "SB",
        "colIndex": 25
      },
      {
        "day": 22,
        "dayName": "MG",
        "colIndex": 26
      },
      {
        "day": 23,
        "dayName": "SN",
        "colIndex": 27
      },
      {
        "day": 24,
        "dayName": "SL",
        "colIndex": 28
      },
      {
        "day": 25,
        "dayName": "RB",
        "colIndex": 29
      },
      {
        "day": 26,
        "dayName": "KM",
        "colIndex": 30
      },
      {
        "day": 27,
        "dayName": "JM",
        "colIndex": 31
      },
      {
        "day": 28,
        "dayName": "SB",
        "colIndex": 32
      },
      {
        "day": 29,
        "dayName": "MG",
        "colIndex": 33
      },
      {
        "day": 30,
        "dayName": "SN",
        "colIndex": 34
      },
      {
        "day": 31,
        "dayName": "SL",
        "colIndex": 35
      }
    ],
    "members": [
      {
        "no": "1",
        "nip": "185849",
        "nama": "KEMAS HIDAYAT",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "M0067",
          "2": "M0067",
          "3": "O",
          "4": "M0067",
          "5": "M0067",
          "6": "M0067",
          "7": "M0067",
          "8": "O",
          "9": "M0067",
          "10": "M0067",
          "11": "M0067",
          "12": "M0067",
          "13": "M0067",
          "14": "M0067",
          "15": "O",
          "16": "M0067",
          "17": "M0067",
          "18": "M0067",
          "19": "M0067",
          "20": "M0067",
          "21": "O",
          "22": "O",
          "23": "M0067",
          "24": "M0067",
          "25": "O",
          "26": "M0067",
          "27": "M0067",
          "28": "M0067",
          "29": "O",
          "30": "M0067",
          "31": "M0067"
        },
        "summary": {
          "O": "7",
          "AL": "0",
          "M0067": "24"
        }
      },
      {
        "no": "3",
        "nip": "194445",
        "nama": "DONI ASHARI",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "M0067",
          "2": "M0067",
          "3": "M0067",
          "4": "O",
          "5": "M0067",
          "6": "M0067",
          "7": "M0067",
          "8": "M0067",
          "9": "O",
          "10": "M0067",
          "11": "M0067",
          "12": "M0067",
          "13": "M0067",
          "14": "O",
          "15": "M0067",
          "16": "M0067",
          "17": "M0067",
          "18": "M0067",
          "19": "M0067",
          "20": "M0067",
          "21": "O",
          "22": "O",
          "23": "M0067",
          "24": "M0067",
          "25": "M0067",
          "26": "O",
          "27": "M0067",
          "28": "M0067",
          "29": "M0067",
          "30": "O",
          "31": "M0067"
        },
        "summary": {
          "O": "7",
          "AL": "0",
          "M0067": "24"
        }
      },
      {
        "no": "4",
        "nip": "194455",
        "nama": "MUHAMMAD JUPI",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "M0067",
          "2": "M0067",
          "3": "M0067",
          "4": "M0067",
          "5": "M0067",
          "6": "M0067",
          "7": "O",
          "8": "M0067",
          "9": "M0067",
          "10": "O",
          "11": "M0067",
          "12": "M0067",
          "13": "M0067",
          "14": "M0067",
          "15": "M0067",
          "16": "M0067",
          "17": "O",
          "18": "M0067",
          "19": "M0067",
          "20": "M0067",
          "21": "O",
          "22": "O",
          "23": "M0067",
          "24": "M0067",
          "25": "M0067",
          "26": "M0067",
          "27": "O",
          "28": "M0067",
          "29": "M0067",
          "30": "M0067",
          "31": "O"
        },
        "summary": {
          "O": "7",
          "AL": "0",
          "M0067": "24"
        }
      }
    ],
    "dailyStats": {
      "m0067": {
        "1": "3",
        "2": "3",
        "3": "2",
        "4": "2",
        "5": "3",
        "6": "3",
        "7": "2",
        "8": "2",
        "9": "2",
        "10": "2",
        "11": "3",
        "12": "3",
        "13": "3",
        "14": "2",
        "15": "2",
        "16": "3",
        "17": "2",
        "18": "3",
        "19": "3",
        "20": "3",
        "21": "0",
        "22": "0",
        "23": "3",
        "24": "3",
        "25": "2",
        "26": "2",
        "27": "2",
        "28": "3",
        "29": "2",
        "30": "2",
        "31": "2"
      },
      "off": {
        "1": "0",
        "2": "0",
        "3": "1",
        "4": "1",
        "5": "0",
        "6": "0",
        "7": "1",
        "8": "1",
        "9": "1",
        "10": "1",
        "11": "0",
        "12": "0",
        "13": "0",
        "14": "1",
        "15": "1",
        "16": "0",
        "17": "1",
        "18": "0",
        "19": "0",
        "20": "0",
        "21": "3",
        "22": "3",
        "23": "0",
        "24": "0",
        "25": "1",
        "26": "1",
        "27": "1",
        "28": "0",
        "29": "1",
        "30": "1",
        "31": "1"
      },
      "al": {
        "1": "0",
        "2": "0",
        "3": "0",
        "4": "0",
        "5": "0",
        "6": "0",
        "7": "0",
        "8": "0",
        "9": "0",
        "10": "0",
        "11": "0",
        "12": "0",
        "13": "0",
        "14": "0",
        "15": "0",
        "16": "0",
        "17": "0",
        "18": "0",
        "19": "0",
        "20": "0",
        "21": "0",
        "22": "0",
        "23": "0",
        "24": "0",
        "25": "0",
        "26": "0",
        "27": "0",
        "28": "0",
        "29": "0",
        "30": "0",
        "31": "0"
      }
    },
    "notes": {
      "5": "PERDIN",
      "6": "PERDIN"
    }
  },
  {
    "id": "2026-04",
    "monthName": "April",
    "year": 2026,
    "gid": "1464149613",
    "totalDays": 30,
    "days": [
      {
        "day": 1,
        "dayName": "RB",
        "colIndex": 5
      },
      {
        "day": 2,
        "dayName": "KM",
        "colIndex": 6
      },
      {
        "day": 3,
        "dayName": "JM",
        "colIndex": 7
      },
      {
        "day": 4,
        "dayName": "SB",
        "colIndex": 8
      },
      {
        "day": 5,
        "dayName": "MG",
        "colIndex": 9
      },
      {
        "day": 6,
        "dayName": "SN",
        "colIndex": 10
      },
      {
        "day": 7,
        "dayName": "SL",
        "colIndex": 11
      },
      {
        "day": 8,
        "dayName": "RB",
        "colIndex": 12
      },
      {
        "day": 9,
        "dayName": "KM",
        "colIndex": 13
      },
      {
        "day": 10,
        "dayName": "JM",
        "colIndex": 14
      },
      {
        "day": 11,
        "dayName": "SB",
        "colIndex": 15
      },
      {
        "day": 12,
        "dayName": "MG",
        "colIndex": 16
      },
      {
        "day": 13,
        "dayName": "SN",
        "colIndex": 17
      },
      {
        "day": 14,
        "dayName": "SL",
        "colIndex": 18
      },
      {
        "day": 15,
        "dayName": "RB",
        "colIndex": 19
      },
      {
        "day": 16,
        "dayName": "KM",
        "colIndex": 20
      },
      {
        "day": 17,
        "dayName": "JM",
        "colIndex": 21
      },
      {
        "day": 18,
        "dayName": "SB",
        "colIndex": 22
      },
      {
        "day": 19,
        "dayName": "MG",
        "colIndex": 23
      },
      {
        "day": 20,
        "dayName": "SN",
        "colIndex": 24
      },
      {
        "day": 21,
        "dayName": "SL",
        "colIndex": 25
      },
      {
        "day": 22,
        "dayName": "RB",
        "colIndex": 26
      },
      {
        "day": 23,
        "dayName": "KM",
        "colIndex": 27
      },
      {
        "day": 24,
        "dayName": "JM",
        "colIndex": 28
      },
      {
        "day": 25,
        "dayName": "SB",
        "colIndex": 29
      },
      {
        "day": 26,
        "dayName": "MG",
        "colIndex": 30
      },
      {
        "day": 27,
        "dayName": "SN",
        "colIndex": 31
      },
      {
        "day": 28,
        "dayName": "SL",
        "colIndex": 32
      },
      {
        "day": 29,
        "dayName": "RB",
        "colIndex": 33
      },
      {
        "day": 30,
        "dayName": "KM",
        "colIndex": 34
      }
    ],
    "members": [
      {
        "no": "1",
        "nip": "185849",
        "nama": "KEMAS HIDAYAT",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "M0067",
          "2": "M0067",
          "3": "O",
          "4": "M0067",
          "5": "O",
          "6": "M0067",
          "7": "M0067",
          "8": "M0067",
          "9": "M0067",
          "10": "M0067",
          "11": "O",
          "12": "M0067",
          "13": "M0067",
          "14": "M0067",
          "15": "M0067",
          "16": "M0067",
          "17": "M0067",
          "18": "AL",
          "19": "AL",
          "20": "AL",
          "21": "M0067",
          "22": "M0067",
          "23": "M0067",
          "24": "M0067",
          "25": "M0067",
          "26": "O",
          "27": "M0067",
          "28": "M0067",
          "29": "M0067",
          "30": "O"
        },
        "summary": {
          "O": "5",
          "AL": "3",
          "M0067": "22"
        }
      },
      {
        "no": "3",
        "nip": "194445",
        "nama": "DONI ASHARI",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "M0067",
          "2": "M0067",
          "3": "M0067",
          "4": "M0067",
          "5": "M0067",
          "6": "O",
          "7": "M0067",
          "8": "M0067",
          "9": "M0067",
          "10": "M0067",
          "11": "M0067",
          "12": "O",
          "13": "M0067",
          "14": "M0067",
          "15": "M0067",
          "16": "M0067",
          "17": "O",
          "18": "M0067",
          "19": "M0067",
          "20": "M0067",
          "21": "M0067",
          "22": "M0067",
          "23": "O",
          "24": "M0067",
          "25": "M0067",
          "26": "M0067",
          "27": "M0067",
          "28": "M0067",
          "29": "O",
          "30": "M0067"
        },
        "summary": {
          "O": "5",
          "AL": "0",
          "M0067": "25"
        }
      },
      {
        "no": "4",
        "nip": "194455",
        "nama": "MUHAMMAD JUPI",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "M0067",
          "2": "M0067",
          "3": "M0067",
          "4": "M0067",
          "5": "M0067",
          "6": "M0067",
          "7": "O",
          "8": "M0067",
          "9": "M0067",
          "10": "M0067",
          "11": "M0067",
          "12": "M0067",
          "13": "M0067",
          "14": "O",
          "15": "M0067",
          "16": "M0067",
          "17": "M0067",
          "18": "M0067",
          "19": "M0067",
          "20": "M0067",
          "21": "O",
          "22": "M0067",
          "23": "M0067",
          "24": "M0067",
          "25": "O",
          "26": "M0067",
          "27": "M0067",
          "28": "O",
          "29": "M0067",
          "30": "M0067"
        },
        "summary": {
          "O": "5",
          "AL": "0",
          "M0067": "25"
        }
      }
    ],
    "dailyStats": {
      "m0067": {
        "1": "3",
        "2": "3",
        "3": "2",
        "4": "3",
        "5": "2",
        "6": "2",
        "7": "2",
        "8": "3",
        "9": "3",
        "10": "3",
        "11": "2",
        "12": "2",
        "13": "3",
        "14": "2",
        "15": "3",
        "16": "3",
        "17": "2",
        "18": "2",
        "19": "2",
        "20": "2",
        "21": "2",
        "22": "3",
        "23": "2",
        "24": "3",
        "25": "2",
        "26": "2",
        "27": "3",
        "28": "2",
        "29": "2",
        "30": "2"
      },
      "off": {
        "1": "0",
        "2": "0",
        "3": "1",
        "4": "0",
        "5": "1",
        "6": "1",
        "7": "1",
        "8": "0",
        "9": "0",
        "10": "0",
        "11": "1",
        "12": "1",
        "13": "0",
        "14": "1",
        "15": "0",
        "16": "0",
        "17": "1",
        "18": "0",
        "19": "0",
        "20": "0",
        "21": "1",
        "22": "0",
        "23": "1",
        "24": "0",
        "25": "1",
        "26": "1",
        "27": "0",
        "28": "1",
        "29": "1",
        "30": "1"
      },
      "al": {
        "1": "0",
        "2": "0",
        "3": "0",
        "4": "0",
        "5": "0",
        "6": "0",
        "7": "0",
        "8": "0",
        "9": "0",
        "10": "0",
        "11": "0",
        "12": "0",
        "13": "0",
        "14": "0",
        "15": "0",
        "16": "0",
        "17": "0",
        "18": "1",
        "19": "1",
        "20": "1",
        "21": "0",
        "22": "0",
        "23": "0",
        "24": "0",
        "25": "0",
        "26": "0",
        "27": "0",
        "28": "0",
        "29": "0",
        "30": "0"
      }
    },
    "notes": {}
  },
  {
    "id": "2026-05",
    "monthName": "Mei",
    "year": 2026,
    "gid": "711135214",
    "totalDays": 31,
    "days": [
      {
        "day": 1,
        "dayName": "JM",
        "colIndex": 5
      },
      {
        "day": 2,
        "dayName": "SB",
        "colIndex": 6
      },
      {
        "day": 3,
        "dayName": "MG",
        "colIndex": 7
      },
      {
        "day": 4,
        "dayName": "SN",
        "colIndex": 8
      },
      {
        "day": 5,
        "dayName": "SL",
        "colIndex": 9
      },
      {
        "day": 6,
        "dayName": "RB",
        "colIndex": 10
      },
      {
        "day": 7,
        "dayName": "KM",
        "colIndex": 11
      },
      {
        "day": 8,
        "dayName": "JM",
        "colIndex": 12
      },
      {
        "day": 9,
        "dayName": "SB",
        "colIndex": 13
      },
      {
        "day": 10,
        "dayName": "MG",
        "colIndex": 14
      },
      {
        "day": 11,
        "dayName": "SN",
        "colIndex": 15
      },
      {
        "day": 12,
        "dayName": "SL",
        "colIndex": 16
      },
      {
        "day": 13,
        "dayName": "RB",
        "colIndex": 17
      },
      {
        "day": 14,
        "dayName": "KM",
        "colIndex": 18
      },
      {
        "day": 15,
        "dayName": "JM",
        "colIndex": 19
      },
      {
        "day": 16,
        "dayName": "SB",
        "colIndex": 20
      },
      {
        "day": 17,
        "dayName": "MG",
        "colIndex": 21
      },
      {
        "day": 18,
        "dayName": "SN",
        "colIndex": 22
      },
      {
        "day": 19,
        "dayName": "SL",
        "colIndex": 23
      },
      {
        "day": 20,
        "dayName": "RB",
        "colIndex": 24
      },
      {
        "day": 21,
        "dayName": "KM",
        "colIndex": 25
      },
      {
        "day": 22,
        "dayName": "JM",
        "colIndex": 26
      },
      {
        "day": 23,
        "dayName": "SB",
        "colIndex": 27
      },
      {
        "day": 24,
        "dayName": "MG",
        "colIndex": 28
      },
      {
        "day": 25,
        "dayName": "SN",
        "colIndex": 29
      },
      {
        "day": 26,
        "dayName": "SL",
        "colIndex": 30
      },
      {
        "day": 27,
        "dayName": "RB",
        "colIndex": 31
      },
      {
        "day": 28,
        "dayName": "KM",
        "colIndex": 32
      },
      {
        "day": 29,
        "dayName": "JM",
        "colIndex": 33
      },
      {
        "day": 30,
        "dayName": "SB",
        "colIndex": 34
      },
      {
        "day": 31,
        "dayName": "MG",
        "colIndex": 35
      }
    ],
    "members": [
      {
        "no": "1",
        "nip": "185849",
        "nama": "KEMAS HIDAYAT",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "O",
          "2": "M0067",
          "3": "O",
          "4": "M0067",
          "5": "M0067",
          "6": "M0067",
          "7": "M0067",
          "8": "M0067",
          "9": "O",
          "10": "M0067",
          "11": "M0067",
          "12": "M0067",
          "13": "M0067",
          "14": "M0067",
          "15": "M0067",
          "16": "O",
          "17": "M0067",
          "18": "M0067",
          "19": "M0067",
          "20": "O",
          "21": "M0067",
          "22": "M0067",
          "23": "M0067",
          "24": "O",
          "25": "M0067",
          "26": "M0067",
          "27": "O",
          "28": "M0067",
          "29": "M0067",
          "30": "M0067",
          "31": "O"
        },
        "summary": {
          "O": "8",
          "AL": "0",
          "M0067": "23"
        }
      },
      {
        "no": "3",
        "nip": "194445",
        "nama": "DONI ASHARI",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "O",
          "2": "M0067",
          "3": "M0067",
          "4": "O",
          "5": "M0067",
          "6": "M0067",
          "7": "M0067",
          "8": "O",
          "9": "M0067",
          "10": "M0067",
          "11": "M0067",
          "12": "M0067",
          "13": "O",
          "14": "O",
          "15": "M0067",
          "16": "M0067",
          "17": "M0067",
          "18": "O",
          "19": "M0067",
          "20": "M0067",
          "21": "M0067",
          "22": "M0067",
          "23": "O",
          "24": "M0067",
          "25": "M0067",
          "26": "M0067",
          "27": "O",
          "28": "M0067",
          "29": "M0067",
          "30": "M0067",
          "31": "M0067"
        },
        "summary": {
          "O": "8",
          "AL": "0",
          "M0067": "23"
        }
      },
      {
        "no": "4",
        "nip": "194455",
        "nama": "MUHAMMAD JUPI",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "O",
          "2": "M0067",
          "3": "M0067",
          "4": "M0067",
          "5": "O",
          "6": "O",
          "7": "O",
          "8": "M0067",
          "9": "M0067",
          "10": "M0067",
          "11": "M0067",
          "12": "O",
          "13": "M0067",
          "14": "M0067",
          "15": "M0067",
          "16": "M0067",
          "17": "M0067",
          "18": "M0067",
          "19": "O",
          "20": "M0067",
          "21": "M0067",
          "22": "M0067",
          "23": "M0067",
          "24": "M0067",
          "25": "M0067",
          "26": "M0067",
          "27": "O",
          "28": "M0067",
          "29": "M0067",
          "30": "O",
          "31": "M0067"
        },
        "summary": {
          "O": "8",
          "AL": "0",
          "M0067": "23"
        }
      }
    ],
    "dailyStats": {
      "m0067": {
        "1": "0",
        "2": "3",
        "3": "2",
        "4": "2",
        "5": "2",
        "6": "2",
        "7": "2",
        "8": "2",
        "9": "2",
        "10": "3",
        "11": "3",
        "12": "2",
        "13": "2",
        "14": "2",
        "15": "3",
        "16": "2",
        "17": "3",
        "18": "2",
        "19": "2",
        "20": "2",
        "21": "3",
        "22": "3",
        "23": "2",
        "24": "2",
        "25": "3",
        "26": "3",
        "27": "0",
        "28": "3",
        "29": "3",
        "30": "2",
        "31": "2"
      },
      "off": {
        "1": "3",
        "2": "0",
        "3": "1",
        "4": "1",
        "5": "1",
        "6": "1",
        "7": "1",
        "8": "1",
        "9": "1",
        "10": "0",
        "11": "0",
        "12": "1",
        "13": "1",
        "14": "1",
        "15": "0",
        "16": "1",
        "17": "0",
        "18": "1",
        "19": "1",
        "20": "1",
        "21": "0",
        "22": "0",
        "23": "1",
        "24": "1",
        "25": "0",
        "26": "0",
        "27": "3",
        "28": "0",
        "29": "0",
        "30": "1",
        "31": "1"
      },
      "al": {
        "1": "0",
        "2": "0",
        "3": "0",
        "4": "0",
        "5": "0",
        "6": "0",
        "7": "0",
        "8": "0",
        "9": "0",
        "10": "0",
        "11": "0",
        "12": "0",
        "13": "0",
        "14": "0",
        "15": "0",
        "16": "0",
        "17": "0",
        "18": "0",
        "19": "0",
        "20": "0",
        "21": "0",
        "22": "0",
        "23": "0",
        "24": "0",
        "25": "0",
        "26": "0",
        "27": "0",
        "28": "0",
        "29": "0",
        "30": "0",
        "31": "0"
      }
    },
    "notes": {
      "24": "PERDIN KAB SAMBAS",
      "26": "RMR JUPI",
      "27": "LEBARAN HAJI | DONI RMR TGL 29 | JUPI RMR TGL 30",
      "29": "RMR DONI"
    }
  },
  {
    "id": "2026-06",
    "monthName": "Juni",
    "year": 2026,
    "gid": "1657733442",
    "totalDays": 31,
    "days": [
      {
        "day": 1,
        "dayName": "SN",
        "colIndex": 5
      },
      {
        "day": 2,
        "dayName": "SL",
        "colIndex": 6
      },
      {
        "day": 3,
        "dayName": "RB",
        "colIndex": 7
      },
      {
        "day": 4,
        "dayName": "KM",
        "colIndex": 8
      },
      {
        "day": 5,
        "dayName": "JM",
        "colIndex": 9
      },
      {
        "day": 6,
        "dayName": "SB",
        "colIndex": 10
      },
      {
        "day": 7,
        "dayName": "MG",
        "colIndex": 11
      },
      {
        "day": 8,
        "dayName": "SN",
        "colIndex": 12
      },
      {
        "day": 9,
        "dayName": "SL",
        "colIndex": 13
      },
      {
        "day": 10,
        "dayName": "RB",
        "colIndex": 14
      },
      {
        "day": 11,
        "dayName": "KM",
        "colIndex": 15
      },
      {
        "day": 12,
        "dayName": "JM",
        "colIndex": 16
      },
      {
        "day": 13,
        "dayName": "SB",
        "colIndex": 17
      },
      {
        "day": 14,
        "dayName": "MG",
        "colIndex": 18
      },
      {
        "day": 15,
        "dayName": "SN",
        "colIndex": 19
      },
      {
        "day": 16,
        "dayName": "SL",
        "colIndex": 20
      },
      {
        "day": 17,
        "dayName": "RB",
        "colIndex": 21
      },
      {
        "day": 18,
        "dayName": "KM",
        "colIndex": 22
      },
      {
        "day": 19,
        "dayName": "JM",
        "colIndex": 23
      },
      {
        "day": 20,
        "dayName": "SB",
        "colIndex": 24
      },
      {
        "day": 21,
        "dayName": "MG",
        "colIndex": 25
      },
      {
        "day": 22,
        "dayName": "SN",
        "colIndex": 26
      },
      {
        "day": 23,
        "dayName": "SL",
        "colIndex": 27
      },
      {
        "day": 24,
        "dayName": "RB",
        "colIndex": 28
      },
      {
        "day": 25,
        "dayName": "KM",
        "colIndex": 29
      },
      {
        "day": 26,
        "dayName": "JM",
        "colIndex": 30
      },
      {
        "day": 27,
        "dayName": "SB",
        "colIndex": 31
      },
      {
        "day": 28,
        "dayName": "MG",
        "colIndex": 32
      },
      {
        "day": 29,
        "dayName": "SN",
        "colIndex": 33
      },
      {
        "day": 30,
        "dayName": "SL",
        "colIndex": 34
      },
      {
        "day": 31,
        "dayName": "MG",
        "colIndex": 35
      }
    ],
    "members": [
      {
        "no": "1",
        "nip": "185849",
        "nama": "KEMAS HIDAYAT",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "M0067",
          "2": "M0067",
          "3": "O",
          "4": "M0067",
          "5": "M0067",
          "6": "M0067",
          "7": "O",
          "8": "M0067",
          "9": "M0067",
          "10": "M0067",
          "11": "M0067",
          "12": "M0067",
          "13": "O",
          "14": "M0067",
          "15": "M0067",
          "16": "M0067",
          "17": "M0067",
          "18": "M0067",
          "19": "M0067",
          "20": "M0067",
          "21": "O",
          "22": "M0067",
          "23": "M0067",
          "24": "M0067",
          "25": "M0067",
          "26": "M0067",
          "27": "O",
          "28": "M0067",
          "29": "M0067",
          "30": "O",
          "31": ""
        },
        "summary": {
          "O": "6",
          "AL": "0",
          "M0067": "24"
        }
      },
      {
        "no": "3",
        "nip": "194445",
        "nama": "DONI ASHARI",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "O",
          "2": "M0067",
          "3": "M0067",
          "4": "M0067",
          "5": "M0067",
          "6": "M0067",
          "7": "M0067",
          "8": "O",
          "9": "M0067",
          "10": "M0067",
          "11": "M0067",
          "12": "M0067",
          "13": "M0067",
          "14": "O",
          "15": "M0067",
          "16": "M0067",
          "17": "M0067",
          "18": "M0067",
          "19": "O",
          "20": "M0067",
          "21": "M0067",
          "22": "M0067",
          "23": "M0067",
          "24": "O",
          "25": "M0067",
          "26": "M0067",
          "27": "M0067",
          "28": "O",
          "29": "M0067",
          "30": "M0067",
          "31": ""
        },
        "summary": {
          "O": "6",
          "AL": "0",
          "M0067": "24"
        }
      },
      {
        "no": "4",
        "nip": "194455",
        "nama": "MUHAMMAD JUPI",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "M0067",
          "2": "M0067",
          "3": "M0067",
          "4": "M0067",
          "5": "M0067",
          "6": "O",
          "7": "M0067",
          "8": "M0067",
          "9": "O",
          "10": "M0067",
          "11": "M0067",
          "12": "M0067",
          "13": "M0067",
          "14": "M0067",
          "15": "O",
          "16": "O",
          "17": "M0067",
          "18": "M0067",
          "19": "M0067",
          "20": "M0067",
          "21": "M0067",
          "22": "M0067",
          "23": "O",
          "24": "M0067",
          "25": "M0067",
          "26": "M0067",
          "27": "M0067",
          "28": "M0067",
          "29": "O",
          "30": "M0067",
          "31": ""
        },
        "summary": {
          "O": "6",
          "AL": "0",
          "M0067": "24"
        }
      }
    ],
    "dailyStats": {
      "m0067": {
        "1": "2",
        "2": "3",
        "3": "2",
        "4": "3",
        "5": "3",
        "6": "2",
        "7": "2",
        "8": "2",
        "9": "2",
        "10": "3",
        "11": "3",
        "12": "3",
        "13": "2",
        "14": "2",
        "15": "2",
        "16": "2",
        "17": "3",
        "18": "3",
        "19": "2",
        "20": "3",
        "21": "2",
        "22": "3",
        "23": "2",
        "24": "2",
        "25": "3",
        "26": "3",
        "27": "2",
        "28": "2",
        "29": "2",
        "30": "2",
        "31": "0"
      },
      "off": {
        "1": "1",
        "2": "0",
        "3": "1",
        "4": "0",
        "5": "0",
        "6": "1",
        "7": "1",
        "8": "1",
        "9": "1",
        "10": "0",
        "11": "0",
        "12": "0",
        "13": "1",
        "14": "1",
        "15": "1",
        "16": "1",
        "17": "0",
        "18": "0",
        "19": "1",
        "20": "0",
        "21": "1",
        "22": "0",
        "23": "1",
        "24": "1",
        "25": "0",
        "26": "0",
        "27": "1",
        "28": "1",
        "29": "1",
        "30": "1",
        "31": "0"
      },
      "al": {
        "1": "0",
        "2": "0",
        "3": "0",
        "4": "0",
        "5": "0",
        "6": "0",
        "7": "0",
        "8": "0",
        "9": "0",
        "10": "0",
        "11": "0",
        "12": "0",
        "13": "0",
        "14": "0",
        "15": "0",
        "16": "0",
        "17": "0",
        "18": "0",
        "19": "0",
        "20": "0",
        "21": "0",
        "22": "0",
        "23": "0",
        "24": "0",
        "25": "0",
        "26": "0",
        "27": "0",
        "28": "0",
        "29": "0",
        "30": "0",
        "31": "0"
      }
    },
    "notes": {
      "12": "TUKAR OFF  JUPI"
    }
  },
  {
    "id": "2026-07",
    "monthName": "Juli",
    "year": 2026,
    "gid": "1511274547",
    "totalDays": 31,
    "days": [
      {
        "day": 1,
        "dayName": "RB",
        "colIndex": 5
      },
      {
        "day": 2,
        "dayName": "KM",
        "colIndex": 6
      },
      {
        "day": 3,
        "dayName": "JM",
        "colIndex": 7
      },
      {
        "day": 4,
        "dayName": "SB",
        "colIndex": 8
      },
      {
        "day": 5,
        "dayName": "MG",
        "colIndex": 9
      },
      {
        "day": 6,
        "dayName": "SN",
        "colIndex": 10
      },
      {
        "day": 7,
        "dayName": "SL",
        "colIndex": 11
      },
      {
        "day": 8,
        "dayName": "RB",
        "colIndex": 12
      },
      {
        "day": 9,
        "dayName": "KM",
        "colIndex": 13
      },
      {
        "day": 10,
        "dayName": "JM",
        "colIndex": 14
      },
      {
        "day": 11,
        "dayName": "SB",
        "colIndex": 15
      },
      {
        "day": 12,
        "dayName": "MG",
        "colIndex": 16
      },
      {
        "day": 13,
        "dayName": "SN",
        "colIndex": 17
      },
      {
        "day": 14,
        "dayName": "SL",
        "colIndex": 18
      },
      {
        "day": 15,
        "dayName": "RB",
        "colIndex": 19
      },
      {
        "day": 16,
        "dayName": "KM",
        "colIndex": 20
      },
      {
        "day": 17,
        "dayName": "JM",
        "colIndex": 21
      },
      {
        "day": 18,
        "dayName": "SB",
        "colIndex": 22
      },
      {
        "day": 19,
        "dayName": "MG",
        "colIndex": 23
      },
      {
        "day": 20,
        "dayName": "SN",
        "colIndex": 24
      },
      {
        "day": 21,
        "dayName": "SL",
        "colIndex": 25
      },
      {
        "day": 22,
        "dayName": "RB",
        "colIndex": 26
      },
      {
        "day": 23,
        "dayName": "KM",
        "colIndex": 27
      },
      {
        "day": 24,
        "dayName": "JM",
        "colIndex": 28
      },
      {
        "day": 25,
        "dayName": "SB",
        "colIndex": 29
      },
      {
        "day": 26,
        "dayName": "MG",
        "colIndex": 30
      },
      {
        "day": 27,
        "dayName": "SN",
        "colIndex": 31
      },
      {
        "day": 28,
        "dayName": "SL",
        "colIndex": 32
      },
      {
        "day": 29,
        "dayName": "RB",
        "colIndex": 33
      },
      {
        "day": 30,
        "dayName": "KM",
        "colIndex": 34
      },
      {
        "day": 31,
        "dayName": "JM",
        "colIndex": 35
      }
    ],
    "members": [
      {
        "no": "1",
        "nip": "185849",
        "nama": "KEMAS HIDAYAT",
        "jobTitle": "INST",
        "totalHariKerja": "31",
        "shifts": {
          "1": "M0067",
          "2": "M0067",
          "3": "M0067",
          "4": "O",
          "5": "M0067",
          "6": "M0067",
          "7": "M0067",
          "8": "M0067",
          "9": "M0067",
          "10": "M0067",
          "11": "O",
          "12": "M0067",
          "13": "M0067",
          "14": "M0067",
          "15": "M0067",
          "16": "M0067",
          "17": "M0067",
          "18": "M0067",
          "19": "O",
          "20": "M0067",
          "21": "M0067",
          "22": "M0067",
          "23": "M0067",
          "24": "M0067",
          "25": "M0067",
          "26": "O",
          "27": "M0067",
          "28": "M0067",
          "29": "M0067",
          "30": "M0067",
          "31": "M0067"
        },
        "summary": {
          "O": "4",
          "AL": "0",
          "M0067": "26"
        }
      },
      {
        "no": "2",
        "nip": "194445",
        "nama": "DONI ASHARI",
        "jobTitle": "INST",
        "totalHariKerja": "31",
        "shifts": {
          "1": "O",
          "2": "M0067",
          "3": "M0067",
          "4": "M0067",
          "5": "M0067",
          "6": "M0067",
          "7": "M0067",
          "8": "M0067",
          "9": "M0067",
          "10": "M0067",
          "11": "M0067",
          "12": "M0067",
          "13": "O",
          "14": "M0067",
          "15": "M0067",
          "16": "M0067",
          "17": "M0067",
          "18": "O",
          "19": "M0067",
          "20": "M0067",
          "21": "M0067",
          "22": "M0067",
          "23": "M0067",
          "24": "M0067",
          "25": "M0067",
          "26": "M0067",
          "27": "O",
          "28": "M0067",
          "29": "M0067",
          "30": "M0067",
          "31": "M0067"
        },
        "summary": {
          "O": "4",
          "AL": "0",
          "M0067": "26"
        }
      },
      {
        "no": "3",
        "nip": "194455",
        "nama": "MUHAMMAD JUPI",
        "jobTitle": "INST",
        "totalHariKerja": "31",
        "shifts": {
          "1": "M0067",
          "2": "M0067",
          "3": "M0067",
          "4": "M0067",
          "5": "O",
          "6": "M0067",
          "7": "M0067",
          "8": "M0067",
          "9": "O",
          "10": "M0067",
          "11": "M0067",
          "12": "M0067",
          "13": "M0067",
          "14": "M0067",
          "15": "M0067",
          "16": "O",
          "17": "M0067",
          "18": "M0067",
          "19": "M0067",
          "20": "M0067",
          "21": "M0067",
          "22": "M0067",
          "23": "O",
          "24": "M0067",
          "25": "M0067",
          "26": "M0067",
          "27": "M0067",
          "28": "M0067",
          "29": "M0067",
          "30": "M0067",
          "31": "M0067"
        },
        "summary": {
          "O": "4",
          "AL": "0",
          "M0067": "26"
        }
      }
    ],
    "dailyStats": {
      "m0067": {
        "1": "2",
        "2": "3",
        "3": "3",
        "4": "2",
        "5": "2",
        "6": "3",
        "7": "3",
        "8": "3",
        "9": "2",
        "10": "3",
        "11": "2",
        "12": "3",
        "13": "2",
        "14": "3",
        "15": "3",
        "16": "2",
        "17": "3",
        "18": "2",
        "19": "2",
        "20": "3",
        "21": "3",
        "22": "3",
        "23": "2",
        "24": "3",
        "25": "3",
        "26": "2",
        "27": "2",
        "28": "3",
        "29": "3",
        "30": "3",
        "31": "3"
      },
      "off": {
        "1": "1",
        "2": "0",
        "3": "0",
        "4": "1",
        "5": "1",
        "6": "0",
        "7": "0",
        "8": "0",
        "9": "1",
        "10": "0",
        "11": "1",
        "12": "0",
        "13": "1",
        "14": "0",
        "15": "0",
        "16": "1",
        "17": "0",
        "18": "1",
        "19": "1",
        "20": "0",
        "21": "0",
        "22": "0",
        "23": "1",
        "24": "0",
        "25": "0",
        "26": "1",
        "27": "1",
        "28": "0",
        "29": "0",
        "30": "0",
        "31": "0"
      },
      "al": {
        "1": "0",
        "2": "0",
        "3": "0",
        "4": "0",
        "5": "0",
        "6": "0",
        "7": "0",
        "8": "0",
        "9": "0",
        "10": "0",
        "11": "0",
        "12": "0",
        "13": "0",
        "14": "0",
        "15": "0",
        "16": "0",
        "17": "0",
        "18": "0",
        "19": "0",
        "20": "0",
        "21": "0",
        "22": "0",
        "23": "0",
        "24": "0",
        "25": "0",
        "26": "0",
        "27": "0",
        "28": "0",
        "29": "0",
        "30": "0",
        "31": "0"
      }
    },
    "notes": {
      "12": "PERDIN SENGKUBANG"
    }
  },
  {
    "id": "2026-08",
    "monthName": "Agustus",
    "year": 2026,
    "gid": "1206459244",
    "totalDays": 31,
    "days": [
      {
        "day": 1,
        "dayName": "SB",
        "colIndex": 5
      },
      {
        "day": 2,
        "dayName": "MG",
        "colIndex": 6
      },
      {
        "day": 3,
        "dayName": "SN",
        "colIndex": 7
      },
      {
        "day": 4,
        "dayName": "SL",
        "colIndex": 8
      },
      {
        "day": 5,
        "dayName": "RB",
        "colIndex": 9
      },
      {
        "day": 6,
        "dayName": "KM",
        "colIndex": 10
      },
      {
        "day": 7,
        "dayName": "JM",
        "colIndex": 11
      },
      {
        "day": 8,
        "dayName": "SB",
        "colIndex": 12
      },
      {
        "day": 9,
        "dayName": "MG",
        "colIndex": 13
      },
      {
        "day": 10,
        "dayName": "SN",
        "colIndex": 14
      },
      {
        "day": 11,
        "dayName": "SL",
        "colIndex": 15
      },
      {
        "day": 12,
        "dayName": "RB",
        "colIndex": 16
      },
      {
        "day": 13,
        "dayName": "KM",
        "colIndex": 17
      },
      {
        "day": 14,
        "dayName": "JM",
        "colIndex": 18
      },
      {
        "day": 15,
        "dayName": "SB",
        "colIndex": 19
      },
      {
        "day": 16,
        "dayName": "MG",
        "colIndex": 20
      },
      {
        "day": 17,
        "dayName": "SN",
        "colIndex": 21
      },
      {
        "day": 18,
        "dayName": "SL",
        "colIndex": 22
      },
      {
        "day": 19,
        "dayName": "RB",
        "colIndex": 23
      },
      {
        "day": 20,
        "dayName": "KM",
        "colIndex": 24
      },
      {
        "day": 21,
        "dayName": "JM",
        "colIndex": 25
      },
      {
        "day": 22,
        "dayName": "SB",
        "colIndex": 26
      },
      {
        "day": 23,
        "dayName": "MG",
        "colIndex": 27
      },
      {
        "day": 24,
        "dayName": "SN",
        "colIndex": 28
      },
      {
        "day": 25,
        "dayName": "SL",
        "colIndex": 29
      },
      {
        "day": 26,
        "dayName": "RB",
        "colIndex": 30
      },
      {
        "day": 27,
        "dayName": "KM",
        "colIndex": 31
      },
      {
        "day": 28,
        "dayName": "JM",
        "colIndex": 32
      },
      {
        "day": 29,
        "dayName": "SB",
        "colIndex": 33
      },
      {
        "day": 30,
        "dayName": "MG",
        "colIndex": 34
      },
      {
        "day": 31,
        "dayName": "SN",
        "colIndex": 35
      }
    ],
    "members": [
      {
        "no": "1",
        "nip": "185849",
        "nama": "KEMAS HIDAYAT",
        "jobTitle": "INST",
        "totalHariKerja": "31",
        "shifts": {
          "1": "M0067",
          "2": "M0067",
          "3": "M0067",
          "4": "O",
          "5": "O",
          "6": "O",
          "7": "M0067",
          "8": "M0067",
          "9": "O",
          "10": "M0067",
          "11": "M0067",
          "12": "M0067",
          "13": "M0067",
          "14": "M0067",
          "15": "M0067",
          "16": "O",
          "17": "M0067",
          "18": "M0067",
          "19": "M0067",
          "20": "M0067",
          "21": "M0067",
          "22": "M0067",
          "23": "O",
          "24": "M0067",
          "25": "M0067",
          "26": "M0067",
          "27": "M0067",
          "28": "M0067",
          "29": "M0067",
          "30": "O",
          "31": "M0067"
        },
        "summary": {
          "O": "7",
          "AL": "0",
          "M0067": "23"
        }
      },
      {
        "no": "2",
        "nip": "194445",
        "nama": "DONI ASHARI",
        "jobTitle": "INST",
        "totalHariKerja": "31",
        "shifts": {
          "1": "M0067",
          "2": "O",
          "3": "M0067",
          "4": "M0067",
          "5": "M0067",
          "6": "M0067",
          "7": "M0067",
          "8": "O",
          "9": "M0067",
          "10": "M0067",
          "11": "O",
          "12": "O",
          "13": "M0067",
          "14": "M0067",
          "15": "M0067",
          "16": "M0067",
          "17": "M0067",
          "18": "M0067",
          "19": "M0067",
          "20": "O",
          "21": "M0067",
          "22": "M0067",
          "23": "M0067",
          "24": "O",
          "25": "M0067",
          "26": "M0067",
          "27": "M0067",
          "28": "M0067",
          "29": "O",
          "30": "M0067",
          "31": "M0067"
        },
        "summary": {
          "O": "7",
          "AL": "0",
          "M0067": "23"
        }
      },
      {
        "no": "3",
        "nip": "194455",
        "nama": "MUHAMMAD JUPI",
        "jobTitle": "INST",
        "totalHariKerja": "31",
        "shifts": {
          "1": "O",
          "2": "M0067",
          "3": "M0067",
          "4": "M0067",
          "5": "M0067",
          "6": "M0067",
          "7": "O",
          "8": "M0067",
          "9": "M0067",
          "10": "M0067",
          "11": "O",
          "12": "O",
          "13": "M0067",
          "14": "M0067",
          "15": "M0067",
          "16": "M0067",
          "17": "O",
          "18": "M0067",
          "19": "M0067",
          "20": "M0067",
          "21": "M0067",
          "22": "O",
          "23": "M0067",
          "24": "M0067",
          "25": "M0067",
          "26": "M0067",
          "27": "M0067",
          "28": "O",
          "29": "M0067",
          "30": "M0067",
          "31": "M0067"
        },
        "summary": {
          "O": "7",
          "AL": "0",
          "M0067": "23"
        }
      }
    ],
    "dailyStats": {
      "m0067": {
        "1": "2",
        "2": "2",
        "3": "3",
        "4": "2",
        "5": "2",
        "6": "2",
        "7": "2",
        "8": "2",
        "9": "2",
        "10": "3",
        "11": "1",
        "12": "1",
        "13": "3",
        "14": "3",
        "15": "3",
        "16": "2",
        "17": "2",
        "18": "3",
        "19": "3",
        "20": "2",
        "21": "3",
        "22": "2",
        "23": "2",
        "24": "2",
        "25": "3",
        "26": "3",
        "27": "3",
        "28": "2",
        "29": "2",
        "30": "2",
        "31": "3"
      },
      "off": {
        "1": "1",
        "2": "1",
        "3": "0",
        "4": "1",
        "5": "1",
        "6": "1",
        "7": "1",
        "8": "1",
        "9": "1",
        "10": "0",
        "11": "2",
        "12": "2",
        "13": "0",
        "14": "0",
        "15": "0",
        "16": "1",
        "17": "1",
        "18": "0",
        "19": "0",
        "20": "1",
        "21": "0",
        "22": "1",
        "23": "1",
        "24": "1",
        "25": "0",
        "26": "0",
        "27": "0",
        "28": "1",
        "29": "1",
        "30": "1",
        "31": "0"
      },
      "al": {
        "1": "0",
        "2": "0",
        "3": "0",
        "4": "0",
        "5": "0",
        "6": "0",
        "7": "0",
        "8": "0",
        "9": "0",
        "10": "0",
        "11": "0",
        "12": "0",
        "13": "0",
        "14": "0",
        "15": "0",
        "16": "0",
        "17": "0",
        "18": "0",
        "19": "0",
        "20": "0",
        "21": "0",
        "22": "0",
        "23": "0",
        "24": "0",
        "25": "0",
        "26": "0",
        "27": "0",
        "28": "0",
        "29": "0",
        "30": "0",
        "31": "0"
      }
    },
    "notes": {
      "4": "OUTING KLOTER 1",
      "10": "PERDIN KE PT EUP",
      "11": "OUTING KLOTER 2"
    }
  },
  {
    "id": "2026-09",
    "monthName": "September",
    "year": 2026,
    "gid": "1003907271",
    "totalDays": 30,
    "days": [
      {
        "day": 1,
        "dayName": "SL",
        "colIndex": 5
      },
      {
        "day": 2,
        "dayName": "RB",
        "colIndex": 6
      },
      {
        "day": 3,
        "dayName": "KM",
        "colIndex": 7
      },
      {
        "day": 4,
        "dayName": "JM",
        "colIndex": 8
      },
      {
        "day": 5,
        "dayName": "SB",
        "colIndex": 9
      },
      {
        "day": 6,
        "dayName": "MG",
        "colIndex": 10
      },
      {
        "day": 7,
        "dayName": "SN",
        "colIndex": 11
      },
      {
        "day": 8,
        "dayName": "SL",
        "colIndex": 12
      },
      {
        "day": 9,
        "dayName": "RB",
        "colIndex": 13
      },
      {
        "day": 10,
        "dayName": "KM",
        "colIndex": 14
      },
      {
        "day": 11,
        "dayName": "JM",
        "colIndex": 15
      },
      {
        "day": 12,
        "dayName": "SB",
        "colIndex": 16
      },
      {
        "day": 13,
        "dayName": "MG",
        "colIndex": 17
      },
      {
        "day": 14,
        "dayName": "SN",
        "colIndex": 18
      },
      {
        "day": 15,
        "dayName": "SL",
        "colIndex": 19
      },
      {
        "day": 16,
        "dayName": "RB",
        "colIndex": 20
      },
      {
        "day": 17,
        "dayName": "KM",
        "colIndex": 21
      },
      {
        "day": 18,
        "dayName": "JM",
        "colIndex": 22
      },
      {
        "day": 19,
        "dayName": "SB",
        "colIndex": 23
      },
      {
        "day": 20,
        "dayName": "MG",
        "colIndex": 24
      },
      {
        "day": 21,
        "dayName": "SN",
        "colIndex": 25
      },
      {
        "day": 22,
        "dayName": "SL",
        "colIndex": 26
      },
      {
        "day": 23,
        "dayName": "RB",
        "colIndex": 27
      },
      {
        "day": 24,
        "dayName": "KM",
        "colIndex": 28
      },
      {
        "day": 25,
        "dayName": "JM",
        "colIndex": 29
      },
      {
        "day": 26,
        "dayName": "SB",
        "colIndex": 30
      },
      {
        "day": 27,
        "dayName": "MG",
        "colIndex": 31
      },
      {
        "day": 28,
        "dayName": "SN",
        "colIndex": 32
      },
      {
        "day": 29,
        "dayName": "SL",
        "colIndex": 33
      },
      {
        "day": 30,
        "dayName": "RB",
        "colIndex": 34
      }
    ],
    "members": [
      {
        "no": "1",
        "nip": "185849",
        "nama": "KEMAS HIDAYAT",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "M0067",
          "2": "M0067",
          "3": "M0067",
          "4": "M0067",
          "5": "M0067",
          "6": "O",
          "7": "M0067",
          "8": "M0067",
          "9": "M0067",
          "10": "M0067",
          "11": "M0067",
          "12": "O",
          "13": "M0067",
          "14": "M0067",
          "15": "M0067",
          "16": "M0067",
          "17": "M0067",
          "18": "M0067",
          "19": "O",
          "20": "M0067",
          "21": "M0067",
          "22": "M0067",
          "23": "M0067",
          "24": "M0067",
          "25": "M0067",
          "26": "M0067",
          "27": "O",
          "28": "M0067",
          "29": "M0067",
          "30": "M0067"
        },
        "summary": {
          "O": "4",
          "AL": "0",
          "M0067": "26"
        }
      },
      {
        "no": "2",
        "nip": "194445",
        "nama": "DONI ASHARI",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "M0067",
          "2": "M0067",
          "3": "M0067",
          "4": "M0067",
          "5": "M0067",
          "6": "M0067",
          "7": "O",
          "8": "M0067",
          "9": "M0067",
          "10": "M0067",
          "11": "M0067",
          "12": "M0067",
          "13": "M0067",
          "14": "O",
          "15": "M0067",
          "16": "M0067",
          "17": "M0067",
          "18": "M0067",
          "19": "M0067",
          "20": "O",
          "21": "M0067",
          "22": "M0067",
          "23": "M0067",
          "24": "M0067",
          "25": "M0067",
          "26": "O",
          "27": "M0067",
          "28": "M0067",
          "29": "M0067",
          "30": "M0067"
        },
        "summary": {
          "O": "4",
          "AL": "0",
          "M0067": "26"
        }
      },
      {
        "no": "3",
        "nip": "194455",
        "nama": "MUHAMMAD JUPI",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "M0067",
          "2": "M0067",
          "3": "M0067",
          "4": "M0067",
          "5": "O",
          "6": "M0067",
          "7": "M0067",
          "8": "M0067",
          "9": "M0067",
          "10": "M0067",
          "11": "M0067",
          "12": "M0067",
          "13": "O",
          "14": "M0067",
          "15": "M0067",
          "16": "M0067",
          "17": "M0067",
          "18": "O",
          "19": "M0067",
          "20": "M0067",
          "21": "M0067",
          "22": "M0067",
          "23": "M0067",
          "24": "O",
          "25": "M0067",
          "26": "M0067",
          "27": "M0067",
          "28": "M0067",
          "29": "M0067",
          "30": "M0067"
        },
        "summary": {
          "O": "4",
          "AL": "0",
          "M0067": "26"
        }
      }
    ],
    "dailyStats": {
      "m0067": {
        "1": "3",
        "2": "3",
        "3": "3",
        "4": "3",
        "5": "2",
        "6": "2",
        "7": "2",
        "8": "3",
        "9": "3",
        "10": "3",
        "11": "3",
        "12": "2",
        "13": "2",
        "14": "2",
        "15": "3",
        "16": "3",
        "17": "3",
        "18": "2",
        "19": "2",
        "20": "2",
        "21": "3",
        "22": "3",
        "23": "3",
        "24": "2",
        "25": "3",
        "26": "2",
        "27": "2",
        "28": "3",
        "29": "3",
        "30": "3"
      },
      "off": {
        "1": "0",
        "2": "0",
        "3": "0",
        "4": "0",
        "5": "1",
        "6": "1",
        "7": "1",
        "8": "0",
        "9": "0",
        "10": "0",
        "11": "0",
        "12": "1",
        "13": "1",
        "14": "1",
        "15": "0",
        "16": "0",
        "17": "0",
        "18": "1",
        "19": "1",
        "20": "1",
        "21": "0",
        "22": "0",
        "23": "0",
        "24": "1",
        "25": "0",
        "26": "1",
        "27": "1",
        "28": "0",
        "29": "0",
        "30": "0"
      },
      "al": {
        "1": "0",
        "2": "0",
        "3": "0",
        "4": "0",
        "5": "0",
        "6": "0",
        "7": "0",
        "8": "0",
        "9": "0",
        "10": "0",
        "11": "0",
        "12": "0",
        "13": "0",
        "14": "0",
        "15": "0",
        "16": "0",
        "17": "0",
        "18": "0",
        "19": "0",
        "20": "0",
        "21": "0",
        "22": "0",
        "23": "0",
        "24": "0",
        "25": "0",
        "26": "0",
        "27": "0",
        "28": "0",
        "29": "0",
        "30": "0"
      }
    },
    "notes": {}
  },
  {
    "id": "2026-10",
    "monthName": "Oktober",
    "year": 2026,
    "gid": "1220991612",
    "totalDays": 31,
    "days": [
      { "day": 1, "dayName": "KM" },
      { "day": 2, "dayName": "JM" },
      { "day": 3, "dayName": "SB" },
      { "day": 4, "dayName": "MG" },
      { "day": 5, "dayName": "SN" },
      { "day": 6, "dayName": "SL" },
      { "day": 7, "dayName": "RB" },
      { "day": 8, "dayName": "KM" },
      { "day": 9, "dayName": "JM" },
      { "day": 10, "dayName": "SB" },
      { "day": 11, "dayName": "MG" },
      { "day": 12, "dayName": "SN" },
      { "day": 13, "dayName": "SL" },
      { "day": 14, "dayName": "RB" },
      { "day": 15, "dayName": "KM" },
      { "day": 16, "dayName": "JM" },
      { "day": 17, "dayName": "SB" },
      { "day": 18, "dayName": "MG" },
      { "day": 19, "dayName": "SN" },
      { "day": 20, "dayName": "SL" },
      { "day": 21, "dayName": "RB" },
      { "day": 22, "dayName": "KM" },
      { "day": 23, "dayName": "JM" },
      { "day": 24, "dayName": "SB" },
      { "day": 25, "dayName": "MG" },
      { "day": 26, "dayName": "SN" },
      { "day": 27, "dayName": "SL" },
      { "day": 28, "dayName": "RB" },
      { "day": 29, "dayName": "KM" },
      { "day": 30, "dayName": "JM" },
      { "day": 31, "dayName": "SB" }
    ],
    "members": [
      {
        "no": "1",
        "nip": "185849",
        "nama": "KEMAS HIDAYAT",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "M0067", "2": "M0067", "3": "M0067", "4": "O", "5": "M0067",
          "6": "M0067", "7": "M0067", "8": "M0067", "9": "M0067", "10": "M0067",
          "11": "O", "12": "M0067", "13": "M0067", "14": "M0067", "15": "M0067",
          "16": "M0067", "17": "M0067", "18": "O", "19": "M0067", "20": "M0067",
          "21": "M0067", "22": "M0067", "23": "M0067", "24": "M0067", "25": "O",
          "26": "M0067", "27": "M0067", "28": "M0067", "29": "M0067", "30": "M0067", "31": "M0067"
        },
        "summary": { "O": "4", "AL": "0", "M0067": "26" }
      },
      {
        "no": "2",
        "nip": "194445",
        "nama": "DONI ASHARI",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "O", "2": "M0067", "3": "M0067", "4": "M0067", "5": "M0067",
          "6": "M0067", "7": "M0067", "8": "M0067", "9": "M0067", "10": "O",
          "11": "M0067", "12": "M0067", "13": "M0067", "14": "M0067", "15": "M0067",
          "16": "O", "17": "M0067", "18": "M0067", "19": "M0067", "20": "M0067",
          "21": "M0067", "22": "M0067", "23": "M0067", "24": "O", "25": "M0067",
          "26": "M0067", "27": "M0067", "28": "M0067", "29": "M0067", "30": "M0067", "31": "M0067"
        },
        "summary": { "O": "4", "AL": "0", "M0067": "26" }
      },
      {
        "no": "3",
        "nip": "194455",
        "nama": "MUHAMMAD JUPI",
        "jobTitle": "INST",
        "totalHariKerja": "30",
        "shifts": {
          "1": "M0067", "2": "M0067", "3": "O", "4": "M0067", "5": "M0067",
          "6": "M0067", "7": "M0067", "8": "M0067", "9": "O", "10": "M0067",
          "11": "M0067", "12": "M0067", "13": "M0067", "14": "M0067", "15": "M0067",
          "16": "M0067", "17": "O", "18": "M0067", "19": "M0067", "20": "M0067",
          "21": "M0067", "22": "M0067", "23": "O", "24": "M0067", "25": "M0067",
          "26": "M0067", "27": "M0067", "28": "M0067", "29": "M0067", "30": "M0067", "31": "M0067"
        },
        "summary": { "O": "4", "AL": "0", "M0067": "26" }
      }
    ],
    "dailyStats": {
      "m0067": {
        "1": "2", "2": "3", "3": "2", "4": "2", "5": "3", "6": "3", "7": "3", "8": "3", "9": "2", "10": "2",
        "11": "2", "12": "3", "13": "3", "14": "3", "15": "3", "16": "2", "17": "2", "18": "2", "19": "3", "20": "3",
        "21": "3", "22": "3", "23": "2", "24": "2", "25": "2", "26": "3", "27": "3", "28": "3", "29": "3", "30": "3", "31": "3"
      },
      "off": {
        "1": "1", "2": "0", "3": "1", "4": "1", "5": "0", "6": "0", "7": "0", "8": "0", "9": "1", "10": "1",
        "11": "1", "12": "0", "13": "0", "14": "0", "15": "0", "16": "1", "17": "1", "18": "1", "19": "0", "20": "0",
        "21": "0", "22": "0", "23": "1", "24": "1", "25": "1", "26": "0", "27": "0", "28": "0", "29": "0", "30": "0", "31": "0"
      },
      "al": {
        "1": "0", "2": "0", "3": "0", "4": "0", "5": "0", "6": "0", "7": "0", "8": "0", "9": "0", "10": "0",
        "11": "0", "12": "0", "13": "0", "14": "0", "15": "0", "16": "0", "17": "0", "18": "0", "19": "0", "20": "0",
        "21": "0", "22": "0", "23": "0", "24": "0", "25": "0", "26": "0", "27": "0", "28": "0", "29": "0", "30": "0", "31": "0"
      }
    },
    "notes": {}
  }
];
