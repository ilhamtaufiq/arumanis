import type { CapaianBidang } from '../api/capaian-bidang'

export type PosterBidang = 'air-minum' | 'sanitasi'

export const POSTER_WIDTH = 1536
export const POSTER_HEIGHT = 2048

type Rect = { x: number; y: number; w: number; h: number }

export type PosterLayout = {
    /** Nama sub bidang di API (`tbl_kegiatan.sub_bidang`). */
    namaApi: string
    judul: string
    gambar: string
    /** Area teks judul di dalam kotak judul pada templat. */
    areaJudul: Rect
    /** Empat kartu statistik: kartu dan jalur bilah progresnya (koordinat piksel pada gambar templat). */
    kartu: { kartu: Rect; bilah: Rect }[]
    areaFooter: Rect
    warnaBilah: string
    warnaJalur: string
}

/** Koordinat diukur dari gambar templat 1536×2048 (bilah bawaan gambar sudah dihapus). */
export const POSTER_LAYOUT: Record<PosterBidang, PosterLayout> = {
    'air-minum': {
        namaApi: 'air minum',
        judul: 'AIR MINUM',
        gambar: '/images/poster-capaian/air-minum.jpg',
        areaJudul: { x: 130, y: 96, w: 990, h: 240 },
        kartu: [
            { kartu: { x: 77, y: 916, w: 1385, h: 213 }, bilah: { x: 344, y: 1077, w: 1079, h: 28 } },
            { kartu: { x: 77, y: 1152, w: 1385, h: 213 }, bilah: { x: 344, y: 1315, w: 1079, h: 28 } },
            { kartu: { x: 77, y: 1389, w: 1385, h: 211 }, bilah: { x: 344, y: 1548, w: 1079, h: 28 } },
            { kartu: { x: 77, y: 1625, w: 1385, h: 208 }, bilah: { x: 344, y: 1784, w: 1079, h: 29 } },
        ],
        areaFooter: { x: 110, y: 1880, w: 1316, h: 115 },
        warnaBilah: '#F87A02',
        warnaJalur: '#FEF0D9',
    },
    sanitasi: {
        namaApi: 'sanitasi',
        judul: 'SANITASI',
        gambar: '/images/poster-capaian/sanitasi.jpg',
        areaJudul: { x: 175, y: 75, w: 940, h: 280 },
        kartu: [
            { kartu: { x: 72, y: 968, w: 1403, h: 220 }, bilah: { x: 319, y: 1129, w: 1113, h: 31 } },
            { kartu: { x: 72, y: 1200, w: 1403, h: 221 }, bilah: { x: 319, y: 1363, w: 1113, h: 29 } },
            { kartu: { x: 72, y: 1434, w: 1403, h: 212 }, bilah: { x: 319, y: 1586, w: 1113, h: 31 } },
            { kartu: { x: 72, y: 1657, w: 1403, h: 215 }, bilah: { x: 319, y: 1809, w: 1113, h: 31 } },
        ],
        areaFooter: { x: 230, y: 1905, w: 1070, h: 90 },
        warnaBilah: '#EE7602',
        warnaJalur: '#FAE3B2',
    },
}

export type KartuPoster = {
    label: string
    nilai: string
    keterangan: string
    /** Isi bilah progres, 0 sampai 100. */
    persen: number
}

const formatAngka = (n: number, maksDesimal: number) =>
    n.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: maksDesimal })

/** Rupiah ringkas: `Rp 600 juta`, `Rp 1,25 miliar`, `Rp 2,5 triliun`. Di bawah sejuta ditulis lengkap. */
export function rupiahRingkas(nilai: number): string {
    const abs = Math.abs(nilai)
    if (abs >= 1e12) return `Rp ${formatAngka(nilai / 1e12, 2)} triliun`
    if (abs >= 1e9) return `Rp ${formatAngka(nilai / 1e9, 2)} miliar`
    if (abs >= 1e6) return `Rp ${formatAngka(nilai / 1e6, 1)} juta`
    return `Rp ${formatAngka(nilai, 0)}`
}

/** Persen dengan satu desimal, mis. `16,7%`. */
export function persenTeks(nilai: number): string {
    return `${nilai.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

const batasi = (n: number) => (Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0)

/** Empat kartu statistik poster untuk satu bidang. */
export function kartuPoster(d: CapaianBidang): KartuPoster[] {
    const porsiBerkontrak = d.paket > 0 ? (d.berkontrak / d.paket) * 100 : 0
    const porsiPagu = d.paguKegiatan > 0 ? (d.pagu / d.paguKegiatan) * 100 : 0

    return [
        {
            label: 'Paket pekerjaan',
            nilai: `${formatAngka(d.paket, 0)} paket`,
            keterangan: `${d.berkontrak} berkontrak · ${d.belumBerkontrak} belum · ${d.batal} batal`,
            persen: batasi(porsiBerkontrak),
        },
        {
            label: 'Pagu paket',
            nilai: rupiahRingkas(d.pagu),
            keterangan:
                d.kegiatan > 0
                    ? `${d.kegiatan} kegiatan · pagu kegiatan ${rupiahRingkas(d.paguKegiatan)}`
                    : 'Belum ada kegiatan',
            persen: batasi(porsiPagu),
        },
        {
            label: 'Progres fisik',
            nilai: persenTeks(d.progressFisik),
            keterangan: `rata-rata ${d.paketBerprogres} paket`,
            persen: batasi(d.progressFisik),
        },
        {
            label: 'Realisasi keuangan',
            nilai: persenTeks(d.realisasiKeuanganPersen),
            keterangan: `SP2D ${rupiahRingkas(d.sp2dTotal)}`,
            persen: batasi(d.realisasiKeuanganPersen),
        },
    ]
}

const KOSONG: CapaianBidang = {
    name: '',
    kegiatan: 0,
    paguKegiatan: 0,
    paket: 0,
    berkontrak: 0,
    belumBerkontrak: 0,
    batal: 0,
    pagu: 0,
    progressFisik: 0,
    paketBerprogres: 0,
    sp2dTotal: 0,
    realisasiKeuanganPersen: 0,
}

/** Capaian bidang dari respons API; nol semua bila bidang tidak ada di respons. */
export function cariBidang(bidang: CapaianBidang[] | undefined, nama: string): CapaianBidang {
    return bidang?.find((b) => b.name === nama) ?? { ...KOSONG, name: nama }
}

export function tanggalIndonesia(tanggal: Date): string {
    return tanggal.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
