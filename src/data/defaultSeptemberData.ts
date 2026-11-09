import { parseSpreadsheetData, parseDetailLkpb, parseDetailPending } from '../utils/csvParser';
import { MonthlyDataset } from '../types';

export const DEFAULT_SEPTEMBER_RAW_CSV = `"CENTRALIZED MANUAL No.","Pool Name","Achv","Tanggal","Total Jalur","Total Team","Prod.","Bobot Masuk","Bobot Finish","Pending Resch","Rusong","Tungkom","Brg.","Inst.","Total","Open ","Lanjut Install ","Cancel ","LKPB ","(n/a) ","Instalasi Target","Real.","","","","","","","",""
"1","SINGKAWANG","100,00%","01 Sep 2026","9","1","9","57","46","-","-","-","-","-","-","-","-","2","-","-","9","9","","","","","","","",""
"2","SINGKAWANG","100,00%","02 Sep 2026","7","1","7","23","15","-","-","-","-","-","-","-","-","3","-","-","7","7","","","","","","","",""
"3","SINGKAWANG","100,00%","03 Sep 2026","4","1","4","11","11","-","-","-","-","-","-","-","-","-","-","-","4","4","","","","","","","",""
"4","SINGKAWANG","100,00%","04 Sep 2026","6","1","6","26","11","-","-","-","-","-","-","-","-","1","-","-","6","6","","","","","","","",""
"5","SINGKAWANG","100,00%","05 Sep 2026","2","1","2","10","10","-","-","-","-","-","-","-","-","-","-","-","2","2","","","","","","","",""
"6","SINGKAWANG","100,00%","06 Sep 2026","5","1","5","6","4","-","-","-","-","-","-","-","-","1","-","-","5","5","","","","","","","",""
"7","SINGKAWANG","100,00%","07 Sep 2026","2","1","2","203","203","-","-","-","-","-","-","-","-","-","-","-","2","2","","","","","","","",""
"8","SINGKAWANG","100,00%","08 Sep 2026","8","1","8","63","62","-","-","-","-","-","-","-","-","1","-","-","8","8","","","","","","","",""
"9","SINGKAWANG","100,00%","09 Sep 2026","5","1","5","36","36","-","-","-","-","-","-","-","-","-","-","-","5","5","","","","","","","",""
"10","SINGKAWANG","100,00%","10 Sep 2026","3","1","3","8","8","-","-","-","-","-","-","-","-","-","-","-","3","3","","","","","","","",""
"11","SINGKAWANG","100,00%","11 Sep 2026","1","1","1","1","1","-","-","-","-","-","-","-","-","-","-","-","1","1","","","","","","","",""
"12","SINGKAWANG","100,00%","12 Sep 2026","9","-","-","36","35","-","-","-","-","-","-","-","-","1","-","-","9","9","","","","","","","",""
"13","SINGKAWANG","100,00%","13 Sep 2026","4","1","4","8","8","-","-","-","-","-","-","-","-","-","-","-","4","4","","","","","","","",""
"14","SINGKAWANG","100,00%","14 Sep 2026","2","1","2","5","5","-","-","-","-","-","-","-","-","-","-","-","2","2","","","","","","","",""
"15","SINGKAWANG","100,00%","15 Sep 2026","10","1","10","34","-","-","-","-","-","-","-","-","-","-","-","-","10","10","","","","","","","",""
"16","SINGKAWANG","-","16 Sep 2026","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","","","","","","","",""
"17","SINGKAWANG","-","17 Sep 2026","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","","","","","","","",""
"18","SINGKAWANG","-","18 Sep 2026","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","","","","","","","",""
"19","SINGKAWANG","-","19 Sep 2026","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","","","","","","","",""
"20","SINGKAWANG","-","20 Sep 2026","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","","","","","","","",""
"21","SINGKAWANG","-","21 Sep 2026","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","","","","","","","",""
"22","SINGKAWANG","-","22 Sep 2026","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","","","","","","","",""
"23","SINGKAWANG","-","23 Sep 2026","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","","","","","","","",""
"24","SINGKAWANG","-","24 Sep 2026","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","","","","","","","",""
"25","SINGKAWANG","-","25 Sep 2026","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","","","","","","","",""
"26","SINGKAWANG","-","26 Sep 2026","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","","","","","","","",""
"27","SINGKAWANG","-","27 Sep 2026","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","","","","","","","",""
"28","SINGKAWANG","-","28 Sep 2026","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","","","","","","","",""
"29","SINGKAWANG","-","29 Sep 2026","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","","","","","","","",""
"30","SINGKAWANG","-","30 Sep 2026","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","","","","","","","",""`;

export const DEFAULT_SEPTEMBER_DETAIL_LKPB_CSV = `"", "W1", "W2"
"", "NO DO", "NAMA CUSTOMER", "TGL AWAL", "TGL TARGET", "AGING", "STATUS", "KATEGORI LKPB", "REASON"
"1", "5A.XH.000016", "MITRA PROPERTI", "6 Agu 2026", "5 Sep 2026", "40 Day", "FINISH", "CACAT", "KULIT PADA BAGIAN SANDARAN SOFA SOBEK"
"2", "D7.XF.000605", "SOPHIA", "21 Agu 2026", "20 Sep 2026", "25 Day", "OPEN", "CACAT", "BARANG TUGU MASIH CACAT"
"3", "5A.XH.000057", "RUDI", "21 Agu 2026", "24 Agu 2026", "25 Day", "FINISH", "CACAT", "SUDUT PINTU PENYOK"
"4", "5A.XG.000115", "HENY", "25 Jul 2026", "31 Agu 2026", "52 Day", "FINISH", "CACAT", "BAGIAN DEPAN SOFA SOBEK"
"5", "5A.XG.000053", "GESIA 1", "13 Jul 2026", "12 Agu 2026", "64 Day", "OPEN", "CACAT VENDOR", "TIDAK ADA CANTOLAN UNTUK AMBALAN BAWAH DI PART A"
"6", "5A.XG.000076", "ROSNAZIZI", "18 Jul 2026", "30 Sep 2026", "59 Day", "OPEN", "CACAT", "BAGIAN BAWAH DIPAN SOBEK"
"7", "35.XG.002406", "BONY", "1 Sep 2026", "1 Okt 2026", "14 Day", "OPEN", "CACAT", "GORESAN PADA KAKI MEJA"`;

export const DEFAULT_SEPTEMBER_DETAIL_PENDING_CSV = `"REKAP DETAIL PENDING"
"", "NO DO", "NAMA CUSTOMER", "TGL AWAL", "TGL TARGET", "STATUS", "KONFIRMASI BY", "KATEGORI", "KETERANGAN"
"1", "D7.XF.000717", "DIANA 2", "7 Agustus 2026", "6 Sep 2026", "OPEN", "LANGSUNG DATANG", "LJI", "ROOFTOP BELUM SIAP"
"2", "58.XG.000037", "LAI PO KHONG", "15 Agustus 2026", "14 Sep 2026", "FINISH", "CHAT/PHONE PRIBADI", "LOKASI BELUM SIAP", "KAMAR MASIH RENOV"
"3", "MC.58.20260726.4", "LAI PO KHONG", "15 Agustus 2026", "14 Sep 2026", "FINISH", "CHAT/PHONE PRIBADI", "LOKASI BELUM SIAP", "KAMAR MASIH RENOV"
"4", "5A.XH.000063", "LIM NYUN NGO", "21 Agustus 2026", "20 Sep 2026", "FINISH", "LEADER POOL/STORE", "PERMINTAAN CUST DILAIN HARI", "SMT DAYAT"
"5", "5A.XH.000064", "LIM NYUN NGO", "21 Agustus 2026", "20 Sep 2026", "FINISH", "LEADER POOL/STORE", "PERMINTAAN CUST DILAIN HARI", "SMT DAYAT"
"6", "D7.XH.000622", "FARIZ MUHAMMADALK", "28 Agustus 2026", "27 Sep 2026", "OPEN", "CHAT/PHONE PRIBADI", "LOKASI BELUM SIAP", "TOKO BELUM SIAP, MASIH KONSTRUKSI"
"7", "D7.XH.000623", "FARIZ MUHAMMADALK", "28 Agustus 2026", "27 Sep 2026", "OPEN", "CHAT/PHONE PRIBADI", "LOKASI BELUM SIAP", "TOKO BELUM SIAP, MASIH KONSTRUKSI"`;

export const DEFAULT_SEPTEMBER_DATASET: MonthlyDataset = {
  ...parseSpreadsheetData(
    DEFAULT_SEPTEMBER_RAW_CSV,
    'September',
    9,
    2026,
    'https://docs.google.com/spreadsheets/d/10yajj552DnuKf0-rroYqcdyET60WjTCe58PknW7L6Dw/edit?gid=808257444#gid=808257444',
    '808257444'
  ),
  detailLkpb: parseDetailLkpb(DEFAULT_SEPTEMBER_DETAIL_LKPB_CSV),
  detailPending: parseDetailPending(DEFAULT_SEPTEMBER_DETAIL_PENDING_CSV),
  isDefault: true,
};

export const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

