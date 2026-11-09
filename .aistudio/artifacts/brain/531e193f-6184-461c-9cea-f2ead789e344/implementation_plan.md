# Rencana Implementasi: Integrasi Spreadsheet November 2025 & Deteksi Kolom Dinamis 2025

## 1. Ringkasan Kebutuhan & Hasil Analisis
1. **Tambahkan Spreadsheet November 2025 ke Database**:
   - URL: `https://docs.google.com/spreadsheets/d/1iittRJgYUBmE5-vVt_ycnyekzZ6siaxYRWwRhIlZMPQ/edit?gid=476175390#gid=476175390`
   - Tab Utama (Centralize / Schedule Harian): Sheet pertama (01 Nov 2025 s/d 30 Nov 2025)
   - Tab Detail Pendingan: GID `476175390` (atau sheet "Detail Pendingan")
   - Tab Detail LKPB: Sheet "Detail LKPB"
   - Database target: `data/registered_months.json`, inisialisasi `server.ts`, dan sinkronisasi Firestore koleksi `registered_months`.
2. **Pengecekan Variasi Tampilan & Deteksi Kolom Fleksibel untuk Seluruh Spreadsheet 2025**:
   - Setiap bulan di 2025 memiliki perbedaan tata letak (row header pada baris 0, 1, atau 4; kolom `Tanggal`, `Total Jalur`, `Prod`, `Bobot`, `Pending`, `Target`, `Realisasi` sering kali bergeser).
   - Di `src/utils/csvParser.ts`, ganti indeks kolom statis dengan **deteksi posisi kolom otomatis berbasis kata kunci header fleksibel** (`Tanggal`, `Jalur`, `Team`, `Prod`, `Bobot Masuk`, `Bobot Finish`, `Pending`, `Open`, `Cancel`, `LKPB`, `Target`, `Real`).
   - Pada Detail Pending dan Detail LKPB, sesuaikan kolom yang hanya memiliki `REASON` tanpa kolom terpisah `KATEGORI` agar langsung mendeteksi alasan seperti `BARANG BELUM DATANG` dan `KURANG SPAREPART` secara otomatis.
3. **Kategori Kurang Sparepart Masuk ke Kendala / Cacat**:
   - Pastikan setiap item pending/LKPB dengan kendala `KURANG SPAREPART` atau `PART` dikelompokkan dan ditandai ke kategori kendala/cacat dengan label tindakan dan rekomendasi operasional yang presisi.
4. **Pembaruan Default / Fallback Data November 2025**:
   - Di `src/data/default2025Data.ts`, perbarui data kosong November 2025 (`2025-11`) dengan 30 hari data aktual dari Google Sheets baru agar jika offline atau koneksi proxy terhambat, data tetap tampil lengkap.

---

## 2. Rincian Perubahan Kode

### A. Konfigurasi Database & Backend (`data/registered_months.json` & `server.ts`)
- Perbarui entri `2025-11` di `data/registered_months.json` dan `server.ts`:
  - `sheetUrl`: `https://docs.google.com/spreadsheets/d/1iittRJgYUBmE5-vVt_ycnyekzZ6siaxYRWwRhIlZMPQ/edit?gid=476175390#gid=476175390`
  - `gid`: `0` (atau kosong untuk memicu default gviz tab pertama)
  - `detailPendingGid`: `476175390`
  - `detailLkpbGid`: `` (akan otomatis mendeteksi sheet name 'Detail LKPB')
- Di `server.ts`, tingkatkan fungsi `fetchSmartCentralize`, `fetchSmartPending`, dan `fetchSmartLkpb`:
  - Tambahkan pencarian sheet name: `'Detail Pendingan'` dan `'Detail LKPB'`.
  - Jika `customGid` mengembalikan 400 (seperti gid 0 di sheet tertentu), lakukan fallback langsung ke URL export CSV tanpa parameter GID yang otomatis mengambil sheet pertama.
- Tambahkan integrasi sinkronisasi Firestore di endpoint `/api/months` dan saat server start untuk menyinkronkan data bulan ke database Firestore `ai-studio-monitoringdopool-531e193f-6184-461c-9cea-f2ead789e344` koleksi `registered_months`.

### B. Parser Dinamis Berbasis Kata Kunci Header (`src/utils/csvParser.ts`)
- **Fungsi `parseSpreadsheetData` (Centralized Harian)**:
  - Cari baris header yang mengandung kata kunci seperti `tanggal`, `jalur`, `bobot`, `achv`.
  - Buat pemetaan dinamis indeks kolom (Header Column Map):
    - `colNo`: 'no', 'no.'
    - `colPool`: 'pool'
    - `colAchv`: 'achv'
    - `colTanggal`: 'tanggal', 'tgl'
    - `colJalur`: 'total jalur', 'jalur'
    - `colTeam`: 'total team', 'team'
    - `colProd`: 'prod'
    - `colBobotMasuk`: 'bobot masuk', 'masuk'
    - `colBobotFinish`: 'bobot finish', 'finish'
    - `colPendingResch`: 'pending resch'
    - `colRusong`: 'rusong'
    - `colTungkom`: 'tungkom'
    - `colBrg`: 'brg'
    - `colInst`: 'inst.'
    - `colTotalPending`: 'total pending', 'total' (di bagian pending)
    - `colOpen`: 'open'
    - `colLanjutInstall`: 'lanjut install', 'lji'
    - `colCancel`: 'cancel'
    - `colLkpb`: 'lkpb'
    - `colTarget`: 'target', 'instalasi target'
    - `colReal`: 'real', 'realisasi'
  - Jika ada kolom yang tidak ditemukan dalam pemetaan dinamis, gunakan fallback indeks bawaan standar secara aman.
- **Fungsi `parseDetailPending`**:
  - Dukung struktur kolom November 2025 yang memiliki `TANGGAL REQUEST` dan `REASON` langsung pada kolom 7 tanpa kolom 8 `KETERANGAN`.
  - Deteksi otomatis apakah kolom 7 adalah `REASON` atau `KATEGORI`.
  - Pastikan kendala `KURANG SPAREPART` dan `BARANG BELUM DATANG` terpetakan ke `kategori` dan `actionTag` yang sesuai.
- **Fungsi `parseDetailLkpb`**:
  - Pastikan kendala sparepart diklasifikasikan sebagai `isSparepart` dan status/kategori `CACAT / KENDALA SPAREPART`.

### C. Sinkronisasi Data Client & Fallback Bundled (`src/services/sheetService.ts` & `src/data/default2025Data.ts`)
- Sinkronkan daftar default bulan `defaultList` di `src/services/sheetService.ts` agar menyertakan URL baru November 2025.
- Ekstrak data 30 hari November 2025 aktual dari spreadsheet dan perbarui `DEFAULT_2025_DATASETS["2025-11"]` di `src/data/default2025Data.ts`.
- Tambahkan integrasi Firestore sync pada client untuk membaca dan memperbarui konfigurasi bulan secara real-time.

---

## 3. Rencana Verifikasi & Uji Coba
1. **Verifikasi Fetch API Spreadsheet**:
   - Uji endpoint `/api/fetch-full-dataset` dengan URL November 2025 baru, pastikan tab `Centralize`, `Detail Pendingan` (gid 476175390), dan `Detail LKPB` berhasil diunduh tanpa error 400.
2. **Verifikasi Parser Otomatis**:
   - Jalankan script tes parser untuk November 2025 dan bulan-bulan 2025 lainnya (Februari - Oktober, Desember) untuk memastikan tanggal, target, realisasi, dan pending terpetakan dengan akurat.
3. **Verifikasi UI & Data Presentation**:
   - Pastikan dropdown bulan menampilkan November 2025.
   - Periksa ringkasan bulanan (Total Jalur, Bobot Masuk/Finish, Pending, Realisasi %).
   - Periksa tab Detail Pendingan menampilkan DO `4P.WJ.000439` (Ibu Yusan, 13 Nov 2025, status OPEN, Reason: BARANG BELUM DATANG).
4. **Verifikasi Build & Lint**:
   - Jalankan `compile_applet` untuk memastikan tidak ada kesalahan TypeScript atau kompilasi build Vite.
