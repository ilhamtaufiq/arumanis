import { describe, expect, it } from 'vitest'
import { jenisUntuk, perihalNomor } from '../nomor-surat'

describe('perihalNomor', () => {
    it('menambah nama penyedia setelah judul', () => {
        expect(perihalNomor('SPK', 'CV Maju Jaya')).toBe('Surat Perjanjian Kontrak — CV Maju Jaya')
    })

    it('memakai judul saja bila nama penyedia kosong', () => {
        expect(perihalNomor('SPMK', '   ')).toBe('Surat Perintah Mulai Kerja')
        expect(perihalNomor('SPPBJ', null)).toBe('Surat Penunjukan Penyedia Barang/Jasa')
    })
})

describe('jenisUntuk', () => {
    const daftar = [
        { id: 1, code: 'BASTP' },
        { id: 2, code: ' spk ' },
        { id: 3, code: 'SPK-KONTRAK-2026' },
        { id: 4, code: 'SPK-ADDENDUM' },
        { id: 5, code: 'SPPBJ-DESA' },
        { id: 6, code: 'SPKX' },
        { id: 7, code: null },
    ]

    it('mengambil kode persis dan kode dengan akhiran, tanpa kode yang hanya mirip', () => {
        expect(jenisUntuk(daftar, 'SPK').map((j) => j.id)).toEqual([2, 4, 3])
    })

    it('kosong bila tidak ada jenis yang cocok', () => {
        expect(jenisUntuk(daftar, 'SPMK')).toEqual([])
    })
})

