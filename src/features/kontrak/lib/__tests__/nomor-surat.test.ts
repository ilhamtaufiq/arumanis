import { describe, expect, it } from 'vitest'
import { cariJenis, perihalNomor } from '../nomor-surat'

describe('perihalNomor', () => {
    it('menambah nama penyedia setelah judul', () => {
        expect(perihalNomor('SPK', 'CV Maju Jaya')).toBe('Surat Perjanjian Kontrak — CV Maju Jaya')
    })

    it('memakai judul saja bila nama penyedia kosong', () => {
        expect(perihalNomor('SPMK', '   ')).toBe('Surat Perintah Mulai Kerja')
        expect(perihalNomor('SPPBJ', null)).toBe('Surat Penunjukan Penyedia Barang/Jasa')
    })
})

describe('cariJenis', () => {
    const daftar = [
        { id: 1, code: 'BASTP' },
        { id: 2, code: ' spk ' },
        { id: 3, code: null },
    ]

    it('mencocokkan kode tanpa peduli huruf besar dan spasi', () => {
        expect(cariJenis(daftar, 'SPK')?.id).toBe(2)
    })

    it('mengembalikan undefined bila jenis belum ada', () => {
        expect(cariJenis(daftar, 'SPMK')).toBeUndefined()
    })
})
