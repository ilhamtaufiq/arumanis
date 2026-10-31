import { describe, expect, it } from 'bun:test'
import { didukung, didukungMime, namaUntukKonversi } from '../convert-to-pdf'

describe('namaUntukKonversi', () => {
    it('nama dengan titik di tengah (KEC.) tidak dianggap ekstensi, pakai MIME', () => {
        const nama = 'SUKET DESA JATI KEC. BOJONGPICUNG'
        expect(didukung(nama)).toBe(false)
        expect(namaUntukKonversi(nama, 'application/pdf')).toBe(`${nama}.pdf`)
    })

    it('nama yang sudah punya ekstensi didukung dibiarkan', () => {
        expect(namaUntukKonversi('rab.xlsx', 'application/octet-stream')).toBe('rab.xlsx')
    })

    it('ekstensi dari file_name dipakai bila nama tidak punya ekstensi', () => {
        expect(namaUntukKonversi('Surat Keterangan', null, 'suket.docx')).toBe('Surat Keterangan.docx')
    })

    it('tanpa petunjuk apa pun, nama tetap dan tidak didukung', () => {
        const hasil = namaUntukKonversi('dokumen', 'application/x-unknown')
        expect(hasil).toBe('dokumen')
        expect(didukung(hasil)).toBe(false)
    })

    it('didukungMime mengenali tipe umum', () => {
        expect(didukungMime('application/pdf')).toBe(true)
        expect(didukungMime('image/jpeg')).toBe(true)
        expect(didukungMime('video/mp4')).toBe(false)
        expect(didukungMime(null)).toBe(false)
    })
})
