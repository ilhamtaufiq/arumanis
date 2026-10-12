import { describe, expect, it } from 'vitest'
import {
    emptyInformasiForm,
    ISI_MAX_CHARS,
    isiToHtml,
    isiToTeks,
    rentangTampil,
    ringkasan,
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

describe('isiToHtml', () => {
    it('mengembalikan HTML dari editor apa adanya', () => {
        expect(isiToHtml('<p>Halo <strong>dunia</strong></p>')).toBe('<p>Halo <strong>dunia</strong></p>')
    })
    it('mengubah teks biasa menjadi paragraf dan menjaga baris baru', () => {
        expect(isiToHtml('Baris satu\nBaris dua\n\nParagraf baru')).toBe(
            '<p>Baris satu<br>Baris dua</p><p>Paragraf baru</p>',
        )
    })
    it('meng-escape karakter khusus pada teks biasa', () => {
        expect(isiToHtml('a < b & c')).toBe('<p>a &lt; b &amp; c</p>')
    })
})

describe('isiToTeks dan ringkasan', () => {
    it('membuang tag dan merapikan spasi', () => {
        expect(isiToTeks('<p>Halo</p><p>dunia&nbsp;ini</p>')).toBe('Halo dunia ini')
    })
    it('memotong ringkasan dan menambah elipsis', () => {
        expect(ringkasan('abcdefghij', 5)).toBe('abcde…')
    })
})

describe('validasi isi HTML', () => {
    it('menganggap paragraf kosong dari editor sebagai isi kosong', () => {
        const errors = validasiInformasiForm({ ...emptyInformasiForm(), judul: 'Judul', isi: '<p></p>' })
        expect(errors.isi).toBeDefined()
    })
    it('menolak isi melebihi batas karakter', () => {
        const errors = validasiInformasiForm({
            ...emptyInformasiForm(),
            judul: 'Judul',
            isi: '<p>' + 'x'.repeat(ISI_MAX_CHARS) + '</p>',
        })
        expect(errors.isi).toBeDefined()
    })
})
