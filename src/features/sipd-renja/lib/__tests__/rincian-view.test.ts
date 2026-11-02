import { describe, expect, it } from 'bun:test'
import { formatKodeRekening, kategoriRincian, terapkanFilterUrut } from '../rincian-view'
import type { SipdRincianRow } from '@/features/sipd-renja/types'

const FISIK = 'Belanja Barang untuk Dijual/Diserahkan kepada Masyarakat'
const rows: SipdRincianRow[] = [
    { id_rinci_sub_bl: 1, subs_bl_teks: 'Pipa', kode_akun: '5.1.02.04.001.00002', nama_akun: FISIK, total_harga: 500 },
    { id_rinci_sub_bl: 2, subs_bl_teks: 'Honor', kode_akun: '5.1.02.01.001.00001', nama_akun: 'Belanja Barang Operasional', total_harga: 900 },
    { id_rinci_sub_bl: 3, subs_bl_teks: 'Sewa', kode_akun: '5.1.02.04.001.00001', nama_akun: FISIK, total_harga: 700 },
]
const lokasi = new Map([
    [1, { desa: 'Sukarama', kecamatan: 'Bojongpicung' }],
    [3, { desa: 'Joglo', kecamatan: 'Bojongpicung' }],
])

describe('kategoriRincian', () => {
    it('membedakan kegiatan fisik dan penunjang', () => {
        expect(kategoriRincian({ nama_akun: FISIK })).toBe('Kegiatan Fisik')
        expect(kategoriRincian({ nama_akun: 'Belanja Barang Operasional' })).toBe('Penunjang')
        expect(kategoriRincian({ nama_akun: null })).toBe('Penunjang')
    })
})

describe('formatKodeRekening', () => {
    it('memakai format Rincian ... Rekening ...', () => {
        expect(formatKodeRekening('1.03.03.2.01.0028', '5.1.02.04.001.00001')).toBe(
            'Rincian 1.03.03.2.01.0028 Rekening 5.1.02.04.001.00001',
        )
    })

    it('bagian kosong dilewati', () => {
        expect(formatKodeRekening(null, '5.1.02.04.001.00001')).toBe('Rekening 5.1.02.04.001.00001')
        expect(formatKodeRekening('1.03.03.2.01.0028', '')).toBe('Rincian 1.03.03.2.01.0028')
        expect(formatKodeRekening('', '')).toBe('')
    })
})

describe('terapkanFilterUrut', () => {
    it('filter kategori fisik dan penunjang', () => {
        expect(terapkanFilterUrut(rows, lokasi, { kategori: 'fisik', urut: 'urutan' }).map((r) => r.id_rinci_sub_bl)).toEqual([1, 3])
        expect(terapkanFilterUrut(rows, lokasi, { kategori: 'penunjang', urut: 'urutan' }).map((r) => r.id_rinci_sub_bl)).toEqual([2])
        expect(terapkanFilterUrut(rows, lokasi, { kategori: 'semua', urut: 'urutan' }).length).toBe(3)
    })

    it('urut berdasarkan rekening, total, uraian', () => {
        const ids = (u: Parameters<typeof terapkanFilterUrut>[2]['urut']) =>
            terapkanFilterUrut(rows, lokasi, { kategori: 'semua', urut: u }).map((r) => r.id_rinci_sub_bl)
        expect(ids('rekening')).toEqual([2, 3, 1])
        expect(ids('total-desc')).toEqual([2, 3, 1])
        expect(ids('total-asc')).toEqual([1, 3, 2])
        expect(ids('uraian')).toEqual([2, 1, 3])
    })

    it('urut desa: baris tanpa desa di akhir', () => {
        const ids = terapkanFilterUrut(rows, lokasi, { kategori: 'semua', urut: 'desa' }).map((r) => r.id_rinci_sub_bl)
        expect(ids).toEqual([3, 1, 2])
    })
})
