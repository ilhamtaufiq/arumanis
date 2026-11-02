/**
 * Mencocokkan teks lokasi dari SIPD (mis. "Kp. Joglo Rt 02 Rw. 04 Desa Sukarama Kecamatan Bojongpicung,
 * Kab. Cianjur") dengan master desa dan kecamatan di Arumanis.
 */

export type MasterDesa = {
    id: number
    nama: string
    kecamatan: string | null
}

export type HasilLokasi = {
    desa: string | null
    kecamatan: string | null
}

/** Huruf kecil, tanda baca jadi spasi, spasi berlebih dibuang. */
export function normalisasiNama(teks: string): string {
    return teks
        .toLowerCase()
        .replace(/[.,;:()/\-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

/** Nama master tanpa awalan "desa" atau "kelurahan" yang kadang ikut tersimpan di database. */
function namaMaster(nama: string): string {
    return normalisasiNama(nama).replace(/^(desa|kelurahan|kel)\s+/, '')
}

/** Teks dengan spasi di kedua ujung, supaya pencocokan selalu per kata utuh. */
function berkata(teks: string): string {
    return ` ${normalisasiNama(teks)} `
}

function adaKata(berkataTeks: string, kata: string): boolean {
    return kata.length > 0 && berkataTeks.includes(` ${kata} `)
}

/**
 * Cari desa dan kecamatan dari satu atau beberapa teks lokasi.
 *
 * Aturan:
 * - Desa diterima bila namanya muncul sebagai kata utuh dan didahului kata "desa", atau kecamatannya juga
 *   disebut di teks. Nama desa tanpa dua petunjuk itu diabaikan, karena bisa salah cocok.
 * - Bila lebih dari satu desa cocok, pilih yang kecamatannya disebut di teks, lalu yang namanya paling panjang.
 * - Kalau tidak ada desa yang cocok, kecamatan diambil dari nama kecamatan yang disebut di teks.
 */
export function cariLokasi(teksLokasi: Array<string | null | undefined>, master: MasterDesa[]): HasilLokasi {
    const gabungan = teksLokasi.filter((t): t is string => !!t && t.trim() !== '').join(' ')
    if (!gabungan) return { desa: null, kecamatan: null }

    const teks = berkata(gabungan)
    const namaDesa = new Set(master.map((d) => namaMaster(d.nama)))

    // Kecamatan disebut bila didahului "kecamatan"/"kec", atau bila namanya bukan nama desa
    // (nama yang sama dengan desa bisa jadi memang nama desa).
    const kecamatanDisebut = new Set<string>()
    for (const d of master) {
        if (!d.kecamatan) continue
        const kec = namaMaster(d.kecamatan)
        const eksplisit = teks.includes(` kecamatan ${kec} `) || teks.includes(` kec ${kec} `)
        if (eksplisit || (adaKata(teks, kec) && !namaDesa.has(kec))) kecamatanDisebut.add(d.kecamatan)
    }

    type Calon = { desa: MasterDesa; skor: number; panjang: number }
    const calon: Calon[] = []
    for (const d of master) {
        const nama = namaMaster(d.nama)
        if (!adaKata(teks, nama)) continue
        const didahuluiDesa = teks.includes(` desa ${nama} `) || teks.includes(` kelurahan ${nama} `)
        // Nama desa yang sama dengan kecamatannya hanya diterima bila didahului "desa".
        if (!didahuluiDesa && d.kecamatan && namaMaster(d.kecamatan) === nama) continue
        const kecamatanCocok = d.kecamatan !== null && kecamatanDisebut.has(d.kecamatan)
        if (!didahuluiDesa && !kecamatanCocok) continue
        calon.push({ desa: d, skor: (didahuluiDesa ? 2 : 0) + (kecamatanCocok ? 2 : 0), panjang: nama.length })
    }

    if (calon.length > 0) {
        calon.sort((a, b) => b.skor - a.skor || b.panjang - a.panjang)
        const terbaik = calon[0].desa
        return { desa: terbaik.nama, kecamatan: terbaik.kecamatan }
    }

    // Tidak ada desa yang cocok: ambil kecamatan yang disebut di teks, dengan nama paling panjang.
    const daftarKec = [...kecamatanDisebut].sort((a, b) => namaMaster(b).length - namaMaster(a).length)
    return { desa: null, kecamatan: daftarKec[0] ?? null }
}

const AKUN_LOKASI = 'belanja barang untuk dijual diserahkan kepada masyarakat'

/** Hanya rincian dengan rekening ini yang diisi desa dan kecamatan. */
export function adalahAkunLokasi(namaAkun: string | null | undefined): boolean {
    return !!namaAkun && normalisasiNama(namaAkun) === AKUN_LOKASI
}
