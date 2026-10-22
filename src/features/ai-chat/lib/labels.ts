/** Nama tool dari server ke label yang dipahami pengguna. */
const TOOL_LABEL: Record<string, string> = {
    statistik_dashboard: 'Ringkasan dashboard',
    pekerjaan_progres_rendah: 'Progres rendah',
    pekerjaan_cari: 'Cari pekerjaan',
    kontrak_ringkasan: 'Kontrak',
    realisasi_keuangan: 'Realisasi SP2D',
    rekap_kecamatan: 'Rekap kecamatan',
    rekap_desa: 'Rekap desa',
    penerima_agregat: 'Penerima (agregat)',
    cari_surat: 'Cari surat',
    kualitas_data: 'Kualitas data',
}

export function labelTool(nama: string): string {
    return TOOL_LABEL[nama] ?? nama
}

/** Status dari server berbentuk "Mengambil data: <tool>". Labelnya diganti agar mudah dibaca. */
export function labelStatus(message: string): string {
    const cocok = /^Mengambil data: (.+)$/.exec(message)
    return cocok ? `Mengambil ${labelTool(cocok[1])}…` : message
}

/** Teks ringkas untuk sumber jawaban, mis. "Rekap desa · 12 baris". */
export function teksSumber(tool: string, jumlahBaris: number | null): string {
    return jumlahBaris !== null ? `${labelTool(tool)} · ${jumlahBaris} baris` : labelTool(tool)
}
