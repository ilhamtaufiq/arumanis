export type KontrakPlaceholderGroup = {
    id: string;
    label: string;
    description?: string;
    items: KontrakPlaceholderItem[];
};

export type KontrakPlaceholderItem = {
    key: string;
    label: string;
    example?: string;
};

export const KONTRAK_PLACEHOLDER_SYNTAX = '{nama_placeholder}';

export const KONTRAK_PLACEHOLDER_GROUPS: KontrakPlaceholderGroup[] = [
    {
        id: 'pekerjaan',
        label: 'Pekerjaan',
        items: [
            { key: 'nama_paket', label: 'Nama paket pekerjaan', example: 'Pembangunan SPAM Desa Sukamaju' },
            { key: 'pagu', label: 'Pagu pekerjaan (format Rupiah)', example: 'Rp. 500.000.000' },
            { key: 'pagu_terbilang', label: 'Pagu pekerjaan terbilang', example: 'Lima Ratus Juta' },
            { key: 'kode_rekening', label: 'Kode rekening pekerjaan' },
            { key: 'kecamatan', label: 'Nama kecamatan lokasi' },
            { key: 'desa', label: 'Nama desa/kelurahan lokasi' },
            { key: 'Kota', label: 'Alias kecamatan (default Cianjur jika kosong)' },
            { key: 'Pekerjaan', label: 'Alias {nama_paket}' },
        ],
    },
    {
        id: 'kegiatan',
        label: 'Kegiatan',
        items: [
            { key: 'nama_program', label: 'Nama program' },
            { key: 'nama_kegiatan', label: 'Nama kegiatan' },
            { key: 'sub_kegiatan', label: 'Nama sub kegiatan' },
            { key: 'nama_sub_kegiatan', label: 'Nama sub kegiatan (snake_case)' },
            { key: 'nama_subkegiatan', label: 'Nama sub kegiatan (tanpa underscore)' },
            { key: 'Nama_Sub_Kegiatan', label: 'Alias nama sub kegiatan' },
            { key: 'Nama_SubKegiatan', label: 'Alias nama sub kegiatan' },
            { key: 'tahun', label: 'Tahun anggaran kegiatan', example: '2026' },
            { key: 'sumber_dana', label: 'Sumber dana kegiatan', example: 'DAK' },
        ],
    },
    {
        id: 'kontrak',
        label: 'Kontrak',
        items: [
            { key: 'nilai_kontrak', label: 'Nilai kontrak (format Rupiah)', example: 'Rp. 450.000.000' },
            { key: 'nilai_kontrak_terbilang', label: 'Nilai kontrak terbilang' },
            { key: 'terbilang_nilai_kontrak', label: 'Alias nilai kontrak terbilang' },
            { key: 'Nilai_Kontrak', label: 'Alias {nilai_kontrak}' },
            { key: 'Terbilang', label: 'Alias terbilang nilai kontrak' },
            { key: 'nomor_sppbj', label: 'Nomor SPPBJ' },
            { key: 'tgl_sppbj', label: 'Tanggal SPPBJ', example: '15 Januari 2026' },
            { key: 'SPPBJ', label: 'Alias tanggal SPPBJ' },
            { key: 'SPPBJ1', label: 'Alias nomor SPPBJ' },
            { key: 'nomor_spk', label: 'Nomor SPK / kontrak' },
            { key: 'tgl_spk', label: 'Tanggal SPK', example: '20 Januari 2026' },
            { key: 'tanggal_spk', label: 'Alias tanggal SPK' },
            { key: 'tgl_spl', label: 'Alias tanggal SPK' },
            { key: 'SPK', label: 'Alias tanggal SPK' },
            { key: 'SPK1', label: 'Alias nomor SPK' },
            { key: 'nomor_spmk', label: 'Nomor SPMK' },
            { key: 'tgl_spmk', label: 'Tanggal SPMK' },
            { key: 'tanggal_mulai', label: 'Tanggal mulai pelaksanaan (SPMK)' },
            { key: 'tgl_selesai', label: 'Tanggal selesai kontrak' },
            { key: 'tanggal_selesai', label: 'Alias tanggal selesai' },
            { key: 'Selesai', label: 'Alias tanggal selesai' },
            { key: 'nomor_bastp', label: 'Nomor BASTP (Register Dokumen, kode BASTP)' },
            { key: 'tgl_bastp', label: 'Tanggal BASTP (Register Dokumen, kode BASTP)', example: '15 Januari 2026' },
            { key: 'nilai_kontrak_addendum', label: 'Nilai kontrak setelah addendum terakhir', example: 'Rp. 120.000.000' },
            { key: 'nilai_kontrak_5persen', label: '5% nilai kontrak efektif', example: 'Rp. 6.000.000' },
            { key: 'nomor_jaminan_uang_muka', label: 'Nomor jaminan uang muka (Register JAMINAN_UM atau isi modal Ringkasan)' },
            { key: 'tanggal_jaminan_uang_muka', label: 'Tanggal jaminan uang muka' },
            { key: 'tgl_jaminan_uang_muka', label: 'Alias tanggal jaminan uang muka' },
            { key: 'nomor_jaminan_pelaksanaan', label: 'Nomor jaminan pelaksanaan (Register JAMINAN_PEL atau isi modal Ringkasan)' },
            { key: 'tanggal_jaminan_pelaksanaan', label: 'Tanggal jaminan pelaksanaan' },
            { key: 'tgl_jaminan_pelaksanaan', label: 'Alias tanggal jaminan pelaksanaan' },
            { key: 'nomor_jaminan_pemeliharaan', label: 'Nomor jaminan pemeliharaan (Register Dokumen, kode JAMINAN_PEM)' },
            { key: 'tanggal_jaminan_pemeliharaan', label: 'Tanggal jaminan pemeliharaan' },
            { key: 'tgl_jaminan_pemeliharaan', label: 'Alias tanggal jaminan pemeliharaan' },
            { key: 'nomor_bap', label: 'Nomor BAP (Register Dokumen, kode BAP)' },
            { key: 'tgl_bap', label: 'Tanggal BAP' },
            { key: 'masa_hari_addendum', label: 'Jangka waktu pelaksanaan setelah addendum', example: '120 (Seratus Dua Puluh) Hari Kalender' },
            { key: 'jangka_pemeliharaan', label: 'Jangka waktu pemeliharaan', example: '180 (Seratus Delapan Puluh) Hari Kalender' },
            { key: 'mulai_selesai_pemeliharaan', label: 'Rentang tanggal pemeliharaan', example: 'dari Tanggal 1 Juni 2026 s.d Tanggal 28 November 2026' },
            { key: 'kode_rup', label: 'Kode RUP' },
            { key: 'kode_paket', label: 'Kode paket' },
            { key: 'nomor_penawaran', label: 'Nomor penawaran penyedia' },
            { key: 'tanggal_penawaran', label: 'Tanggal penawaran' },
            { key: 'masa', label: 'Masa pelaksanaan', example: '90 Hari' },
            { key: 'masa_hari', label: 'Masa pelaksanaan (angka hari)', example: '90' },
            { key: 'masa_hari_terbilang', label: 'Masa pelaksanaan terbilang' },
            { key: 'Masa', label: 'Alias masa hari' },
        ],
    },
    {
        id: 'penyedia',
        label: 'Penyedia',
        items: [
            { key: 'nama_penyedia', label: 'Nama penyedia / rekanan' },
            { key: 'Penyedia', label: 'Alias {nama_penyedia}' },
            { key: 'direktur', label: 'Nama direktur penyedia' },
            { key: 'nama_direktur', label: 'Alias nama direktur' },
            { key: 'alamat_penyedia', label: 'Alamat penyedia' },
            { key: 'bank', label: 'Nama bank penyedia' },
            { key: 'bank_penyedia', label: 'Alias nama bank' },
            { key: 'norek', label: 'Nomor rekening penyedia' },
            { key: 'rekening_penyedia', label: 'Alias nomor rekening' },
            { key: 'npwp_penyedia', label: 'NPWP penyedia' },
            { key: 'no_akta', label: 'Nomor akta pendirian' },
            { key: 'notaris', label: 'Nama notaris' },
            { key: 'tanggal_akta', label: 'Tanggal akta' },
        ],
    },
    {
        id: 'pejabat',
        label: 'Pejabat (Settings → Template Dokumen Kontrak)',
        description: 'PPK dari Settings (default SPSE jika kosong). PPTK utama dari sub kegiatan pekerjaan; Settings hanya fallback.',
        items: [
            { key: 'nama_ppk', label: 'Nama Pejabat Pembuat Komitmen (PPK)' },
            { key: 'nip_ppk', label: 'NIP PPK' },
            { key: 'nama_pptk', label: 'Nama PPTK (sub kegiatan, fallback Settings)' },
            { key: 'nip_pptk', label: 'NIP PPTK (sub kegiatan, fallback Settings)' },
        ],
    },
    {
        id: 'instansi',
        label: 'Instansi & DPA (Settings → Template Dokumen Kontrak)',
        items: [
            { key: 'skpd', label: 'Nama SKPD', example: 'Dinas Perumahan dan Kawasan Permukiman' },
            { key: 'nomor_dpa', label: 'Nomor DPA / DPPA SKPD', example: '900/Kep.09/BKAD/2/2026' },
            { key: 'tanggal_dpa', label: 'Tanggal DPA / DPPA', example: '03 Februari 2026' },
        ],
    },
    {
        id: 'pembayaran',
        label: 'Tata cara pembayaran (Settings → Template Dokumen Kontrak)',
        description: 'Checkbox ☑/☐ sesuai pilihan cara pembayaran di pengaturan.',
        items: [
            { key: 'cara_pembayaran', label: 'Cara pembayaran terpilih', example: 'Sekaligus' },
            { key: 'check_pembayaran_sekaligus', label: 'Checkbox sekaligus' },
            { key: 'check_pembayaran_termin', label: 'Checkbox termin' },
            { key: 'check_pembayaran_bulan', label: 'Checkbox bulan' },
        ],
    },
    {
        id: 'ringkasan',
        label: 'Ringkasan kontrak (modal ekspor / pratinjau)',
        description:
            'Nilai dari form modal Ringkasan. Jaminan: isi di modal menimpa Register Dokumen. Template Excel ringkasan memakai placeholder yang sama {nama}.',
        items: [
            { key: 'persen_tagih', label: 'Persen yang ditagihkan', example: '100' },
            { key: 'nilai_tagih', label: 'Nominal yang ditagihkan (format Rupiah)', example: 'Rp. 450.000.000' },
            { key: 'nomor_jaminan_uang_muka', label: 'Nomor jaminan uang muka (override modal)' },
            { key: 'tanggal_jaminan_uang_muka', label: 'Tanggal jaminan uang muka (override modal)', example: '10 Februari 2026' },
            { key: 'tgl_jaminan_uang_muka', label: 'Alias tanggal jaminan uang muka' },
            { key: 'nomor_jaminan_pelaksanaan', label: 'Nomor jaminan pelaksanaan (override modal)' },
            { key: 'tanggal_jaminan_pelaksanaan', label: 'Tanggal jaminan pelaksanaan (override modal)', example: '15 Januari 2026' },
            { key: 'tgl_jaminan_pelaksanaan', label: 'Alias tanggal jaminan pelaksanaan' },
            { key: 'pembayaran_lalu_1_jenis', label: 'Pembayaran lalu baris 1 — jenis', example: 'Uang Muka' },
            { key: 'pembayaran_lalu_1_tanggal', label: 'Pembayaran lalu baris 1 — tanggal' },
            { key: 'pembayaran_lalu_1_nominal', label: 'Pembayaran lalu baris 1 — nominal' },
            { key: 'pembayaran_lalu_2_jenis', label: 'Pembayaran lalu baris 2 — jenis' },
            { key: 'pembayaran_lalu_2_tanggal', label: 'Pembayaran lalu baris 2 — tanggal' },
            { key: 'pembayaran_lalu_2_nominal', label: 'Pembayaran lalu baris 2 — nominal' },
            { key: 'pembayaran_lalu_3_jenis', label: 'Pembayaran lalu baris 3 — jenis' },
            { key: 'pembayaran_lalu_3_tanggal', label: 'Pembayaran lalu baris 3 — tanggal' },
            { key: 'pembayaran_lalu_3_nominal', label: 'Pembayaran lalu baris 3 — nominal' },
        ],
    },
    {
        id: 'sumber_dana_checkbox',
        label: 'Checkbox sumber dana',
        description: 'Menampilkan ☑ atau ☐ sesuai sumber dana kegiatan. Tersedia beberapa alias nama placeholder.',
        items: [
            { key: 'checkbox_apbd', label: 'Checkbox APBD' },
            { key: 'checkbox_apbn', label: 'Checkbox APBN' },
            { key: 'checkbox_dak', label: 'Checkbox DAK' },
            { key: 'checkbox_dau', label: 'Checkbox DAU' },
            { key: 'checkbox_did', label: 'Checkbox DID' },
            { key: 'checkbox_banprov', label: 'Checkbox bantuan provinsi' },
            { key: 'checkbox_dbh', label: 'Checkbox DBH' },
            { key: 'checkbox_silpa', label: 'Checkbox SILPA' },
            { key: 'checkbox_dbh_pajak_rokok', label: 'Checkbox DBH pajak rokok' },
            { key: 'checkbox_pad', label: 'Checkbox PAD' },
            { key: 'checkbox_dbhct', label: 'Checkbox DBHCT' },
            { key: 'checkbox_dbh_prov', label: 'Checkbox DBH provinsi' },
            { key: 'APBD_CHECK', label: 'Alias checkbox APBD' },
            { key: 'DAK_CHECK', label: 'Alias checkbox DAK' },
        ],
    },
    {
        id: 'addendum',
        label: 'Addendum',
        description: 'Placeholder addendum yang disetujui, berurutan dari 1 (maks. 10 slot default).',
        items: [
            { key: 'nomor_addendum1', label: 'Nomor addendum ke-1' },
            { key: 'tgl_addendum1', label: 'Tanggal addendum ke-1' },
            { key: 'tanggal_addendum1', label: 'Alias tanggal addendum ke-1' },
            { key: 'nomor_addendum2', label: 'Nomor addendum ke-2' },
            { key: 'tgl_addendum2', label: 'Tanggal addendum ke-2' },
        ],
    },
];

export function formatKontrakPlaceholder(key: string): string {
    return `{${key}}`;
}

export function filterPlaceholderGroups(query: string): KontrakPlaceholderGroup[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
        return KONTRAK_PLACEHOLDER_GROUPS;
    }

    return KONTRAK_PLACEHOLDER_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter(
            (item) =>
                item.key.toLowerCase().includes(normalized) ||
                item.label.toLowerCase().includes(normalized) ||
                item.example?.toLowerCase().includes(normalized)
        ),
    })).filter((group) => group.items.length > 0);
}