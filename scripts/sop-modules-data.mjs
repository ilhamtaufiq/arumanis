/**
 * Definisi SOP per modul Arumanis, Puspen, dan Panel Pengawasan.
 * Dipakai oleh scripts/generate-sop-md.mjs
 */

export function toRoman(n) {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
  let r = "";
  let x = n;
  for (let i = 0; i < vals.length; i++) {
    while (x >= vals[i]) {
      r += syms[i];
      x -= vals[i];
    }
  }
  return r;
}

/** Langkah standar: buka modul → aksi → simpan/verifikasi */
function tplCrud(route, modul, aksi, opts = {}) {
  const col = opts.col ?? "operator";
  const admin = col === "admin";
  return [
    {
      no: "1.",
      kegiatan: `Login Arumanis → buka ${route} (${modul}).`,
      flow: { col, type: "process", label: "Buka" },
      persyaratan: "Hak akses menu " + modul,
      waktu: "± 2 menit",
      output: "Daftar/data tampil",
    },
    {
      no: "2.",
      kegiatan: aksi.buat ?? `Klik Tambah / pilih record untuk ${modul}.`,
      flow: { col, type: "process", label: "Input" },
      persyaratan: opts.persyaratan ?? "Form lengkap",
      waktu: opts.waktuInput ?? "± 10 mnt",
      output: "Data terisi",
    },
    {
      no: "3.",
      kegiatan: aksi.validasi ?? "Validasi field wajib & format data.",
      flow: { col, type: "decision", label: "Valid?" },
      tidakIn: admin ? "operator" : "admin",
      tidakLoopTo: 1,
      persyaratan: "Aturan validasi modul",
      waktu: "± 2 menit",
      output: "Siap simpan / pesan error",
      ket: "Perbaiki bila Tidak",
    },
    {
      no: "4.",
      kegiatan: aksi.simpan ?? "Klik Simpan → sistem persist ke APIAMIS.",
      flow: { col: "sistem", type: "red", label: "Simpan" },
      persyaratan: "Koneksi API aktif",
      waktu: "Real-time",
      output: "Notifikasi sukses",
    },
    {
      no: "5.",
      kegiatan: aksi.verifikasi ?? "Verifikasi record di daftar / detail.",
      flow: { col: admin ? "admin" : col, type: "process", label: "Selesai" },
      persyaratan: "—",
      waktu: "± 2 menit",
      output: "Data tersimpan benar",
    },
  ];
}

function tplView(route, modul, opts = {}) {
  const col = opts.col ?? "operator";
  return [
    {
      no: "1.",
      kegiatan: `Login → buka ${route}.`,
      flow: { col, type: "process", label: "Buka" },
      persyaratan: "Hak akses " + modul,
      waktu: "± 2 menit",
      output: "Halaman modul",
    },
    {
      no: "2.",
      kegiatan: opts.filter ?? "Atur filter tahun / wilayah / pencarian.",
      flow: { col, type: "process", label: "Filter" },
      persyaratan: "Data induk tersedia",
      waktu: "± 3 menit",
      output: "Data terfilter",
    },
    {
      no: "3.",
      kegiatan: opts.aksi ?? "Baca metrik, grafik, atau detail record.",
      flow: { col, type: "red", label: "Analisis" },
      persyaratan: "—",
      waktu: opts.waktu ?? "± 5 mnt",
      output: "Insight / ringkasan",
    },
    {
      no: "4.",
      kegiatan: "Export atau tindak lanjut bila diperlukan.",
      flow: { col, type: "process", label: "Selesai" },
      persyaratan: "—",
      waktu: "Sesuai kebutuhan",
      output: "Laporan / keputusan",
    },
  ];
}

function pgSteps(steps) {
  return steps.map((s, i) => ({
    ...s,
    no: `${i + 1}.`,
    flow: { col: "pengawas", ...s.flow },
  }));
}

function pg(num, id, slug, route, title, steps, category = "Panel Pengawasan") {
  return def(num, id, slug, "www/pengawas", route, title, pgSteps(steps), category);
}

function def(num, id, slug, app, route, title, steps, category = "") {
  return {
    num,
    id: `SOP-${String(num).padStart(2, "0")} ${id}`,
    slug,
    lampiran: `LAMPIRAN ${toRoman(num)}`,
    title: `PROSEDUR PELAKSANAAN ${title.toUpperCase()}`,
    app,
    route,
    category,
    steps,
  };
}

/** SOP integrasi (alur lintas modul) */
export const SOPS_INTEGRASI = [
  def(1, "Login & SSO", "sop-01-login", "Keduanya", "/sign-in", "AKSES & AUTENTIKASI ARUMANIS / PANEL PENGAWASAN", [
    { no: "1.", kegiatan: "Pengguna membuka URL Arumanis di browser terbaru.", flow: { col: "operator", type: "process", label: "User" }, persyaratan: "Browser terbaru", waktu: "± 2 menit", output: "/sign-in" },
    { no: "2.", kegiatan: "Masukkan email & password APIAMIS → Sign In.", flow: { col: "operator", type: "process", label: "Login" }, persyaratan: "Akun aktif", waktu: "± 1 menit", output: "Sesi cookie" },
    { no: "3.", kegiatan: "Validasi kredensial via BFF → APIAMIS.", flow: { col: "sistem", type: "decision", label: "Berhasil?" }, tidakIn: "operator", tidakLoopTo: 1, persyaratan: "Kredensial benar", waktu: "Real-time", output: "Token valid", ket: "Ulangi bila Tidak" },
    { no: "4.", kegiatan: "Routing role: kantor → dashboard; pengawas → SSO.", flow: { col: "sistem", type: "red", label: "Role" }, persyaratan: "Role terdaftar", waktu: "Real-time", output: "Halaman tujuan" },
    { no: "5.", kegiatan: "SSO pengawas: /pengawasan/login?token.", flow: { col: "pengawas", type: "process", label: "SSO" }, persyaratan: "Token valid", waktu: "± 30 dtk", output: "/pengawasan/" },
    { no: "6.", kegiatan: "Logout via menu profil.", flow: { col: "operator", type: "process", label: "Selesai" }, persyaratan: "—", waktu: "± 1 menit", output: "Sesi berakhir" },
  ], "Integrasi"),
  def(2, "Alur Input Program", "sop-02-program-alur", "www/bun", "—", "ALUR INPUT PROGRAM (KEGIATAN → PEKERJAAN → OUTPUT)", [
    { no: "1.", kegiatan: "Input kegiatan di /kegiatan.", flow: { col: "operator", type: "process", label: "Kegiatan" }, persyaratan: "Pagu & TA", waktu: "± 15 mnt", output: "Master kegiatan" },
    { no: "2.", kegiatan: "Input pekerjaan di /pekerjaan.", flow: { col: "operator", type: "red", label: "Pekerjaan" }, persyaratan: "Wilayah desa", waktu: "± 15 mnt", output: "Pekerjaan aktif" },
    { no: "3.", kegiatan: "Input output & penerima.", flow: { col: "operator", type: "process", label: "Output" }, persyaratan: "RAB", waktu: "± 20 mnt", output: "Komponen lengkap" },
    { no: "4.", kegiatan: "Upload berkas/foto awal.", flow: { col: "operator", type: "process", label: "Dokumen" }, persyaratan: "File digital", waktu: "± 15 mnt", output: "Berkas terunggah" },
    { no: "5.", kegiatan: "Verifikasi data quality dashboard.", flow: { col: "admin", type: "decision", label: "Lengkap?" }, tidakIn: "operator", tidakLoopTo: 1, persyaratan: "Dashboard", waktu: "± 5 mnt", output: "Siap kontrak", ket: "Perbaiki bila Tidak" },
  ], "Integrasi"),
  def(3, "Alur Kontrak", "sop-03-kontrak-alur", "www/bun", "—", "ALUR KONTRAK & PENYEDIA", [
    { no: "1.", kegiatan: "Pastikan pekerjaan & penyedia ada.", flow: { col: "operator", type: "process", label: "Prasyarat" }, persyaratan: "Master data", waktu: "± 10 mnt", output: "Induk siap" },
    { no: "2.", kegiatan: "Buat kontrak di /kontrak.", flow: { col: "operator", type: "red", label: "Kontrak" }, persyaratan: "Nilai & tanggal", waktu: "± 20 mnt", output: "Kontrak aktif" },
    { no: "3.", kegiatan: "Addendum bila perlu.", flow: { col: "operator", type: "decision", label: "Addendum?" }, tidakIn: "admin", persyaratan: "Register", waktu: "Sesuai kebutuhan", output: "Dokumen sinkron" },
    { no: "4.", kegiatan: "Assign pengawas & verifikasi.", flow: { col: "admin", type: "process", label: "Selesai" }, persyaratan: "/user-pekerjaan", waktu: "± 10 mnt", output: "Siap lapangan" },
  ], "Integrasi"),
  def(4, "Alur Pengawasan", "sop-04-pengawasan-alur", "www/pengawas", "—", "ALUR PEMANTAUAN LAPANGAN", [
    { no: "1.", kegiatan: "SSO login → dashboard pengawasan.", flow: { col: "pengawas", type: "process", label: "SSO" }, persyaratan: "Penugasan aktif", waktu: "± 2 mnt", output: "KPI tampil" },
    { no: "2.", kegiatan: "Kelola penerima, foto GPS, progress.", flow: { col: "pengawas", type: "red", label: "Lapangan" }, persyaratan: "GPS & slot foto", waktu: "Per kunjungan", output: "Matriks terisi" },
    { no: "3.", kegiatan: "Buat laporan mingguan.", flow: { col: "pengawas", type: "process", label: "Laporan" }, persyaratan: "Form progress", waktu: "Mingguan", output: "Deviasi update" },
    { no: "4.", kegiatan: "Tiket kendala bila ada.", flow: { col: "pengawas", type: "decision", label: "Kendala?" }, tidakIn: "sistem", persyaratan: "Modul tiket", waktu: "Sesuai kejadian", output: "Tiket / selesai" },
    { no: "5.", kegiatan: "Sinkron ke Arumanis via APIAMIS.", flow: { col: "sistem", type: "process", label: "Sinkron" }, persyaratan: "API aktif", waktu: "Real-time", output: "Data kantor = lapangan" },
  ], "Integrasi"),
  def(5, "Penugasan Pengawas", "sop-05-penugasan", "Keduanya", "/user-pekerjaan", "PENUGASAN PENGAWAS", [
    { no: "1.", kegiatan: "Master /pengawas (NIP benar).", flow: { col: "admin", type: "process", label: "Master" }, persyaratan: "Data NIP", waktu: "± 10 mnt", output: "Pengawas valid" },
    { no: "2.", kegiatan: "Role pengawas di /users.", flow: { col: "admin", type: "red", label: "Role" }, persyaratan: "RBAC", waktu: "± 5 mnt", output: "Role aktif" },
    { no: "3.", kegiatan: "Assign /user-pekerjaan.", flow: { col: "admin", type: "process", label: "Assign" }, persyaratan: "Daftar paket", waktu: "± 15 mnt", output: "Paket muncul", ket: "Wajib" },
    { no: "4.", kegiatan: "Uji login pengawas: paket tampil?", flow: { col: "pengawas", type: "decision", label: "Tampil?" }, tidakIn: "admin", tidakLoopTo: 2, persyaratan: "Uji SSO", waktu: "± 5 mnt", output: "Penugasan efektif" },
  ], "Integrasi"),
  def(6, "Manajemen Akses", "sop-06-akses-alur", "www/bun", "—", "MANAJEMEN AKSES (RBAC)", [
    { no: "1.", kegiatan: "Kelola /roles & /permissions.", flow: { col: "admin", type: "process", label: "Role" }, persyaratan: "Modul RBAC", waktu: "± 15 mnt", output: "Role siap" },
    { no: "2.", kegiatan: "Atur /route-permissions & /menu-permissions.", flow: { col: "admin", type: "red", label: "Route" }, persyaratan: "Daftar route", waktu: "± 20 mnt", output: "Menu terkontrol" },
    { no: "3.", kegiatan: "Uji login per role.", flow: { col: "admin", type: "decision", label: "Sesuai?" }, tidakIn: "operator", tidakLoopTo: 1, persyaratan: "Akun uji", waktu: "± 10 mnt", output: "Hak akses benar" },
  ], "Integrasi"),
];

let n = 7;

function crud(num, id, slug, app, route, title, modul, aksi, opts) {
  return def(num, id, slug, app, route, title, tplCrud(route, modul, aksi, opts), modul);
}

function view(num, id, slug, app, route, title, modul, opts) {
  return def(num, id, slug, app, route, title, tplView(route, modul, opts), modul);
}

/** SOP per modul Arumanis & Panel Pengawasan */
export const SOPS_MODUL = [
  // —— Dashboard & Pelaporan (Arumanis) ——
  view(n++, "Dashboard", "sop-dashboard", "www/bun", "/dashboard", "DASHBOARD ARUMANIS", "Dashboard", {
    filter: "Pilih tahun anggaran & filter kecamatan pada widget.",
    aksi: "Baca card statistik, grafik capaian, dan data quality.",
    waktu: "± 10 mnt",
  }),
  view(n++, "Dashboard Eksekutif", "sop-executive-dashboard", "www/bun", "/executive-dashboard", "DASHBOARD EKSEKUTIF", "Dashboard Eksekutif", { col: "admin" }),
  view(n++, "Rekap Progress", "sop-progress-rekap", "www/bun", "/progress_rekap", "REKAP PROGRESS", "Rekap Progress", {
    aksi: "Export rekap progress fisik/keuangan per pekerjaan.",
  }),
  def(n++, "Buat Laporan (Kantor)", "sop-buat-laporan-kantor", "www/bun", "/buat-laporan", "BUAT LAPORAN KANTOR", [
    { no: "1.", kegiatan: "Buka /buat-laporan → pilih pekerjaan.", flow: { col: "operator", type: "process", label: "Pilih" }, persyaratan: "Pekerjaan aktif", waktu: "± 5 mnt", output: "Form laporan" },
    { no: "2.", kegiatan: "Isi rencana & realisasi minggu aktif.", flow: { col: "operator", type: "red", label: "Input" }, persyaratan: "RAB progress", waktu: "± 20 mnt", output: "Angka terisi" },
    { no: "3.", kegiatan: "Simpan → sinkron ke Puspen/pengawas.", flow: { col: "sistem", type: "process", label: "Simpan" }, persyaratan: "API progress", waktu: "Real-time", output: "Laporan tersimpan" },
    { no: "4.", kegiatan: "Verifikasi di /progress_rekap.", flow: { col: "admin", type: "process", label: "Selesai" }, persyaratan: "—", waktu: "± 5 mnt", output: "Rekap konsisten" },
  ], "Buat Laporan"),
  view(n++, "Analisa RAB", "sop-rab-analyzer", "www/bun", "/rab-analyzer", "ANALISA RAB", "Analisa RAB", {
    aksi: "Upload/ pilih RAB → jalankan analisa → review deviasi.",
  }),
  def(n++, "Tiket & Laporan", "sop-tiket-kantor", "www/bun", "/tiket", "TIKET & LAPORAN KANTOR", [
    { no: "1.", kegiatan: "Buka /tiket → lihat daftar tiket.", flow: { col: "operator", type: "process", label: "Daftar" }, persyaratan: "Hak akses tiket", waktu: "± 3 mnt", output: "Daftar tiket" },
    { no: "2.", kegiatan: "Buat tiket baru atau buka detail.", flow: { col: "operator", type: "red", label: "Tiket" }, persyaratan: "Deskripsi kendala", waktu: "± 10 mnt", output: "Tiket terbuka" },
    { no: "3.", kegiatan: "Tanggapi / ubah status / komentar.", flow: { col: "admin", type: "process", label: "Tindak" }, persyaratan: "Workflow status", waktu: "Sesuai SLA", output: "Status terupdate" },
    { no: "4.", kegiatan: "Tutup tiket bila selesai.", flow: { col: "operator", type: "decision", label: "Selesai?" }, tidakIn: "admin", persyaratan: "—", waktu: "± 5 mnt", output: "Tiket closed" },
  ], "Tiket"),
  view(n++, "Kanban", "sop-kanban", "www/bun", "/kanban", "KANBAN TUGAS", "Kanban", {
    aksi: "Geser kartu antar kolom status → update progres tugas.",
  }),
  def(n++, "Pusat Notifikasi", "sop-notifications", "www/bun", "/notifications", "PUSAT NOTIFIKASI", [
    { no: "1.", kegiatan: "Buka /notifications.", flow: { col: "operator", type: "process", label: "Buka" }, persyaratan: "Login aktif", waktu: "± 1 mnt", output: "Riwayat notifikasi" },
    { no: "2.", kegiatan: "Baca & tandai sudah dibaca.", flow: { col: "operator", type: "red", label: "Baca" }, persyaratan: "—", waktu: "Harian", output: "Inbox bersih" },
    { no: "3.", kegiatan: "Klik notifikasi → navigasi ke modul terkait.", flow: { col: "operator", type: "process", label: "Selesai" }, persyaratan: "Link valid", waktu: "± 2 mnt", output: "Tindak lanjut" },
  ], "Notifikasi"),
  def(n++, "Asisten AI", "sop-chat-ai", "www/bun", "/chat", "ASISTEN AI (AMI)", [
    { no: "1.", kegiatan: "Buka /chat (Asisten AI).", flow: { col: "operator", type: "process", label: "Chat" }, persyaratan: "Fitur AI aktif", waktu: "± 1 mnt", output: "Panel chat" },
    { no: "2.", kegiatan: "Ajukan pertanyaan terkait data/program.", flow: { col: "operator", type: "red", label: "Tanya" }, persyaratan: "Konteks jelas", waktu: "± 5 mnt", output: "Jawaban AI" },
    { no: "3.", kegiatan: "Verifikasi jawaban dengan data resmi modul.", flow: { col: "admin", type: "decision", label: "Akurat?" }, tidakIn: "operator", persyaratan: "—", waktu: "± 5 mnt", output: "Keputusan valid", ket: "Janganandalkan AI untuk data final" },
  ], "Asisten AI"),

  // —— Master Data ——
  crud(n++, "Program Kegiatan", "sop-kegiatan", "www/bun", "/kegiatan", "PROGRAM KEGIATAN", "Kegiatan", {
    buat: "Tambah kegiatan: nama, kode, sumber dana, pagu, TA.",
    validasi: "Cek kode unik & pagu > 0.",
  }),
  crud(n++, "Master Fase", "sop-master-fase", "www/bun", "/master-fase", "MASTER FASE", "Master Fase", { buat: "Tambah/edit fase pekerjaan." }, { col: "admin" }),
  crud(n++, "Kecamatan", "sop-kecamatan", "www/bun", "/kecamatan", "DATA KECAMATAN", "Kecamatan", { buat: "Kelola data kecamatan & kode wilayah." }, { col: "admin" }),
  crud(n++, "Desa", "sop-desa", "www/bun", "/desa", "DATA DESA", "Desa", {
    buat: "Tambah/edit desa: kecamatan, kode, koordinat geo-fencing.",
    validasi: "Koordinat desa valid untuk validasi GPS foto.",
  }),
  crud(n++, "Pekerjaan", "sop-pekerjaan", "www/bun", "/pekerjaan", "PEKERJAAN", "Pekerjaan", {
    buat: "Tambah pekerjaan: kegiatan, kecamatan, desa, pagu, fase.",
  }),
  crud(n++, "Aset SPAM Unit", "sop-spam-unit", "www/bun", "/spam-unit", "ASET & CAPAIAN SPAM UNIT", "SPAM Unit", {
    buat: "Input unit SPAM, kapasitas, dan capaian SPM air minum.",
  }),
  crud(n++, "SPM Sanitasi", "sop-spm-sanitasi", "www/bun", "/spm-sanitasi", "SPM SANITASI", "SPM Sanitasi", {
    buat: "Input capaian indikator sanitasi per wilayah.",
  }),
  def(n++, "Draft Pekerjaan", "sop-draft-pekerjaan", "www/bun", "/draft-pekerjaan", "DRAFT PEKERJAAN", [
    { no: "1.", kegiatan: "Buka /draft-pekerjaan.", flow: { col: "operator", type: "process", label: "Draft" }, persyaratan: "Hak akses", waktu: "± 3 mnt", output: "Daftar draft" },
    { no: "2.", kegiatan: "Lengkapi draft → submit untuk review.", flow: { col: "operator", type: "red", label: "Lengkapi" }, persyaratan: "Field wajib", waktu: "± 20 mnt", output: "Draft lengkap" },
    { no: "3.", kegiatan: "Admin review & publish ke pekerjaan aktif.", flow: { col: "admin", type: "decision", label: "Setuju?" }, tidakIn: "operator", tidakLoopTo: 1, persyaratan: "Checklist", waktu: "± 10 mnt", output: "Pekerjaan aktif / revisi" },
  ], "Draft Pekerjaan"),
  crud(n++, "Penyedia", "sop-penyedia", "www/bun", "/penyedia", "PENYEDIA / REKANAN", "Penyedia", { buat: "Tambah penyedia: nama, NPWP, kontak." }),
  crud(n++, "Kontrak", "sop-kontrak-modul", "www/bun", "/kontrak", "PENGUELOLAAN KONTRAK", "Kontrak", {
    buat: "Buat kontrak: pekerjaan, penyedia, nilai, tanggal.",
  }),
  crud(n++, "Addendum Kontrak", "sop-kontrak-addendum", "www/bun", "/kontrak-addendums", "ADDENDUM KONTRAK", "Addendum", {
    buat: "Buat addendum terkait kontrak induk.",
  }),
  def(n++, "Register Dokumen", "sop-register-dokumen", "www/bun", "/pekerjaan/register", "REGISTER DOKUMEN PEKERJAAN", [
    { no: "1.", kegiatan: "Buka /pekerjaan/register.", flow: { col: "operator", type: "process", label: "Register" }, persyaratan: "Pekerjaan aktif", waktu: "± 5 mnt", output: "Daftar register" },
    { no: "2.", kegiatan: "Centang kelengkapan dokumen per item.", flow: { col: "operator", type: "red", label: "Ceklist" }, persyaratan: "Template dokumen", waktu: "± 15 mnt", output: "Status kelengkapan" },
    { no: "3.", kegiatan: "Upload dokumen yang belum ada di /berkas.", flow: { col: "operator", type: "process", label: "Upload" }, persyaratan: "File PDF/image", waktu: "± 15 mnt", output: "Register lengkap" },
    { no: "4.", kegiatan: "Admin verifikasi register final.", flow: { col: "admin", type: "process", label: "Selesai" }, persyaratan: "—", waktu: "± 5 mnt", output: "Siap audit" },
  ], "Register Dokumen"),
  def(n++, "Checklist Pekerjaan", "sop-checklist", "www/bun", "/checklist", "CHECKLIST PEKERJAAN", [
    { no: "1.", kegiatan: "Buka /checklist → pilih pekerjaan.", flow: { col: "operator", type: "process", label: "Buka" }, persyaratan: "Pekerjaan aktif", waktu: "± 5 mnt", output: "Form checklist" },
    { no: "2.", kegiatan: "Isi item checklist tahap pelaksanaan.", flow: { col: "operator", type: "red", label: "Isi" }, persyaratan: "Template checklist", waktu: "± 15 mnt", output: "Checklist terisi" },
    { no: "3.", kegiatan: "Simpan & verifikasi kelengkapan.", flow: { col: "admin", type: "decision", label: "Lengkap?" }, tidakIn: "operator", persyaratan: "—", waktu: "± 5 mnt", output: "Checklist final" },
  ], "Checklist"),
  def(n++, "Post Pekerjaan", "sop-post-pekerjaan", "www/bun", "/post-pekerjaan", "POST PEKERJAAN / SERAH TERIMA", [
    { no: "1.", kegiatan: "Buka /post-pekerjaan.", flow: { col: "operator", type: "process", label: "Post" }, persyaratan: "Pekerjaan selesai", waktu: "± 5 mnt", output: "Daftar post" },
    { no: "2.", kegiatan: "Isi data serah terima & dokumentasi akhir.", flow: { col: "operator", type: "red", label: "Input" }, persyaratan: "Foto 100%", waktu: "± 30 mnt", output: "Post terisi" },
    { no: "3.", kegiatan: "Admin approve post pekerjaan.", flow: { col: "admin", type: "process", label: "Selesai" }, persyaratan: "Review dokumen", waktu: "± 15 mnt", output: "Pekerjaan closed" },
  ], "Post Pekerjaan"),
  crud(n++, "Output", "sop-output", "www/bun", "/output", "OUTPUT PEKERJAAN", "Output", { buat: "Tambah komponen output per pekerjaan." }),
  crud(n++, "Penerima", "sop-penerima", "www/bun", "/penerima", "PENERIMA MANFAAT", "Penerima", {
    buat: "Tambah penerima individu/komunal: jiwa, NIK, output.",
  }),
  crud(n++, "Master Pengawas", "sop-pengawas-master", "www/bun", "/pengawas", "MASTER PENGAWAS", "Pengawas", {
    buat: "Tambah pengawas: NIP, nama, kontak.",
  }, { col: "admin" }),

  // —— Dokumentasi ——
  view(n++, "Panduan Pengguna", "sop-panduan", "www/bun", "/panduan", "PANDUAN PENGGUNA IN-APP", "Panduan", {
    aksi: "Navigasi topik panduan & buka tautan modul terkait.",
  }),
  def(n++, "Foto Dokumentasi", "sop-foto", "www/bun", "/foto", "FOTO DOKUMENTASI (KANTOR)", [
    { no: "1.", kegiatan: "Buka /foto → filter pekerjaan/output.", flow: { col: "operator", type: "process", label: "Foto" }, persyaratan: "Pekerjaan aktif", waktu: "± 5 mnt", output: "Galeri foto" },
    { no: "2.", kegiatan: "Upload foto slot progress (0–100%).", flow: { col: "operator", type: "red", label: "Upload" }, persyaratan: "GPS dalam desa", waktu: "Per slot", output: "Foto tersimpan" },
    { no: "3.", kegiatan: "Validasi geo-fencing sistem.", flow: { col: "sistem", type: "decision", label: "GPS OK?" }, tidakIn: "operator", persyaratan: "Koordinat desa", waktu: "Real-time", output: "Foto diterima / ditolak" },
    { no: "4.", kegiatan: "Cetak PDF dokumentasi bila perlu.", flow: { col: "operator", type: "process", label: "Selesai" }, persyaratan: "Popup diizinkan", waktu: "± 5 mnt", output: "PDF foto" },
  ], "Foto"),
  view(n++, "Peta Progress", "sop-map", "www/bun", "/map", "PETA PROGRESS", "Peta", {
    aksi: "Klik marker pekerjaan → lihat progress & navigasi detail.",
  }),
  view(n++, "Simulasi Jaringan", "sop-simulation", "www/bun", "/simulation", "SIMULASI JARINGAN PIPA", "Simulasi", {
    aksi: "Atur parameter jaringan → jalankan simulasi → analisa hasil.",
  }),
  def(n++, "Berkas Digital", "sop-berkas", "www/bun", "/berkas", "BERKAS & DRIVE 3-ZONA", [
    { no: "1.", kegiatan: "Buka /berkas → pilih pekerjaan/zona.", flow: { col: "operator", type: "process", label: "Berkas" }, persyaratan: "Pekerjaan aktif", waktu: "± 5 mnt", output: "Drive berkas" },
    { no: "2.", kegiatan: "Upload dokumen ke zona (kontrak/lapangan/arsip).", flow: { col: "operator", type: "red", label: "Upload" }, persyaratan: "Format file", waktu: "± 10 mnt", output: "File terunggah" },
    { no: "3.", kegiatan: "Preview / download / organize dokumen.", flow: { col: "operator", type: "process", label: "Kelola" }, persyaratan: "—", waktu: "± 10 mnt", output: "Berkas rapi" },
    { no: "4.", kegiatan: "Verifikasi kelengkapan register dokumen.", flow: { col: "admin", type: "process", label: "Selesai" }, persyaratan: "Register", waktu: "± 5 mnt", output: "Lengkap" },
  ], "Berkas"),

  // —— Publikasi ——
  crud(n++, "Manajemen Publikasi", "sop-manajemen-publikasi", "www/bun", "/manajemen-publikasi", "MANAJEMEN PUBLIKASI", "Publikasi", {
    buat: "Buat/edit artikel publikasi program.",
  }, { col: "admin" }),
  def(n++, "Komentar Publikasi", "sop-komentar-publikasi", "www/bun", "/manajemen-publikasi/komentar", "MODERASI KOMENTAR PUBLIKASI", [
    { no: "1.", kegiatan: "Buka moderasi komentar.", flow: { col: "admin", type: "process", label: "Moderasi" }, persyaratan: "Hak publikasi", waktu: "± 3 mnt", output: "Daftar komentar" },
    { no: "2.", kegiatan: "Review komentar → approve/hide/delete.", flow: { col: "admin", type: "decision", label: "Layak?" }, tidakIn: "operator", persyaratan: "Kebijakan moderasi", waktu: "± 10 mnt", output: "Komentar ditangani" },
    { no: "3.", kegiatan: "Publikasi tetap sesuai standar.", flow: { col: "admin", type: "process", label: "Selesai" }, persyaratan: "—", waktu: "—", output: "Halaman publik aman" },
  ], "Publikasi"),

  // —— Akses & Keamanan ——
  crud(n++, "Users", "sop-users", "www/bun", "/users", "PENGELOLAAN USERS", "Users", { buat: "Tambah/edit user & assign role." }, { col: "admin" }),
  crud(n++, "Roles", "sop-roles", "www/bun", "/roles", "PENGELOLAAN ROLES", "Roles", { buat: "Buat role & assign permission." }, { col: "admin" }),
  crud(n++, "Permissions", "sop-permissions", "www/bun", "/permissions", "PENGELOLAAN PERMISSIONS", "Permissions", { buat: "Definisikan permission granular." }, { col: "admin" }),
  crud(n++, "Route Permissions", "sop-route-permissions", "www/bun", "/route-permissions", "ROUTE PERMISSIONS", "Route Permissions", { buat: "Mapping route URL ke permission." }, { col: "admin" }),
  crud(n++, "Kegiatan Role", "sop-kegiatan-role", "www/bun", "/kegiatan-role", "KEGIATAN ROLE", "Kegiatan Role", {
    buat: "Batasi akses user per program kegiatan.",
  }, { col: "admin" }),
  crud(n++, "Menu Permissions", "sop-menu-permissions", "www/bun", "/menu-permissions", "MENU PERMISSIONS", "Menu Permissions", {
    buat: "Atur visibilitas menu sidebar per role.",
  }, { col: "admin" }),

  // —— Pengaturan ——
  view(n++, "Audit Trail", "sop-audit-logs", "www/bun", "/audit-logs", "AUDIT TRAIL", "Audit Trail", {
    col: "admin",
    aksi: "Filter log aktivitas user → export untuk audit.",
  }),
  view(n++, "Debug Reporting", "sop-error-logs", "www/bun", "/error-logs", "DEBUG REPORTING", "Error Logs", { col: "admin" }),
  crud(n++, "Pengaturan Aplikasi", "sop-settings", "www/bun", "/settings", "PENGATURAN APLIKASI", "Settings", {
    buat: "Ubah konfigurasi aplikasi & template email/kontrak.",
  }, { col: "admin" }),
  def(n++, "Assign Pekerjaan", "sop-user-pekerjaan", "www/bun", "/user-pekerjaan", "ASSIGN PEKERJAAN KE PENGAWAS", [
    { no: "1.", kegiatan: "Buka /user-pekerjaan.", flow: { col: "admin", type: "process", label: "Assign" }, persyaratan: "User pengawas ada", waktu: "± 5 mnt", output: "Form assign" },
    { no: "2.", kegiatan: "Pilih pengawas & centang pekerjaan/paket.", flow: { col: "admin", type: "red", label: "Pilih" }, persyaratan: "Daftar paket", waktu: "± 15 mnt", output: "Assign tersimpan" },
    { no: "3.", kegiatan: "Uji tampil di dashboard pengawas.", flow: { col: "pengawas", type: "decision", label: "Tampil?" }, tidakIn: "admin", tidakLoopTo: 1, persyaratan: "SSO uji", waktu: "± 5 mnt", output: "Penugasan OK" },
  ], "Assign"),
  def(n++, "Broadcast Notifikasi", "sop-broadcast", "www/bun", "/notifications/broadcast", "BROADCAST NOTIFIKASI", [
    { no: "1.", kegiatan: "Buka /notifications/broadcast.", flow: { col: "admin", type: "process", label: "Broadcast" }, persyaratan: "Hak admin", waktu: "± 3 mnt", output: "Form broadcast" },
    { no: "2.", kegiatan: "Tulis pesan & pilih target role/user.", flow: { col: "admin", type: "red", label: "Tulis" }, persyaratan: "Konten jelas", waktu: "± 10 mnt", output: "Preview" },
    { no: "3.", kegiatan: "Kirim → notifikasi masuk ke pengguna.", flow: { col: "sistem", type: "process", label: "Kirim" }, persyaratan: "Queue notifikasi", waktu: "Real-time", output: "Notifikasi terkirim" },
  ], "Broadcast"),

  // —— Puspen ——
  view(n++, "Puspen Dashboard", "sop-puspen-dashboard", "Puspen", "/puspen", "PUSPEN — DASHBOARD KOMANDO", "Puspen", {
    col: "admin",
    aksi: "Monitor KPI lintas program & drill-down pekerjaan.",
  }),
  def(n++, "Puspen Review Pekerjaan", "sop-puspen-review", "Puspen", "/puspen/review-pekerjaan", "PUSPEN — REVIEW PEKERJAAN", [
    { no: "1.", kegiatan: "Buka /puspen/review-pekerjaan.", flow: { col: "admin", type: "process", label: "Review" }, persyaratan: "Akses Puspen", waktu: "± 5 mnt", output: "Antrian review" },
    { no: "2.", kegiatan: "Buka detail pekerjaan → cek foto/progress/RAB.", flow: { col: "admin", type: "red", label: "Cek" }, persyaratan: "Data lapangan sync", waktu: "± 20 mnt", output: "Catatan review" },
    { no: "3.", kegiatan: "Approve / minta perbaikan ke pengawas.", flow: { col: "admin", type: "decision", label: "Layak?" }, tidakIn: "pengawas", persyaratan: "Checklist review", waktu: "± 10 mnt", output: "Status review" },
  ], "Puspen"),
  def(n++, "Puspen Progress Fisik", "sop-puspen-progress", "Puspen", "/puspen/progress-fisik", "PUSPEN — PROGRESS FISIK", tplView("/puspen/progress-fisik", "Progress Fisik", { col: "admin", aksi: "Analisa deviasi fisik per pekerjaan & export." }).map((s, i) => ({ ...s, no: `${i + 1}.` })), "Puspen"),
  view(n++, "Puspen KPI Pengawas", "sop-puspen-kpi", "Puspen", "/puspen/pengawas-kpi", "PUSPEN — KPI PENGAWAS", "KPI Pengawas", { col: "admin" }),
  def(n++, "Puspen Sign PDF", "sop-puspen-sign-pdf", "Puspen", "/puspen/sign-pdf", "PUSPEN — TANDA TANGAN PDF", [
    { no: "1.", kegiatan: "Upload PDF ke Sign PDF.", flow: { col: "admin", type: "process", label: "PDF" }, persyaratan: "File PDF", waktu: "± 5 mnt", output: "PDF loaded" },
    { no: "2.", kegiatan: "Letakkan tanda tangan digital.", flow: { col: "admin", type: "red", label: "Sign" }, persyaratan: "Sertifikat/TTD", waktu: "± 10 mnt", output: "PDF signed" },
    { no: "3.", kegiatan: "Download & simpan ke /berkas.", flow: { col: "admin", type: "process", label: "Selesai" }, persyaratan: "—", waktu: "± 5 mnt", output: "Dokumen arsip" },
  ], "Puspen"),
  def(n++, "Puspen Organize PDF", "sop-puspen-organize", "Puspen", "/puspen/organize-pdf", "PUSPEN — ORGANIZE PDF", tplView("/puspen/organize-pdf", "Organize PDF", { col: "admin", aksi: "Susun ulang halaman PDF → download." }).map((s, i) => ({ ...s, no: `${i + 1}.` })), "Puspen"),
  view(n++, "Puspen Media Sharing", "sop-puspen-media", "Puspen", "/puspen/media-sharing", "PUSPEN — MEDIA SHARING", "Media Sharing", { col: "admin" }),

  // —— Panel Pengawasan ——
  pg(n++, "PG Dashboard", "sop-pg-dashboard", "/pengawasan/", "PANEL PENGAWASAN — DASHBOARD", [
    { kegiatan: "SSO login → dashboard /pengawasan/.", flow: { type: "process", label: "SSO" }, persyaratan: "Penugasan aktif", waktu: "± 2 mnt", output: "KPI & filter" },
    { kegiatan: "Baca KPI, filter paket, buka perlu perhatian.", flow: { type: "red", label: "KPI" }, persyaratan: "—", waktu: "Harian", output: "Prioritas paket" },
    { kegiatan: "Navigasi ke pekerjaan / tiket / laporan.", flow: { type: "process", label: "Selesai" }, persyaratan: "—", waktu: "± 3 mnt", output: "Modul tujuan" },
  ]),
  pg(n++, "PG Daftar Pekerjaan", "sop-pg-pekerjaan", "/pengawasan/pekerjaan", "PANEL PENGAWASAN — DAFTAR PEKERJAAN", [
    { kegiatan: "Buka /pengawasan/pekerjaan.", flow: { type: "process", label: "Daftar" }, persyaratan: "Assign aktif", waktu: "± 2 mnt", output: "Tabel paket" },
    { kegiatan: "Filter & paginasi daftar pekerjaan.", flow: { type: "process", label: "Filter" }, persyaratan: "—", waktu: "± 3 mnt", output: "Paket terfilter" },
    { kegiatan: "Klik baris → buka detail pekerjaan.", flow: { type: "red", label: "Detail" }, persyaratan: "—", waktu: "± 1 mnt", output: "Halaman detail" },
  ]),
  def(n++, "PG Detail Pekerjaan", "sop-pg-detail", "www/pengawas", "/pengawasan/pekerjaan/:id", "PANEL PENGAWASAN — DETAIL PEKERJAAN (6 TAB)", pgSteps([
    { kegiatan: "Tab Ringkasan: baca metadata paket & status foto.", flow: { type: "process", label: "Ringkasan" }, persyaratan: "—", waktu: "± 5 mnt", output: "Konteks paket" },
    { kegiatan: "Tab Output: kelola komponen output pekerjaan.", flow: { type: "process", label: "Output" }, persyaratan: "RAB", waktu: "± 15 mnt", output: "Output lengkap" },
    { kegiatan: "Tab Penerima: input individu/komunal, jiwa, NIK.", flow: { type: "red", label: "Penerima" }, persyaratan: "Data penerima", waktu: "± 20 mnt", output: "Penerima tercatat" },
    { kegiatan: "Tab Foto: upload slot 0–100% + GPS per output.", flow: { type: "process", label: "Foto GPS" }, persyaratan: "GPS aktif", waktu: "Per kunjungan", output: "Matriks foto" },
    { kegiatan: "Tab Progress: estimasi fisik & keuangan mingguan.", flow: { type: "process", label: "Progress" }, persyaratan: "Form progress", waktu: "Mingguan", output: "Deviasi update" },
    { kegiatan: "Tab Tiket: buat/lihat tiket terkait paket.", flow: { type: "decision", label: "Kendala?" }, tidakIn: "sistem", persyaratan: "Modul tiket", waktu: "Sesuai kejadian", output: "Tiket / selesai" },
  ]), "Panel Pengawasan"),
  def(n++, "PG Buat Laporan", "sop-pg-buat-laporan", "www/pengawas", "/pengawasan/buat-laporan", "PANEL PENGAWASAN — BUAT LAPORAN MINGGUAN", pgSteps([
    { kegiatan: "Buka /pengawasan/buat-laporan → pilih paket.", flow: { type: "process", label: "Pilih" }, persyaratan: "Minggu aktif", waktu: "± 5 mnt", output: "Form laporan" },
    { kegiatan: "Isi Rencana & Realisasi per item RAB.", flow: { type: "red", label: "Input" }, persyaratan: "Kunjungan lapangan", waktu: "± 30 mnt", output: "Angka terisi" },
    { kegiatan: "Simpan → sinkron ke APIAMIS/Arumanis.", flow: { col: "sistem", type: "process", label: "Simpan" }, persyaratan: "API aktif", waktu: "Real-time", output: "Laporan tersimpan" },
    { kegiatan: "Verifikasi di tab Progress pekerjaan.", flow: { type: "process", label: "Selesai" }, persyaratan: "—", waktu: "± 3 mnt", output: "Konsisten" },
  ]), "Panel Pengawasan"),
  def(n++, "PG Tiket", "sop-pg-tiket", "www/pengawas", "/pengawasan/tiket", "PANEL PENGAWASAN — TIKET KENDALA", pgSteps([
    { kegiatan: "Buka /pengawasan/tiket.", flow: { type: "process", label: "Tiket" }, persyaratan: "Login SSO", waktu: "± 2 mnt", output: "Daftar tiket" },
    { kegiatan: "Buat tiket: judul, deskripsi, paket terkait.", flow: { type: "red", label: "Buat" }, persyaratan: "Kendala lapangan", waktu: "± 10 mnt", output: "Tiket terbuka" },
    { kegiatan: "Pantau komentar & status dari kantor.", flow: { type: "process", label: "Pantau" }, persyaratan: "—", waktu: "Harian", output: "Tindak lanjut" },
    { kegiatan: "Tutup bila kendala selesai.", flow: { type: "decision", label: "Selesai?" }, tidakIn: "admin", persyaratan: "—", waktu: "± 5 mnt", output: "Tiket closed" },
  ]), "Panel Pengawasan"),
  def(n++, "PG Notifikasi", "sop-pg-notifikasi", "www/pengawas", "/pengawasan/notifikasi", "PANEL PENGAWASAN — NOTIFIKASI", pgSteps([
    { kegiatan: "Buka /pengawasan/notifikasi atau bell icon.", flow: { type: "process", label: "Notif" }, persyaratan: "—", waktu: "± 1 mnt", output: "Riwayat notif" },
    { kegiatan: "Baca broadcast & deadline dari kantor.", flow: { type: "red", label: "Baca" }, persyaratan: "—", waktu: "Harian", output: "Inbox clear" },
    { kegiatan: "Klik notifikasi → navigasi ke modul terkait.", flow: { type: "process", label: "Selesai" }, persyaratan: "Link valid", waktu: "± 2 mnt", output: "Tindak lanjut" },
  ]), "Panel Pengawasan"),
  def(n++, "PG Profil", "sop-pg-profil", "www/pengawas", "/pengawasan/profile", "PANEL PENGAWASAN — PROFIL PENGAWAS", pgSteps([
    { kegiatan: "Buka /pengawasan/profile.", flow: { type: "process", label: "Profil" }, persyaratan: "—", waktu: "± 1 mnt", output: "Data user" },
    { kegiatan: "Cek kecocokan NIP dengan master /pengawas.", flow: { type: "decision", label: "Cocok?" }, tidakIn: "admin", persyaratan: "Master pengawas", waktu: "± 3 mnt", output: "Profil valid / hubungi admin" },
    { kegiatan: "Logout dari menu profil bila selesai.", flow: { type: "process", label: "Selesai" }, persyaratan: "—", waktu: "± 1 mnt", output: "Sesi berakhir" },
  ]), "Panel Pengawasan"),
  def(n++, "PG Panduan", "sop-pg-panduan", "www/pengawas", "/pengawasan/panduan", "PANEL PENGAWASAN — PANDUAN IN-APP", pgSteps([
    { kegiatan: "Buka /pengawasan/panduan.", flow: { type: "process", label: "Panduan" }, persyaratan: "—", waktu: "± 1 mnt", output: "Tutorial interaktif" },
    { kegiatan: "Ikuti langkah upload foto, progress, tiket.", flow: { type: "red", label: "Pelajari" }, persyaratan: "—", waktu: "± 15 mnt", output: "Pemahaman alur" },
    { kegiatan: "Praktikkan di modul pekerjaan.", flow: { type: "process", label: "Selesai" }, persyaratan: "Penugasan aktif", waktu: "—", output: "Siap operasional" },
  ]), "Panel Pengawasan"),
];

export const ALL_SOPS = [...SOPS_INTEGRASI, ...SOPS_MODUL];

export const SOP_KETERANGAN = [
  "Bagian A — Integrasi (SOP-01 s/d SOP-06)",
  "Bagian B — Dashboard & Pelaporan Arumanis (SOP-07 s/d SOP-15)",
  "Bagian C — Master Data Arumanis (SOP-16 s/d SOP-32)",
  "Bagian D — Dokumentasi Arumanis (SOP-33 s/d SOP-37)",
  "Bagian E — Publikasi (SOP-38 s/d SOP-39)",
  "Bagian F — Akses & Keamanan (SOP-40 s/d SOP-45)",
  "Bagian G — Pengaturan (SOP-46 s/d SOP-50)",
  "Bagian H — Puspen (SOP-51 s/d SOP-57)",
  "Bagian I — Panel Pengawasan (SOP-58 s/d SOP-65)",
  "Panduan teknis: docs/user-guide/ dan /docs",
];