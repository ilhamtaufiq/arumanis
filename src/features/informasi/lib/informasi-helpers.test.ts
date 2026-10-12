import { describe, expect, it } from 'vitest'
import {
    emptyInformasiForm,
    rentangTampil,
    statusTampil,
    validasiInformasiForm,
} from './informasi-helpers'

const dasar = { terbit: true, tampil_dari: null, tampil_sampai: null }

describe('statusTampil', () => {
    const today = '2026-10-12'
    it('draft bila tidak terbit, apa pun tanggalnya', () => {
        expect(statusTampil({ ...dasar, terbit: false }, today)).toBe('draft')
    })
    it('terjadwal bila tanggal mulai di masa depan', () => {
        expect(statusTampil({ ...dasar, tampil_dari: '2026-10-13' }, today)).toBe('terjadwal')
    })
    it('berakhir bila tanggal selesai sudah lewat', () => {
        expect(statusTampil({ ...dasar, tampil_sampai: '2026-10-11' }, today)).toBe('berakhir')
    })
    it('tampil bila hari ini berada dalam rentang, termasuk hari terakhir', () => {
        expect(statusTampil({ ...dasar, tampil_dari: '2026-10-12', tampil_sampai: '2026-10-12' }, today)).toBe('tampil')
    })
})

describe('rentangTampil', () => {
    it('null bila tanpa tanggal', () => {
        expect(rentangTampil(dasar)).toBeNull()
    })
    it('menulis rentang lengkap dengan tanggal yang tidak bergeser zona waktu', () => {
        expect(rentangTampil({ tampil_dari: '2026-10-01', tampil_sampai: '2026-10-31' })).toBe('1 Okt 2026 s.d. 31 Okt 2026')
    })
})

describe('validasiInformasiForm', () => {
    it('menolak judul dan isi kosong', () => {
        const errors = validasiInformasiForm(emptyInformasiForm())
        expect(errors.judul).toBeDefined()
        expect(errors.isi).toBeDefined()
    })
    it('menolak rentang tampil terbalik', () => {
        const errors = validasiInformasiForm({
            ...emptyInformasiForm(),
            judul: 'Judul',
            isi: 'Isi',
            tampil_dari: '2026-10-20',
            tampil_sampai: '2026-10-10',
        })
        expect(errors.tampil_sampai).toBeDefined()
    })
    it('lolos untuk isian yang benar', () => {
        expect(validasiInformasiForm({ ...emptyInformasiForm(), judul: 'Judul', isi: 'Isi' })).toEqual({})
    })
})
