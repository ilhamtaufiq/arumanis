export type PekerjaanProgresMentah = {
    id: number
    nama_paket: string
    progress_estimasi_fisik?: number | string | null
    progress_estimasi_keuangan?: number | string | null
}

export type PekerjaanProgres = {
    id: number
    nama_paket: string
    fisik: number
    keuangan: number
}

/**
 * Paket yang progres fisiknya belum 100%, diurutkan dari yang paling rendah.
 * `terendah` berisi paling banyak `batas` paket; `jumlahBelum` adalah jumlah semua paket yang belum 100%
 * dalam data yang diberikan (bukan hanya yang ditampilkan).
 */
export function ringkasProgres(rows: PekerjaanProgresMentah[], batas = 5) {
    const belum = rows
        .map<PekerjaanProgres>((p) => ({
            id: p.id,
            nama_paket: p.nama_paket,
            fisik: Number(p.progress_estimasi_fisik ?? 0),
            keuangan: Number(p.progress_estimasi_keuangan ?? 0),
        }))
        .filter((p) => p.fisik < 100)
        .sort((a, b) => a.fisik - b.fisik || a.nama_paket.localeCompare(b.nama_paket, 'id'))

    return { terendah: belum.slice(0, batas), jumlahBelum: belum.length }
}
