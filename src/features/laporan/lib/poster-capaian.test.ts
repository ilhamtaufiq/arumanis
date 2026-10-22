import { describe, expect, it } from 'vitest'
import type { CapaianBidang } from '../api/capaian-bidang'
import { cariBidang, kartuPoster, persenTeks, POSTER_LAYOUT, rupiahRingkas } from './poster-capaian'

const bidang: CapaianBidang = {
    name: 'air minum',
    kegiatan: 3,
    paguKegiatan: 1_000_000_000,
    paket: 10,
    berkontrak: 7,
    belumBerkontrak: 3,
    batal: 1,
    pagu: 600_000_000,
    progressFisik: 50,
    paketBerprogres: 6,
    sp2dTotal: 100_000_000,
    realisasiKeuanganPersen: 16.7,
}

describe('rupiahRingkas', () => {
    it('memakai satuan juta, miliar, dan triliun', () => {
        expect(rupiahRingkas(600_000_000)).toBe('Rp 600 juta')
        expect(rupiahRingkas(612_500_000)).toBe('Rp 612,5 juta')
        expect(rupiahRingkas(1_250_000_000)).toBe('Rp 1,25 miliar')
        expect(rupiahRingkas(2_500_000_000_000)).toBe('Rp 2,5 triliun')
    })

    it('menulis lengkap di bawah satu juta', () => {
        expect(rupiahRingkas(0)).toBe('Rp 0')
        expect(rupiahRingkas(250_000)).toBe('Rp 250.000')
    })
})

describe('persenTeks', () => {
    it('satu desimal dengan koma', () => {
        expect(persenTeks(16.7)).toBe('16,7%')
        expect(persenTeks(50)).toBe('50,0%')
    })
})

describe('kartuPoster', () => {
    it('menyusun empat kartu dari capaian bidang', () => {
        const kartu = kartuPoster(bidang)
        expect(kartu).toHaveLength(4)
        expect(kartu[0]).toMatchObject({ label: 'Paket pekerjaan', nilai: '10 paket', persen: 70 })
        expect(kartu[0].keterangan).toBe('7 berkontrak · 3 belum · 1 batal')
        expect(kartu[1]).toMatchObject({ label: 'Pagu paket', nilai: 'Rp 600 juta', persen: 60 })
        expect(kartu[2]).toMatchObject({ label: 'Progres fisik', nilai: '50,0%', persen: 50 })
        expect(kartu[3]).toMatchObject({ label: 'Realisasi keuangan', nilai: '16,7%', persen: 16.7 })
    })

    it('tidak membagi dengan nol dan membatasi bilah ke 0 sampai 100', () => {
        const kosong = kartuPoster({ ...bidang, paket: 0, berkontrak: 0, paguKegiatan: 0, kegiatan: 0 })
        expect(kosong[0].persen).toBe(0)
        expect(kosong[1].persen).toBe(0)
        expect(kosong[1].keterangan).toBe('Belum ada kegiatan')

        const lebih = kartuPoster({ ...bidang, realisasiKeuanganPersen: 130, pagu: 2_000_000_000 })
        expect(lebih[1].persen).toBe(100)
        expect(lebih[3].persen).toBe(100)
    })
})

describe('cariBidang', () => {
    it('mengembalikan nol bila bidang tidak ada di respons', () => {
        const d = cariBidang([bidang], 'sanitasi')
        expect(d.name).toBe('sanitasi')
        expect(d.paket).toBe(0)
        expect(cariBidang(undefined, 'air minum').pagu).toBe(0)
    })

    it('menemukan bidang menurut nama API pada layout', () => {
        expect(cariBidang([bidang], POSTER_LAYOUT['air-minum'].namaApi).paket).toBe(10)
    })
})
