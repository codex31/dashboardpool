export interface VersionRecord {
  version: string;
  releaseDate: string;
  type: 'major' | 'minor' | 'patch';
  title: string;
  summary: string;
  changes: string[];
  isCurrent?: boolean;
}

export const CURRENT_APP_VERSION = '1.13.0';

export const VERSION_HISTORY: VersionRecord[] = [
  {
    version: '1.13.0',
    releaseDate: '01 Nov 2026',
    type: 'minor',
    title: 'Integrasi Spreadsheet Monitoring DO Pool Singkawang Periode November 2026',
    summary:
      'Pendaftaran dan integrasi resmi Google Spreadsheet operasional periode November 2026 ke dalam database sistem: mencakup tab Centralize (GID 808257444), Detail Pendingan (GID 216624293), Detail LKPB (GID 200773994), dan Summary Individu (GID 554961730) dengan sinkronisasi live real-time.',
    isCurrent: true,
    changes: [
      'Pendaftaran Periode November 2026: URL Spreadsheet November 2026 resmi didaftarkan dan diaktifkan sebagai periode default aktif dashboard.',
      'Pemetaan Multi-Tab Otomatis: Sinkronisasi presisi untuk tab Centralize (GID 808257444), Detail Pendingan (GID 216624293), Detail LKPB (GID 200773994), serta Summary Individu (GID 554961730).',
      'Dataset Cadangan Bundled: Penyediaan fallback data offline November 2026 agar visualisasi dashboard langsung instan dan responsif.',
      'Sinkronisasi Multi-Database: Sinkronisasi otomatis ke registered_months.json lokal, memori runtime backend, dan database Firestore.',
    ],
  },
  {
    version: '1.12.0',
    releaseDate: '01 Okt 2026',
    type: 'minor',
    title: 'Pembaruan Logika Target vs Realisasi DO (Pencapaian Presisi)',
    summary:
      'Penyempurnaan formula kalkulasi Target dan Realisasi di seluruh sistem: Target dihitung dari total DO berstatus "Open" (total order yang ditugaskan), sedangkan Realisasi dihitung dari DO finish dikurangi kendala Pending, LKPB, dan Cancel dengan presisi persentase akurat (2 desimal).',
    isCurrent: false,
    changes: [
      'Logika Target Berbasis Status Open: Target harian dan bulanan kini mengacu pada total DO yang berstatus Open / total order yang didistribusikan ke tim.',
      'Logika Realisasi Bersih: Realisasi dihitung dari DO selesai dikurangi akumulasi kendala Pending (semua jenis), LKPB, dan Cancel. Contoh: pada 01 Sep 2026 dari total 9 DO dengan 2 DO cancel, terealisasi tepat 7 DO dengan pencapaian 77,78% (bukan 100%).',
      'Implementasi Menyeluruh: Diterapkan ke Tabel Monitoring Harian, Kartu KPI Eksekutif, Modal Detail Tanggal, Grafik Analisis Pacing & Kumulatif, Donut Komposisi Hasil Order, Modul LKPB & Cancel, serta Ekspor Laporan Multi-Format (XLSX, PDF, Google Slides).',
      'Presisi Format Persentase: Menggunakan format dua desimal (e.g. 77,78%) pada seluruh indikator pencapaian harian dan ringkasan bulanan.',
    ],
  },
  {
    version: '1.11.0',
    releaseDate: '30 Sep 2026',
    type: 'minor',
    title: 'Integrasi Sinkronisasi Periode Oktober 2026: Schedule Tim & Monitoring DO',
    summary:
      'Penyelarasan penuh modul Schedule Tim Teknisi dengan tab Oktober dari Google Spreadsheet sumber (GID 1220991612, 31 hari) serta integrasi resmi Spreadsheet Monitoring DO Pool Singkawang periode Oktober 2026 (Centralize GID 808257444, Detail Pendingan GID 216624293, Detail LKPB GID 200773994, dan Summary Individu GID 554961730).',
    isCurrent: false,
    changes: [
      'Sinkronisasi Roster Schedule Oktober 2026: Integrasi penuh jadwal shift kerja M0067, libur OFF, cuti AL ketiga teknisi (Kemas Hidayat, Doni Ashari, Muhammad Jupi) untuk bulan Oktober 2026 dari Google Sheets sumber secara live dan terverifikasi.',
      'Spreadsheet Monitoring DO Oktober 2026: Pendaftaran URL spreadsheet operasional Oktober 2026 lengkap dengan tab Centralize (GID 808257444), Detail Pendingan (GID 216624293), Detail LKPB (GID 200773994), dan Summary Individu (GID 554961730).',
      'Reconcile Cache Multi-Bulan Otomatis: Perbaikan sinkronisasi cache lokal sehingga browser pengguna otomatis mendeteksi dan menampilkan bulan Oktober 2026 baik pada Schedule Tim maupun selector Periode Aktif.',
      'Pembaruan Label & Navigasi: Menyesuaikan seluruh teks antarmuka, selector roster, dan rekapitulasi tahunan dari Januari s/d September menjadi Januari s/d Oktober 2026 (10 bulan terdaftar).',
    ],
  },
  {
    version: '1.10.0',
    releaseDate: '19 Sep 2026',
    type: 'minor',
    title: 'Auto-Sync Summary Individu & Widget DO Cancel Terbaru',
    summary:
      'Peningkatan otomatisasi sinkronisasi data Summary Individu saat pertama kali membuka dashboard tanpa perlu refresh manual, serta penambahan tabel "DO Cancel Terbaru" (5 order terkini dari terbaru ke terlama) dan integrasi rincian daftar DO yang cancel pada setiap tanggal di modul Monitoring LKPB & Cancel.',
    isCurrent: false,
    changes: [
      'Auto-Sync Summary Individu: Menu Summary Individu kini secara otomatis tersinkronisasi langsung saat awal masuk dashboard tanpa perlu menekan tombol refresh manual terlebih dahulu.',
      'Widget "DO Cancel Terbaru": Ditambahkan pada tab Rekap Harian LKPB & Cancel, menampilkan 5 order pembatalan terkini diurutkan dari yang paling baru ke terlama beserta nomor DO, tim yang jalur, kategori, bobot (tanpa KG), dan status.',
      'Rincian DO Cancel per Tanggal: Mengklik tombol Detail atau baris tanggal (misal 05 Sep 2026 atau tanggal lainnya) akan langsung menampilkan daftar lengkap nomor DO yang cancel pada tanggal tersebut, atau konfirmasi 0 cancel jika nihil pembatalan.',
      'Integrasi Caching & Server Endpoint: Endpoint `/api/canceled-dos` dan caching performa tinggi pada `/api/fetch-individual-summary` untuk loading instan.',
    ],
  },
  {
    version: '1.9.0',
    releaseDate: '18 Sep 2026',
    type: 'minor',
    title: 'Modul Summary Individu & Leaderboard Tim Pool Singkawang',
    summary:
      'Peluncuran menu baru "Summary Individu" untuk melacak pencapaian total finish, pending, cancel, total bobot finish dari total bobot yang dibawa (tanpa satuan KG), persentase performa, 4 kategori leaderboard, serta penerapan aturan Project Team yang diatribusikan ke ketiga anggota (Kemas Hidayat, Doni Ashari, dan Muhammad Jupi) sesuai referensi sheet "Summary Individu".',
    isCurrent: false,
    changes: [
      'Menu Baru "Summary Individu": Ditambahkan pada navigasi utama dengan indikator live sinkron Google Sheets.',
      'Perhitungan Akurat Bobot per Orang: Total bobot finish dari total bobot yang dibawa per individu (bukan KG) lengkap dengan progress bar dan persentase clearance.',
      'Aturan Bisnis Project Team: Jika penugasan jalur adalah "Project Team", maka DO finish dan bobot finish secara otomatis diatribusikan ke ke-3 teknisi (Kemas Hidayat, Doni Ashari, dan Muhammad Jupi).',
      'Leaderboard Multi-Kategori: Klasemen Finish Terbanyak (Medali 🥇, 🥈, 🥉), Pending Terbanyak, Cancel Terbanyak, dan Rasio Efisiensi Clearance.',
      'Tabel Rekapitulasi Sheet Summary Individu: Menampilkan kolom sesuai sheet spreadsheet (Nama Staff, Finish, breakdown Pending Resch/Rusong/Tungkom/Brg/Lji/Inst, Cancel, LKPB, Total DO, Total Pending, %, Bobot Finish, Bobot Dibawa, Clearance %).',
      'Log Rincian Harian per Teknisi: Riwayat penugasan harian tiap teknisi dengan tanggal, status tim (Project Team vs Reguler), DO finish, pending, cancel, serta bobot.',
      'Toggle Mode Distribusi: Pilihan beralih antara Mode Aturan Project Team (Shared) dan Mode Sheet Mentah (Project Team terpisah).',
    ],
  },
  {
    version: '1.8.0',
    releaseDate: '17 Sep 2026',
    type: 'minor',
    title: 'Integrasi Modul Schedule & Roster Tim Teknisi (Januari s/d September 2026)',
    summary:
      'Penambahan menu baru "Schedule Tim" di luar monitoring DO dengan visual Neo-Brutalism konsisten, mencakup integrasi Google Spreadsheet 9 bulan (Januari - September 2026), matriks shift kerja (M0067), libur (OFF), cuti tahunan (AL), rekap agenda dinas/perdin, profil teknisi, serta akumulasi performa tahunan.',
    isCurrent: false,
    changes: [
      'Menu Baru "Schedule Tim": Ditambahkan pada navigasi utama dengan tema visual Neo-Brutalism yang selaras (border hitam tegas, shadow offset, high contrast palette).',
      'Integrasi 9 Bulan Penuh (Jan - Sep 2026): Data roster teknisi (Kemas Hidayat, Doni Ashari, Muhammad Jupi) diimpor lengkap dari Google Spreadsheet per masing-masing tab bulan.',
      'Matriks Jadwal Harian & Status Shift: Pemetaan visual shift kerja (M0067), libur giliran (OFF), dan cuti tahunan (AL) lengkap dengan total harian dan penanda akhir pekan.',
      'Modal Inspeksi Tanggal: Fitur klik kolom tanggal untuk melihat rincian penugasan teknisi yang masuk dan libur pada tanggal bersangkutan.',
      'Pencatatan Agenda Khusus & Perdin: Penandaan otomatis agenda khusus (Perdin Kab Sambas, Sengkubang, PT EUP, Outing kloter 1 & 2, Lebaran Haji, Tukar Off, dll).',
      'Profil & Rekapitulasi Tahunan: Ringkasan performa per teknisi serta tabel perbandingan kehadiran lintas 9 bulan.',
      'Sinkronisasi Live & Export CSV: Tombol live sync untuk menarik pembaruan langsung dari Google Sheets serta fitur unduh jadwal dalam format CSV.',
    ],
  },
  {
    version: '1.7.0',
    releaseDate: '17 Sep 2026',
    type: 'minor',
    title: 'Multi-Format Universal Export, Dynamic Analytics Date Range & Zero-Clearance Logic',
    summary:
      'Dukungan export 5 format (XLSX, ODS, PDF, PPT, ODP) dengan modal pemilih tema (Standar Gradient vs Neo-Brutalism) di seluruh menu, penyesuaian status 0% clearance menjadi OPEN, filter rentang waktu analitik dinamis (MTD, 7D, 30D, Custom Range), serta optimasi auto-sinkronisasi kontainer setiap beberapa detik.',
    isCurrent: false,
    changes: [
      'Universal Multi-Format Export (XLSX, ODS, PDF, PPT, ODP): Ditambahkan pada setiap menu (Monitoring Harian, Detail Pending, Rekap LKPB & Cancel, serta Executive Analytics).',
      'Modal Pemilihan Tema Dokumen: Pilihan format visual "Biasa (Standar Biru-Putih Gradien)" dan "Neo Brutalism (Format warna & border tegas mengikuti tampilan web)" untuk format PDF, PPT, dan ODP.',
      'Logika Status Clearance 0%: Penyesuaian aturan bisnis di mana record dengan clearance 0% otomatis berstatus OPEN (bukan CLEAR) lengkap dengan filter preset baru "OPEN (0%)".',
      'Filter Rentang Tanggal Analitik (MTD, 7D, 30D, Custom): Menu analitik kini mendukung tampilan Month to Date (Default: Tgl 1 - Hari Ini), 7 Hari Terakhir, 30 Hari, dan Custom Range dengan KPI & grafik dinamis.',
      'Otomasi Sinkronisasi Database Antar-Kontainer: Interval sinkronisasi background dipercepat menjadi setiap 8 detik untuk memastikan replikasi data instan antara kontainer dev dan production.',
    ],
  },
  {
    version: '1.6.0',
    releaseDate: '16 Sep 2026',
    type: 'minor',
    title: 'Multi-Container Auto-Sync & Semantic Versioning',
    summary:
      'Sinkronisasi database antar-kontainer (Development & Published Instance) secara otomatis setiap beberapa detik serta penerapan sistem Semantic Versioning lengkap.',
    isCurrent: false,
    changes: [
      'Fitur Sinkronisasi Otomatis Antar-Kontainer: Menghubungkan container Development (ais-dev) dengan container Published (dashboardpool.ai.studio) secara berkala (interval 12 detik).',
      'Dual-Direction Sync: Penambahan atau perubahan bulan di satu kontainer langsung disinkronkan ke kontainer lainnya secara real-time via HTTP push & background pull.',
      'Sistem Semantic Versioning (SemVer): Pelacakan versi terstruktur (Major.Minor.Patch) berdasarkan riwayat pembaruan aplikasi.',
      'Modal & Badge Changelog: Pengguna dapat mengklik badge versi di header/admin untuk memeriksa riwayat update dan rincian perubahan.',
      'Panel Kontrol Sinkronisasi di Admin: Dilengkapi status konektivitas antar-kontainer, waktu sync terakhir, dan tombol "Paksa Sinkron Sekarang".',
    ],
  },
  {
    version: '1.5.0',
    releaseDate: '16 Sep 2026',
    type: 'minor',
    title: 'Multi-Month Architecture & Smart Tab Auto-Resolver',
    summary:
      'Dukungan penuh multi-bulan (Agustus 2026) dengan algoritma cerdas pendeteksi tab Centralize, Detail Pendingan, dan LKPB.',
    changes: [
      'Pendaftaran Bawaan Agustus 2026: Mengintegrasikan spreadsheet Agustus (173 Total Jalur, 31 Hari) langsung ke sistem backend.',
      'Smart Tab Auto-Resolver: Mencegah data berantakan akibat parameter GID sheet harian (seperti tgl 1) pada tautan spreadsheet dengan otomatis mendeteksi tab Centralize 31 hari.',
      'Auto-Mapping Tab Pending & LKPB: Otomatis mendeteksi lembar "Detail Pendingan" dan "Detail LKPB" tanpa memerlukan input manual GID.',
      'Pembaruan Form Admin: Pratinjau dataset kini menampilkan rincian jumlah hari aktif, baris pending, dan kasus LKPB.',
    ],
  },
  {
    version: '1.4.0',
    releaseDate: '16 Sep 2026',
    type: 'minor',
    title: 'Automated Unlisted Pending DO Audit Engine',
    summary:
      'Audit otomatis diskrepansi antara sheet tanggal harian (tgl 1-31) dengan lembar Detail Pendingan.',
    changes: [
      'Banner Notifikasi Audit: Menampilkan peringatan mencolok saat terdapat DO berstatus pending di sheet tanggal yang belum terdaftar di Detail Pendingan.',
      'Modal Rekonsiliasi Audit: Dialog detail dengan informasi No DO, nama tim, tanggal, status kendala, dan instruksi penambahan.',
      'Filter DO Non-Standar: Otomatis mengidentifikasi status kendala (Brg, Lokasi, Cust, dll) di luar status selesai/normal.',
    ],
  },
  {
    version: '1.3.0',
    releaseDate: '16 Sep 2026',
    type: 'minor',
    title: 'Live Toast Notification & Event History Drawer',
    summary:
      'Notifikasi toast langsung saat terdeteksi perubahan status DO di spreadsheet sumber tanpa perlu refresh halaman.',
    changes: [
      'Real-Time Status Toast: Muncul seketika ketika ada DO yang berubah status (misal dari OPEN ke FINISH atau ke LKPB/Pending).',
      'Drawer Riwayat Notifikasi: Panel riwayat update interaktif dengan penanda waktu, filter tipe status, dan audio tone alert.',
      'Simulator Event: Tombol simulasi perubahan status untuk verifikasi responsivitas visual tim operasional.',
    ],
  },
  {
    version: '1.2.0',
    releaseDate: '15 Sep 2026',
    type: 'minor',
    title: 'Full-Duplex WebSocket Engine & Background Polling',
    summary:
      'Infrastruktur real-time WebSocket terintegrasi di server Express dengan background scanner Google Sheets.',
    changes: [
      'Engine WebSocket Server: Endpoint ws:// terintegrasi yang menyiarkan update data langsung ke seluruh client yang terhubung.',
      'Background Polling Scanner: Pemindaian otomatis ke Google Visualization API setiap 15 detik untuk mendeteksi revisi spreadsheet.',
      'Reconnection Handling: Auto-reconnect dengan status pill visual (LIVE SYNC / CONNECTING / OFFLINE) di header.',
    ],
  },
  {
    version: '1.1.0',
    releaseDate: '15 Sep 2026',
    type: 'minor',
    title: 'Detail LKPB & Detail Pendingan Monitoring',
    summary:
      'Modul analitik terperinci untuk pelacakan komplain kualitas (LKPB) dan penanganan order tertunda (Pendingan).',
    changes: [
      'Monitoring SLA Pending: Klasifikasi aging hari (Hijau/Kuning/Oranye/Merah) dengan batas toleransi operasional.',
      'Smart Recommendations Engine: Saran penanganan otomatis berdasarkan kategori kendala (Renovasi, Re-visit, Vendor part).',
      'Tab Navigasi Dedicated: Akses terpisah untuk Ringkasan Utama, Monitoring Detail Pending, dan Analitik Detail LKPB.',
    ],
  },
  {
    version: '1.0.0',
    releaseDate: '14 Sep 2026',
    type: 'major',
    title: 'Initial Release - Dashboard Monitoring Pool Singkawang',
    summary:
      'Peluncuran perdana dashboard operasional Pool Singkawang dengan integrasi Google Spreadsheet periode September 2026.',
    changes: [
      'Kartu KPI Utama: Total Jalur, Total Team, Rata-rata Produktivitas, Bobot Masuk & Finish, serta Persentase Achievement.',
      'Tabel Rekap 31 Hari: Visualisasi status harian dengan indikator status pencapaian dan perbandingan target vs realisasi.',
      'Grafik Tren Interaktif: Visualisasi distribusi beban kerja dan produktivitas harian tim installer.',
      'Desain Neo-Brutalist: Tipografi Space Grotesk + Plus Jakarta Sans dengan kontras tinggi dan border tegas khas dashboard industri.',
    ],
  },
];
